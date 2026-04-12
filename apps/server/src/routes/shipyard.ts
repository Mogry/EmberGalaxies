import { Hono } from 'hono';
import { prisma } from '../db/client';
import { broadcastToPlayer } from '../websocket/broadcast';
import { SHIP_BUILD_TIMES, SHIP_COSTS } from '@ember-galaxies/shared';

export const shipyardRoutes = new Hono();

// GET /api/shipyard/planet/:planetId — returns queue + stock (PRIVATE — only owner)
shipyardRoutes.get('/planet/:planetId', async (c) => {
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

  const [queue, stock] = await Promise.all([
    prisma.shipyard.findMany({
      where: { planetId, isBuilding: true },
    }),
    prisma.planetShip.findMany({
      where: { planetId, count: { gt: 0 } },
    }),
  ]);

  return c.json({ queue, stock });
});

// POST /api/shipyard/build
shipyardRoutes.post('/build', async (c) => {
  const authPlayerId = c.get('playerId');
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

  // Calculate cost
  const cost = SHIP_COSTS[shipType];
  if (!cost) {
    return c.json({ error: 'Unknown ship type' }, 400);
  }

  const totalCost = {
    iron: (cost.iron ?? 0) * count,
    silver: (cost.silver ?? 0) * count,
    ember: (cost.ember ?? 0) * count,
    h2: (cost.h2 ?? 0) * count,
    energy: (cost.energy ?? 0) * count,
  };

  // Check resources
  const planet = await prisma.planet.findUnique({ where: { id: planetId } });
  if (!planet) {
    return c.json({ error: 'Planet not found' }, 404);
  }

  // Ownership check
  if (planet.ownerId !== authPlayerId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  if (
    planet.iron < totalCost.iron ||
    planet.silver < totalCost.silver ||
    (totalCost.ember > 0 && planet.ember < totalCost.ember) ||
    (totalCost.h2 > 0 && planet.h2 < totalCost.h2) ||
    (totalCost.energy > 0 && planet.energy < totalCost.energy)
  ) {
    return c.json({ error: 'Not enough resources' }, 400);
  }

  // Deduct resources
  await prisma.planet.update({
    where: { id: planetId },
    data: {
      iron: { decrement: totalCost.iron },
      silver: { decrement: totalCost.silver },
      ...(totalCost.ember > 0 ? { ember: { decrement: totalCost.ember } } : {}),
      ...(totalCost.h2 > 0 ? { h2: { decrement: totalCost.h2 } } : {}),
      ...(totalCost.energy > 0 ? { energy: { decrement: totalCost.energy } } : {}),
    },
  });

  // Calculate build time: base × level × 0.9^(level-1) × count
  const baseTime = SHIP_BUILD_TIMES[shipType as keyof typeof SHIP_BUILD_TIMES] ?? 60;
  const buildTimeSeconds = baseTime * count * Math.pow(0.9, shipyardBuilding.level - 1);
  const finishAt = new Date(Date.now() + buildTimeSeconds * 1000);

  // Create or update queue entry
  const queueEntry = existing
    ? await prisma.shipyard.update({
        where: { id: existing.id },
        data: { count, isBuilding: true, buildFinishAt: finishAt },
      })
    : await prisma.shipyard.create({
        data: { planetId, shipType, count, isBuilding: true, buildFinishAt: finishAt },
      });

  return c.json(queueEntry, 201);
});

// POST /api/shipyard/cancel
shipyardRoutes.post('/cancel', async (c) => {
  const authPlayerId = c.get('playerId');
  const body = await c.req.json();
  const { planetId, shipType } = body;

  const ship = await prisma.shipyard.findUnique({
    where: { planetId_shipType: { planetId, shipType } },
    include: { planet: { select: { ownerId: true } } },
  });

  if (!ship) {
    return c.json({ error: 'Ship not found' }, 404);
  }

  // Ownership check
  if (ship.planet.ownerId !== authPlayerId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  if (!ship.isBuilding) {
    return c.json({ error: 'Ship is not building' }, 400);
  }

  // Delete queue entry — no refund
  await prisma.shipyard.delete({
    where: { id: ship.id },
  });

  return c.json({ success: true });
});
