import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLAYER_ID = 'cmnmvcsia0000atjujuq4n0nw';
const ORIGIN_PLANET_ID = 'cmnmvbe1w000413roo1hf8hli'; // has ships
const TARGET_PLANET_ID = 'cmnmvcsko0002atjubtcr3eqd'; // same owner, can test attack...

async function setup() {
  // Add colonizer + ember_bomb to origin planet if not present
  const ships = await prisma.planetShip.findMany({ where: { planetId: ORIGIN_PLANET_ID } });
  const shipMap = new Map(ships.map(s => [s.shipType, s.count]));

  const needed: Array<{ type: 'colonizer' | 'ember_bomb' | 'fly'; count: number }> = [
    { type: 'colonizer', count: 1 },
    { type: 'ember_bomb', count: 1 },
    { type: 'fly', count: 50 },
  ];

  for (const { type, count } of needed) {
    const current = shipMap.get(type) ?? 0;
    if (current < count) {
      await prisma.planetShip.upsert({
        where: { planetId_shipType: { planetId: ORIGIN_PLANET_ID, shipType: type } },
        update: { count },
        create: { planetId: ORIGIN_PLANET_ID, shipType: type, count },
      });
      console.log(`Set ${type} to ${count} (was ${current})`);
    }
  }

  // Ensure hyperspace drive for colonizer/ember_bomb
  await prisma.research.upsert({
    where: { playerId_type: { playerId: PLAYER_ID, type: 'hyperspace_drive' } },
    update: { level: 1 },
    create: { playerId: PLAYER_ID, type: 'hyperspace_drive', level: 1 },
  });

  console.log(`Setup complete. Ready to test.`);
}

async function callFleetApi(body: object): Promise<{ status: number; data: any }> {
  const res = await fetch('http://localhost:3000/api/fleet/launch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-api-key-123' },
    body: JSON.stringify(body),
  });

  let data: any;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

async function testAttackFleet() {
  console.log('\n--- TEST: Attack fleet ---');
  const { status, data } = await callFleetApi({
    playerId: PLAYER_ID,
    originPlanetId: ORIGIN_PLANET_ID,
    targetPlanetId: TARGET_PLANET_ID,
    mission: 'attack',
    ships: [{ type: 'fly', count: 5 }],
    resources: { iron: 100, silver: 50 },
  });

  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 201;
}

async function testColonizeWithoutColonizer() {
  console.log('\n--- TEST: Colonize without colonizer (should fail) ---');
  const { status, data } = await callFleetApi({
    playerId: PLAYER_ID,
    originPlanetId: ORIGIN_PLANET_ID,
    targetPlanetId: TARGET_PLANET_ID,
    mission: 'colonize',
    ships: [{ type: 'fly', count: 10 }],
    resources: {},
  });

  console.log(`Status: ${status} (expected 400)`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 400;
}

async function testColonizeWithColonizer() {
  console.log('\n--- TEST: Colonize with colonizer (should succeed) ---');
  const { status, data } = await callFleetApi({
    playerId: PLAYER_ID,
    originPlanetId: ORIGIN_PLANET_ID,
    targetPlanetId: TARGET_PLANET_ID,
    mission: 'colonize',
    ships: [{ type: 'colonizer', count: 1 }],
    resources: {},
  });

  console.log(`Status: ${status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 201;
}

async function testDestroyWithoutBomb() {
  console.log('\n--- TEST: Destroy without ember_bomb (should fail) ---');
  const { status, data } = await callFleetApi({
    playerId: PLAYER_ID,
    originPlanetId: ORIGIN_PLANET_ID,
    targetPlanetId: TARGET_PLANET_ID,
    mission: 'destroy',
    ships: [{ type: 'fly', count: 10 }],
    resources: {},
  });

  console.log(`Status: ${status} (expected 400)`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return status === 400;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  await setup();

  const r1 = await testAttackFleet();
  await sleep(15000); // wait for rate limit cooldown

  const r2 = await testColonizeWithoutColonizer();
  await sleep(15000);

  const r3 = await testColonizeWithColonizer();
  await sleep(15000);

  const r4 = await testDestroyWithoutBomb();

  console.log('\n=== RESULTS ===');
  console.log(`Attack fleet:               ${r1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Colonize without colonizer: ${r2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Colonize with colonizer:    ${r3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Destroy without bomb:        ${r4 ? '✅ PASS' : '❌ FAIL'}`);

  await prisma.$disconnect();
}

main().catch(console.error);
