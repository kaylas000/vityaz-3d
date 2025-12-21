import * as BABYLON from '@babylonjs/core';
import { SpecNavyFighter } from './SpecNavyFighter';

/**
 * EnemyFighter - AI-powered opponent with behavior states
 */

export enum AIState {
  IDLE = 'idle',
  CHASING = 'chasing',
  ATTACKING = 'attacking',
  FLEEING = 'fleeing',
  DEAD = 'dead',
}

export class EnemyFighter extends SpecNavyFighter {
  private aiState: AIState = AIState.IDLE;
  private targetPlayer: SpecNavyFighter | null = null;
  private detectionRange: number = 30;
  private attackRange: number = 2;
  private lastDecisionTime: number = 0;
  private decisionInterval: number = 500;
  private patrolPath: BABYLON.Vector3[] = [];
  private currentPatrolIndex: number = 0;

  constructor(name: string, scene: BABYLON.Scene, position: BABYLON.Vector3) {
    super(name, scene, position);
    this.mesh.material = new BABYLON.StandardMaterial('enemyMat', scene);
    (this.mesh.material as BABYLON.StandardMaterial).diffuse = new BABYLON.Color3(1, 0, 0);
    this.initializePatrolPath();
  }

  private initializePatrolPath(): void {
    const startPos = this.mesh.position.clone();
    this.patrolPath = [
      startPos,
      startPos.add(new BABYLON.Vector3(10, 0, 0)),
      startPos.add(new BABYLON.Vector3(10, 0, 10)),
      startPos.add(new BABYLON.Vector3(0, 0, 10)),
    ];
  }

  public setTarget(player: SpecNavyFighter): void {
    this.targetPlayer = player;
  }

  public updateAI(deltaTime: number): void {
    if (!this.state.isAlive) {
      this.aiState = AIState.DEAD;
      return;
    }

    const now = Date.now();
    if (now - this.lastDecisionTime < this.decisionInterval) {
      this.executeCurrentBehavior(deltaTime);
      return;
    }

    this.lastDecisionTime = now;

    if (!this.targetPlayer || !this.targetPlayer.state.isAlive) {
      this.aiState = AIState.IDLE;
      this.patrol(deltaTime);
      return;
    }

    const distance = BABYLON.Vector3.Distance(
      this.mesh.position,
      this.targetPlayer.mesh.position
    );

    // Decide on next action
    if (distance > this.detectionRange) {
      this.aiState = AIState.IDLE;
    } else if (distance < this.attackRange) {
      this.aiState = AIState.ATTACKING;
    } else if (this.stats.health < this.stats.maxHealth * 0.3) {
      this.aiState = AIState.FLEEING;
    } else {
      this.aiState = AIState.CHASING;
    }

    this.executeCurrentBehavior(deltaTime);
  }

  private executeCurrentBehavior(deltaTime: number): void {
    switch (this.aiState) {
      case AIState.IDLE:
        this.patrol(deltaTime);
        break;
      case AIState.CHASING:
        this.chaseTarget(deltaTime);
        break;
      case AIState.ATTACKING:
        this.attackTarget();
        break;
      case AIState.FLEEING:
        this.fleeFromTarget(deltaTime);
        break;
      case AIState.DEAD:
        break;
    }
  }

  private patrol(deltaTime: number): void {
    const targetWaypoint = this.patrolPath[this.currentPatrolIndex];
    const direction = targetWaypoint.subtract(this.mesh.position);
    const distance = direction.length();

    if (distance < 1) {
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPath.length;
    } else {
      const normalizedDirection = BABYLON.Vector3.Normalize(direction);
      this.move(normalizedDirection, deltaTime);
    }
  }

  private chaseTarget(deltaTime: number): void {
    if (!this.targetPlayer) return;

    const direction = this.targetPlayer.mesh.position.subtract(this.mesh.position);
    const normalizedDirection = BABYLON.Vector3.Normalize(direction);
    
    // Use sprint for aggressive chase
    if (this.stats.stamina > 30) {
      this.sprint(normalizedDirection, deltaTime);
    } else {
      this.move(normalizedDirection, deltaTime);
    }
  }

  private attackTarget(): void {
    if (!this.targetPlayer) return;
    const damage = this.attack(this.targetPlayer.mesh.position);
    if (damage > 0) {
      this.targetPlayer.takeDamage(damage);
    }
  }

  private fleeFromTarget(deltaTime: number): void {
    if (!this.targetPlayer) return;

    const direction = this.mesh.position.subtract(this.targetPlayer.mesh.position);
    const normalizedDirection = BABYLON.Vector3.Normalize(direction);
    this.sprint(normalizedDirection, deltaTime);
  }

  public getAIState(): AIState {
    return this.aiState;
  }
}
