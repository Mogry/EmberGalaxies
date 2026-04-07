import { Hono } from 'hono';
import { prisma } from '../db/client';
import {
  calculateDistance,
  calculateFlightTime,
  calculateH2Cost,
  getFlightType,
  getBestDrive,
  canFleetUseDrive,
  SHIP_STATS,
} from '@ember-galaxies/shared';

export const fleetRoutes = new Hono();

// POST /fleet/launch
fleetRoutes.post('/launch', async (c) => {
  const body = await c.req.json();
  const {
    playerId,
    originPlanetId,
    targetPlanetId,
    ships,        // Array<{ type: ShipType, count: number }>
    mission,      // FleetMission
    resources,    // { iron?, silver?, ember?, h2?, energy? }
  } = body;

  // Planeten laden mit System und Galaxy
  const [originPlanet, targetPlanet] = await Promise.all([
    prisma.planet.findUnique({
      where: { id: originPlanetId },
      include: { system: { include: { galaxy: true } } },
    }),
    prisma.planet.findUnique({
      where: { id: targetPlanetId },
      include: { system: { include: { galaxy: true } } },
    }),
  ]);

  if (!originPlanet || !targetPlanet) {
    return c.json({ error: 'Planet not found' }, 404);
  }

  // Ownership prüfen
  if (originPlanet.ownerId !== playerId) {
    return c.json({ error: 'Not your planet' }, 403);
  }

  // Genug Schiffe vorhanden?
  const originShips = await prisma.planetShip.findMany({
    where: { planetId: originPlanetId },
  });

  for (const shipReq of ships) {
    const available = originShips.find(s => s.shipType === shipReq.type)?.count ?? 0;
    if (available < shipReq.count) {
      return c.json({
        error: `Not enough ${shipReq.type}. Have ${available}, need ${shipReq.count}`,
      }, 400);
    }
  }

  // Spieler-Research laden für Antriebe
  const playerResearch = await prisma.research.findMany({
    where: { playerId },
  });

  // Verfügbare Antriebe aus Research
  const availableDrives = playerResearch
    .filter(r => r.level > 0 && r.type.startsWith('drive_'))
    .map(r => r.type.replace('drive_', '') as any)
    .filter(Boolean);

  // Immer combustion verfügbar wenn nichts anderes geforscht
  const drives = availableDrives.length > 0 ? availableDrives : ['combustion'];

  // Koordinaten aus System/Galaxy
  const originCoord = {
    galaxyIndex: originPlanet.system.galaxy.index,
    systemIndex: originPlanet.system.index,
    slot: originPlanet.slot,
  };
  const targetCoord = {
    galaxyIndex: targetPlanet.system.galaxy.index,
    systemIndex: targetPlanet.system.index,
    slot: targetPlanet.slot,
  };

  const distance = calculateDistance(originCoord, targetCoord);
  const flightType = getFlightType(originCoord, targetCoord);
  const bestDrive = getBestDrive(drives, flightType);

  if (!bestDrive) {
    return c.json({
      error: flightType === 'interGalaxy'
        ? 'No interdimensional drive available for inter-galaxy travel'
        : 'No suitable drive available',
    }, 400);
  }

  // Hangar-Validierung
  const hangarCheck = canFleetUseDrive(ships, bestDrive);
  if (!hangarCheck.possible) {
    return c.json({
      error: `Not enough hangar capacity. Need ${hangarCheck.needTransport}, have ${hangarCheck.totalHangar}`,
    }, 400);
  }

  // H2-Kosten prüfen
  const h2Cost = calculateH2Cost(distance, ships, bestDrive, flightType);
  if (originPlanet.h2 < h2Cost) {
    return c.json({ error: `Not enough H2. Need ${h2Cost}, have ${originPlanet.h2}` }, 400);
  }

  // Genug Cargo für Ressourcen?
  const totalCargo = ships.reduce((sum, s) => {
    const stats = SHIP_STATS[s.type as keyof typeof SHIP_STATS];
    return sum + (stats?.cargo ?? 0) * s.count;
  }, 0);
  const totalResources = (resources?.iron ?? 0) + (resources?.silver ?? 0) + (resources?.ember ?? 0) + (resources?.h2 ?? 0) + (resources?.energy ?? 0);

  if (totalResources > totalCargo) {
    return c.json({ error: `Not enough cargo capacity. Have ${totalCargo}, need ${totalResources}` }, 400);
  }

  // Flugzeit
  const flightSeconds = calculateFlightTime(distance, ships, bestDrive, flightType);
  const now = new Date();
  const arrivesAt = new Date(now.getTime() + flightSeconds * 1000);
  const returnsAt = new Date(arrivesAt.getTime() + flightSeconds * 1000);

  // Transaktion: Schiffe abziehen, H2 abziehen, Flotte erstellen
  await prisma.$transaction([
    // Schiffe von Planet abziehen
    ...ships.map(s =>
      prisma.planetShip.update({
        where: { planetId_shipType: { planetId: originPlanetId, shipType: s.type } },
        data: { count: { decrement: s.count } },
      })
    ),
    // H2 abziehen
    prisma.planet.update({
      where: { id: originPlanetId },
      data: { h2: { decrement: h2Cost } },
    }),
  ]);

  // Flotte erstellen
  const fleet = await prisma.fleet.create({
    data: {
      ownerId: playerId,
      originPlanetId,
      targetPlanetId,
      mission,
      iron: resources?.iron ?? 0,
      silver: resources?.silver ?? 0,
      ember: resources?.ember ?? 0,
      h2: resources?.h2 ?? 0,
      energy: resources?.energy ?? 0,
      launchedAt: now,
      arrivesAt,
      returnsAt,
      ships: {
        create: ships.map(s => ({
          type: s.type,
          count: s.count,
        })),
      },
    },
    include: { ships: true },
  });

  return c.json({ fleet, distance, drive: bestDrive, flightSeconds, h2Cost }, 201);
});

// GET /fleet/player/:playerId
fleetRoutes.get('/player/:playerId', async (c) => {
  const { playerId } = c.req.param();

  const fleets = await prisma.fleet.findMany({
    where: { ownerId: playerId },
    include: { ships: true, originPlanet: true, targetPlanet: true },
  });

  return c.json(fleets);
});

// POST /fleet/:fleetId/recall
fleetRoutes.post('/:fleetId/recall', async (c) => {
  const { fleetId } = c.req.param();
  const { playerId } = await c.req.json();

  const fleet = await prisma.fleet.findUnique({
    where: { id: fleetId },
  });

  if (!fleet) {
    return c.json({ error: 'Fleet not found' }, 404);
  }

  if (fleet.ownerId !== playerId) {
    return c.json({ error: 'Not your fleet' }, 403);
  }

  if (fleet.returnsAt) {
    return c.json({ error: 'Fleet already returning' }, 400);
  }

  const now = new Date();
  if (now >= fleet.arrivesAt) {
    return c.json({ error: 'Fleet already arrived' }, 400);
  }

  const timeFlying = now.getTime() - fleet.launchedAt.getTime();
  const newReturnsAt = new Date(now.getTime() + timeFlying);

  const updatedFleet = await prisma.fleet.update({
    where: { id: fleetId },
    data: { returnsAt: newReturnsAt },
  });

  return c.json(updatedFleet);
});

// POST /fleet/simulate — Trockener Lauf
fleetRoutes.post('/simulate', async (c) => {
  const body = await c.req.json();
  const {
    originPlanetId,
    targetPlanetId,
    ships,
  } = body;

  const [originPlanet, targetPlanet] = await Promise.all([
    prisma.planet.findUnique({
      where: { id: originPlanetId },
      include: { system: { include: { galaxy: true } } },
    }),
    prisma.planet.findUnique({
      where: { id: targetPlanetId },
      include: { system: { include: { galaxy: true } } },
    }),
  ]);

  if (!originPlanet || !targetPlanet) {
    return c.json({ error: 'Planet not found' }, 404);
  }

  const originCoord = {
    galaxyIndex: originPlanet.system.galaxy.index,
    systemIndex: originPlanet.system.index,
    slot: originPlanet.slot,
  };
  const targetCoord = {
    galaxyIndex: targetPlanet.system.galaxy.index,
    systemIndex: targetPlanet.system.index,
    slot: targetPlanet.slot,
  };

  const distance = calculateDistance(originCoord, targetCoord);
  const flightType = getFlightType(originCoord, targetCoord);

  // Alle Antriebe durchprobieren
  const results = (['combustion', 'ion', 'hyper', 'nexus', 'interdim'] as const).map(drive => {
    const hangarCheck = canFleetUseDrive(ships, drive);
    if (!hangarCheck.possible) return null;

    const flightSeconds = calculateFlightTime(distance, ships, drive, flightType);
    const h2Cost = calculateH2Cost(distance, ships, drive, flightType);

    return {
      drive,
      flightSeconds,
      h2Cost,
      distance,
      flightType,
      possible: flightSeconds !== Infinity && h2Cost !== Infinity,
    };
  }).filter(Boolean);

  return c.json({ results, distance, flightType });
});
