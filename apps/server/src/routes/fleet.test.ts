import { test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.$transaction([
    prisma.fleetShip.deleteMany(),
    prisma.fleet.deleteMany(),
    prisma.planetShip.deleteMany(),
    prisma.research.deleteMany(),
    prisma.building.deleteMany(),
    prisma.planet.deleteMany(),
    prisma.star.deleteMany(),
    prisma.system.deleteMany(),
    prisma.galaxy.deleteMany(),
    prisma.player.deleteMany(),
  ]);
});

// =============================================================================
// Test: ember_bomb (cargo=0, hyperspace drive) cannot do round-trip interGalaxy
//
// Distance G1→G51: |0|×5 + 100 + |0|×20 + 2000 + |50|×500 = 27,100 DE
// H2 cost (1 ember_bomb, hyperspace): ceil(1 × 27100 × 0.001 × 2.0) = 55 per leg
// Round trip (transport): 55 × 2 = 110 H2
// ember_bomb cargo = 0 → 0 < 110 → cargo+fuel error
// =============================================================================

test('ember_bomb over 50 galaxies: cargo=0 insufficient for round-trip H2 → 400', async () => {
  const galaxy1 = await prisma.galaxy.create({ data: { name: 'G1', index: 0 } });
  const system1 = await prisma.system.create({ data: { index: 0, galaxyId: galaxy1.id } });

  const galaxy51 = await prisma.galaxy.create({ data: { name: 'G51', index: 50 } });
  const system51 = await prisma.system.create({ data: { index: 0, galaxyId: galaxy51.id } });

  const player = await prisma.player.create({
    data: { name: 'TestPlayer', isBot: false, apiKey: `test-key-${Date.now()}` },
  });

  const origin = await prisma.planet.create({
    data: {
      name: 'Origin', slot: 50, systemId: system1.id, ownerId: player.id,
      lastSeen: new Date(), iron: 0, silver: 0, ember: 0, h2: 10000, energy: 0,
    },
  });

  const target = await prisma.planet.create({
    data: {
      name: 'Target', slot: 50, systemId: system51.id, ownerId: player.id,
      lastSeen: new Date(), iron: 0, silver: 0, ember: 0, h2: 0, energy: 0,
    },
  });

  // ember_bomb has drives=['hyperspace'] and cargo=0
  await prisma.planetShip.create({
    data: { planetId: origin.id, shipType: 'ember_bomb', count: 1 },
  });

  await prisma.research.upsert({
    where: { playerId_type: { playerId: player.id, type: 'hyperspace_drive' } },
    update: { level: 1 },
    create: { playerId: player.id, type: 'hyperspace_drive', level: 1 },
  });

  const res = await fetch('http://localhost:3000/api/fleet/launch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${player.apiKey}` },
    body: JSON.stringify({
      playerId: player.id,
      originPlanetId: origin.id,
      targetPlanetId: target.id,
      mission: 'transport',
      ships: [{ type: 'ember_bomb', count: 1 }],
      resources: {},
    }),
  });

  const status = res.status;
  const body = await res.json();
  console.log('TEST 1 → status:', status, 'body:', JSON.stringify(body));

  // Must fail with 400 due to insufficient cargo for H2 fuel
  expect(status).toBe(400);
  expect(body.error).toMatch(/cargo/i);
  expect(body.error).toMatch(/h2|fuel/i);
});

// =============================================================================
// Test: Carrier Titan (cargo=50000) can handle the same long trip
// =============================================================================

test('carrier_titan over 50 galaxies: cargo sufficient for round-trip H2 → 201', async () => {
  const galaxy1 = await prisma.galaxy.create({ data: { name: 'G1-t2', index: 0 } });
  const system1 = await prisma.system.create({ data: { index: 0, galaxyId: galaxy1.id } });

  const galaxy51 = await prisma.galaxy.create({ data: { name: 'G51-t2', index: 50 } });
  const system51 = await prisma.system.create({ data: { index: 0, galaxyId: galaxy51.id } });

  const player = await prisma.player.create({
    data: { name: 'TestPlayer2', isBot: false, apiKey: `test-key-${Date.now()}-t2` },
  });

  const origin = await prisma.planet.create({
    data: {
      name: 'Origin', slot: 50, systemId: system1.id, ownerId: player.id,
      lastSeen: new Date(), iron: 0, silver: 0, ember: 0, h2: 10000, energy: 0,
    },
  });

  const target = await prisma.planet.create({
    data: {
      name: 'Target', slot: 50, systemId: system51.id, ownerId: player.id,
      lastSeen: new Date(), iron: 0, silver: 0, ember: 0, h2: 0, energy: 0,
    },
  });

  await prisma.planetShip.create({
    data: { planetId: origin.id, shipType: 'carrier_titan', count: 1 },
  });

  await prisma.research.upsert({
    where: { playerId_type: { playerId: player.id, type: 'hyperspace_drive' } },
    update: { level: 1 },
    create: { playerId: player.id, type: 'hyperspace_drive', level: 1 },
  });

  const res = await fetch('http://localhost:3000/api/fleet/launch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${player.apiKey}` },
    body: JSON.stringify({
      playerId: player.id,
      originPlanetId: origin.id,
      targetPlanetId: target.id,
      mission: 'transport',
      ships: [{ type: 'carrier_titan', count: 1 }],
      resources: {},
    }),
  });

  const status = res.status;
  expect(status).toBe(201);
});
