import { Hono } from 'hono';
import { prisma } from '../db/client';
import { broadcastToPlayer } from '../websocket/broadcast';

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

  // Calculate build time based on ship type and shipyard level
  // Base times per ship (in seconds)
  const SHIP_BUILD_TIMES: Record<string, number> = {
    light_fighter: 60,
    heavy_fighter: 120,
    cruiser: 300,
    battleship: 600,
    colony_ship: 1200,
    recycler: 180,
    espionage_probe: 30,
    bomber: 400,
    destroyer: 500,
    deathstar: 3600,
    battlecruiser: 700,
    small_cargo: 90,
    large_cargo: 150,
  };

  const baseTime = SHIP_BUILD_TIMES[shipType] || 60;
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
