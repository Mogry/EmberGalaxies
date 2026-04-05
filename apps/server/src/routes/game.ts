import { Hono } from 'hono';
import { prisma } from '../db/client';
import { processExpiredTimers, touchPlanets } from '../utils/timerCompletion';

export const gameRoutes = new Hono();

// Get full game state for a player
gameRoutes.get('/state/:playerId', async (c) => {
  const { playerId } = c.req.param();

  // Process any expired timers before returning state
  await processExpiredTimers();

  // Update lastSeen for all player's planets
  await touchPlanets(playerId);

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      planets: {
        include: { buildings: true, shipyards: true },
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

// Get all planets in a system
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

  // Find system by galaxyId + index
  const system = await prisma.system.findFirst({
    where: { galaxyId: dbGalaxy.id, index: systemIndex },
    include: { planets: { include: { owner: true } }, star: true },
  });

  if (!system) {
    return c.json({ error: 'System not found' }, 404);
  }

  return c.json({ galaxy: dbGalaxy, system, planets: system.planets });
});

// Get planet by ID
gameRoutes.get('/planet/:planetId', async (c) => {
  const { planetId } = c.req.param();

  // Process any expired timers first
  await processExpiredTimers();

  const planet = await prisma.planet.findUnique({
    where: { id: planetId },
    include: {
      system: { include: { star: true } },
      buildings: true,
      owner: true,
    },
  });

  if (!planet) {
    return c.json({ error: 'Planet not found' }, 404);
  }

  return c.json(planet);
});

// Create new player
gameRoutes.post('/player', async (c) => {
  const body = await c.req.json();
  const { name, isBot = false } = body;

  const player = await prisma.player.create({
    data: {
      name,
      isBot,
    },
  });

  return c.json(player, 201);
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

  return c.json(completePlanet, 201);
});