import { Hono } from 'hono';
import { prisma } from '../db/client';
import { getBuildingUpgradeCost } from '@ember-galaxies/shared';
import { devBuildTimeMultiplier } from '../utils/dev';
import { processExpiredTimers } from '../utils/timerCompletion';

export const buildingRoutes = new Hono();

// Get buildings for a planet (PRIVATE — only owner can access)
buildingRoutes.get('/planet/:planetId', async (c) => {
  const { planetId } = c.req.param();
  const authPlayerId = c.get('playerId');

  // Verify ownership
  const planet = await prisma.planet.findUnique({
    where: { id: planetId },
    select: { ownerId: true },
  });

  if (!planet) {
    return c.json({ error: 'Planet not found' }, 404);
  }

  if (planet.ownerId !== authPlayerId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  // Process any expired timers first so queue reflects correct state
  await processExpiredTimers();

  const buildings = await prisma.building.findMany({
    where: { planetId },
    include: { constructionQueue: { orderBy: { upgradeFinishAt: 'asc' } } },
  });

  return c.json(buildings);
});

// Check if player has enough resources for a build
function canAfford(planet: { iron: number; silver: number; ember: number; h2: number; energy: number }, cost: { iron: number; silver: number; ember: number; h2: number; energy: number } | null): boolean {
  if (!cost) return false;
  return (
    planet.iron >= cost.iron &&
    planet.silver >= cost.silver &&
    planet.ember >= (cost.ember ?? 0) &&
    planet.h2 >= (cost.h2 ?? 0) &&
    planet.energy >= (cost.energy ?? 0)
  );
}

// Start building upgrade
buildingRoutes.post('/upgrade', async (c) => {
  const authPlayerId = c.get('playerId');
  const body = await c.req.json();
  const { planetId, buildingType } = body;

  // Check if ANY building on this planet has an active queue (max 1 upgrade per planet)
  const now = new Date();
  const buildingsWithQueue = await prisma.building.findMany({
    where: { planetId },
    include: { constructionQueue: { where: { upgradeFinishAt: { gt: now } } } },
  });

  const hasActiveQueue = buildingsWithQueue.some(b =>
    b.constructionQueue && b.constructionQueue.length > 0
  );

  if (hasActiveQueue) {
    return c.json({ error: 'Another building is already upgrading on this planet' }, 400);
  }

  const existing = await prisma.building.findUnique({
    where: { planetId_type: { planetId, type: buildingType } },
  });

  if (!existing) {
    return c.json({ error: 'Building not found' }, 404);
  }

  // Get cost for this upgrade
  const cost = getBuildingUpgradeCost(buildingType, existing.level);
  if (!cost) {
    return c.json({ error: 'No cost data for this level' }, 400);
  }

  // Fetch planet with current resources
  const planet = await prisma.planet.findUnique({ where: { id: planetId } });
  if (!planet) {
    return c.json({ error: 'Planet not found' }, 404);
  }

  // Ownership check
  if (planet.ownerId !== authPlayerId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  // Check affordability
  if (!canAfford(planet, cost)) {
    return c.json({ error: 'Not enough resources', missing: cost }, 400);
  }

  // Deduct resources and create queue entry in a transaction
  const buildTimeSeconds = Math.pow(existing.level + 1, 2) * 60 * devBuildTimeMultiplier();
  const finishAt = new Date(Date.now() + buildTimeSeconds * 1000);

  await prisma.$transaction([
    prisma.planet.update({
      where: { id: planetId },
      data: {
        iron: { decrement: cost.iron },
        silver: { decrement: cost.silver },
        ember: { decrement: cost.ember ?? 0 },
        h2: { decrement: cost.h2 ?? 0 },
        energy: { decrement: cost.energy ?? 0 },
      },
    }),
    prisma.building.update({
      where: { id: existing.id },
      data: { isUpgrading: true, upgradeFinishAt: finishAt },
    }),
    prisma.constructionQueue.create({
      data: {
        buildingId: existing.id,
        targetLevel: existing.level + 1,
        upgradeFinishAt: finishAt,
      },
    }),
  ]);

  // Fetch full planet with relations
  const updatedPlanet = await prisma.planet.findUnique({
    where: { id: planetId },
    include: { system: { include: { star: true } }, buildings: { include: { constructionQueue: { orderBy: { upgradeFinishAt: 'asc' } } } }, shipyards: true, owner: true },
  });

  // Add galaxyIndex
  const galaxies = await prisma.galaxy.findMany({ orderBy: { createdAt: 'asc' } });
  const galaxyIndex = galaxies.findIndex((g) => g.id === updatedPlanet!.system.galaxyId) + 1;
  const planetWithGalaxy = { ...updatedPlanet, system: { ...updatedPlanet!.system, galaxyIndex } };

  return c.json(planetWithGalaxy);
});

// Cancel building upgrade
buildingRoutes.post('/cancel', async (c) => {
  const authPlayerId = c.get('playerId');
  const body = await c.req.json();
  const { planetId, queueId } = body;

  // Ownership check
  const planetOwner = await prisma.planet.findUnique({
    where: { id: planetId },
    select: { ownerId: true },
  });
  if (!planetOwner) {
    return c.json({ error: 'Planet not found' }, 404);
  }
  if (planetOwner.ownerId !== authPlayerId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const queueEntry = await prisma.constructionQueue.findUnique({
    where: { id: queueId },
    include: { building: true },
  });

  if (!queueEntry) {
    return c.json({ error: 'Queue entry not found' }, 404);
  }

  if (queueEntry.building.planetId !== planetId) {
    return c.json({ error: 'Queue entry not on this planet' }, 400);
  }

  // Get cost to refund (from current building level to targetLevel)
  const cost = getBuildingUpgradeCost(queueEntry.building.type, queueEntry.building.level);

  // Refund resources and delete queue entry
  await prisma.$transaction([
    cost ? prisma.planet.update({
      where: { id: planetId },
      data: {
        iron: { increment: cost.iron },
        silver: { increment: cost.silver },
        ember: { increment: cost.ember ?? 0 },
        h2: { increment: cost.h2 ?? 0 },
        energy: { increment: cost.energy ?? 0 },
      },
    }) : prisma.planet.update({ where: { id: planetId }, data: {} }),
    prisma.constructionQueue.delete({
      where: { id: queueId },
    }),
  ]);

  // Fetch full planet with relations
  const planet = await prisma.planet.findUnique({
    where: { id: planetId },
    include: { system: { include: { star: true } }, buildings: { include: { constructionQueue: { orderBy: { upgradeFinishAt: 'asc' } } } }, shipyards: true, owner: true },
  });

  // Add galaxyIndex
  const galaxies = await prisma.galaxy.findMany({ orderBy: { createdAt: 'asc' } });
  const galaxyIndex = galaxies.findIndex((g) => g.id === planet!.system.galaxyId) + 1;
  const planetWithGalaxy = { ...planet, system: { ...planet!.system, galaxyIndex } };

  return c.json(planetWithGalaxy);
});

// Start new building construction
buildingRoutes.post('/construct', async (c) => {
  const authPlayerId = c.get('playerId');
  const body = await c.req.json();
  const { planetId, buildingType } = body;

  // Check if ANY building on this planet has an active queue (max 1 upgrade per planet)
  const now = new Date();
  const buildingsWithQueue = await prisma.building.findMany({
    where: { planetId },
    include: { constructionQueue: { where: { upgradeFinishAt: { gt: now } } } },
  });

  const hasActiveQueue = buildingsWithQueue.some(b =>
    b.constructionQueue && b.constructionQueue.length > 0
  );

  if (hasActiveQueue) {
    return c.json({ error: 'Another building is already upgrading on this planet' }, 400);
  }

  const planet = await prisma.planet.findUnique({
    where: { id: planetId },
    include: { buildings: true },
  });

  if (!planet) {
    return c.json({ error: 'Planet not found' }, 404);
  }

  // Ownership check
  if (planet.ownerId !== authPlayerId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  // Check if building already exists
  const existing = planet.buildings.find((b) => b.type === buildingType);
  if (existing) {
    return c.json({ error: 'Building type already exists on this planet' }, 400);
  }

  // Cost to go from level 0 → 1
  const cost = getBuildingUpgradeCost(buildingType, 0);
  if (!cost) {
    return c.json({ error: 'No cost data for this building type' }, 400);
  }

  // Check affordability
  if (!canAfford(planet, cost)) {
    return c.json({ error: 'Not enough resources', missing: cost }, 400);
  }

  const buildTimeSeconds = 60 * devBuildTimeMultiplier(); // 1 minute for level 1
  const finishAt = new Date(Date.now() + buildTimeSeconds * 1000);

  // Create building at level 0 and queue entry for level 1
  const building = await prisma.building.create({
    data: {
      planetId,
      type: buildingType,
      level: 0,
    },
  });

  await prisma.$transaction([
    prisma.planet.update({
      where: { id: planetId },
      data: {
        iron: { decrement: cost.iron },
        silver: { decrement: cost.silver },
        ember: { decrement: cost.ember ?? 0 },
        h2: { decrement: cost.h2 ?? 0 },
        energy: { decrement: cost.energy ?? 0 },
      },
    }),
    prisma.building.update({
      where: { id: building.id },
      data: { isUpgrading: true, upgradeFinishAt: finishAt },
    }),
    prisma.constructionQueue.create({
      data: {
        buildingId: building.id,
        targetLevel: 1,
        upgradeFinishAt: finishAt,
      },
    }),
  ]);

  // Fetch full planet with relations
  const updatedPlanet = await prisma.planet.findUnique({
    where: { id: planetId },
    include: { system: { include: { star: true } }, buildings: { include: { constructionQueue: { orderBy: { upgradeFinishAt: 'asc' } } } }, shipyards: true, owner: true },
  });

  // Add galaxyIndex
  const galaxies = await prisma.galaxy.findMany({ orderBy: { createdAt: 'asc' } });
  const galaxyIndex = galaxies.findIndex((g) => g.id === updatedPlanet!.system.galaxyId) + 1;
  const planetWithGalaxy = { ...updatedPlanet, system: { ...updatedPlanet!.system, galaxyIndex } };

  return c.json(planetWithGalaxy);
});
