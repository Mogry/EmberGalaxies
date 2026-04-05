import { Hono } from 'hono';
import { prisma } from '../db/client';
import { getBuildingUpgradeCost } from '@ember-galaxies/shared';
import { devBuildTimeMultiplier } from '../utils/dev';

export const buildingRoutes = new Hono();

// Get buildings for a planet
buildingRoutes.get('/planet/:planetId', async (c) => {
  const { planetId } = c.req.param();

  const buildings = await prisma.building.findMany({
    where: { planetId },
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
  const body = await c.req.json();
  const { planetId, buildingType } = body;

  // Check if ANY building on this planet is currently upgrading
  const upgradingBuildings = await prisma.building.findMany({
    where: { planetId, isUpgrading: true },
  });

  if (upgradingBuildings.length > 0) {
    return c.json({ error: 'Another building is already upgrading on this planet' }, 400);
  }

  const existing = await prisma.building.findUnique({
    where: { planetId_type: { planetId, type: buildingType } },
  });

  if (!existing) {
    return c.json({ error: 'Building not found' }, 404);
  }

  if (existing.isUpgrading) {
    return c.json({ error: 'Building is already upgrading' }, 400);
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

  // Check affordability
  if (!canAfford(planet, cost)) {
    return c.json({ error: 'Not enough resources', missing: cost }, 400);
  }

  // Deduct resources and start upgrade in a transaction
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
      data: {
        isUpgrading: true,
        upgradeFinishAt: finishAt,
      },
    }),
  ]);

  const updated = await prisma.building.findUnique({ where: { id: existing.id } });
  return c.json(updated);
});

// Cancel building upgrade
buildingRoutes.post('/cancel', async (c) => {
  const body = await c.req.json();
  const { planetId, buildingType } = body;

  const building = await prisma.building.findUnique({
    where: { planetId_type: { planetId, type: buildingType } },
  });

  if (!building) {
    return c.json({ error: 'Building not found' }, 404);
  }

  if (!building.isUpgrading) {
    return c.json({ error: 'Building is not upgrading' }, 400);
  }

  // Cancel upgrade - no refund
  const updated = await prisma.building.update({
    where: { id: building.id },
    data: {
      isUpgrading: false,
      upgradeFinishAt: null,
    },
  });

  return c.json(updated);
});

// Start new building construction
buildingRoutes.post('/construct', async (c) => {
  const body = await c.req.json();
  const { planetId, buildingType } = body;

  // Check if ANY building on this planet is currently upgrading
  const upgradingBuildings = await prisma.building.findMany({
    where: { planetId, isUpgrading: true },
  });

  if (upgradingBuildings.length > 0) {
    return c.json({ error: 'Another building is already upgrading on this planet' }, 400);
  }

  const planet = await prisma.planet.findUnique({
    where: { id: planetId },
    include: { buildings: true },
  });

  if (!planet) {
    return c.json({ error: 'Planet not found' }, 404);
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

  // Deduct resources and create building in a transaction
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
    prisma.building.create({
      data: {
        planetId,
        type: buildingType,
        level: 0,
        isUpgrading: true,
        upgradeFinishAt: finishAt,
      },
    }),
  ]);

  return c.json({ success: true, finishAt }, 201);
});
