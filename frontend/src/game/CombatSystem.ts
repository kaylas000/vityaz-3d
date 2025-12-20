import * as BABYLON from '@babylonjs/core';
import { SpecNavyFighter } from './SpecNavyFighter';
import { EnemyFighter, AIState } from './EnemyFighter';

/**
 * CombatSystem - Manages combat mechanics between fighters
 */

export class CombatSystem {
  private scene: BABYLON.Scene;
  private players: SpecNavyFighter[] = [];
  private enemies: EnemyFighter[] = [];
  private isRunning: boolean = false;

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }

  public addPlayer(player: SpecNavyFighter): void {
    this.players.push(player);
  }

  public addEnemy(enemy: EnemyFighter): void {
    this.enemies.push(enemy);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Set targets for enemies
    if (this.players.length > 0) {
      this.enemies.forEach(enemy => {
        enemy.setTarget(this.players[0]);
      });
    }
  }

  public stop(): void {
    this.isRunning = false;
  }

  public update(deltaTime: number): void {
    if (!this.isRunning) return;

    // Update players
    this.players.forEach(player => {
      player.update(deltaTime);
    });

    // Update enemies with AI
    this.enemies.forEach(enemy => {
      enemy.updateAI(deltaTime);
      enemy.update(deltaTime);
    });

    // Check for end conditions
    this.checkEndConditions();
  }

  private checkEndConditions(): void {
    const playersAlive = this.players.filter(p => p.state.isAlive).length;
    const enemiesAlive = this.enemies.filter(e => e.state.isAlive).length;

    if (playersAlive === 0 || enemiesAlive === 0) {
      this.isRunning = false;
    }
  }

  public getStatus(): { playersAlive: number; enemiesAlive: number; isRunning: boolean } {
    return {
      playersAlive: this.players.filter(p => p.state.isAlive).length,
      enemiesAlive: this.enemies.filter(e => e.state.isAlive).length,
      isRunning: this.isRunning,
    };
  }
}
