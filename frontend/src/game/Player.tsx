import { Vector3, TransformNode, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import { GameEngine } from './GameEngine';

type PlayerState = 'idle' | 'walking' | 'running' | 'jumping';

export class Player {
  private name: string;
  private gameEngine: GameEngine;
  private mesh: TransformNode | null = null;
  private position: Vector3 = Vector3.Zero();
  private velocity: Vector3 = Vector3.Zero();
  private state: PlayerState = 'idle';
  private speed: number = 0.1;
  private jumpForce: number = 0.5;
  private isGrounded: boolean = true;
  private keys: { [key: string]: boolean } = {};
  private animationTime: number = 0;

  constructor(name: string, gameEngine: GameEngine) {
    this.name = name;
    this.gameEngine = gameEngine;
  }

  initialize(): void {
    try {
      const scene = this.gameEngine.getScene();
      if (!scene) throw new Error('Scene not available');

      // Create player mesh (simple box for now)
      this.mesh = MeshBuilder.CreateBox('player', { size: 1 }, scene);
      this.mesh.position = new Vector3(0, 1, 0);

      // Apply material
      const material = new StandardMaterial('playerMat', scene);
      material.diffuse = new Color3(0, 0.5, 1);
      if (this.mesh) this.mesh.material = material;

      // Enable collisions
      if (this.mesh) {
        this.mesh.checkCollisions = true;
      }

      this.position = this.mesh.position.clone();
    } catch (error) {
      console.error('Player initialization failed:', error);
      throw error;
    }
  }

  handleInput(keys: { [key: string]: boolean }): void {
    this.keys = { ...this.keys, ...keys };
  }

  update(deltaTime: number): void {
    if (!this.mesh) return;

    this.animationTime += deltaTime;

    // Handle movement input
    const moveVector = new Vector3(0, 0, 0);
    let isMoving = false;

    if (this.keys['w'] || this.keys['arrowup']) {
      moveVector.z += this.speed;
      isMoving = true;
    }
    if (this.keys['s'] || this.keys['arrowdown']) {
      moveVector.z -= this.speed;
      isMoving = true;
    }
    if (this.keys['a'] || this.keys['arrowleft']) {
      moveVector.x -= this.speed;
      isMoving = true;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      moveVector.x += this.speed;
      isMoving = true;
    }

    // Handle running
    if (this.keys['shift']) {
      moveVector.scale(1.5);
      this.state = isMoving ? 'running' : 'idle';
    } else {
      this.state = isMoving ? 'walking' : 'idle';
    }

    // Handle jumping
    if ((this.keys[' '] || this.keys['spacebar']) && this.isGrounded) {
      this.velocity.y += this.jumpForce;
      this.isGrounded = false;
      this.state = 'jumping';
    }

    // Apply gravity
    this.velocity.y -= 0.01; // Gravity
    if (this.mesh.position.y <= 1) {
      this.velocity.y = 0;
      this.isGrounded = true;
      this.mesh.position.y = 1;
    }

    // Update position
    this.mesh.position.addInPlace(moveVector);
    this.mesh.position.y += this.velocity.y * deltaTime;

    // Clamp position
    this.mesh.position.x = Math.max(-50, Math.min(50, this.mesh.position.x));
    this.mesh.position.z = Math.max(-50, Math.min(50, this.mesh.position.z));

    // Update internal position
    this.position = this.mesh.position.clone();
  }

  getPosition(): Vector3 {
    return this.position.clone();
  }

  getState(): PlayerState {
    return this.state;
  }

  getName(): string {
    return this.name;
  }
}
