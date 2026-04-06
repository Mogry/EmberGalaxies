import type { ShipType, DriveType } from './types';
import type { ShipCost } from './costs';
export type { ShipCost } from './costs';
// Re-export SHIP_COSTS from costs.ts so all ship metadata is available from this file
export { SHIP_COSTS } from './costs';

export const SHIP_NAMES: Record<ShipType, string> = {
  fly: 'Fly',
  bumblebee: 'Bumblebee',
  corvette: 'Corvette',
  light_cruiser: 'Light Cruiser',
  heavy_cruiser: 'Heavy Cruiser',
  battleship: 'Battleship',
  battleship_nexus: 'Battleship of Nexus Class',
  battleship_phoenix: 'Battleship of Phoenix Class',
  carrier_titan: 'Carrier Titan',
  colonizer: 'Colonizer',
  invasion_unit: 'Invasion-Unit',
  ember_bomb: 'Ember Bomb',
};

export const SHIP_ABBREVS: Record<ShipType, string> = {
  fly: 'FL',
  bumblebee: 'BB',
  corvette: 'COR',
  light_cruiser: 'LC',
  heavy_cruiser: 'HC',
  battleship: 'BS',
  battleship_nexus: 'BS-N',
  battleship_phoenix: 'BS-P',
  carrier_titan: 'CT',
  colonizer: 'COL',
  invasion_unit: 'IU',
  ember_bomb: 'EB',
};

export const SHIP_ICONS: Record<ShipType, string> = {
  fly: '🪰',
  bumblebee: '🐝',
  corvette: '🚤',
  light_cruiser: '🚀',
  heavy_cruiser: '🛳️',
  battleship: '⚓',
  battleship_nexus: '🔱',
  battleship_phoenix: '🔥',
  carrier_titan: '🛸',
  colonizer: '🧬',
  invasion_unit: '⚔️',
  ember_bomb: '💣',
};

export const SHIP_CLASSES: Record<ShipType, string> = {
  fly: 'Fighter Jet',
  bumblebee: 'Fighter Jet',
  corvette: 'Corvette',
  light_cruiser: 'Cruiser',
  heavy_cruiser: 'Cruiser',
  battleship: 'Capital Ship',
  battleship_nexus: 'Super Capital Ship',
  battleship_phoenix: 'Super Capital Ship',
  carrier_titan: 'Support Ship',
  colonizer: 'Support Ship',
  invasion_unit: 'Support Ship',
  ember_bomb: 'Support Ship',
};

export const SHIP_DESCRIPTIONS: Record<ShipType, string> = {
  fly: 'The first and cheapest combat ship. Fast and agile.',
  bumblebee: 'A small support/bomber fighter with balanced weaponry.',
  corvette: 'The first "real" combat unit for intersystem engagements.',
  light_cruiser: 'First cruiser with jump drive for long-range missions.',
  heavy_cruiser: 'Reinforced variant of the Light Cruiser.',
  battleship: 'Powerful warship with direct jump drive.',
  battleship_nexus: 'Penultimate flagship — uniting all technologies.',
  battleship_phoenix: 'The ultimate ship. Born from the ashes of destruction.',
  carrier_titan: 'Hangar monster for mega fleet transport.',
  colonizer: 'The only way to colonize new planets.',
  invasion_unit: 'Takes over enemy planets completely on successful attack.',
  ember_bomb: 'Blasts enemy planets completely out of the game.',
};

export const SHIP_STATS: Record<ShipType, { attack: number; defense: number; cargo: number; drives: DriveType[] }> = {
  fly:           { attack: 5,   defense: 10,  cargo: 50,  drives: ['combustion'] },
  bumblebee:     { attack: 20,  defense: 25,  cargo: 100, drives: ['combustion'] },
  corvette:      { attack: 50,  defense: 60,  cargo: 300, drives: ['combustion', 'impulse'] },
  light_cruiser: { attack: 150, defense: 130, cargo: 800, drives: ['combustion', 'impulse'] },
  heavy_cruiser: { attack: 300, defense: 250, cargo: 1500, drives: ['combustion', 'impulse'] },
  battleship:    { attack: 600, defense: 500, cargo: 2500, drives: ['combustion', 'impulse', 'hyperspace'] },
  battleship_nexus: { attack: 1500, defense: 1200, cargo: 5000, drives: ['combustion', 'impulse', 'hyperspace', 'nexus'] },
  battleship_phoenix: { attack: 4000, defense: 3000, cargo: 10000, drives: ['combustion', 'impulse', 'hyperspace', 'nexus', 'phoenix'] },
  carrier_titan: { attack: 200, defense: 800, cargo: 50000, drives: ['hyperspace'] },
  colonizer:     { attack: 0,   defense: 100, cargo: 7500, drives: ['hyperspace'] },
  invasion_unit: { attack: 800, defense: 600, cargo: 2000, drives: ['hyperspace'] },
  ember_bomb:    { attack: 0,   defense: 0,   cargo: 0,   drives: ['hyperspace'] },
};

export const SHIP_BUILD_TIMES: Record<ShipType, number> = {
  fly:              5,
  bumblebee:        15,
  corvette:         60,
  light_cruiser:    180,
  heavy_cruiser:    400,
  battleship:       900,
  battleship_nexus: 3000,
  battleship_phoenix: 7200,
  carrier_titan:   2400,
  colonizer:        3600,
  invasion_unit:    4800,
  ember_bomb:       10800,
};
