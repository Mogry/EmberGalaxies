import { prisma } from '../db/client';

export type EventLogType =
  | 'building_complete'
  | 'ship_complete'
  | 'research_complete'
  | 'fleet_launch'
  | 'fleet_arrival'
  | 'fleet_return'
  | 'combat_report'
  | 'planet_colonized';

interface LogEventParams {
  type: EventLogType;
  playerId?: string;
  planetId?: string;
  fleetId?: string;
  data?: Record<string, unknown>;
}

/**
 * Persist a game event to the database for the admin dashboard event feed.
 */
export async function logEvent({ type, playerId, planetId, fleetId, data = {} }: LogEventParams): Promise<void> {
  try {
    await prisma.gameEvent.create({
      data: {
        type,
        playerId: playerId ?? null,
        planetId: planetId ?? null,
        fleetId: fleetId ?? null,
        data,
      },
    });
  } catch (error) {
    console.error('Failed to log game event:', error);
  }
}