import { BUILDING_PRODUCTION } from './types';
import type { Building } from './types';

export type ResourceType = 'iron' | 'silver' | 'ember' | 'h2' | 'energy';

export interface ResourceProduction {
  iron: number;
  silver: number;
  ember: number;
  h2: number;
  energy: number;
}

// Formel: base * level * (1.08 ^ level) * planetModifier * researchBonus
export function calculateProduction(
  buildingType: keyof typeof BUILDING_PRODUCTION,
  level: number,
  planetModifier: number = 1.0,
  researchBonus: number = 1.0
): number {
  const config = BUILDING_PRODUCTION[buildingType];
  if (!config || level === 0) return 0;
  return config.base * level * Math.pow(1.08, level) * planetModifier * researchBonus;
}

// Calculate total production per hour for all producing buildings on a planet
export function calculatePlanetProduction(
  buildings: Building[],
  researchBonus: number = 1.0,
  planetModifier: number = 1.0
): ResourceProduction {
  const production: ResourceProduction = { iron: 0, silver: 0, ember: 0, h2: 0, energy: 0 };

  for (const building of buildings) {
    if (building.level === 0) continue;
    const config = BUILDING_PRODUCTION[building.type as keyof typeof BUILDING_PRODUCTION];
    if (!config) continue;

    const produced = calculateProduction(
      building.type as keyof typeof BUILDING_PRODUCTION,
      building.level,
      planetModifier,
      researchBonus
    );

    production[config.resource as ResourceType] += produced;
  }

  return production;
}

// Calculate offline resources based on time elapsed
// NO CAP - all production is calculated
export function calculateOfflineProduction(
  buildings: Building[],
  lastSeen: Date,
  now: Date = new Date(),
  researchBonus: number = 1.0,
  planetModifier: number = 1.0
): ResourceProduction {
  const msElapsed = now.getTime() - lastSeen.getTime();
  const hoursElapsed = msElapsed / (1000 * 60 * 60);

  if (hoursElapsed <= 0) {
    return { iron: 0, silver: 0, ember: 0, h2: 0, energy: 0 };
  }

  const productionPerHour = calculatePlanetProduction(buildings, researchBonus, planetModifier);

  return {
    iron: productionPerHour.iron * hoursElapsed,
    silver: productionPerHour.silver * hoursElapsed,
    ember: productionPerHour.ember * hoursElapsed,
    h2: productionPerHour.h2 * hoursElapsed,
    energy: productionPerHour.energy * hoursElapsed,
  };
}

// Format time duration for display
export function formatDuration(milliseconds: number): string {
  if (milliseconds <= 0) return '0s';

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}
