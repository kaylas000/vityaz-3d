import { describe, it, expect, beforeEach } from 'vitest';

// Mock combat calculation utilities
class CombatCalculator {
  static calculateDamage(baseDamage: number, distance: number): number {
    // Distance falloff: 1 unit = 1% damage loss per meter
    const distanceFalloff = Math.max(0, 1 - distance / 100);
    return baseDamage * distanceFalloff;
  }

  static applyBodyPartMultiplier(
    damage: number,
    bodyPart: 'head' | 'torso' | 'limb',
  ): number {
    const multipliers = {
      head: 2.5,
      torso: 1.0,
      limb: 0.75,
    };
    return damage * multipliers[bodyPart];
  }

  static applyArmorReduction(
    damage: number,
    armorValue: number,
  ): number {
    const reduction = Math.min(0.8, armorValue / 100); // Max 80% reduction
    return damage * (1 - reduction);
  }

  static calculateCriticalChance(
    baseChance: number = 0.05,
    skillBonus: number = 0,
  ): boolean {
    return Math.random() < baseChance + skillBonus;
  }
}

describe('CombatCalculator', () => {
  describe('calculateDamage', () => {
    it('should deal full damage at close range', () => {
      const damage = CombatCalculator.calculateDamage(100, 5);
      expect(damage).toBeCloseTo(95, 1);
    });

    it('should reduce damage with distance', () => {
      const closeDamage = CombatCalculator.calculateDamage(100, 10);
      const farDamage = CombatCalculator.calculateDamage(100, 50);

      expect(closeDamage).toBeGreaterThan(farDamage);
    });

    it('should not go below zero damage', () => {
      const damage = CombatCalculator.calculateDamage(100, 150);
      expect(damage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('applyBodyPartMultiplier', () => {
    it('should apply headshot 2.5x multiplier', () => {
      const damage = CombatCalculator.applyBodyPartMultiplier(40, 'head');
      expect(damage).toBe(100);
    });

    it('should apply 1x multiplier for torso', () => {
      const damage = CombatCalculator.applyBodyPartMultiplier(100, 'torso');
      expect(damage).toBe(100);
    });

    it('should apply 0.75x multiplier for limbs', () => {
      const damage = CombatCalculator.applyBodyPartMultiplier(100, 'limb');
      expect(damage).toBe(75);
    });

    it('head shot should always be highest damage', () => {
      const baseDamage = 50;
      const headDamage = CombatCalculator.applyBodyPartMultiplier(
        baseDamage,
        'head',
      );
      const torsoDamage = CombatCalculator.applyBodyPartMultiplier(
        baseDamage,
        'torso',
      );
      const limbDamage = CombatCalculator.applyBodyPartMultiplier(
        baseDamage,
        'limb',
      );

      expect(headDamage).toBeGreaterThan(torsoDamage);
      expect(torsoDamage).toBeGreaterThan(limbDamage);
    });
  });

  describe('applyArmorReduction', () => {
    it('should reduce damage based on armor', () => {
      const noArmor = CombatCalculator.applyArmorReduction(100, 0);
      const withArmor = CombatCalculator.applyArmorReduction(100, 50);

      expect(withArmor).toBeLessThan(noArmor);
      expect(noArmor).toBe(100);
    });

    it('should cap armor reduction at 80%', () => {
      const damage = CombatCalculator.applyArmorReduction(100, 500);
      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeCloseTo(20, 1); // Should be 20% of original
    });

    it('should scale reduction linearly with armor up to cap', () => {
      const armor50 = CombatCalculator.applyArmorReduction(100, 50);
      const armor100 = CombatCalculator.applyArmorReduction(100, 100);

      expect(armor50).toBeGreaterThan(armor100);
    });
  });

  describe('calculateCriticalChance', () => {
    it('should return boolean', () => {
      const result = CombatCalculator.calculateCriticalChance();
      expect(typeof result).toBe('boolean');
    });

    it('should increase chance with skill bonus', () => {
      // Run multiple times to get statistical average
      let baseCrits = 0;
      let bonusCrits = 0;
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        if (CombatCalculator.calculateCriticalChance(0.05, 0)) baseCrits++;
        if (CombatCalculator.calculateCriticalChance(0.05, 0.1)) bonusCrits++;
      }

      expect(bonusCrits).toBeGreaterThan(baseCrits);
    });
  });
});
