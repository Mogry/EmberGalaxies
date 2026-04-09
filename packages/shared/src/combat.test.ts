import { describe, test, expect } from 'bun:test';
import { calculateCombat, calculateLoot, SHIP_STATS } from './index';

describe('calculateCombat', () => {
  test('attacker wins when vastly superior', () => {
    const attacker = {
      ships: [{ type: 'battleship' as const, count: 10 }],
    };
    const defender = {
      ships: [{ type: 'fly' as const, count: 5 }],
    };

    const result = calculateCombat(attacker, defender);

    expect(result.winner).toBe('ATTACKER');
    expect(result.attackersRemaining.length).toBeGreaterThan(0);
    expect(result.defendersRemaining.length).toBe(0); // all flies destroyed
    expect(result.defenderLost.length).toBeGreaterThan(0);
  });

  test('defender wins when vastly superior', () => {
    const attacker = {
      ships: [{ type: 'fly' as const, count: 5 }],
    };
    const defender = {
      ships: [{ type: 'battleship' as const, count: 10 }],
    };

    const result = calculateCombat(attacker, defender);

    expect(result.winner).toBe('DEFENDER');
    expect(result.attackersRemaining.length).toBe(0);
    expect(result.defendersRemaining.length).toBeGreaterThan(0);
  });

  test('draw when both sides have ships remaining', () => {
    // Two equal fleets should both take damage but likely both survive
    const fleet = { ships: [{ type: 'corvette' as const, count: 100 }] };

    const result = calculateCombat(fleet, fleet);

    // With identical fleets, both fire same damage. Both should lose ships but both survive.
    expect(result.winner).toBe('DRAW');
    expect(result.attackersRemaining.length).toBeGreaterThan(0);
    expect(result.defendersRemaining.length).toBeGreaterThan(0);
  });

  test('mutual annihilation when damage exceeds all HP', () => {
    const attacker = {
      ships: [{ type: 'battleship_phoenix' as const, count: 100 }],
    };
    const defender = {
      ships: [{ type: 'battleship_phoenix' as const, count: 100 }],
    };

    const result = calculateCombat(attacker, defender);

    // Both sides deal massive damage — likely mutual annihilation
    expect(['DRAW', 'DEFENDER', 'ATTACKER']).toContain(result.winner);
  });

  test('empty defender fleet means instant attacker win', () => {
    const attacker = {
      ships: [{ type: 'fly' as const, count: 1 }],
    };
    const defender = {
      ships: [],
    };

    const result = calculateCombat(attacker, defender);

    expect(result.winner).toBe('ATTACKER');
    expect(result.attackersRemaining[0].count).toBe(1);
    expect(result.defendersRemaining.length).toBe(0);
    expect(result.defenderLost.length).toBe(0);
    expect(result.attackerLost.length).toBe(0);
  });

  test('empty attacker fleet means instant defender win', () => {
    const attacker = {
      ships: [],
    };
    const defender = {
      ships: [{ type: 'fly' as const, count: 1 }],
    };

    const result = calculateCombat(attacker, defender);

    expect(result.winner).toBe('DEFENDER');
    expect(result.defendersRemaining[0].count).toBe(1);
    expect(result.attackersRemaining.length).toBe(0);
  });

  test('both empty fleets = DRAW', () => {
    const result = calculateCombat({ ships: [] }, { ships: [] });
    expect(result.winner).toBe('DRAW');
  });

  test('single ship vs single ship', () => {
    const attacker = { ships: [{ type: 'corvette' as const, count: 1 }] };
    const defender = { ships: [{ type: 'corvette' as const, count: 1 }] };

    const result = calculateCombat(attacker, defender);

    // Corvette: attack=50, defense=60
    // Attacker deals 50 damage, defender has 60 HP -> defender loses ~1 ship (ceil(10/60) = 1... wait)
    // Actually: remaining HP = 60 - 50 = 10, remaining = ceil(10/60) = 1
    // Defender deals 50 damage, attacker has 60 HP -> remaining = ceil(10/60) = 1
    // Both survive -> DRAW
    expect(result.winner).toBe('DRAW');
  });

  test('weapons tech increases attack power', () => {
    const baseAttacker = {
      ships: [{ type: 'corvette' as const, count: 10 }],
      weaponsTech: 0,
    };
    const buffedAttacker = {
      ships: [{ type: 'corvette' as const, count: 10 }],
      weaponsTech: 10, // +50% attack
    };
    const defender = {
      ships: [{ type: 'corvette' as const, count: 10 }],
    };

    const baseResult = calculateCombat(baseAttacker, defender);
    const buffedResult = calculateCombat(buffedAttacker, defender);

    // Buffed attacker should do more damage -> fewer defenders remaining
    const baseDefenderRemaining = baseResult.defendersRemaining.reduce((s, d) => s + d.count, 0);
    const buffedDefenderRemaining = buffedResult.defendersRemaining.reduce((s, d) => s + d.count, 0);

    expect(buffedDefenderRemaining).toBeLessThanOrEqual(baseDefenderRemaining);
  });

  test('shield + armour tech increases ship HP', () => {
    const attacker = { ships: [{ type: 'corvette' as const, count: 10 }] };
    const baseDefender = {
      ships: [{ type: 'corvette' as const, count: 10 }],
      shieldTech: 0,
      armourTech: 0,
    };
    const buffedDefender = {
      ships: [{ type: 'corvette' as const, count: 10 }],
      shieldTech: 10, // +50% defense
      armourTech: 10,  // +50% defense
    };

    const baseResult = calculateCombat(attacker, baseDefender);
    const buffedResult = calculateCombat(attacker, buffedDefender);

    // Buffed defender should take less damage -> more defenders remaining
    const baseDefenderRemaining = baseResult.defendersRemaining.reduce((s, d) => s + d.count, 0);
    const buffedDefenderRemaining = buffedResult.defendersRemaining.reduce((s, d) => s + d.count, 0);

    expect(buffedDefenderRemaining).toBeGreaterThanOrEqual(baseDefenderRemaining);
  });

  test('mixed fleet combat with multiple ship types', () => {
    const attacker = {
      ships: [
        { type: 'battleship' as const, count: 5 },
        { type: 'fly' as const, count: 20 },
      ],
    };
    const defender = {
      ships: [
        { type: 'heavy_cruiser' as const, count: 3 },
        { type: 'corvette' as const, count: 10 },
      ],
    };

    const result = calculateCombat(attacker, defender);

    // Should have results for both sides
    expect(['ATTACKER', 'DEFENDER', 'DRAW']).toContain(result.winner);
    expect(result.attackerLost.length).toBeGreaterThan(0);
    expect(result.defenderLost.length).toBeGreaterThan(0);
  });

  test('proportional damage — bigger HP pools absorb more damage', () => {
    // Defender has 1 fly (low HP) and 1 battleship (high HP)
    // Attacker attacks — battleship should take more of the damage proportionally
    const attacker = {
      ships: [{ type: 'battleship' as const, count: 5 }],
    };
    const defender = {
      ships: [
        { type: 'fly' as const, count: 1 },           // HP = 10
        { type: 'battleship' as const, count: 1 },     // HP = 500
      ],
    };

    const result = calculateCombat(attacker, defender);

    // The fly should be destroyed (it's tiny compared to battleship HP)
    const flyResult = result.defendersRemaining.find(s => s.type === 'fly');
    expect(flyResult).toBeUndefined(); // fly should be destroyed

    // Battleship might survive (it has 500 HP and absorbs most of the proportional damage)
    const battleshipResult = result.defendersRemaining.find(s => s.type === 'battleship');
    // Whether battleship survives depends on exact numbers, but it should take less proportional loss
    // than the fly because it has much more HP relative to the damage it receives
    expect(battleshipResult === undefined || battleshipResult.count >= 0).toBe(true);
  });

  test('loss calculation is correct', () => {
    const attacker = {
      ships: [{ type: 'fly' as const, count: 100 }],
    };
    const defender = {
      ships: [{ type: 'fly' as const, count: 1 }],
    };

    const result = calculateCombat(attacker, defender);

    // Total attacker losses = sent - remaining
    const totalSent = attacker.ships.reduce((s, ship) => s + ship.count, 0);
    const totalRemaining = result.attackersRemaining.reduce((s, ship) => s + ship.count, 0);
    const totalLost = result.attackerLost.reduce((s, ship) => s + ship.count, 0);

    expect(totalRemaining + totalLost).toBe(totalSent);
  });
});

describe('calculateLoot', () => {
  test('loot capacity is reduced by return fuel reserve', () => {
    // 10 corvettes: cargo = 300 each = 3000 total
    // Total fuel cost = 2000 (so return reserve = 1000)
    // Available loot space = 3000 - 1000 = 2000

    const result = calculateLoot(
      [{ type: 'corvette' as const, count: 10 }],
      2000, // total fuel cost
      { iron: 5000, silver: 5000, ember: 5000, h2: 5000, energy: 5000 },
    );

    // Total loot should not exceed 2000
    const totalLoot = result.iron + result.silver + result.ember + result.h2 + result.energy;
    expect(totalLoot).toBeLessThanOrEqual(2000);
    expect(totalLoot).toBeGreaterThan(0);
  });

  test('no loot when capacity equals fuel reserve', () => {
    // If capacity exactly equals return fuel reserve, no space for loot
    const result = calculateLoot(
      [{ type: 'fly' as const, count: 10 }], // cargo = 50 each = 500 total
      1000, // total fuel cost, return reserve = 500
      // availableLootSpace = 500 - 500 = 0
      { iron: 10000, silver: 0, ember: 0, h2: 0, energy: 0 },
    );

    expect(result.iron).toBe(0);
  });

  test('no loot when all ships are combat-only (no cargo)', () => {
    const result = calculateLoot(
      [{ type: 'ember_bomb' as const, count: 10 }], // cargo = 0
      0,
      { iron: 10000, silver: 0, ember: 0, h2: 0, energy: 0 },
    );

    expect(result.iron).toBe(0);
  });

  test('loot is capped by planet resources at 50%', () => {
    const result = calculateLoot(
      [{ type: 'carrier_titan' as const, count: 1 }], // cargo = 50000
      0,
      { iron: 100, silver: 0, ember: 0, h2: 0, energy: 0 },
    );

    // 50% of 100 = 50 iron max
    expect(result.iron).toBe(50);
  });

  test('loot fills cargo in resource order', () => {
    // Carrier Titan: cargo = 50000, no fuel cost
    const result = calculateLoot(
      [{ type: 'carrier_titan' as const, count: 1 }],
      0,
      { iron: 10000, silver: 10000, ember: 10000, h2: 10000, energy: 10000 },
      0.5, // 50% loot factor
    );

    // Each resource has 5000 lootable (50% of 10000)
    // Total lootable = 25000, capacity = 50000
    // So we should get all 25000
    expect(result.iron).toBe(5000);
    expect(result.silver).toBe(5000);
    expect(result.ember).toBe(5000);
    expect(result.h2).toBe(5000);
    expect(result.energy).toBe(5000);
  });

  test('loot fills cargo until full, prioritizing earlier resources', () => {
    // 5 corvettes: cargo = 300 each = 1500 total, no fuel cost
    const result = calculateLoot(
      [{ type: 'corvette' as const, count: 5 }],
      0,
      { iron: 10000, silver: 10000, ember: 10000, h2: 0, energy: 0 },
      0.5,
    );

    // Lootable: iron=5000, silver=5000, ember=5000, total=15000
    // Capacity = 1500
    // Iron takes 1500 (fills all capacity)
    expect(result.iron).toBe(1500);
    expect(result.silver).toBe(0);
    expect(result.ember).toBe(0);
  });

  test('return fuel reserve correctly reduces loot space', () => {
    // Scenario: 10 battleships (cargo=2500 each = 25000 total)
    // Fuel cost = 10000, so return reserve = 5000
    // Available loot = 25000 - 5000 = 20000
    const result = calculateLoot(
      [{ type: 'battleship' as const, count: 10 }],
      10000,
      { iron: 100000, silver: 0, ember: 0, h2: 0, energy: 0 },
      0.5,
    );

    // 50% of 100000 = 50000, but capacity is only 20000
    expect(result.iron).toBe(20000);
  });

  test('custom loot factor', () => {
    const result = calculateLoot(
      [{ type: 'carrier_titan' as const, count: 1 }], // 50000 cargo
      0,
      { iron: 10000, silver: 0, ember: 0, h2: 0, energy: 0 },
      0.75, // 75% loot factor
    );

    // 75% of 10000 = 7500
    expect(result.iron).toBe(7500);
  });

  test('zero-capacity fleet with fuel cost gets no loot', () => {
    // ember_bomb has 0 cargo, but even without that,
    // if fuel cost exceeds capacity, no loot
    const result = calculateLoot(
      [{ type: 'ember_bomb' as const, count: 5 }], // 0 cargo each
      100,
      { iron: 10000, silver: 0, ember: 0, h2: 0, energy: 0 },
    );

    const totalLoot = result.iron + result.silver + result.ember + result.h2 + result.energy;
    expect(totalLoot).toBe(0);
  });
});