import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveCombatAction, CombatAction } from './CombatEngine';

function makeActor(overrides = {}) {
  return {
    stats: { health: 100, maxHealth: 100, armor: 10, maxArmor: 10, damage: 25, stamina: 100, maxStamina: 100 },
    state: { isAlive: true, animationState: 'idle' },
    ...overrides,
  } as any;
}

describe('CombatEngine.resolveCombatAction', () => {
  beforeEach(() => {
    // stabilize Math.random in tests for reproducibility
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
  });

  it('performs a normal attack and applies armor reduction', () => {
    const attacker = makeActor({ stats: { ...makeActor().stats, damage: 30 } });
    const target = makeActor();

    const action: CombatAction = { type: 'attack', attacker, target };
    const res = resolveCombatAction(action);

    // expected actual damage = max(1, 30 - armor*0.5) = 30 - 5 = 25
    expect(res.success).toBe(true);
    expect(res.hit).toBe(true);
    expect(res.damageDealt).toBe(25);
    expect(target.stats.health).toBe(75);
  });

  it('rejects action if insufficient stamina', () => {
    const attacker = makeActor({ stats: { ...makeActor().stats, stamina: 0 } });
    const target = makeActor();

    const action: CombatAction = { type: 'power-attack', attacker, target };
    const res = resolveCombatAction(action);
    expect(res.success).toBe(false);
    expect(res.message).toContain('Insufficient');
  });

  it('power attack applies multiplier and uses stamina', () => {
    const attacker = makeActor({ stats: { ...makeActor().stats, damage: 20, stamina: 100 } });
    const target = makeActor({ stats: { ...makeActor().stats, armor: 5 } });

    const action: CombatAction = { type: 'power-attack', attacker, target };
    const res = resolveCombatAction(action);
    // final damage = 20 * 1.5 = 30; actual = max(1, 30 - 5*0.5 = 27)
    expect(res.hit).toBe(true);
    expect(res.damageDealt).toBe(27);
    expect(attacker.stats.stamina).toBeLessThan(100);
  });

  it('defend applies armor buff', () => {
    const attacker = makeActor();
    const action: CombatAction = { type: 'defend', attacker };
    const res = resolveCombatAction(action);
    expect(res.success).toBe(true);
    expect(res.appliedEffects).toContain('defend');
    expect(attacker.stats.armor).toBeGreaterThan(10);
  });

  it('riposte sets riposte state', () => {
    const actor = makeActor();
    const action: CombatAction = { type: 'riposte', attacker: actor };
    const res = resolveCombatAction(action);
    expect(res.success).toBe(true);
    expect((actor.state as any).riposte).toBeTruthy();
  });

  it('misses when accuracy low', () => {
    const attacker = makeActor();
    const target = makeActor();
    // mock random to be high so accuracy fails
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const action: CombatAction = { type: 'attack', attacker, target, accuracy: 0.1 };
    const res = resolveCombatAction(action);
    expect(res.hit).toBe(false);
    expect(res.message).toContain('Missed');
  });
});