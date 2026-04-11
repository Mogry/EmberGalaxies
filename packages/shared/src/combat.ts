import { SHIP_STATS } from './ships';
import type { ShipType } from './types';

// =============================================================================
// Combat Types
// =============================================================================

export interface FleetComposition {
  ships: Array<{ type: ShipType; count: number }>;
  weaponsTech?: number;  // weapons_technology level (default 0)
  shieldTech?: number;   // shield_technology level (default 0)
  armourTech?: number;   // armour_technology level (default 0)
}

export interface CombatSide {
  type: ShipType;
  count: number;
  maxHP: number;   // (defense * (1 + shield + armour bonus)) per ship
  totalHP: number;  // count * maxHP
}

export interface CombatResult {
  attackersRemaining: Array<{ type: ShipType; count: number }>;
  defendersRemaining: Array<{ type: ShipType; count: number }>;
  attackerLost: Array<{ type: ShipType; count: number }>;
  defenderLost: Array<{ type: ShipType; count: number }>;
  winner: 'ATTACKER' | 'DEFENDER' | 'DRAW';
}

// =============================================================================
// Combat Math — Deterministic Multi-Round Resolution
// =============================================================================

const RESEARCH_BONUS = 0.05; // 5% per level, matching RESEARCH_BONUS_PER_LEVEL
const MAX_COMBAT_ROUNDS = 6;

/**
 * Deterministic multi-round combat resolution.
 *
 * Each round: both sides fire simultaneously with their current attack power.
 * Damage is distributed proportionally across the opposing side's HP pools
 * (ships with more HP absorb proportionally more damage).
 * Combat ends after `maxRounds` or when one side is fully destroyed.
 *
 * No randomness — fully deterministic outcome from identical inputs.
 * Memory-efficient: mutates side arrays in-place, no per-round allocations.
 */
export function simulateCombat(
  attackerFleet: FleetComposition,
  defenderForces: FleetComposition,
  maxRounds: number = MAX_COMBAT_ROUNDS,
): CombatResult {
  // Tech bonuses
  const aWeaponsBonus = 1 + (attackerFleet.weaponsTech ?? 0) * RESEARCH_BONUS;
  const aShieldBonus = (attackerFleet.shieldTech ?? 0) * RESEARCH_BONUS;
  const aArmourBonus = (attackerFleet.armourTech ?? 0) * RESEARCH_BONUS;

  const dWeaponsBonus = 1 + (defenderForces.weaponsTech ?? 0) * RESEARCH_BONUS;
  const dShieldBonus = (defenderForces.shieldTech ?? 0) * RESEARCH_BONUS;
  const dArmourBonus = (defenderForces.armourTech ?? 0) * RESEARCH_BONUS;

  // Mutable combat sides — only totalHP changes per round
  type Side = { type: ShipType; maxHP: number; totalHP: number };

  const aSides: Side[] = [];
  for (const ship of attackerFleet.ships) {
    if (ship.count <= 0) continue;
    const stats = SHIP_STATS[ship.type];
    const maxHP = stats.defense * (1 + aShieldBonus + aArmourBonus);
    aSides.push({ type: ship.type, maxHP, totalHP: ship.count * maxHP });
  }

  const dSides: Side[] = [];
  for (const ship of defenderForces.ships) {
    if (ship.count <= 0) continue;
    const stats = SHIP_STATS[ship.type];
    const maxHP = stats.defense * (1 + dShieldBonus + dArmourBonus);
    dSides.push({ type: ship.type, maxHP, totalHP: ship.count * maxHP });
  }

  // Store original counts for loss calculation
  const origACounts = new Map<ShipType, number>();
  for (const s of aSides) origACounts.set(s.type, Math.round(s.totalHP / s.maxHP));

  const origDCounts = new Map<ShipType, number>();
  for (const s of dSides) origDCounts.set(s.type, Math.round(s.totalHP / s.maxHP));

  // === Combat loop — up to maxRounds ===
  for (let round = 0; round < maxRounds; round++) {
    const aTotalHP = aSides.reduce((sum, s) => sum + s.totalHP, 0);
    const dTotalHP = dSides.reduce((sum, s) => sum + s.totalHP, 0);
    if (aTotalHP <= 0 || dTotalHP <= 0) break;

    // Snapshot current attack power (simultaneous fire with pre-round ship counts)
    let aPower = 0;
    for (const s of aSides) {
      if (s.totalHP <= 0) continue;
      const count = Math.ceil(s.totalHP / s.maxHP);
      aPower += count * SHIP_STATS[s.type].attack * aWeaponsBonus;
    }

    let dPower = 0;
    for (const s of dSides) {
      if (s.totalHP <= 0) continue;
      const count = Math.ceil(s.totalHP / s.maxHP);
      dPower += count * SHIP_STATS[s.type].attack * dWeaponsBonus;
    }

    if (aPower === 0 && dPower === 0) break;

    // Apply attacker damage to defender (proportional to HP pool size)
    if (aPower > 0 && dTotalHP > 0) {
      for (const ds of dSides) {
        if (ds.totalHP <= 0) continue;
        const damage = (ds.totalHP / dTotalHP) * aPower;
        ds.totalHP = Math.max(0, ds.totalHP - damage);
      }
    }

    // Apply defender damage to attacker (proportional to HP pool size)
    if (dPower > 0 && aTotalHP > 0) {
      for (const as of aSides) {
        if (as.totalHP <= 0) continue;
        const damage = (as.totalHP / aTotalHP) * dPower;
        as.totalHP = Math.max(0, as.totalHP - damage);
      }
    }
  }

  // Convert remaining HP to ship counts
  const attackersRemaining = aSides
    .filter(s => s.totalHP > 0)
    .map(s => ({ type: s.type, count: Math.ceil(s.totalHP / s.maxHP) }));

  const defendersRemaining = dSides
    .filter(s => s.totalHP > 0)
    .map(s => ({ type: s.type, count: Math.ceil(s.totalHP / s.maxHP) }));

  // Calculate losses
  const attackerLost = aSides
    .map(s => {
      const orig = origACounts.get(s.type) ?? 0;
      const remaining = s.totalHP > 0 ? Math.ceil(s.totalHP / s.maxHP) : 0;
      return { type: s.type, count: Math.max(0, orig - remaining) };
    })
    .filter(s => s.count > 0);

  const defenderLost = dSides
    .map(s => {
      const orig = origDCounts.get(s.type) ?? 0;
      const remaining = s.totalHP > 0 ? Math.ceil(s.totalHP / s.maxHP) : 0;
      return { type: s.type, count: Math.max(0, orig - remaining) };
    })
    .filter(s => s.count > 0);

  // Determine winner
  const aHasShips = attackersRemaining.some(s => s.count > 0);
  const dHasShips = defendersRemaining.some(s => s.count > 0);

  let winner: 'ATTACKER' | 'DEFENDER' | 'DRAW';
  if (aHasShips && !dHasShips) winner = 'ATTACKER';
  else if (!aHasShips && dHasShips) winner = 'DEFENDER';
  else winner = 'DRAW';

  return {
    attackersRemaining,
    defendersRemaining,
    attackerLost,
    defenderLost,
    winner,
  };
}

/**
 * Backward-compatible wrapper — now uses 6-round resolution.
 */
export function calculateCombat(
  attackerFleet: FleetComposition,
  defenderForces: FleetComposition,
): CombatResult {
  return simulateCombat(attackerFleet, defenderForces);
}

// =============================================================================
// Loot Calculation — Exact Return Fuel Model
// =============================================================================

/**
 * Calculate loot for an attacking fleet after combat.
 *
 * The fleet must reserve cargo space for return-trip fuel.
 * Available loot space = total cargo capacity of surviving ships - return fuel cost.
 * Resources are distributed proportionally across all types (fair distribution).
 *
 * @param remainingShips - Ships surviving combat
 * @param returnFuelCost - Exact H2 cost for the return trip of the surviving fleet
 * @param planetResources - Resources available on the target planet
 * @param lootFactor - Fraction of planet resources that can be looted (default 0.5)
 */
export function calculateLoot(
  remainingShips: Array<{ type: ShipType; count: number }>,
  returnFuelCost: number,
  planetResources: { iron: number; silver: number; ember: number; h2: number; energy: number },
  lootFactor: number = 0.5,
): { iron: number; silver: number; ember: number; h2: number; energy: number } {
  // Total cargo capacity of surviving ships
  const totalCapacity = remainingShips.reduce(
    (sum, s) => sum + s.count * SHIP_STATS[s.type].cargo,
    0,
  );

  // Reserve cargo space for return fuel
  const availableLootSpace = Math.max(0, totalCapacity - returnFuelCost);

  if (availableLootSpace <= 0) {
    return { iron: 0, silver: 0, ember: 0, h2: 0, energy: 0 };
  }

  // Lootable resources from planet (lootFactor × planet stock)
  const lootable = {
    iron: planetResources.iron * lootFactor,
    silver: planetResources.silver * lootFactor,
    ember: planetResources.ember * lootFactor,
    h2: planetResources.h2 * lootFactor,
    energy: planetResources.energy * lootFactor,
  };

  const totalLootable = lootable.iron + lootable.silver + lootable.ember + lootable.h2 + lootable.energy;

  if (totalLootable <= 0) {
    return { iron: 0, silver: 0, ember: 0, h2: 0, energy: 0 };
  }

  const loot = { iron: 0, silver: 0, ember: 0, h2: 0, energy: 0 };

  if (totalLootable <= availableLootSpace) {
    // Everything fits — take all lootable resources
    loot.iron = lootable.iron;
    loot.silver = lootable.silver;
    loot.ember = lootable.ember;
    loot.h2 = lootable.h2;
    loot.energy = lootable.energy;
  } else {
    // Proportional fill: each resource gets (availableSpace / totalLootable) × lootable amount
    const fillRatio = availableLootSpace / totalLootable;
    loot.iron = Math.floor(lootable.iron * fillRatio);
    loot.silver = Math.floor(lootable.silver * fillRatio);
    loot.ember = Math.floor(lootable.ember * fillRatio);
    loot.h2 = Math.floor(lootable.h2 * fillRatio);
    loot.energy = Math.floor(lootable.energy * fillRatio);
  }

  return loot;
}

/**
 * Calculate total cargo capacity of a fleet composition.
 */
export function calculateTotalCapacity(
  ships: Array<{ type: ShipType; count: number }>,
): number {
  return ships.reduce((sum, s) => sum + s.count * SHIP_STATS[s.type].cargo, 0);
}