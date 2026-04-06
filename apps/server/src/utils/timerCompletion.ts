import { prisma } from '../db/client';
import { calculateOfflineProduction } from '@ember-galaxies/shared';
import { broadcastToPlayer } from '../websocket/broadcast';

export interface CompletedResult {
  buildingCompletions: Array<{ planetId: string; buildingType: string; newLevel: number; playerId: string }>;
  researchCompletions: Array<{ playerId: string; researchType: string; newLevel: number }>;
  shipCompletions: Array<{ planetId: string; shipType: string; count: number }>;
}

/**
 * Process all expired timers - call this on game state load.
 * Returns what was completed for WebSocket broadcast.
 */
export async function processExpiredTimers(): Promise<CompletedResult> {
  const now = new Date();
  const result: CompletedResult = {
    buildingCompletions: [],
    researchCompletions: [],
    shipCompletions: [],
  };

  // 1. Complete expired building upgrades
  const expiredBuildings = await prisma.building.findMany({
    where: {
      isUpgrading: true,
      upgradeFinishAt: { lte: now },
    },
    include: { planet: { select: { ownerId: true } } },
  });

  for (const building of expiredBuildings) {
    const newLevel = building.level + 1;
    await prisma.building.update({
      where: { id: building.id },
      data: {
        level: newLevel,
        isUpgrading: false,
        upgradeFinishAt: null,
      },
    });
    result.buildingCompletions.push({
      planetId: building.planetId,
      buildingType: building.type,
      newLevel,
      playerId: building.planet.ownerId!,
    });

    // Broadcast immediately - only once per building
    if (building.planet.ownerId) {
      broadcastToPlayer(building.planet.ownerId, {
        type: 'building_complete',
        data: { planetId: building.planetId, buildingType: building.type, newLevel },
        timestamp: now.toISOString(),
      });
    }
  }

  // 2. Complete expired research
  const expiredResearch = await prisma.research.findMany({
    where: {
      isResearching: true,
      researchFinishAt: { lte: now },
    },
  });

  for (const research of expiredResearch) {
    const newLevel = research.level + 1;
    await prisma.research.update({
      where: { id: research.id },
      data: {
        level: newLevel,
        isResearching: false,
        researchFinishAt: null,
      },
    });
    result.researchCompletions.push({
      playerId: research.playerId,
      researchType: research.type,
      newLevel,
    });

    // Broadcast immediately
    broadcastToPlayer(research.playerId, {
      type: 'research_complete',
      data: { researchType: research.type, newLevel },
      timestamp: now.toISOString(),
    });
  }

  // 3. Complete expired ship builds
  const expiredShips = await prisma.shipyard.findMany({
    where: {
      isBuilding: true,
      buildFinishAt: { lte: now },
    },
    include: { planet: { select: { ownerId: true } } },
  });

  for (const ship of expiredShips) {
    // Add completed ships to planet stock
    await prisma.planetShip.upsert({
      where: { planetId_shipType: { planetId: ship.planetId, shipType: ship.shipType } },
      create: { planetId: ship.planetId, shipType: ship.shipType, count: ship.count },
      update: { count: { increment: ship.count } },
    });

    // Delete queue entry (or mark not building)
    await prisma.shipyard.deleteMany({
      where: { planetId: ship.planetId, shipType: ship.shipType, isBuilding: true },
    });

    result.shipCompletions.push({
      planetId: ship.planetId,
      shipType: ship.shipType,
      count: ship.count,
    });

    // Broadcast immediately
    if (ship.planet.ownerId) {
      broadcastToPlayer(ship.planet.ownerId, {
        type: 'ship_complete',
        data: { planetId: ship.planetId, shipType: ship.shipType, count: ship.count },
        timestamp: now.toISOString(),
      });
    }
  }

  // 4. Calculate offline production for all planets
  // Only process planets that haven't been seen in the last hour
  const stalePlanets = await prisma.planet.findMany({
    where: {
      ownerId: { not: null },
      lastSeen: { lt: new Date(now.getTime() - 60 * 60 * 1000) }, // older than 1 hour
    },
    include: {
      buildings: true,
    },
  });

  for (const planet of stalePlanets) {
    // Calculate production for time elapsed
    const production = calculateOfflineProduction(
      planet.buildings,
      planet.lastSeen,
      now
    );

    // Only update if there's something to add
    const hasProduction = Object.values(production).some((v) => v > 0);
    if (hasProduction) {
      await prisma.planet.update({
        where: { id: planet.id },
        data: {
          iron: { increment: production.iron },
          silver: { increment: production.silver },
          ember: { increment: production.ember },
          h2: { increment: production.h2 },
          energy: { increment: production.energy },
          lastSeen: now,
        },
      });
    } else {
      // Just update lastSeen
      await prisma.planet.update({
        where: { id: planet.id },
        data: { lastSeen: now },
      });
    }
  }

  return result;
}

/**
 * Update lastSeen timestamp when player views a planet
 */
export async function touchPlanets(playerId: string): Promise<void> {
  await prisma.planet.updateMany({
    where: { ownerId: playerId },
    data: { lastSeen: new Date() },
  });
}
