import { test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { PrismaClient } from '@prisma/client';
import { calculateOfflineProduction } from '@ember-galaxies/shared';
import { syncPlanet } from './timerCompletion';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up in FK dependency order
  await prisma.$transaction([
    prisma.fleetShip.deleteMany(),
    prisma.fleet.deleteMany(),
    prisma.shipyard.deleteMany(),
    prisma.constructionQueue.deleteMany(),
    prisma.building.deleteMany(),
    prisma.planetShip.deleteMany(),
    prisma.research.deleteMany(),
    prisma.planet.deleteMany(),
    prisma.star.deleteMany(),
    prisma.system.deleteMany(),
    prisma.galaxy.deleteMany(),
    prisma.player.deleteMany(),
  ]);
});

// =============================================================================
// Test: 10-hour offline simulation
//
// Timeline:
//   T-10h                T-2h               T-1h              T=now
//     |                    |                   |                  |
//   lastSeen          building_complete    fleet_arrival     currentTime
//   (planet created)   (iron_mine L0→L1)  (transport: +500 Fe)
//
// Production math (iron_mine L1: 22 base × 1 × 1.08^1 = 23.76 iron/h):
//   [T-10h → T-2h]: 8h × 0   =   0.00 iron  (no mine yet, level 0)
//   [T-2h → T-1h]:  1h × 23.76 =  23.76 iron  (mine at L1)
//   [T-1h → T]:      1h × 23.76 =  23.76 iron  (mine at L1)
//   Fleet delivery:                   +500.00 iron
//   Total gained:                    547.52 iron
//
// Expected iron = 100 (initial) + 547.52 = 647.52
// =============================================================================

test('10-hour offline simulation: production + building completion + fleet arrival', async () => {
  const msPerHour = 60 * 60 * 1000;

  // ── 1. Set up galaxy / system / planet ──────────────────────────────────
  const galaxy = await prisma.galaxy.create({
    data: { name: `Galaxy-${Date.now()}-1` },
  });
  const system = await prisma.system.create({
    data: { index: 1, galaxyId: galaxy.id },
  });
  const lastSeen = new Date(Date.now() - 10 * msPerHour);
  const planet = await prisma.planet.create({
    data: {
      name: 'Test Planet',
      slot: 1,
      systemId: system.id,
      lastSeen,
      iron: 100,
      silver: 0,
      ember: 0,
      h2: 0,
      energy: 0,
    },
  });

  // ── 2. Create player ────────────────────────────────────────────────────
  const player = await prisma.player.create({
    data: { name: `Player-${Date.now()}-1`, isBot: false },
  });

  // ── 3. Set planet ownership ───────────────────────────────────────────────
  await prisma.planet.update({
    where: { id: planet.id },
    data: { ownerId: player.id },
  });

  // ── 4. Iron mine at level 0 ─────────────────────────────────────────────
  //    After upgrade completes (at T-2h), it produces 23.76 iron/h
  const ironMine = await prisma.building.create({
    data: {
      planetId: planet.id,
      type: 'iron_mine',
      level: 0,
      isUpgrading: true,
      upgradeFinishAt: new Date(Date.now() - 2 * msPerHour),
    },
  });

  await prisma.constructionQueue.create({
    data: {
      buildingId: ironMine.id,
      targetLevel: 1,
      upgradeFinishAt: new Date(Date.now() - 2 * msPerHour),
    },
  });

  // ── 5. Origin planet ────────────────────────────────────────────────────
  const originPlanet = await prisma.planet.create({
    data: {
      name: 'Origin Planet',
      slot: 2,
      systemId: system.id,
      ownerId: player.id,
      lastSeen: new Date(),
      iron: 0,
      silver: 0,
      ember: 0,
      h2: 0,
      energy: 0,
    },
  });

  // ── 6. Transport fleet arriving at T-1h with 500 iron ───────────────────
  const launchedAt = new Date(Date.now() - 10 * msPerHour);
  const arrivesAt = new Date(Date.now() - 1 * msPerHour);
  const fleet = await prisma.fleet.create({
    data: {
      ownerId: player.id,
      originPlanetId: originPlanet.id,
      targetPlanetId: planet.id,
      mission: 'transport',
      iron: 500,
      silver: 0,
      ember: 0,
      h2: 0,
      energy: 0,
      launchedAt,
      arrivesAt,
      returnsAt: new Date(Date.now() + 9 * msPerHour), // placeholder — will be recalculated
    },
  });

  await prisma.fleetShip.create({
    data: { fleetId: fleet.id, type: 'fly', count: 1 },
  });

  // ── 7. Run syncPlanet ────────────────────────────────────────────────────
  const currentTime = new Date();
  const result = await syncPlanet(planet.id, currentTime);

  // ── 8. Verify completions ────────────────────────────────────────────────
  expect(result.buildingCompletions).toHaveLength(1);
  expect(result.buildingCompletions[0]).toMatchObject({
    planetId: planet.id,
    buildingType: 'iron_mine',
    newLevel: 1,
    playerId: player.id,
  });

  expect(result.fleetArrivals).toHaveLength(1);
  expect(result.fleetArrivals[0]).toMatchObject({
    fleetId: fleet.id,
    targetPlanetId: planet.id,
    mission: 'transport',
    playerId: player.id,
  });

  // ── 9. Verify DB state ───────────────────────────────────────────────────
  const updatedMine = await prisma.building.findUnique({ where: { id: ironMine.id } });
  expect(updatedMine!.level).toBe(1);
  expect(updatedMine!.isUpgrading).toBe(false);

  const updatedFleet = await prisma.fleet.findUnique({ where: { id: fleet.id } });
  expect(updatedFleet!.targetPlanetId).toBeNull();
  expect(updatedFleet!.iron).toBe(0);
  expect(updatedFleet!.returnsAt!.getTime()).toBeGreaterThan(currentTime.getTime());

  // ── 10. Mathematical verification ─────────────────────────────────────────
  // Phase 1: T-10h → T-2h @ L0
  const phase1Iron = calculateOfflineProduction(
    [{ id: 'x', planetId: planet.id, type: 'iron_mine', level: 0, isUpgrading: false, upgradeFinishAt: null }],
    lastSeen,
    new Date(Date.now() - 2 * msPerHour),
  ).iron;

  // Phase 2: T-2h → T-1h @ L1
  const phase2Iron = calculateOfflineProduction(
    [{ id: 'x', planetId: planet.id, type: 'iron_mine', level: 1, isUpgrading: false, upgradeFinishAt: null }],
    new Date(Date.now() - 2 * msPerHour),
    new Date(Date.now() - 1 * msPerHour),
  ).iron;

  // Phase 3: T-1h → T @ L1
  const phase3Iron = calculateOfflineProduction(
    [{ id: 'x', planetId: planet.id, type: 'iron_mine', level: 1, isUpgrading: false, upgradeFinishAt: null }],
    new Date(Date.now() - 1 * msPerHour),
    currentTime,
  ).iron;

  const expectedIron = 100 + phase1Iron + phase2Iron + phase3Iron + 500;

  const updatedPlanet = await prisma.planet.findUnique({ where: { id: planet.id } });
  expect(updatedPlanet!.iron).toBeCloseTo(expectedIron, 2);
  expect(updatedPlanet!.lastSeen.getTime()).toBeCloseTo(currentTime.getTime(), -3);
});

// =============================================================================
// Test: Fleet return — ships are returned to origin planet, fleet deleted
// =============================================================================

test('fleet return: ships returned to origin, fleet deleted', async () => {
  const msPerHour = 60 * 60 * 1000;

  const galaxy = await prisma.galaxy.create({ data: { name: `Galaxy-${Date.now()}-2` } });
  const system = await prisma.system.create({ data: { index: 1, galaxyId: galaxy.id } });

  const origin = await prisma.planet.create({
    data: {
      name: 'Origin', slot: 1, systemId: system.id, ownerId: null,
      lastSeen: new Date(), iron: 0, silver: 0, ember: 0, h2: 0, energy: 0,
    },
  });
  const target = await prisma.planet.create({
    data: {
      name: 'Target', slot: 2, systemId: system.id, ownerId: null,
      lastSeen: new Date(), iron: 0, silver: 0, ember: 0, h2: 0, energy: 0,
    },
  });

  const player = await prisma.player.create({
    data: { name: `Player-${Date.now()}-2`, isBot: false },
  });
  await prisma.planet.update({ where: { id: origin.id }, data: { ownerId: player.id } });
  await prisma.planet.update({ where: { id: target.id }, data: { ownerId: player.id } });

  // Fleet: already returned (returnsAt in the past)
  const fleet = await prisma.fleet.create({
    data: {
      ownerId: player.id,
      originPlanetId: origin.id,
      targetPlanetId: target.id,
      mission: 'transport',
      iron: 0, silver: 0, ember: 0, h2: 0, energy: 0,
      launchedAt: new Date(Date.now() - 20 * msPerHour),
      arrivesAt: new Date(Date.now() - 10 * msPerHour),
      returnsAt: new Date(Date.now() - 1 * msPerHour), // returned 1h ago
    },
  });
  await prisma.fleetShip.create({ data: { fleetId: fleet.id, type: 'fly', count: 5 } });

  await syncPlanet(origin.id, new Date());

  const fleetAfter = await prisma.fleet.findUnique({ where: { id: fleet.id } });
  expect(fleetAfter).toBeNull();

  const shipsOnOrigin = await prisma.planetShip.findUnique({
    where: { planetId_shipType: { planetId: origin.id, shipType: 'fly' } },
  });
  expect(shipsOnOrigin!.count).toBe(5);
});

// =============================================================================
// Test: Colonize — ownership changes, colonizer consumed, fleet returns
// =============================================================================

test('colonize: ownership transferred, colonizer consumed, remaining fleet returns', async () => {
  const msPerHour = 60 * 60 * 1000;

  const galaxy = await prisma.galaxy.create({ data: { name: `Galaxy-${Date.now()}-3` } });
  const system = await prisma.system.create({ data: { index: 1, galaxyId: galaxy.id } });

  const origin = await prisma.planet.create({
    data: {
      name: 'Origin', slot: 1, systemId: system.id, ownerId: null,
      lastSeen: new Date(), iron: 0, silver: 0, ember: 0, h2: 0, energy: 0,
    },
  });
  const target = await prisma.planet.create({
    data: {
      name: 'Unclaimed', slot: 2, systemId: system.id, ownerId: null,
      lastSeen: new Date(Date.now() - 10 * msPerHour), iron: 0, silver: 0, ember: 0, h2: 0, energy: 0,
    },
  });

  const colonizerPlayer = await prisma.player.create({
    data: { name: `Colonizer-${Date.now()}-3`, isBot: false },
  });
  await prisma.planet.update({ where: { id: origin.id }, data: { ownerId: colonizerPlayer.id } });

  const launchedAt = new Date(Date.now() - 10 * msPerHour);
  const arrivesAt = new Date(Date.now() - 1 * msPerHour);
  const fleet = await prisma.fleet.create({
    data: {
      ownerId: colonizerPlayer.id,
      originPlanetId: origin.id,
      targetPlanetId: target.id,
      mission: 'colonize',
      iron: 0, silver: 0, ember: 0, h2: 0, energy: 0,
      launchedAt,
      arrivesAt,
      returnsAt: new Date(Date.now() + 9 * msPerHour), // placeholder
    },
  });
  await prisma.fleetShip.create({ data: { fleetId: fleet.id, type: 'colonizer', count: 1 } });
  await prisma.fleetShip.create({ data: { fleetId: fleet.id, type: 'fly', count: 5 } });

  await syncPlanet(target.id, new Date());

  const updatedTarget = await prisma.planet.findUnique({ where: { id: target.id } });
  expect(updatedTarget!.ownerId).toBe(colonizerPlayer.id);

  const updatedFleet = await prisma.fleet.findUnique({ where: { id: fleet.id } });
  expect(updatedFleet).not.toBeNull();
  expect(updatedFleet!.returnsAt!.getTime()).toBeGreaterThan(Date.now());

  const remainingShips = await prisma.fleetShip.findMany({ where: { fleetId: fleet.id } });
  expect(remainingShips.find(s => s.type === 'colonizer')).toBeUndefined();
  const flyShip = remainingShips.find(s => s.type === 'fly');
  expect(flyShip).toBeDefined();
  expect(flyShip!.count).toBe(5);
});

// =============================================================================
// Test: Deployment — fleet stays in orbit (returnsAt = null)
// =============================================================================

test('deployment: fleet stays deployed, returnsAt=null, ships consumed', async () => {
  const msPerHour = 60 * 60 * 1000;

  const galaxy = await prisma.galaxy.create({ data: { name: `Galaxy-${Date.now()}-4` } });
  const system = await prisma.system.create({ data: { index: 1, galaxyId: galaxy.id } });

  const origin = await prisma.planet.create({
    data: {
      name: 'Origin', slot: 1, systemId: system.id, ownerId: null,
      lastSeen: new Date(), iron: 0, silver: 0, ember: 0, h2: 0, energy: 0,
    },
  });
  const target = await prisma.planet.create({
    data: {
      name: 'Target', slot: 2, systemId: system.id, ownerId: null,
      lastSeen: new Date(Date.now() - 10 * msPerHour), iron: 0, silver: 0, ember: 0, h2: 0, energy: 0,
    },
  });

  const player = await prisma.player.create({
    data: { name: `Player-${Date.now()}-4`, isBot: false },
  });
  await prisma.planet.update({ where: { id: origin.id }, data: { ownerId: player.id } });
  await prisma.planet.update({ where: { id: target.id }, data: { ownerId: player.id } });

  const fleet = await prisma.fleet.create({
    data: {
      ownerId: player.id,
      originPlanetId: origin.id,
      targetPlanetId: target.id,
      mission: 'deployment',
      iron: 100, silver: 0, ember: 0, h2: 0, energy: 0,
      launchedAt: new Date(Date.now() - 10 * msPerHour),
      arrivesAt: new Date(Date.now() - 1 * msPerHour),
      returnsAt: new Date(Date.now() + 9 * msPerHour), // placeholder
    },
  });
  await prisma.fleetShip.create({ data: { fleetId: fleet.id, type: 'fly', count: 3 } });

  await syncPlanet(target.id, new Date());

  const updatedFleet = await prisma.fleet.findUnique({ where: { id: fleet.id } });
  expect(updatedFleet).not.toBeNull();
  expect(updatedFleet!.returnsAt).toBeNull();
  expect(updatedFleet!.iron).toBe(0);

  const remainingShips = await prisma.fleetShip.findMany({ where: { fleetId: fleet.id } });
  expect(remainingShips).toHaveLength(0);
});
