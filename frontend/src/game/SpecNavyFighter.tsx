import * as BABYLON from '@babylonjs/core';

/**
 * SpecNavyFighter - Special Forces Navy Fighter Class
 * Represents a Navy SEAL / Spetsnaz operator in 3D combat arena
 */

export interface CombatStats {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  damage: number;
  attackSpeed: number;
  movementSpeed: number;
  stamina: number;
  maxStamina: number;
}

export interface FighterState {
  position: BABYLON.Vector3;
  rotation: BABYLON.Vector3;
  isAlive: boolean;
  isDucking: boolean;
  isSliding: boolean;
  currentWeapon: 'melee' | 'ranged' | 'special';
  lastAttackTime: number;
  animationState: 'idle' | 'running' | 'sprinting' | 'ducking' | 'attacking' | 'dead';
}

export class SpecNavyFighter {
  public mesh: BABYLON.Mesh;
  public stats: CombatStats;
  public state: FighterState;
  private scene: BABYLON.Scene;
  private physicsImpostor: BABYLON.PhysicsImpostor;
  private speed: BABYLON.Vector3 = BABYLON.Vector3.Zero();

  constructor(name: string, scene: BABYLON.Scene, position: BABYLON.Vector3) {
    this.scene = scene;
    
    // Create 3D mesh for fighter
    this.mesh = BABYLON.MeshBuilder.CreateBox(name, { size: 0.5 }, scene);
    this.mesh.position = position;
    
    // Create basic fighter stats
    this.stats = {
      health: 100,
      maxHealth: 100,
      armor: 50,
      maxArmor: 50,
      damage: 25,
      attackSpeed: 1.0,
      movementSpeed: 15,
      stamina: 100,
      maxStamina: 100,
    };
    
    // Initialize state
    this.state = {
      position: position.clone(),
      rotation: BABYLON.Vector3.Zero(),
      isAlive: true,
      isDucking: false,
      isSliding: false,
      currentWeapon: 'melee',
      lastAttackTime: 0,
      animationState: 'idle',
    };
    
    // Setup physics
    this.physicsImpostor = new BABYLON.PhysicsImpostor(
      this.mesh,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 1, restitution: 0 },
      scene
    );
  }
  
  public move(direction: BABYLON.Vector3, deltaTime: number): void {
    if (!this.state.isAlive) return;
    
    const velocity = direction.scale(this.stats.movementSpeed * deltaTime);
    this.physicsImpostor.applyForce(velocity, this.mesh.getAbsolutePosition());
    this.state.position = this.mesh.position.clone();
  }
  
  public sprint(direction: BABYLON.Vector3, deltaTime: number): void {
    if (this.state.stamina <= 0) return;
    
    const sprintMultiplier = 1.5;
    const velocity = direction.scale(this.stats.movementSpeed * sprintMultiplier * deltaTime);
    this.physicsImpostor.applyForce(velocity, this.mesh.getAbsolutePosition());
    
    this.state.stamina -= 20 * deltaTime;
    this.state.animationState = 'sprinting';
  }
  
  public duck(): void {
    if (this.state.isDucking) return;
    this.state.isDucking = true;
    this.state.animationState = 'ducking';
    this.mesh.scaling.y = 0.6;
  }
  
  public standup(): void {
    if (!this.state.isDucking) return;
    this.state.isDucking = false;
    this.state.animationState = 'idle';
    this.mesh.scaling.y = 1;
  }
  
  public slide(direction: BABYLON.Vector3): void {
    if (this.state.stamina < 15 || this.state.isSliding) return;
    
    this.state.isSliding = true;
    this.state.stamina -= 15;
    const slideVelocity = direction.scale(40);
    this.physicsImpostor.applyImpulse(slideVelocity, this.mesh.getAbsolutePosition());
    
    setTimeout(() => {
      this.state.isSliding = false;
    }, 500);
  }
  
  public attack(targetPosition: BABYLON.Vector3): number {
    if (!this.state.isAlive) return 0;
    
    const now = Date.now();
    if (now - this.state.lastAttackTime < 1000 / this.stats.attackSpeed) return 0;
    
    this.state.lastAttackTime = now;
    this.state.animationState = 'attacking';
    
    const distance = BABYLON.Vector3.Distance(this.mesh.position, targetPosition);
    if (distance > 2) return 0; // Out of melee range
    
    let damage = this.stats.damage;
    if (this.state.currentWeapon === 'special') damage *= 1.5;
    
    return damage;
  }
  
  public takeDamage(amount: number): void {
    if (!this.state.isAlive) return;
    
    let damageAfterArmor = amount;
    const armorReduction = this.stats.armor * 0.01;
    damageAfterArmor = amount * (1 - armorReduction);
    
    this.stats.armor = Math.max(0, this.stats.armor - amount * 0.1);
    this.stats.health = Math.max(0, this.stats.health - damageAfterArmor);
    
    if (this.stats.health <= 0) {
      this.die();
    }
  }
  
  public heal(amount: number): void {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }
  
  public restoreArmor(amount: number): void {
    this.stats.armor = Math.min(this.stats.maxArmor, this.stats.armor + amount);
  }
  
  public restoreStamina(amount: number): void {
    this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + amount);
  }
  
  public die(): void {
    this.state.isAlive = false;
    this.state.animationState = 'dead';
    this.mesh.dispose();
    this.physicsImpostor.dispose();
  }
  
  public update(deltaTime: number): void {
    if (!this.state.isAlive) return;
    
    // Regenerate stamina
    if (this.state.animationState === 'idle') {
      this.restoreStamina(25 * deltaTime);
    }
  }
  
  public getHealth(): number {
    return this.stats.health / this.stats.maxHealth;
  }
  
  public getArmor(): number {
    return this.stats.armor / this.stats.maxArmor;
  }
  
  public getStamina(): number {
    return this.stats.stamina / this.stats.maxStamina;
  }
}
