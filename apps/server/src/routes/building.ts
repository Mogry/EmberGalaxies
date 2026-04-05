import { Hono } from 'hono';
import { prisma } from '../db/client';

export const buildingRoutes = new Hono();

// Get buildings for a planet
buildingRoutes.get('/planet/:planetId', async (c) => {
  const { planetId } = c.req.param();

  const buildings = await prisma.building.findMany({
    where: { planetId },
  });

  return c.json(buildings);
});

// Start building upgrade
buildingRoutes.post('/upgrade', async (c) => {
  const body = await c.req.json();
  const { planetId, buildingType } = body;

  // Check if ANY building on this planet is currently upgrading
  const upgradingBuildings = await prisma.building.findMany({
    where: {
      planetId,
      isUpgrading: true,
    },
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

  // Calculate build time based on level (simplified)
  const buildTimeSeconds = Math.pow(existing.level + 1, 2) * 60;
  const finishAt = new Date(Date.now() + buildTimeSeconds * 1000);

  const updated = await prisma.building.update({
    where: { id: existing.id },
    data: {
      isUpgrading: true,
      upgradeFinishAt: finishAt,
    },
  });

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
    where: {
      planetId,
      isUpgrading: true,
    },
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

  const buildTimeSeconds = 60; // 1 minute for level 1
  const finishAt = new Date(Date.now() + buildTimeSeconds * 1000);

  const building = await prisma.building.create({
    data: {
      planetId,
      type: buildingType,
      level: 0,
      isUpgrading: true,
      upgradeFinishAt: finishAt,
    },
  });

  return c.json(building, 201);
});