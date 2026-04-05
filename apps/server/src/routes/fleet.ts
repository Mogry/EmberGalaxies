import { Hono } from 'hono';
import { prisma } from '../db/client';

export const fleetRoutes = new Hono();

// Launch a fleet
fleetRoutes.post('/launch', async (c) => {
  const body = await c.req.json();
  const { playerId, originPlanetId, targetPosition, ships, mission, resources } = body;

  // Calculate flight time (simplified)
  const originPlanet = await prisma.planet.findUnique({
    where: { id: originPlanetId },
  });

  if (!originPlanet) {
    return c.json({ error: 'Origin planet not found' }, 404);
  }

  // Distance calculation (simplified)
  const galaxyDiff = Math.abs((targetPosition.galaxy || 1) - originPlanet.galaxy);
  const systemDiff = Math.abs((targetPosition.system || 1) - originPlanet.system);
  const slotDiff = Math.abs((targetPosition.slot || 1) - originPlanet.slot);

  const distance = Math.sqrt(
    Math.pow(galaxyDiff * 20000, 2) +
    Math.pow(systemDiff * 95 + slotDiff * 5, 2)
  );

  // Flight time in seconds (simplified formula)
  const baseSpeed = 10000; // Would be calculated from ship speeds and drives
  const flightTime = Math.floor((10 + distance / baseSpeed) * 60); // Minutes to seconds
  const now = new Date();

  const fleet = await prisma.fleet.create({
    data: {
      ownerId: playerId,
      originPlanetId,
      targetGalaxy: targetPosition.galaxy,
      targetSystem: targetPosition.system,
      targetSlot: targetPosition.slot,
      mission,
      metal: resources?.metal || 0,
      crystal: resources?.crystal || 0,
      deuterium: resources?.deuterium || 0,
      arrivesAt: new Date(now.getTime() + flightTime * 1000),
      returnsAt: new Date(now.getTime() + flightTime * 2 * 1000),
      ships: {
        create: ships.map((s: { type: string; count: number }) => ({
          type: s.type,
          count: s.count,
        })),
      },
    },
    include: { ships: true },
  });

  return c.json(fleet, 201);
});

// Get all fleets for a player
fleetRoutes.get('/player/:playerId', async (c) => {
  const { playerId } = c.req.param();

  const fleets = await prisma.fleet.findMany({
    where: { ownerId: playerId },
    include: { ships: true, originPlanet: true },
  });

  return c.json(fleets);
});

// Cancel/return a fleet
fleetRoutes.post('/:fleetId/return', async (c) => {
  const { fleetId } = c.req.param();

  const fleet = await prisma.fleet.findUnique({
    where: { id: fleetId },
  });

  if (!fleet) {
    return c.json({ error: 'Fleet not found' }, 404);
  }

  const now = new Date();
  const timeFlying = now.getTime() - fleet.launchedAt.getTime();
  const returnTime = new Date(now.getTime() + timeFlying);

  const updatedFleet = await prisma.fleet.update({
    where: { id: fleetId },
    data: { returnsAt: returnTime },
  });

  return c.json(updatedFleet);
});