import { prisma } from '../db/client';
import { calculateOfflineProduction } from '@ember-galaxies/shared';
import { broadcastToPlayer } from '../websocket/broadcast';
import type { FleetMission, ShipType } from '@ember-galaxies/shared';

// =============================================================================
// Types
// =============================================================================

interface BuildingUpgradeEvent {
  type: 'building_upgrade';
  timestamp: Date;
  payload: {
    buildingId: string;
    targetLevel: number;
    queueId: string;
    planetId: string;
    buildingType: string;
  };
}

interface ShipBuildEvent {
  type: 'ship_build';
  timestamp: Date;
  payload: {
    shipyardId: string;
    planetId: string;
    shipType: ShipType;
    count: number;
  };
}

interface ResearchCompleteEvent {
  type: 'research_complete';
  timestamp: Date;
  payload: {
    researchId: string;
    playerId: string;
    researchType: string;
  };
}

interface FleetArrivalEvent {
  type: 'fleet_arrival';
  timestamp: Date;
  payload: {
    fleetId: string;
    ownerId: string;
    originPlanetId: string;
    targetPlanetId: string;
    mission: FleetMission;
    iron: number;
    silver: number;
    ember: number;
    h2: number;
    energy: number;
    ships: Array<{ type: ShipType; count: number }>;
  };
}

interface FleetReturnEvent {
  type: 'fleet_return';
  timestamp: Date;
  payload: {
    fleetId: string;
    ownerId: string;
    originPlanetId: string;
    ships: Array<{ type: ShipType; count: number }>;
  };
}

type QueuedEvent =
  | BuildingUpgradeEvent
  | ShipBuildEvent
  | ResearchCompleteEvent
  | FleetArrivalEvent
  | FleetReturnEvent;

export interface CompletedResult {
  buildingCompletions: Array<{
    planetId: string;
    buildingType: string;
    newLevel: number;
    queueId: string;
    playerId: string;
  }>;
  researchCompletions: Array<{
    playerId: string;
    researchType: string;
    newLevel: number;
  }>;
  shipCompletions: Array<{
    planetId: string;
    shipType: ShipType;
    count: number;
    queueId: string;
  }>;
  fleetArrivals: Array<{
    fleetId: string;
    targetPlanetId: string;
    mission: FleetMission;
    playerId: string;
  }>;
}

interface InMemoryPlanetState {
  planetId: string;
  ownerId: string | null;
  iron: number;
  silver: number;
  ember: number;
  h2: number;
  energy: number;
  lastSeen: Date;
  buildings: Array<{
    id: string;
    type: string;
    level: number;
    isUpgrading: boolean;
    upgradeFinishAt: Date | null;
  }>;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Compute flight time for return trip (same distance, same drive as outbound).
 * We store launchedAt on the fleet — return time = half the total round-trip
 * so that returnsAt - arrivesAt = arrivesAt - launchedAt.
 */
function computeReturnTime(
  launchedAt: Date,
  arrivesAt: Date,
): Date {
  const flightDuration = arrivesAt.getTime() - launchedAt.getTime();
  return new Date(arrivesAt.getTime() + flightDuration);
}

/**
 * Resolve a fleet arrival into the game state (in-memory).
 * Mutates planetState.resources and fleetShipCounts, and may change planet owner.
 */
function resolveFleetArrival(
  event: FleetArrivalEvent,
  planetState: InMemoryPlanetState,
  fleetShipCounts: Map<string, Map<string, number>>,
): void {
  const { payload } = event;

  // Add transported resources to planet
  planetState.iron += payload.iron;
  planetState.silver += payload.silver;
  planetState.ember += payload.ember;
  planetState.h2 += payload.h2;
  planetState.energy += payload.energy;

  // Initialize fleet ship counts from payload
  const shipCounts = new Map<string, number>();
  for (const ship of payload.ships) {
    shipCounts.set(ship.type, ship.count);
  }
  fleetShipCounts.set(payload.fleetId, shipCounts);

  switch (payload.mission) {
    case 'transport':
    case 'deployment': {
      // Resources are dropped on planet
      // Ships are consumed — fleet is "empty" (no remaining ships)
      // transport: fleet returns home (handled in fleet writes)
      // deployment: fleet stays in orbit with returnsAt = null (handled in fleet writes)
      // Clear the ship counts so remainingShips = []
      shipCounts.clear();
      break;
    }

    case 'colonize': {
      // Change planet ownership to fleet owner
      planetState.ownerId = payload.ownerId;
      // Remove one colonizer (the colonists land); remaining ships stay on fleet
      const colonizerCount = shipCounts.get('colonizer') ?? 0;
      if (colonizerCount > 0) {
        shipCounts.set('colonizer', colonizerCount - 1);
        if (colonizerCount === 1) shipCounts.delete('colonizer');
      }
      break;
    }

    case 'attack':
    case 'invasion':
    case 'destroy':
    case 'harvest':
    case 'espionage':
    default:
      // Combat logic deferred — ships are consumed in the fight
      shipCounts.clear();
      break;
  }
}

// =============================================================================
// Main sync function
// =============================================================================

/**
 * Synchronise a single planet's state up to `currentTime`.
 *
 * Architecture:
 *   - One Prisma transaction wrapping everything.
 *   - Planet is locked FIRST with SELECT ... FOR UPDATE.
 *   - All expired timers for this planet are collected and merged into a
 *     chronological event queue.
 *   - Events are applied in order; offline production is credited between events.
 *   - A single planet.update (plus fleet writes) is issued at the end.
 *
 * @param planetId   The planet to sync.
 * @param currentTime  The point in time to sync to (usually "now").
 */
export async function syncPlanet(
  planetId: string,
  currentTime: Date,
): Promise<CompletedResult> {
  const result: CompletedResult = {
    buildingCompletions: [],
    researchCompletions: [],
    shipCompletions: [],
    fleetArrivals: [],
  };

  await prisma.$transaction(async (tx) => {
    // -------------------------------------------------------------------------
    // 1. Lock the planet row
    // -------------------------------------------------------------------------
    await tx.$executeRaw`
      SELECT id FROM "Planet" WHERE id = ${planetId} FOR UPDATE
    `;

    // -------------------------------------------------------------------------
    // 2. Load planet state into memory
    // -------------------------------------------------------------------------
    const planet = await tx.planet.findUnique({
      where: { id: planetId },
      include: {
        buildings: true,
        originFleets: { where: { arrivesAt: { lte: currentTime } } },
        targetFleets: { where: { arrivesAt: { lte: currentTime } } },
        shipyards: { where: { isBuilding: true, buildFinishAt: { lte: currentTime } } },
      },
    });

    if (!planet) return;

    // -------------------------------------------------------------------------
    // 3. Build unified event queue
    // -------------------------------------------------------------------------
    const events: QueuedEvent[] = [];

    // Building upgrades
    for (const building of planet.buildings) {
      if (
        building.isUpgrading &&
        building.upgradeFinishAt &&
        building.upgradeFinishAt <= currentTime
      ) {
        const queueEntry = await tx.constructionQueue.findFirst({
          where: { buildingId: building.id },
          orderBy: { upgradeFinishAt: 'desc' },
        });
        if (queueEntry) {
          events.push({
            type: 'building_upgrade',
            timestamp: queueEntry.upgradeFinishAt,
            payload: {
              buildingId: building.id,
              targetLevel: queueEntry.targetLevel,
              queueId: queueEntry.id,
              planetId,
              buildingType: building.type,
            },
          });
        }
      }
    }

    // Ship builds
    for (const ship of planet.shipyards) {
      if (ship.isBuilding && ship.buildFinishAt && ship.buildFinishAt <= currentTime) {
        events.push({
          type: 'ship_build',
          timestamp: ship.buildFinishAt,
          payload: {
            shipyardId: ship.id,
            planetId,
            shipType: ship.shipType,
            count: ship.count,
          },
        });
      }
    }

    // Fleet arrivals (fleets targeting this planet)
    for (const fleet of planet.targetFleets) {
      if (fleet.arrivesAt <= currentTime) {
        const fleetShips = await tx.fleetShip.findMany({
          where: { fleetId: fleet.id },
        });
        events.push({
          type: 'fleet_arrival',
          timestamp: fleet.arrivesAt,
          payload: {
            fleetId: fleet.id,
            ownerId: fleet.ownerId,
            originPlanetId: fleet.originPlanetId,
            targetPlanetId: fleet.targetPlanetId!,
            mission: fleet.mission,
            iron: fleet.iron,
            silver: fleet.silver,
            ember: fleet.ember,
            h2: fleet.h2,
            energy: fleet.energy,
            ships: fleetShips.map(s => ({ type: s.type, count: s.count })),
          },
        });
      }
    }

    // Fleet returns (fleets that launched from this planet and are past their return time)
    const originFleetsReturning = planet.originFleets.filter(
      f => f.returnsAt && f.returnsAt <= currentTime,
    );
    for (const fleet of originFleetsReturning) {
      const fleetShips = await tx.fleetShip.findMany({
        where: { fleetId: fleet.id },
      });
      events.push({
        type: 'fleet_return',
        timestamp: fleet.returnsAt!,
        payload: {
          fleetId: fleet.id,
          ownerId: fleet.ownerId,
          originPlanetId: fleet.originPlanetId,
          ships: fleetShips.map(s => ({ type: s.type, count: s.count })),
        },
      });
    }

    // Research completions for the planet owner (player-level events in the unified queue)
    if (planet.ownerId) {
      const expiredResearch = await tx.research.findMany({
        where: {
          playerId: planet.ownerId,
          isResearching: true,
          researchFinishAt: { lte: currentTime },
        },
      });
      for (const research of expiredResearch) {
        events.push({
          type: 'research_complete',
          timestamp: research.researchFinishAt!,
          payload: {
            researchId: research.id,
            playerId: research.playerId,
            researchType: research.type,
          },
        });
      }
    }

    // -------------------------------------------------------------------------
    // 4. Sort events chronologically (oldest first)
    // -------------------------------------------------------------------------
    events.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    // -------------------------------------------------------------------------
    // 5. Build in-memory planet state
    // -------------------------------------------------------------------------
    const planetState: InMemoryPlanetState = {
      planetId: planet.id,
      ownerId: planet.ownerId,
      iron: planet.iron,
      silver: planet.silver,
      ember: planet.ember,
      h2: planet.h2,
      energy: planet.energy,
      lastSeen: planet.lastSeen,
      buildings: planet.buildings.map(b => ({
        id: b.id,
        type: b.type,
        level: b.level,
        isUpgrading: b.isUpgrading,
        upgradeFinishAt: b.upgradeFinishAt,
      })),
    };

    // Track which fleets need updates after we know their return times
    const fleetWrites: Array<{
      fleetId: string;
      action: 'complete_arrival' | 'complete_return';
      mission: FleetMission;
      ownerId: string;
      remainingShips: Array<{ type: ShipType; count: number }>;
    }> = [];

    // Map of fleetId -> shipType -> count for fleets being resolved
    const fleetShipCounts = new Map<string, Map<string, number>>();

    const getFleetShips = (fleetId: string): Array<{ type: ShipType; count: number }> => {
      const counts = fleetShipCounts.get(fleetId);
      if (!counts) return [];
      return Array.from(counts.entries()).map(([type, count]) => ({ type: type as ShipType, count }));
    };

    // -------------------------------------------------------------------------
    // 6. Process events in chronological order
    // -------------------------------------------------------------------------
    for (const event of events) {
      // Credit offline production from lastSeen up to this event's timestamp
      const production = calculateOfflineProduction(
        planetState.buildings as any,
        planetState.lastSeen,
        event.timestamp,
      );
      planetState.iron += production.iron;
      planetState.silver += production.silver;
      planetState.ember += production.ember;
      planetState.h2 += production.h2;
      planetState.energy += production.energy;

      // Apply the event
      switch (event.type) {
        case 'building_upgrade': {
          const { buildingId, targetLevel, queueId, buildingType } = event.payload;
          // Update building level in DB and in-memory state
          await tx.building.update({
            where: { id: buildingId },
            data: { level: targetLevel, isUpgrading: false, upgradeFinishAt: null },
          });
          const building = planetState.buildings.find(b => b.id === buildingId);
          if (building) {
            building.level = targetLevel;
            building.isUpgrading = false;
            building.upgradeFinishAt = null;
          }
          // Delete queue entry
          await tx.constructionQueue.delete({ where: { id: queueId } });
          // Broadcast
          if (planetState.ownerId) {
            broadcastToPlayer(planetState.ownerId, {
              type: 'building_complete',
              data: { planetId, buildingType, newLevel: targetLevel, queueId },
              timestamp: event.timestamp.toISOString(),
            });
          }
          result.buildingCompletions.push({
            planetId,
            buildingType,
            newLevel: targetLevel,
            queueId,
            playerId: planetState.ownerId!,
          });
          break;
        }

        case 'ship_build': {
          const { shipyardId, planetId: pId, shipType, count } = event.payload;
          // Upsert ships onto planet
          await tx.planetShip.upsert({
            where: { planetId_shipType: { planetId: pId, shipType } },
            create: { planetId: pId, shipType, count },
            update: { count: { increment: count } },
          });
          // Delete shipyard entry
          await tx.shipyard.delete({ where: { id: shipyardId } });
          // Broadcast
          if (planetState.ownerId) {
            broadcastToPlayer(planetState.ownerId, {
              type: 'ship_complete',
              data: { planetId: pId, shipType, count, queueId: shipyardId },
              timestamp: event.timestamp.toISOString(),
            });
          }
          result.shipCompletions.push({
            planetId: pId,
            shipType,
            count,
            queueId: shipyardId,
          });
          break;
        }

        case 'research_complete': {
          // Research is player-scoped — lock the player's research row
          const { researchId, playerId, researchType } = event.payload;

          // Load the research row with FOR UPDATE.
          await tx.$executeRaw`
            SELECT id FROM "Research" WHERE id = ${researchId} FOR UPDATE
          `;
          const research = await tx.research.findUnique({
            where: { id: researchId },
          });
          if (research && research.isResearching) {
            const computedLevel = research.level + 1;
            await tx.research.update({
              where: { id: researchId },
              data: {
                level: computedLevel,
                isResearching: false,
                researchFinishAt: null,
              },
            });
            broadcastToPlayer(playerId, {
              type: 'research_complete',
              data: { researchType, newLevel: computedLevel },
              timestamp: event.timestamp.toISOString(),
            });
            result.researchCompletions.push({
              playerId,
              researchType,
              newLevel: computedLevel,
            });
          }
          break;
        }

        case 'fleet_arrival': {
          const arrival = event.payload;

          // Resolve resources and ownership changes in planet state
          resolveFleetArrival(event, planetState, fleetShipCounts);

          // Queue the fleet write (remainingShips derived after resolveFleetArrival mutates fleetShipCounts)
          fleetWrites.push({
            fleetId: arrival.fleetId,
            action: 'complete_arrival',
            mission: arrival.mission,
            ownerId: arrival.ownerId,
            remainingShips: getFleetShips(arrival.fleetId),
          });

          // Broadcast
          broadcastToPlayer(arrival.ownerId, {
            type: 'fleet_arrival',
            data: {
              fleetId: arrival.fleetId,
              targetPlanetId: arrival.targetPlanetId,
              mission: arrival.mission,
            },
            timestamp: event.timestamp.toISOString(),
          });

          result.fleetArrivals.push({
            fleetId: arrival.fleetId,
            targetPlanetId: arrival.targetPlanetId,
            mission: arrival.mission,
            playerId: arrival.ownerId,
          });
          break;
        }

        case 'fleet_return': {
          const ret = event.payload;

          // Ships go back to origin planet — update planetShip counts
          // Note: fleet_return ships come from the event payload directly (the fleet was not yet resolved)
          for (const ship of ret.ships) {
            await tx.planetShip.upsert({
              where: {
                planetId_shipType: { planetId: ret.originPlanetId, shipType: ship.type },
              },
              create: { planetId: ret.originPlanetId, shipType: ship.type, count: ship.count },
              update: { count: { increment: ship.count } },
            });
          }

          // Queue the fleet write
          fleetWrites.push({
            fleetId: ret.fleetId,
            action: 'complete_return',
            mission: 'transport',
            ownerId: ret.ownerId,
            remainingShips: [], // fleet is deleted on return
          });

          // Broadcast
          broadcastToPlayer(ret.ownerId, {
            type: 'fleet_return',
            data: { fleetId: ret.fleetId, originPlanetId: ret.originPlanetId },
            timestamp: event.timestamp.toISOString(),
          });
          break;
        }
      }

      // Advance lastSeen to this event's timestamp
      planetState.lastSeen = event.timestamp;
    }

    // -------------------------------------------------------------------------
    // 7. Final offline production: from last event (or planet.lastSeen) to currentTime
    // -------------------------------------------------------------------------
    if (planetState.lastSeen < currentTime) {
      const finalProduction = calculateOfflineProduction(
        planetState.buildings as any,
        planetState.lastSeen,
        currentTime,
      );
      planetState.iron += finalProduction.iron;
      planetState.silver += finalProduction.silver;
      planetState.ember += finalProduction.ember;
      planetState.h2 += finalProduction.h2;
      planetState.energy += finalProduction.energy;
      planetState.lastSeen = currentTime;
    }

    // -------------------------------------------------------------------------
    // 8. Execute all fleet writes
    // -------------------------------------------------------------------------
    for (const fw of fleetWrites) {
      if (fw.action === 'complete_arrival') {
        switch (fw.mission) {
          case 'transport': {
            // Resources already credited to planetState.
            // Fleet goes on return trip.
            const fleet = await tx.fleet.findUnique({ where: { id: fw.fleetId } });
            if (fleet) {
              const returnTime = computeReturnTime(fleet.launchedAt, fleet.arrivesAt);
              await tx.fleet.update({
                where: { id: fw.fleetId },
                data: {
                  targetPlanetId: null,
                  iron: 0,
                  silver: 0,
                  ember: 0,
                  h2: 0,
                  energy: 0,
                  returnsAt: returnTime,
                  ships: { deleteMany: {} }, // ships consumed
                },
              });
            }
            break;
          }

          case 'deployment': {
            // Resources unloaded, fleet stays in orbit.
            await tx.fleet.update({
              where: { id: fw.fleetId },
              data: {
                targetPlanetId: null,
                iron: 0,
                silver: 0,
                ember: 0,
                h2: 0,
                energy: 0,
                returnsAt: null, // stays deployed
                ships: { deleteMany: {} }, // ships consumed
              },
            });
            break;
          }

          case 'colonize': {
            // Planet owner was changed in planetState.
            // fw.remainingShips holds post-colonizer-consumption ship counts.
            // remainingShips = all non-colonizer ships (colonizer already decremented in resolveFleetArrival)
            const remainingShips = fw.remainingShips;

            if (remainingShips.length > 0) {
              // Fleet returns home with remaining ships
              const fleet = await tx.fleet.findUnique({ where: { id: fw.fleetId } });
              if (fleet) {
                const returnTime = computeReturnTime(fleet.launchedAt, fleet.arrivesAt);
                await tx.fleet.update({
                  where: { id: fw.fleetId },
                  data: {
                    targetPlanetId: null,
                    ships: { deleteMany: {} },
                  },
                });
                // Re-create remaining ships
                for (const s of remainingShips) {
                  await tx.fleetShip.create({
                    data: { fleetId: fw.fleetId, type: s.type, count: s.count },
                  });
                }
                await tx.fleet.update({
                  where: { id: fw.fleetId },
                  data: { returnsAt: returnTime },
                });
              }
            } else {
              // All ships consumed (only colonizer was on this fleet)
              await tx.fleet.update({
                where: { id: fw.fleetId },
                data: {
                  targetPlanetId: null,
                  ships: { deleteMany: {} },
                  returnsAt: null,
                },
              });
            }
            break;
          }

          default:
            // Attack / invasion / etc. — mark arrived, combat deferred
            await tx.fleet.update({
              where: { id: fw.fleetId },
              data: {
                targetPlanetId: null,
                ships: { deleteMany: {} }, // ships consumed in combat
              },
            });
            break;
        }
      } else if (fw.action === 'complete_return') {
        // Delete the fleet record entirely — ships already returned to planet
        await tx.fleet.delete({ where: { id: fw.fleetId } });
      }
    }

    // -------------------------------------------------------------------------
    // 9. Single DB write: persist aggregated planet state
    // -------------------------------------------------------------------------
    await tx.planet.update({
      where: { id: planetId },
      data: {
        ownerId: planetState.ownerId,
        iron: planetState.iron,
        silver: planetState.silver,
        ember: planetState.ember,
        h2: planetState.h2,
        energy: planetState.energy,
        lastSeen: planetState.lastSeen,
      },
    });
  });

  return result;
}

// =============================================================================
// Legacy wrapper — processes all planets (for game-state-load bootstrap)
// =============================================================================

/**
 * Process all expired timers across all planets.
 * Call this once on game-state load.
 *
 * @deprecated Use syncPlanet per-planet on state load for better isolation.
 */
export async function processExpiredTimers(): Promise<CompletedResult> {
  const now = new Date();
  const result: CompletedResult = {
    buildingCompletions: [],
    researchCompletions: [],
    shipCompletions: [],
    fleetArrivals: [],
  };

  // Collect all planet IDs with pending work
  const planetIds = await prisma.planet.findMany({
    select: { id: true },
    where: {
      OR: [
        // Has building upgrade pending
        { buildings: { some: { isUpgrading: true, upgradeFinishAt: { lte: now } } } },
        // Has ship build pending
        { shipyards: { some: { isBuilding: true, buildFinishAt: { lte: now } } } },
        // Has fleet arriving
        { targetFleets: { some: { arrivesAt: { lte: now } } } },
        // Has fleet returning from here
        { originFleets: { some: { returnsAt: { lte: now } } } },
      ],
    },
  });

  for (const { id: planetId } of planetIds) {
    const planetResult = await syncPlanet(planetId, now);
    // Merge results
    result.buildingCompletions.push(...planetResult.buildingCompletions);
    result.researchCompletions.push(...planetResult.researchCompletions);
    result.shipCompletions.push(...planetResult.shipCompletions);
    result.fleetArrivals.push(...planetResult.fleetArrivals);
  }

  // Also handle research for players who have NO planets (no planet = no syncPlanet call)
  const playerIdsWithPlanets = new Set(
    (await prisma.planet.findMany({ select: { ownerId: true }, where: { ownerId: { not: null } } }))
      .map(p => p.ownerId)
      .filter((id): id is string => id !== null),
  );

  const researchPlayerIds = await prisma.research.findMany({
    select: { playerId: true },
    where: { isResearching: true, researchFinishAt: { lte: now } },
    distinct: ['playerId'],
  });

  for (const { playerId } of researchPlayerIds) {
    // Skip players whose research is already handled via syncPlanet (they own planets)
    if (playerIdsWithPlanets.has(playerId)) continue;

    const expiredResearch = await prisma.research.findMany({
      where: { playerId, isResearching: true, researchFinishAt: { lte: now } },
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
      broadcastToPlayer(playerId, {
        type: 'research_complete',
        data: { researchType: research.type, newLevel },
        timestamp: now.toISOString(),
      });
      result.researchCompletions.push({ playerId, researchType: research.type, newLevel });
    }
  }

  return result;
}

/**
 * Update lastSeen timestamp when player views a planet.
 * Must be called AFTER syncPlanet with the same `now` timestamp.
 */
export async function touchPlanets(
  playerId: string,
  now: Date = new Date(),
): Promise<void> {
  await prisma.planet.updateMany({
    where: { ownerId: playerId },
    data: { lastSeen: now },
  });
}
