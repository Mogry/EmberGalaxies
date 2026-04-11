import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GALAXIES = 100;
const SYSTEMS_PER_GALAXY = 300;

// Planets per system: Normal distribution, min 10, max 30, mean 20, stddev ~4
function planetCountForSystem(): number {
  const samples = Array.from({ length: 6 }, () => Math.random());
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const gauss = (mean - 0.5) * 4;
  const count = Math.round(20 + gauss * 4);
  return Math.max(10, Math.min(30, count));
}

function starTemperature(planetCount: number): number {
  return Math.round(2000 + planetCount * 70);
}

function starEnergyOutput(temperature: number): number {
  return Math.round((temperature / 3000) * 1000 * 10) / 10;
}

interface SystemBlueprint {
  index: number;
  planetCount: number;
  temperature: number;
  energyOutput: number;
}

async function main() {
  console.log('🌀 Seeding full universe...\n');

  // Clean slate (order matters for FK constraints)
  await prisma.gameEvent.deleteMany();
  await prisma.combatReport.deleteMany();
  await prisma.fleetShip.deleteMany();
  await prisma.fleet.deleteMany();
  await prisma.constructionQueue.deleteMany();
  await prisma.planetShip.deleteMany();
  await prisma.shipyard.deleteMany();
  await prisma.building.deleteMany();
  await prisma.research.deleteMany();
  await prisma.star.deleteMany();
  await prisma.planet.deleteMany();
  await prisma.system.deleteMany();
  await prisma.galaxy.deleteMany();

  let totalSystems = 0;
  let totalPlanets = 0;

  for (let g = 1; g <= GALAXIES; g++) {
    const start = Date.now();

    // Pre-calculate all system data for this galaxy
    const systemBlueprints: SystemBlueprint[] = Array.from(
      { length: SYSTEMS_PER_GALAXY },
      (_, i) => {
        const planetCount = planetCountForSystem();
        const temperature = starTemperature(planetCount);
        const energyOutput = starEnergyOutput(temperature);
        return { index: i + 1, planetCount, temperature, energyOutput };
      },
    );

    // Create galaxy
    const galaxy = await prisma.galaxy.create({
      data: { name: `G${g}`, index: g },
    });

    // Bulk-create systems
    await prisma.system.createMany({
      data: systemBlueprints.map((s) => ({
        index: s.index,
        galaxyId: galaxy.id,
      })),
    });

    // Fetch system IDs back (ordered by index)
    const systems = await prisma.system.findMany({
      where: { galaxyId: galaxy.id },
      select: { id: true, index: true },
      orderBy: { index: 'asc' },
    });

    // Bulk-create stars
    await prisma.star.createMany({
      data: systems.map((s, i) => ({
        temperature: systemBlueprints[i].temperature,
        energyOutput: systemBlueprints[i].energyOutput,
        systemId: s.id,
      })),
    });

    // Build planet data
    const planetData: { name: string; slot: number; systemId: string }[] = [];
    for (let i = 0; i < systems.length; i++) {
      const sys = systems[i];
      const bp = systemBlueprints[i];
      for (let p = 1; p <= bp.planetCount; p++) {
        planetData.push({
          name: `G${g}-S${String(bp.index).padStart(3, '0')}-P${p}`,
          slot: p,
          systemId: sys.id,
        });
      }
    }

    // Bulk-create planets (chunk to avoid parameter limits)
    const CHUNK = 5000;
    for (let i = 0; i < planetData.length; i += CHUNK) {
      await prisma.planet.createMany({
        data: planetData.slice(i, i + CHUNK),
      });
    }

    totalSystems += SYSTEMS_PER_GALAXY;
    totalPlanets += planetData.length;
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    if (g % 10 === 0 || g === 1) {
      console.log(
        `  G${String(g).padStart(3)}: ${SYSTEMS_PER_GALAXY} systems, ${planetData.length} planets (${elapsed}s)`,
      );
    }
  }

  console.log('\n✅ Universe seeded!');
  console.log(`   Galaxies:  ${GALAXIES}`);
  console.log(`   Systems:   ${totalSystems}`);
  console.log(`   Planets:   ${totalPlanets}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });