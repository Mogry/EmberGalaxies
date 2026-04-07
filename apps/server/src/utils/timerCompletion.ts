import { prisma } from '../db/client';
import { calculateOfflineProduction } from '@ember-galaxies/shared';
import { broadcastToPlayer } from '../websocket/broadcast';

export interface CompletedResult {
  buildingCompletions: Array<{ planetId: string; buildingType: string; newLevel: number; queueId: string; playerId: string }>;
  researchCompletions: Array<{ playerId: string; researchType: string; newLevel: number }>;
  shipCompletions: Array<{ planetId: string; shipType: string; count: number; queueId: string }>;
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

  // Use a transaction for consistency across all timer completions
  await prisma.$transaction(async (tx) => {
    // 1. Complete expired building upgrades via ConstructionQueue
    const expiredQueueEntries = await tx.constructionQueue.findMany({
      where: { upgradeFinishAt: { lte: now } },
      orderBy: { upgradeFinishAt: 'asc' },
      include: { building: { include: { planet: { select: { ownerId: true } } } } },
    });

    for (const entry of expiredQueueEntries) {
      await tx.building.update({
        where: { id: entry.buildingId },
        data: { level: entry.targetLevel },
      });

      await tx.constructionQueue.delete({
        where: { id: entry.id },
      });

      result.buildingCompletions.push({
        planetId: entry.building.planetId,
        buildingType: entry.building.type,
        newLevel: entry.targetLevel,
        queueId: entry.id,
        playerId: entry.building.planet.ownerId!,
      });

      // Broadcast immediately
      if (entry.building.planet.ownerId) {
        broadcastToPlayer(entry.building.planet.ownerId, {
          type: 'building_complete',
          data: { planetId: entry.building.planetId, buildingType: entry.building.type, newLevel: entry.targetLevel, queueId: entry.id },
          timestamp: now.toISOString(),
        });
      }
    }

    // 2. Complete expired research
    const expiredResearch = await tx.research.findMany({
      where: {
        isResearching: true,
        researchFinishAt: { lte: now },
      },
    });

    for (const research of expiredResearch) {
      const newLevel = research.level + 1;
      await tx.research.update({
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
    const expiredShips = await tx.shipyard.findMany({
      where: {
        isBuilding: true,
        buildFinishAt: { lte: now },
      },
      include: { planet: { select: { ownerId: true } } },
    });

    for (const ship of expiredShips) {
      // Add completed ships to planet stock using atomic increment
      await tx.planetShip.upsert({
        where: { planetId_shipType: { planetId: ship.planetId, shipType: ship.shipType } },
        create: { planetId: ship.planetId, shipType: ship.shipType, count: ship.count },
        update: { count: { increment: ship.count } },
      });

      // Delete queue entry
      await tx.shipyard.delete({
        where: { id: ship.id },
      });

      result.shipCompletions.push({
        planetId: ship.planetId,
        shipType: ship.shipType,
        count: ship.count,
        queueId: ship.id,
      });

      // Broadcast immediately
      if (ship.planet.ownerId) {
        broadcastToPlayer(ship.planet.ownerId, {
          type: 'ship_complete',
          data: { planetId: ship.planetId, shipType: ship.shipType, count: ship.count, queueId: ship.id },
          timestamp: now.toISOString(),
        });
      }
    }

    // 4. Calculate offline production for ALL owned planets (no staleness check)
    // Lazy Evaluation: calculate exact resource delta from lastSeen to now
    const ownedPlanets = await tx.planet.findMany({
      where: { ownerId: { not: null } },
      include: { buildings: true },
    });

    // Process in parallel for performance
    const planetUpdates = ownedPlanets.map(async (planet) => {
      // Calculate production for full time elapsed (ms precision)
      const production = calculateOfflineProduction(
        planet.buildings,
        planet.lastSeen,
        now
      );

      const hasProduction = Object.values(production).some((v) => v > 0);

      if (hasProduction) {
        // Atomic increment: use Prisma's increment to avoid overwriting concurrent changes
        await tx.planet.update({
          where: { id: planet.id },
          data: {
            iron: { increment: production.iron },
            silver: { increment: production.silver },
            ember: { increment: production.ember },
            h2: { increment: production.h2 },
            energy: { increment: production.energy },
            lastSeen: now, // Reflects the point in time until which resources were calculated
          },
        });
      } else {
        // No buildings producing, just update lastSeen
        await tx.planet.update({
          where: { id: planet.id },
          data: { lastSeen: now },
        });
      }
    });

    await Promise.all(planetUpdates);
  });

  return result;
}

/**
 * Update lastSeen timestamp when player views a planet.
 * Must be called AFTER processExpiredTimers with the same `now` timestamp
 * to ensure lastSeen reflects the production calculation point.
 */
export async function touchPlanets(playerId: string, now: Date = new Date()): Promise<void> {
  await prisma.planet.updateMany({
    where: { ownerId: playerId },
    data: { lastSeen: now },
  });
}
