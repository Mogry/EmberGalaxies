import type { DriveType, FleetMission, ShipType } from './types';
import { SHIP_STATS } from './ships';

// --- Pearl String Distanz-Konstanten ---
// DE = Distanz-Einheiten
// Das Universum ist linear aufgebaut: Galaxien → Systeme → Planeten

export const PLANET_STEP_DIST = 5;      // DE pro Planeten-Slot (intra-system)
export const EXIT_SYSTEM_COST = 100;    // DE Pauschal für System-Verlassen
export const SYSTEM_STEP_DIST = 20;     // DE pro System-Abstand
export const EXIT_GALAXY_COST = 2000;   // DE Pauschal für Galaxy-Verlassen
export const GALAXY_STEP_DIST = 500;    // DE pro Galaxy-Abstand

export type FlightType = 'intraSystem' | 'interSystem' | 'interGalaxy';

// --- Antriebs-Effektivität ---
// speed = Modifikator auf DE/s (wie schnell Antrieb Distanz "verbraucht")
// interGalaxy = ob Antrieb für Inter-Galaxy-Flüge nutzbar ist

export const DRIVE_EFFECTIVENESS: Record<DriveType, { speed: number; interGalaxy: boolean; h2Factor: number }> = {
  combustion: { speed: 1.0,  interGalaxy: false, h2Factor: 1.0 },
  ion:        { speed: 2.5,  interGalaxy: false, h2Factor: 3.0 },
  hyper:      { speed: 3.0,  interGalaxy: false, h2Factor: 2.0 },
  nexus:      { speed: 3.0,  interGalaxy: false, h2Factor: 1.5 },
  interdim:   { speed: 50,   interGalaxy: true,  h2Factor: 10.0 },
};

export interface Coordinate {
  galaxyIndex: number;
  systemIndex: number;
  slot: number;
}

/**
 * Berechnet die Distanz zwischen zwei Planeten in DE (Distanz-Einheiten).
 */
export function calculateDistance(origin: Coordinate, target: Coordinate): number {
  const sameGalaxy = origin.galaxyIndex === target.galaxyIndex;
  const sameSystem = sameGalaxy && origin.systemIndex === target.systemIndex;

  // Pearl String: Linear, hierarchisch
  // 1. Intra-system: Planet-Slot-Differenz × PLANET_STEP_DIST
  let dist = Math.abs(origin.slot - target.slot) * PLANET_STEP_DIST;

  if (!sameSystem) {
    // 2. Inter-system, same galaxy: System verlassen + lineare System-Distanz
    dist += EXIT_SYSTEM_COST + Math.abs(origin.systemIndex - target.systemIndex) * SYSTEM_STEP_DIST;
  }

  if (!sameGalaxy) {
    // 3. Inter-galaxy: Galaxy verlassen + lineare Galaxy-Distanz
    dist += EXIT_GALAXY_COST + Math.abs(origin.galaxyIndex - target.galaxyIndex) * GALAXY_STEP_COST;
  }

  return dist;
}

/**
 * Bestimmt den FlightType basierend auf Start- und Zielkoordinaten.
 */
export function getFlightType(origin: Coordinate, target: Coordinate): FlightType {
  if (origin.galaxyIndex !== target.galaxyIndex) return 'interGalaxy';
  if (origin.systemIndex !== target.systemIndex) return 'interSystem';
  return 'intraSystem';
}

/**
 * Findet den besten verfügbaren Antrieb für einen Flugtyp.
 * Gibt null zurück wenn kein Antrieb verfügbar (z.B. InterGalaxy ohne interdim).
 */
export function getBestDrive(
  availableDrives: DriveType[],
  flightType: FlightType
): DriveType | null {
  const candidates = availableDrives.filter(d => {
    const eff = DRIVE_EFFECTIVENESS[d];
    if (flightType === 'interGalaxy') return eff.interGalaxy;
    return true; // Alle Antriebe für Intra/Inter-System nutzbar
  });

  if (candidates.length === 0) return null;

  // Höchster Speed-Modifikator gewinnt
  return candidates.reduce((best, d) =>
    DRIVE_EFFECTIVENESS[d].speed > DRIVE_EFFECTIVENESS[best].speed ? d : best
  );
}

/**
 * Prüft ob eine Flotte mit einem bestimmten Antrieb fliegen kann.
 * Berücksichtigt Hangar-Kapazität: Schiffe ohne passenden Antrieb müssen transportiert werden.
 */
export function canFleetUseDrive(
  shipComposition: Array<{ type: ShipType; count: number }>,
  drive: DriveType
): { possible: boolean; needTransport: number; totalHangar: number } {
  let needTransport = 0;
  let totalHangar = 0;

  for (const { type, count } of shipComposition) {
    const stats = SHIP_STATS[type];
    if (stats.drives.includes(drive)) {
      // Dieses Schiff kann mit dem Antrieb fliegen
      totalHangar += (stats.hangarCapacity ?? 0) * count;
    } else {
      // Muss transportiert werden
      needTransport += count;
    }
  }

  return {
    possible: needTransport <= totalHangar,
    needTransport,
    totalHangar,
  };
}

/**
 * Berechnet die Flugzeit in Sekunden.
 */
export function calculateFlightTime(
  distance: number,
  shipComposition: Array<{ type: ShipType; count: number }>,
  drive: DriveType,
  flightType: FlightType
): number {
  const eff = DRIVE_EFFECTIVENESS[drive];

  // InterGalaxy nur mit interdim möglich
  if (flightType === 'interGalaxy' && !eff.interGalaxy) {
    return Infinity;
  }

  // Langsamstes Schiff bestimmt Basis-Geschwindigkeit
  const slowestSpeed = Math.min(...shipComposition.map(s => SHIP_STATS[s.type].speed));

  // Flugzeit = Distanz / (Basis-Geschwindigkeit * Antriebs-Modifikator)
  const effectiveSpeed = slowestSpeed * eff.speed;
  return Math.ceil(distance / effectiveSpeed);
}

/**
 * Berechnet H2-Kosten (Platzhalter — Werte kommen beim Playtesting).
 */
export function calculateH2Cost(
  distance: number,
  shipComposition: Array<{ type: ShipType; count: number }>,
  drive: DriveType,
  flightType: FlightType
): number {
  const eff = DRIVE_EFFECTIVENESS[drive];
  if (flightType === 'interGalaxy' && !eff.interGalaxy) return Infinity;

  // Basis: Summe aller Schiffe * Distanz * H2-Faktor
  const totalShips = shipComposition.reduce((sum, s) => sum + s.count, 0);
  return Math.ceil(totalShips * distance * eff.h2Factor * 0.001);
}
