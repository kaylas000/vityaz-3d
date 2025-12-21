import { SpecNavyFighter } from './SpecNavyFighter';

export type CombatActionType = 'attack' | 'power-attack' | 'defend' | 'riposte' | 'special';

export interface CombatAction {
  type: CombatActionType;
  attacker: Partial<SpecNavyFighter>;
  target?: Partial<SpecNavyFighter>;
  baseDamage?: number;
  staminaCost?: number;
  accuracy?: number; // 0..1
  effects?: string[]; // 'stun','bleed', etc.
}

export interface CombatResult {
  success: boolean;
  hit: boolean;
  damageDealt: number;
  targetKilled: boolean;
  message?: string;
  appliedEffects?: string[];
}

// Special ability constants
export const SPECIALS = {
  POWER_ATTACK: { multiplier: 1.5, cost: 20, accuracy: 0.85 },
  DEFEND: { armorBoost: 30, durationTurns: 5, cost: 15 },
  RIPOSTE: { chance: 0.3, damageFactor: 0.5, cost: 25 },
};

function clamp(v: number, a = 0, b = 1) {
  return Math.max(a, Math.min(b, v));
}

/**
 * Core: resolve a CombatAction and return CombatResult
 */
export function resolveCombatAction(action: CombatAction): CombatResult {
  const attacker = action.attacker;
  const target = action.target;

  if (!attacker) return { success: false, hit: false, damageDealt: 0, targetKilled: false, message: 'No attacker' };

  const getStat = (actor: any, key: string, defaultVal = 0) => (actor && actor.stats && typeof actor.stats[key] === 'number' ? actor.stats[key] : defaultVal);

  // Determine stamina cost based on action type if not provided
  let cost = action.staminaCost ?? 0;
  switch (action.type) {
    case 'attack':
      cost = cost || 5;
      break;
    case 'power-attack':
      cost = cost || SPECIALS.POWER_ATTACK.cost;
      break;
    case 'defend':
      cost = cost || SPECIALS.DEFEND.cost;
      break;
    case 'riposte':
      cost = cost || SPECIALS.RIPOSTE.cost;
      break;
    default:
      cost = cost || 0;
  }

  const attackerStamina = getStat(attacker, 'stamina', 0);
  if (attackerStamina < cost) {
    return { success: false, hit: false, damageDealt: 0, targetKilled: false, message: 'Insufficient stamina' };
  }

  // consume stamina
  if (attacker.stats) attacker.stats.stamina = Math.max(0, attacker.stats.stamina - cost);

  // Handle defend immediately: armor buff
  if (action.type === 'defend') {
    const armorBoost = SPECIALS.DEFEND.armorBoost;
    if (attacker.stats) attacker.stats.armor = (attacker.stats.armor ?? 0) + armorBoost;

    // attach a temporary effect on the state to be consumed later by the system
    if (!attacker.state) attacker.state = {} as any;
    (attacker.state as any).tempArmor = { amount: armorBoost, remainingTurns: SPECIALS.DEFEND.durationTurns };

    return { success: true, hit: false, damageDealt: 0, targetKilled: false, message: `Defend applied +${armorBoost} armor for ${SPECIALS.DEFEND.durationTurns} turns`, appliedEffects: ['defend'] };
  }

  // Handle riposte: set riposte status on attacker (defender will trigger it when attacked)
  if (action.type === 'riposte') {
    if (!attacker.state) attacker.state = {} as any;
    (attacker.state as any).riposte = { chance: SPECIALS.RIPOSTE.chance, damageFactor: SPECIALS.RIPOSTE.damageFactor, remainingTurns: 1 };
    return { success: true, hit: false, damageDealt: 0, targetKilled: false, message: 'Riposte ready', appliedEffects: ['riposte'] };
  }

  // For attacks (normal and power)
  if (!target) return { success: false, hit: false, damageDealt: 0, targetKilled: false, message: 'No target' };

  // Accuracy check
  const accuracy = clamp(action.accuracy ?? (action.type === 'power-attack' ? SPECIALS.POWER_ATTACK.accuracy : 0.9), 0, 1);
  const roll = Math.random();
  const hit = roll <= accuracy;

  if (!hit) {
    return { success: true, hit: false, damageDealt: 0, targetKilled: false, message: 'Missed attack' };
  }

  // Compute base damage
  const base = action.baseDamage ?? getStat(attacker, 'damage', 1);
  let finalDamage = base;
  if (action.type === 'power-attack') finalDamage = base * SPECIALS.POWER_ATTACK.multiplier;

  // Status effects can modify damage
  if (action.effects && action.effects.includes('stun')) {
    // stun might add small bonus
    finalDamage += 2;
  }

  // Armor reduction formula: actual_damage = max(1, damage - armor * 0.5)
  const targetArmor = getStat(target, 'armor', 0);
  const actualDamage = Math.max(1, Math.round(finalDamage - targetArmor * 0.5));

  // Apply damage to target
  if (target.stats) {
    target.stats.health = Math.max(0, (target.stats.health ?? 0) - actualDamage);
    // Optionally reduce armor slightly
    target.stats.armor = Math.max(0, (target.stats.armor ?? 0) - Math.round(actualDamage * 0.1));

    if (target.stats.health <= 0 && target.state) {
      target.state.isAlive = false;
    }
  }

  // Apply status effects
  const applied: string[] = [];
  if (action.effects) {
    for (const e of action.effects) {
      applied.push(e);
      // simple bleeding: subtract small amount immediately
      if (e === 'bleed' && target.stats) {
        target.stats.health = Math.max(0, target.stats.health - 2);
        if (target.stats.health <= 0 && target.state) target.state.isAlive = false;
      }
      if (e === 'stun' && target.state) {
        (target.state as any).stunned = true;
      }
    }
  }

  // Handle riposte on target if present
  if (target.state && (target.state as any).riposte) {
    const r = (target.state as any).riposte;
    if (Math.random() <= (r.chance ?? 0)) {
      const counterDmg = Math.max(1, Math.round((r.damageFactor ?? 0.5) * (getStat(target, 'damage', 1))));
      if (attacker.stats) {
        attacker.stats.health = Math.max(0, (attacker.stats.health ?? 0) - counterDmg);
        if (attacker.stats.health <= 0 && attacker.state) attacker.state.isAlive = false;
      }
    }
    // consume riposte
    delete (target.state as any).riposte;
  }

  return { success: true, hit: true, damageDealt: actualDamage, targetKilled: target.stats ? target.stats.health <= 0 : false, message: 'Hit', appliedEffects: applied };
}

export default { resolveCombatAction, SPECIALS };
