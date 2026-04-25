import { Hono } from 'hono';
import { prisma } from '../db/client';
import { processExpiredTimers, syncPlanet, touchPlanets } from '../utils/timerCompletion';
import { logEvent } from '../utils/eventLogger';
import { DEV_MODE } from '../utils/dev';

export const gameRoutes = new Hono();

// Get full game state for a player (PRIVATE — only owner can access)
gameRoutes.get('/state/:playerId', async (c) => {
  const { playerId } = c.req.param();
  const authPlayerId = c.get('playerId');

  // Only the owner can access their own state
  if (authPlayerId !== playerId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  // Process any expired timers before returning state
  await processExpiredTimers();

  // Sync all player planets to compute offline production
  const playerPlanets = await prisma.planet.findMany({
    where: { ownerId: playerId },
    select: { id: true },
  });
  const now = new Date();
  for (const { id } of playerPlanets) {
    await syncPlanet(id, now);
  }

  // Update lastSeen for all player's planets
  await touchPlanets(playerId, now);

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      planets: {
        include: { buildings: { include: { constructionQueue: { orderBy: { upgradeFinishAt: 'asc' } } } }, shipyards: true, planetShips: true },
      },
      fleets: {
        include: { ships: true },
      },
      research: true,
    },
  });

  if (!player) {
    return c.json({ error: 'Player not found' }, 404);
  }

  return c.json(player);
});

// Radar Scan — Fog of War: planets only expose id, name, slot, ownerId
gameRoutes.get('/galaxy/:galaxy/system/:system', async (c) => {
  const galaxyIndex = parseInt(c.req.param('galaxy'));
  const systemIndex = parseInt(c.req.param('system'));

  // Find galaxy by order (galaxy 1 = first created, etc.)
  const galaxies = await prisma.galaxy.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const dbGalaxy = galaxies[galaxyIndex - 1];
  if (!dbGalaxy) {
    return c.json({ error: 'Galaxy not found' }, 404);
  }

  // Find system by galaxyId + index — Fog of War: no resources/buildings/ships on planets
  const system = await prisma.system.findFirst({
    where: { galaxyId: dbGalaxy.id, index: systemIndex },
    include: {
      star: true,
      planets: {
        select: {
          id: true,
          name: true,
          slot: true,
          ownerId: true,
        },
      },
    },
  });

  if (!system) {
    return c.json({ error: 'System not found' }, 404);
  }

  return c.json({ galaxy: { ...dbGalaxy, index: galaxyIndex }, system, planets: system.planets });
});

// Get planet by ID — Fog of War: owner sees full data, others see minimal info
gameRoutes.get('/planet/:planetId', async (c) => {
  const { planetId } = c.req.param();
  const authPlayerId = c.get('playerId');

  // Process any expired timers first
  await processExpiredTimers();
  await syncPlanet(planetId, new Date());

  // Phase 1: Minimal query to check ownership
  const ownership = await prisma.planet.findUnique({
    where: { id: planetId },
    select: { ownerId: true },
  });

  if (!ownership) {
    return c.json({ error: 'Planet not found' }, 404);
  }

  // Fog of War: non-owners only see id, name, ownerId, systemId, slot
  if (ownership.ownerId !== authPlayerId) {
    const planet = await prisma.planet.findUnique({
      where: { id: planetId },
      select: {
        id: true,
        name: true,
        ownerId: true,
        systemId: true,
        slot: true,
      },
    });
    return c.json(planet);
  }

  // Owner gets full details
  const planet = await prisma.planet.findUnique({
    where: { id: planetId },
    include: {
      system: { include: { star: true } },
      buildings: { include: { constructionQueue: { orderBy: { upgradeFinishAt: 'asc' } } } },
      planetShips: true,
      owner: true,
    },
  });

  // Add galaxyIndex
  const galaxies = await prisma.galaxy.findMany({ orderBy: { createdAt: 'asc' } });
  const galaxyIndex = galaxies.findIndex((g) => g.id === planet!.system.galaxyId) + 1;

  return c.json({ ...planet, system: { ...planet!.system, galaxyIndex } });
});

// Get player by ID — Fog of War: owner sees full data, others see minimal profile
gameRoutes.get('/player/:playerId', async (c) => {
  const { playerId } = c.req.param();
  const authPlayerId = c.get('playerId');

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: {
      id: true,
      name: true,
      isBot: true,
      createdAt: true,
      // apiKey is NEVER exposed — not even to the owner via this endpoint
    },
  });

  if (!player) {
    return c.json({ error: 'Player not found' }, 404);
  }

  // Non-owners only see the public profile
  if (authPlayerId !== playerId) {
    return c.json(player);
  }

  // Owner gets the same public profile here; full state is via /state/:playerId
  return c.json(player);
});

// Create or get the single human player
// Returns existing human player if one exists, otherwise creates exactly one with a starter planet
gameRoutes.post('/player', async (c) => {
  // Check if a human player already exists
  const existingPlayer = await prisma.player.findFirst({
    where: { isBot: false },
    include: { planets: true },
  });

  if (existingPlayer) {
    // Process offline production for all planets before returning
    await processExpiredTimers();
    // Re-fetch with updated planet data
    const refreshed = await prisma.player.findUnique({
      where: { id: existingPlayer.id },
      include: { planets: { include: { buildings: { include: { constructionQueue: { orderBy: { upgradeFinishAt: 'asc' } } } } } } },
    });
    return c.json(refreshed);
  }

  // No human player exists yet — create exactly one
  const body = await c.req.json();
  const { name, isBot = false } = body;

  const player = await prisma.player.create({
    data: { name, isBot },
  });

  // Find a slot for the starter planet
  const galaxies = await prisma.galaxy.findMany({ orderBy: { createdAt: 'asc' } });
  if (galaxies.length === 0) {
    return c.json({ error: 'No galaxies found. Run seed first.' }, 500);
  }

  const galaxy = galaxies[0];
  const systems = await prisma.system.findMany({
    where: { galaxyId: galaxy.id },
    include: { planets: true },
  });

  const systemWithSpace = systems.reduce((best, current) => {
    const bestEmpty = 30 - best.planets.length;
    const currentEmpty = 30 - current.planets.length;
    return currentEmpty > bestEmpty ? current : best;
  });

  const usedSlots = new Set(systemWithSpace.planets.map((p) => p.slot));
  let slot = 1;
  while (usedSlots.has(slot) && slot <= 30) slot++;
  if (slot > 30) {
    return c.json({ error: 'No free slots' }, 500);
  }

  const planet = await prisma.planet.create({
    data: {
      name: `${name}'s Homeworld`,
      slot,
      systemId: systemWithSpace.id,
      ownerId: player.id,
      iron: 500,
      silver: 250,
      ember: 0,
      h2: 0,
      energy: 0,
      lastSeen: new Date(),
    },
  });

  await prisma.building.createMany({
    data: [
      { planetId: planet.id, type: 'zentrale', level: 1 },
      { planetId: planet.id, type: 'iron_mine', level: 1 },
      { planetId: planet.id, type: 'silver_mine', level: 1 },
      { planetId: planet.id, type: 'fusion_plant', level: 1 },
    ],
  });

  const completePlanet = await prisma.planet.findUnique({
    where: { id: planet.id },
    include: { system: { include: { star: true } }, buildings: { include: { constructionQueue: { orderBy: { upgradeFinishAt: 'asc' } } } }, shipyards: true },
  });

  return c.json({ ...player, planets: [completePlanet] }, 201);
});

// Get all planets for a player (PRIVATE — only owner can access)
gameRoutes.get('/planets/:playerId', async (c) => {
  const { playerId } = c.req.param();
  const authPlayerId = c.get('playerId');

  // Only the owner can list their planets
  if (authPlayerId !== playerId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  // Process offline production first so resources are up-to-date
  await processExpiredTimers();

  const galaxies = await prisma.galaxy.findMany({ orderBy: { createdAt: 'asc' } });
  const now = new Date();
  const planetIds = await prisma.planet.findMany({
    where: { ownerId: playerId },
    select: { id: true },
  });
  for (const { id } of planetIds) {
    await syncPlanet(id, now);
  }

  const planets = await prisma.planet.findMany({
    where: { ownerId: playerId },
    include: {
      system: { include: { star: true } },
      buildings: { include: { constructionQueue: { orderBy: { upgradeFinishAt: 'asc' } } } },
      shipyards: true,
      planetShips: true,
    },
  });

  // Attach galaxyIndex to each planet's system
  const planetsWithGalaxyIndex = planets.map((p) => {
    const galaxyIndex = galaxies.findIndex((g) => g.id === p.system.galaxyId) + 1;
    return { ...p, system: { ...p.system, galaxyIndex } };
  });

  return c.json(planetsWithGalaxyIndex);
});

// Create starter planet for player
gameRoutes.post('/planet/starter/:playerId', async (c) => {
  const { playerId } = c.req.param();

  const player = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!player) {
    return c.json({ error: 'Player not found' }, 404);
  }

  // Find first galaxy and a random system with an empty slot
  const galaxies = await prisma.galaxy.findMany({
    orderBy: { createdAt: 'asc' },
  });

  if (galaxies.length === 0) {
    return c.json({ error: 'No galaxies found. Run seed first.' }, 500);
  }

  const galaxy = galaxies[0]; // First galaxy

  // Find a system with empty planet slots
  const systems = await prisma.system.findMany({
    where: { galaxyId: galaxy.id },
    include: { planets: true },
  });

  // Find system with most empty slots
  const systemWithSpace = systems.reduce((best, current) => {
    const bestEmpty = 30 - best.planets.length;
    const currentEmpty = 30 - current.planets.length;
    return currentEmpty > bestEmpty ? current : best;
  });

  const usedSlots = new Set(systemWithSpace.planets.map((p) => p.slot));
  let slot = 1;
  while (usedSlots.has(slot) && slot <= 30) slot++;

  if (slot > 30) {
    return c.json({ error: 'No free slots in any system' }, 500);
  }

  const planet = await prisma.planet.create({
    data: {
      name: `${player.name}'s Homeworld`,
      slot,
      systemId: systemWithSpace.id,
      ownerId: playerId,
      iron: 500,
      silver: 250,
      ember: 0,
      h2: 0,
      energy: 0,
      lastSeen: new Date(),
    },
  });

  // Create starter buildings (all at level 1)
  await prisma.building.createMany({
    data: [
      { planetId: planet.id, type: 'zentrale', level: 1 },
      { planetId: planet.id, type: 'iron_mine', level: 1 },
      { planetId: planet.id, type: 'silver_mine', level: 1 },
      { planetId: planet.id, type: 'fusion_plant', level: 1 },
    ],
  });

  // Fetch complete planet with relations
  const completePlanet = await prisma.planet.findUnique({
    where: { id: planet.id },
    include: {
      system: { include: { star: true } },
      buildings: true,
    },
  });

  // Add galaxyIndex (reuse existing 'galaxies' variable)
  const galaxyIndex = galaxies.findIndex((g) => g.id === completePlanet!.system.galaxyId) + 1;
  const planetWithGalaxy = {
    ...completePlanet,
    system: { ...completePlanet!.system, galaxyIndex },
  };

  return c.json(planetWithGalaxy, 201);
});

// Colonize an unoccupied planet (dev mode - bypasses fleet system)
gameRoutes.post('/planet/:planetId/colonize', async (c) => {
  const { planetId } = c.req.param();

  const planet = await prisma.planet.findUnique({
    where: { id: planetId },
    include: { system: { include: { star: true } } },
  });

  if (!planet) {
    return c.json({ error: 'Planet not found' }, 404);
  }

  if (planet.ownerId) {
    return c.json({ error: 'Planet already occupied' }, 400);
  }

  // Get the human player
  const player = await prisma.player.findFirst({
    where: { isBot: false },
  });

  if (!player) {
    return c.json({ error: 'No player found' }, 404);
  }

  const colonized = await prisma.planet.update({
    where: { id: planetId },
    data: {
      ownerId: player.id,
      name: `${player.name}'s Colony`,
      iron: 500,
      silver: 250,
      ember: 0,
      h2: 0,
      energy: 0,
      lastSeen: new Date(),
    },
  });

  await logEvent({ type: 'planet_colonized', playerId: player.id, planetId: colonized.id });

  // Create starter buildings
  await prisma.building.createMany({
    data: [
      { planetId: colonized.id, type: 'zentrale', level: 1 },
      { planetId: colonized.id, type: 'iron_mine', level: 1 },
      { planetId: colonized.id, type: 'silver_mine', level: 1 },
      { planetId: colonized.id, type: 'fusion_plant', level: 1 },
    ],
  });

  const completePlanet = await prisma.planet.findUnique({
    where: { id: colonized.id },
    include: { system: { include: { star: true } }, buildings: true, shipyards: true, owner: true },
  });

  // Add galaxyIndex
  const galaxies = await prisma.galaxy.findMany({ orderBy: { createdAt: 'asc' } });
  const galaxyIndex = galaxies.findIndex((g) => g.id === completePlanet!.system.galaxyId) + 1;
  const planetWithGalaxy = {
    ...completePlanet,
    system: { ...completePlanet!.system, galaxyIndex },
  };

  return c.json(planetWithGalaxy, 201);
});

// DEV MODE: Add 5000 of each resource to a planet
if (DEV_MODE) {
  gameRoutes.post('/dev/resources/:planetId', async (c) => {
    const { planetId } = c.req.param();

    const planet = await prisma.planet.update({
      where: { id: planetId },
      data: {
        iron:    { increment: 5000 },
        silver:  { increment: 5000 },
        ember:   { increment: 5000 },
        h2:      { increment: 5000 },
        energy:  { increment: 5000 },
      },
    });

    return c.json({ success: true, planet });
  });
}