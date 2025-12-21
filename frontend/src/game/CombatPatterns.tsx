import { AIAction } from './EnemyAI';
import { DifficultyLevel, DifficultyManager } from './EnemyAIDifficulty';
import { AStarPathfinder } from './Pathfinding';

export enum CombatPattern {
  RUSH_ATTACK = 'RUSH_ATTACK',
  DEFENSIVE_STANCE = 'DEFENSIVE_STANCE',
  RANGED_KITING = 'RANGED_KITING',
  RIPOSTE_COUNTER = 'RIPOSTE_COUNTER',
  COMBO_CHAIN = 'COMBO_CHAIN',
  TACTICAL_RETREAT = 'TACTICAL_RETREAT',
}

export interface CombatTactic {
  pattern: CombatPattern;
  power: number;
  speed: number;
  risk: number;
}

export class CombatTacticsEngine {
  private difficultyManager: DifficultyManager;
  private lastActionTick: number = 0;
  private comboChain: number = 0;
  private maxComboChain: number = 5;

  constructor(difficultyManager: DifficultyManager) {
    this.difficultyManager = difficultyManager;
  }

  selectTactic(playerDistance: number, playerHealth: number, enemyHealth: number): CombatTactic {
    const difficulty = this.difficultyManager.getDifficulty();
    const config = this.difficultyManager.getConfig();

    // High aggression and low risk enemy (HARD)
    if (difficulty === DifficultyLevel.HARD && playerDistance < 3) {
      return {
        pattern: CombatPattern.COMBO_CHAIN,
        power: 0.9,
        speed: 0.95,
        risk: 0.7,
      };
    }

    // Medium difficulty balanced approach
    if (difficulty === DifficultyLevel.MEDIUM) {
      if (playerDistance < 2) {
        return {
          pattern: CombatPattern.RUSH_ATTACK,
          power: 0.7,
          speed: 0.7,
          risk: 0.5,
        };
      } else {
        return {
          pattern: CombatPattern.RANGED_KITING,
          power: 0.5,
          speed: 0.6,
          risk: 0.3,
        };
      }
    }

    // Easy difficulty - cautious approach
    return {
      pattern: CombatPattern.DEFENSIVE_STANCE,
      power: 0.4,
      speed: 0.4,
      risk: 0.2,
    };
  }

  executeCombo(baseTactic: CombatTactic): CombatTactic {
    if (this.difficultyManager.shouldAttemptCombo()) {
      this.comboChain = Math.min(this.comboChain + 1, this.maxComboChain);
      return {
        pattern: CombatPattern.COMBO_CHAIN,
        power: baseTactic.power * (1 + this.comboChain * 0.1),
        speed: baseTactic.speed * 1.2,
        risk: baseTactic.risk * 1.3,
      };
    }

    this.comboChain = 0;
    return baseTactic;
  }

  shouldCounterAttack(playerJustAttacked: boolean): boolean {
    if (!playerJustAttacked) return false;
    const config = this.difficultyManager.getConfig();
    return Math.random() < config.comboProbability * 0.8;
  }

  getComboChain(): number {
    return this.comboChain;
  }

  resetCombo(): void {
    this.comboChain = 0;
  }
}

export class AIBehaviorTree {
  private tacticsEngine: CombatTacticsEngine;

  constructor(tacticsEngine: CombatTacticsEngine) {
    this.tacticsEngine = tacticsEngine;
  }

  evaluateBehavior(
    playerPos: { x: number; y: number },
    enemyPos: { x: number; y: number },
    playerHealth: number,
    enemyHealth: number,
    enemyMaxHealth: number
  ): AIAction {
    const distance = Math.sqrt((playerPos.x - enemyPos.x) ** 2 + (playerPos.y - enemyPos.y) ** 2);

    // Check if should retreat
    if (this.tacticsEngine['difficultyManager'].shouldRetreat(enemyHealth, enemyMaxHealth)) {
      return {
        type: 'RETREAT',
        power: 0,
        direction: {
          x: enemyPos.x < playerPos.x ? -1 : 1,
          y: enemyPos.y < playerPos.y ? -1 : 1,
        },
      };
    }

    // Select tactic based on situation
    const baseTactic = this.tacticsEngine.selectTactic(distance, playerHealth, enemyHealth);
    const finalTactic = this.tacticsEngine.executeCombo(baseTactic);

    return {
      type: finalTactic.pattern,
      power: finalTactic.power,
      direction: {
        x: playerPos.x > enemyPos.x ? 1 : -1,
        y: playerPos.y > enemyPos.y ? 1 : -1,
      },
    };
  }
}
