export enum AIState {
  IDLE,
  PATROL,
  HUNT,
  ATTACK,
  RETREAT,
  STUN,
}

export interface AIAction {
  type: string;
  direction?: { x: number; y: number };
  targetId?: string;
  power?: number;
}

export class EnemyAI {
  position = { x: 0, y: 0 };
  health = 100;
  stamina = 100;
  aiState: AIState = AIState.IDLE;
  aggressionLevel = 0.6; // 0.3 = CAUTIOUS, 0.6 = BALANCED, 0.9 = AGGRESSIVE
  id: string = '';

  calculateNextAction(playerPos: { x: number; y: number }): AIAction {
    const dist = Math.sqrt(
      (playerPos.x - this.position.x) ** 2 +
      (playerPos.y - this.position.y) ** 2
    );

    // Health-based retreat logic
    if (this.health < 30) {
      const retreatChance = Math.random();
      if (retreatChance < 0.4) {
        this.aiState = AIState.RETREAT;
        return { type: 'RETREAT', power: 0 };
      } else {
        this.aiState = AIState.ATTACK;
        return { type: 'DEFEND', power: 0.5 };
      }
    }

    // Stamina-based attack avoidance
    if (this.stamina < 20) {
      return { type: 'DEFEND', power: 0.3 };
    }

    // Distance-based logic
    if (dist < 2) {
      this.aiState = AIState.ATTACK;
      return { type: 'ATTACK', power: this.aggressionLevel };
    } else if (dist < 5) {
      this.aiState = AIState.HUNT;
      const direction = {
        x: playerPos.x > this.position.x ? 1 : -1,
        y: playerPos.y > this.position.y ? 1 : -1,
      };
      return { type: 'HUNT', direction };
    } else {
      this.aiState = AIState.PATROL;
      return { type: 'PATROL', power: 0 };
    }
  }
}

export class AIManager {
  enemies: EnemyAI[] = [];

  constructor(enemies: EnemyAI[] = []) {
    this.enemies = enemies;
  }

  update(playerPos: { x: number; y: number }): AIAction[] {
    return this.enemies.map((enemy) =>
      enemy.calculateNextAction(playerPos)
    );
  }

  addEnemy(enemy: EnemyAI): void {
    this.enemies.push(enemy);
  }

  removeEnemy(enemyId: string): void {
    this.enemies = this.enemies.filter((e) => e.id !== enemyId);
  }
}
