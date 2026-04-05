import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Planeten pro System: Normalverteilt, min 10, max 30, mean 20, stddev ~4
function planetCountForSystem(): number {
  // Zentraler Grenzwertsatz: Summe von 6 Gleichverteilten → annähernd Normalverteilung
  const samples = Array.from({ length: 6 }, () => Math.random());
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const gauss = (mean - 0.5) * 4; // transform to ~N(0, 1)
  const count = Math.round(20 + gauss * 4);
  return Math.max(10, Math.min(30, count));
}

// Stern-Temperatur basierend auf Planetenanzahl
function starTemperature(planetCount: number): number {
  // 10 Planeten → 2500K, 30 Planeten → 4000K (linear)
  return Math.round(2000 + planetCount * 70);
}

// Stern-Energieoutput basierend auf Temperatur
function starEnergyOutput(temperature: number): number {
  // Basis: 3000K → 1000 kW
  return Math.round((temperature / 3000) * 1000 * 10) / 10;
}

async function main() {
  console.log('🌀 Starting galaxy initialization...\n');

  // Existierende Daten löschen (sauberer Start)
  await prisma.star.deleteMany();
  await prisma.planet.deleteMany();
  await prisma.system.deleteMany();
  await prisma.galaxy.deleteMany();

  const galaxyNames = ['Milchstraße', 'Andromeda', 'Triangulum'];
  const SYSTEMS_PER_GALAXY = 300;
  const MIN_PLANETS = 10;
  const MAX_PLANETS = 30;

  let totalPlanets = 0;
  let totalStars = 0;

  for (let g = 1; g <= 3; g++) {
    console.log(`📦 Creating galaxy ${g}: ${galaxyNames[g - 1]}`);

    const galaxy = await prisma.galaxy.create({
      data: { name: galaxyNames[g - 1] },
    });

    let galaxyPlanets = 0;

    for (let s = 1; s <= SYSTEMS_PER_GALAXY; s++) {
      const planetCount = planetCountForSystem();
      const temperature = starTemperature(planetCount);
      const energyOutput = starEnergyOutput(temperature);

      // System erstellen mit Star in einer Transaktion
      const system = await prisma.system.create({
        data: {
          index: s,
          galaxyId: galaxy.id,
          star: {
            create: {
              temperature,
              energyOutput,
            },
          },
        },
      });

      // Planeten erstellen
      const planetCreations = [];
      for (let p = 1; p <= planetCount; p++) {
        planetCreations.push({
          name: `G${g}-S${String(s).padStart(3, '0')}-P${p}`,
          slot: p,
          systemId: system.id,
        });
      }

      await prisma.planet.createMany({ data: planetCreations });

      galaxyPlanets += planetCount;
      totalStars++;

      if (s % 50 === 0) {
        console.log(`  Systems ${s - 49}-${s}: done`);
      }
    }

    totalPlanets += galaxyPlanets;
    console.log(`  ✓ ${galaxyPlanets} planets, 1 star\n`);
  }

  console.log('✅ Galaxy initialization complete!');
  console.log(`   Galaxies: 3`);
  console.log(`   Systems:  ${SYSTEMS_PER_GALAXY * 3}`);
  console.log(`   Stars:    ${totalStars}`);
  console.log(`   Planets:  ${totalPlanets}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });