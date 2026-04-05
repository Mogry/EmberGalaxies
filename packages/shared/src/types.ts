// Game Entity Types - matches Prisma schema

export interface Galaxy {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Star {
  id: string;
  temperature: number;
  energyOutput: number;
  systemId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface System {
  id: string;
  index: number;
  galaxyId: string;
  galaxyIndex?: number;
  createdAt: Date;
  updatedAt: Date;
  star?: Star;
}

export interface Planet {
  id: string;
  name: string;
  slot: number;
  systemId: string;
  ownerId: string | null;
  iron: number;
  silver: number;
  ember: number;
  h2: number;
  energy: number;
  lastSeen: Date;
  fieldsUsed: number;
  fieldsMax: number;
  createdAt: Date;
  updatedAt: Date;
  system?: System;
  buildings?: Building[];
}

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Building {
  id: string;
  planetId: string;
  type: BuildingType;
  level: number;
  isUpgrading: boolean;
  upgradeFinishAt: Date | null;
}

export type BuildingType =
  | 'zentrale'
  | 'iron_mine'
  | 'silver_mine'
  | 'uderon_raffinery'
  | 'h2_refinery'
  | 'fusion_plant'
  | 'research_center'
  | 'shipyard'
  | 'space_station'
  | 'anti_spy'
  | 'planetary_shield'
  | 'dummy_building';

export type ShipType =
  | 'light_fighter'
  | 'heavy_fighter'
  | 'cruiser'
  | 'battleship'
  | 'colony_ship'
  | 'recycler'
  | 'espionage_probe'
  | 'bomber'
  | 'destroyer'
  | 'deathstar'
  | 'battlecruiser'
  | 'small_cargo'
  | 'large_cargo';

export interface FleetShip {
  id: string;
  fleetId: string;
  type: ShipType;
  count: number;
}

export type FleetMission =
  | 'attack'
  | 'transport'
  | 'deployment'
  | 'colonize'
  | 'harvest'
  | 'espionage';

export interface Fleet {
  id: string;
  ownerId: string;
  originPlanetId: string;
  targetPlanetId: string | null;
  mission: FleetMission;
  iron: number;
  silver: number;
  ember: number;
  h2: number;
  energy: number;
  launchedAt: Date;
  arrivesAt: Date;
  returnsAt: Date;
  ships?: FleetShip[];
  originPlanet?: Planet;
  targetPlanet?: Planet;
}

export type ResearchType =
  | 'iron_mining'
  | 'silver_mining'
  | 'ember_extraction'
  | 'h2_refining'
  | 'energy_efficiency'
  | 'laser_technology'
  | 'ion_technology'
  | 'hyperspace_technology'
  | 'plasma_technology'
  | 'combustion_drive'
  | 'impulse_drive'
  | 'hyperspace_drive'
  | 'espionage_technology'
  | 'computer_technology'
  | 'astrophysics'
  | 'intergalactic_research_network'
  | 'graviton_technology'
  | 'shield_technology'
  | 'armour_technology'
  | 'weapons_technology';

export interface Research {
  id: string;
  playerId: string;
  type: ResearchType;
  level: number;
  isResearching: boolean;
  researchFinishAt: Date | null;
}

// API Types

export interface GameState {
  player: Player;
  planets: Planet[];
  fleets: Fleet[];
  research: Research[];
}

export interface ApiError {
  error: string;
  message: string;
}

// WebSocket Event Types

export type GameEventType =
  | 'resource_update'
  | 'building_complete'
  | 'ship_complete'
  | 'research_complete'
  | 'fleet_arrival'
  | 'fleet_return'
  | 'attack'
  | 'combat_report';

export interface GameEvent {
  type: GameEventType;
  timestamp: Date;
  data: Record<string, unknown>;
}

// Building production constants (per hour at level 1)
export const BUILDING_PRODUCTION = {
  iron_mine: { base: 22, resource: 'iron' },
  silver_mine: { base: 24, resource: 'silver' },
  uderon_raffinery: { base: 5, resource: 'ember' },
  h2_refinery: { base: 16, resource: 'h2' },
  fusion_plant: { base: 18, resource: 'energy' }, // energy from fusion
} as const;

export const RESEARCH_BONUS_PER_LEVEL = 0.05; // 5% per level

// Re-export costs and production utilities
export * from './costs';
export * from './production';