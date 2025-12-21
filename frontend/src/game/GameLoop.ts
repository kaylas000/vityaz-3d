import { Arena } from './Arena';
import { CombatEngine } from './CombatEngine';
import { EnemyAI, AIManager, AIAction } from './EnemyAI';

export interface GameState {
  running: boolean;
  paused: boolean;
  tick: number;
  playerHealth: number;
  playerStamina: number;
  enemiesCount: number;
}

export interface Position {
  x: number;
  y: number;
}

export class GameLoop {
  private arena: Arena;
  private player: { position: Position; health: number; stamina: number };
  private enemies: EnemyAI[] = [];
  private combatEngine: CombatEngine;
  private aiManager: AIManager;
  private gameState: 'RUNNING' | 'PAUSED' | 'ENDED' = 'RUNNING';
  private tick = 0;

  constructor(width = 50, height = 50) {
    this.arena = new Arena();
    this.arena.generateArena(width, height);

    // Initialize player at spawn point
    const spawnPoints = this.arena.getSpawnPoints(5);
    const playerSpawn = spawnPoints[0];

    this.player = {
      position: playerSpawn,
      health: 100,
      stamina: 100,
    };

    // Initialize enemies
    for (let i = 1; i < Math.min(spawnPoints.length, 4); i++) {
      const enemy = new EnemyAI();
      enemy.position = spawnPoints[i];
      enemy.id = `enemy-${i}`;
      this.enemies.push(enemy);
    }

    this.aiManager = new AIManager(this.enemies);
    this.combatEngine = new CombatEngine();
  }

  update(playerAction: any): GameState {
    if (this.gameState !== 'RUNNING') {
      return this.getGameState();
    }

    this.tick++;

    // Update player position based on action
    if (playerAction?.direction) {
      this.player.position.x += playerAction.direction.x;
      this.player.position.y += playerAction.direction.y;

      // Clamp to arena bounds
      this.player.position.x = Math.max(0, Math.min(49, this.player.position.x));
      this.player.position.y = Math.max(0, Math.min(49, this.player.position.y));
    }

    // Update player stamina
    if (playerAction?.type === 'ATTACK') {
      this.player.stamina -= 20;
    } else if (playerAction?.type === 'DEFEND') {
      this.player.stamina -= 5;
    } else {
      this.player.stamina = Math.min(100, this.player.stamina + 5);
    }

    // Get AI decisions
    const aiActions = this.aiManager.update(this.player.position);

    // Update enemies
    this.enemies.forEach((enemy, index) => {
      if (aiActions[index]) {
        const action = aiActions[index];
        if (action.direction) {
          enemy.position.x += action.direction.x;
          enemy.position.y += action.direction.y;
          enemy.position.x = Math.max(0, Math.min(49, enemy.position.x));
          enemy.position.y = Math.max(0, Math.min(49, enemy.position.y));
        }
      }
    });

    // Check game end conditions
    if (this.player.health <= 0) {
      this.gameState = 'ENDED';
    }

    if (this.enemies.filter((e) => e.health > 0).length === 0) {
      this.gameState = 'ENDED';
    }

    return this.getGameState();
  }

  pause(): void {
    this.gameState = 'PAUSED';
  }

  resume(): void {
    if (this.gameState === 'PAUSED') {
      this.gameState = 'RUNNING';
    }
  }

  getGameState(): GameState {
    return {
      running: this.gameState === 'RUNNING',
      paused: this.gameState === 'PAUSED',
      tick: this.tick,
      playerHealth: this.player.health,
      playerStamina: this.player.stamina,
      enemiesCount: this.enemies.filter((e) => e.health > 0).length,
    };
  }

  getPlayer() {
    return this.player;
  }

  getEnemies() {
    return this.enemies;
  }

  getArena() {
    return this.arena;
  }
}
