import { Hono } from 'hono';
import { prisma } from '../db/client';
import { broadcastToPlayer } from '../websocket/broadcast';
import { SHIP_BUILD_TIMES } from '@ember-galaxies/shared';

export const shipyardRoutes = new Hono();

// Get shipyard queue for a planet
shipyardRoutes.get('/planet/:planetId', async (c) => {
  const { planetId } = c.req.param();

  const shipyards = await prisma.shipyard.findMany({
    where: { planetId },
  });

  return c.json(shipyards);
});

// Start building ships
shipyardRoutes.post('/build', async (c) => {
  const body = await c.req.json();
  const { planetId, shipType, count = 1 } = body;

  // Check if planet has shipyard building
  const shipyardBuilding = await prisma.building.findUnique({
    where: { planetId_type: { planetId, type: 'shipyard' } },
  });

  if (!shipyardBuilding || shipyardBuilding.level < 1) {
    return c.json({ error: 'Shipyard not available' }, 400);
  }

  // Check if already building this ship type
  const existing = await prisma.shipyard.findUnique({
    where: { planetId_shipType: { planetId, shipType } },
  });

  if (existing?.isBuilding) {
    return c.json({ error: 'Already building this ship type' }, 400);
  }

  const baseTime = SHIP_BUILD_TIMES[shipType as keyof typeof SHIP_BUILD_TIMES] || 60;
  // shipyard level reduces build time by 10% per level
  const buildTimeSeconds = baseTime * count * Math.pow(0.9, shipyardBuilding.level - 1);
  const finishAt = new Date(Date.now() + buildTimeSeconds * 1000);

  let ship;
  if (existing) {
    ship = await prisma.shipyard.update({
      where: { id: existing.id },
      data: { count, isBuilding: true, buildFinishAt: finishAt },
    });
  } else {
    ship = await prisma.shipyard.create({
      data: { planetId, shipType, count, isBuilding: true, buildFinishAt: finishAt },
    });
  }

  return c.json(ship, 201);
});

// Cancel ship building
shipyardRoutes.post('/cancel', async (c) => {
  const body = await c.req.json();
  const { planetId, shipType } = body;

  const ship = await prisma.shipyard.findUnique({
    where: { planetId_shipType: { planetId, shipType } },
    include: { planet: { select: { ownerId: true } } },
  });

  if (!ship) {
    return c.json({ error: 'Ship not found' }, 404);
  }

  if (!ship.isBuilding) {
    return c.json({ error: 'Ship is not building' }, 400);
  }

  // Cancel building - no refund
  await prisma.shipyard.update({
    where: { id: ship.id },
    data: {
      isBuilding: false,
      buildFinishAt: null,
    },
  });

  return c.json({ success: true });
});
