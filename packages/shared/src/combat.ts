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
  maxHP: number;   // (defense + shield_bonus + armour_bonus) per ship
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
// Combat Math
// =============================================================================

const RESEARCH_BONUS = 0.05; // 5% per level, matching RESEARCH_BONUS_PER_LEVEL

/**
 * Build combat sides from fleet compositions.
 * Each ship gets:
 *   maxHP = defense + (defense * shieldTech * 0.05) + (defense * armourTech * 0.05)
 *        = defense * (1 + (shieldTech + armourTech) * 0.05)
 * TotalAttackPower for a side = sum(count * base_attack * (1 + weaponsTech * 0.05))
 */
function buildCombatSides(
  fleet: FleetComposition,
): { sides: CombatSide[]; totalAttackPower: number } {
  const weaponsBonus = 1 + (fleet.weaponsTech ?? 0) * RESEARCH_BONUS;
  const shieldBonus = (fleet.shieldTech ?? 0) * RESEARCH_BONUS;
  const armourBonus = (fleet.armourTech ?? 0) * RESEARCH_BONUS;

  const sides: CombatSide[] = [];
  let totalAttackPower = 0;

  for (const ship of fleet.ships) {
    if (ship.count <= 0) continue;
    const stats = SHIP_STATS[ship.type];
    const maxHP = stats.defense * (1 + shieldBonus + armourBonus);
    const totalHP = ship.count * maxHP;
    totalAttackPower += ship.count * stats.attack * weaponsBonus;

    sides.push({
      type: ship.type,
      count: ship.count,
      maxHP,
      totalHP,
    });
  }

  return { sides, totalAttackPower };
}

/**
 * Apply damage proportionally across combat sides.
 * Sides with more total HP absorb proportionally more damage.
 * Returns updated sides with remaining HP and ship counts.
 */
function applyDamage(
  sides: CombatSide[],
  totalAttackPower: number,
): { sides: CombatSide[]; shipsDestroyed: boolean } {
  if (sides.length === 0) return { sides: [], shipsDestroyed: false };

  const totalHP = sides.reduce((sum, s) => sum + s.totalHP, 0);
  if (totalHP === 0) return { sides: [], shipsDestroyed: true };

  const newSides: CombatSide[] = [];
  let shipsDestroyed = false;

  for (const side of sides) {
    // Proportional damage: (side.totalHP / totalHP) * totalAttackPower
    const damageToSide = (side.totalHP / totalHP) * totalAttackPower;
    const remainingHP = Math.max(0, side.totalHP - damageToSide);
    const remainingCount = remainingHP > 0 ? Math.ceil(remainingHP / side.maxHP) : 0;

    if (remainingCount < side.count) shipsDestroyed = true;

    newSides.push({
      type: side.type,
      count: remainingCount,
      maxHP: side.maxHP,
      totalHP: remainingHP,
    });
  }

  return { sides: newSides, shipsDestroyed };
}

/**
 * Deterministic 1-round combat resolution.
 *
 * Algorithm:
 * 1. Build combat sides for both attacker and defender
 * 2. Attacker fires: total attack power distributed proportionally across defender HP pools
 * 3. Defender fires: remaining defender attack power distributed proportionally across attacker HP pools
 * 4. Convert remaining HP back to ship counts
 * 5. Determine winner based on which side has ships remaining
 */
export function calculateCombat(
  attackerFleet: FleetComposition,
  defenderForces: FleetComposition,
): CombatResult {
  const attacker = buildCombatSides(attackerFleet);
  const defender = buildCombatSides(defenderForces);

  // Round 1: Attacker fires on defender
  const defenderAfterAttack = applyDamage(defender.sides, attacker.totalAttackPower);

  // Round 1: Defender fires on attacker (using ORIGINAL defender attack, not post-damage)
  // Actually, the spec says: defenders fire back. We use the original defender's attack power.
  const attackerAfterDefense = applyDamage(attacker.sides, defender.totalAttackPower);

  // Build result arrays
  const attackersRemaining = attackerAfterDefense.sides
    .filter(s => s.count > 0)
    .map(s => ({ type: s.type, count: s.count }));

  const defendersRemaining = defenderAfterAttack.sides
    .filter(s => s.count > 0)
    .map(s => ({ type: s.type, count: s.count }));

  // Calculate losses
  const attackerLost = attacker.sides
    .map(original => {
      const after = attackerAfterDefense.sides.find(s => s.type === original.type);
      const remaining = after?.count ?? 0;
      const lost = original.count - remaining;
      return { type: original.type, count: lost };
    })
    .filter(s => s.count > 0);

  const defenderLost = defender.sides
    .map(original => {
      const after = defenderAfterAttack.sides.find(s => s.type === original.type);
      const remaining = after?.count ?? 0;
      const lost = original.count - remaining;
      return { type: original.type, count: lost };
    })
    .filter(s => s.count > 0);

  // Determine winner
  const attackerHasShips = attackersRemaining.some(s => s.count > 0);
  const defenderHasShips = defendersRemaining.some(s => s.count > 0);

  let winner: 'ATTACKER' | 'DEFENDER' | 'DRAW';
  if (attackerHasShips && !defenderHasShips) {
    winner = 'ATTACKER';
  } else if (!attackerHasShips && defenderHasShips) {
    winner = 'DEFENDER';
  } else if (attackerHasShips && defenderHasShips) {
    winner = 'DRAW';
  } else {
    winner = 'DRAW'; // mutual annihilation
  }

  return {
    attackersRemaining,
    defendersRemaining,
    attackerLost,
    defenderLost,
    winner,
  };
}

/**
 * Calculate loot capacity for an attacking fleet after combat.
 * The fleet must reserve return-trip fuel, which takes up cargo space.
 * Only half of the total fuel cost blocks cargo (outbound leg already consumed).
 *
 * @param remainingShips - Ships surviving combat
 * @param totalFuelCost - Total round-trip H2 fuel cost for the original fleet
 * @param planetResources - Resources available on the target planet
 * @param lootFactor - Fraction of planet resources that can be looted (default 0.5 = 50%)
 * @returns Loot carried back by the fleet
 */
export function calculateLoot(
  remainingShips: Array<{ type: ShipType; count: number }>,
  totalFuelCost: number,
  planetResources: { iron: number; silver: number; ember: number; h2: number; energy: number },
  lootFactor: number = 0.5,
): { iron: number; silver: number; ember: number; h2: number; energy: number } {
  // Total cargo capacity of surviving ships
  const totalCapacity = remainingShips.reduce(
    (sum, s) => sum + s.count * SHIP_STATS[s.type].cargo,
    0,
  );

  // Return fuel reserve: only half the total fuel cost (outbound already consumed)
  const returnFuelReserve = totalFuelCost / 2;

  // Available loot space = capacity minus return fuel reserve
  const availableLootSpace = Math.max(0, totalCapacity - returnFuelReserve);

  if (availableLootSpace <= 0) {
    return { iron: 0, silver: 0, ember: 0, h2: 0, energy: 0 };
  }

  // Lootable resources from planet (lootFactor * planet stock)
  const lootable = {
    iron: planetResources.iron * lootFactor,
    silver: planetResources.silver * lootFactor,
    ember: planetResources.ember * lootFactor,
    h2: planetResources.h2 * lootFactor,
    energy: planetResources.energy * lootFactor,
  };

  // Fill cargo in order: iron, silver, ember, h2, energy
  // (most valuable resources first — can be made configurable later)
  let spaceLeft = availableLootSpace;
  const loot = { iron: 0, silver: 0, ember: 0, h2: 0, energy: 0 };

  const resourceOrder: Array<keyof typeof lootable> = ['iron', 'silver', 'ember', 'h2', 'energy'];
  for (const res of resourceOrder) {
    const taken = Math.min(lootable[res], spaceLeft);
    loot[res] = taken;
    spaceLeft -= taken;
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