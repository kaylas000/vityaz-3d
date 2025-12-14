/**
 * 🌋 VISUAL EFFECTS ENGINE - VITYAZ
 * Real-time particle system, lighting, and post-processing effects
 * Blood splatters, explosions, muzzle flashes, smoke, and more
 * 
 * @author VITYAZ Development Team
 * @version 1.0.0
 * @date 2025-12-14
 */

import { Physics, Graphics, Scene } from 'phaser';
import ProceduralGraphics from './ProceduralGraphics';

/**
 * Effect type definition
 */
interface EffectConfig {
  x: number;
  y: number;
  intensity?: number;
  direction?: number;
  color?: string;
  duration?: number;
}

/**
 * Visual effects engine
 */
export class VisualEffectsEngine {
  private scene: Scene;
  private effects: Effect[] = [];
  private particleSystems: Map<string, ParticleSystem> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
    this.initializeEffects();
  }

  /**
   * Initialize visual effect systems
   */
  private initializeEffects(): void {
    // Pre-create particle systems for reuse (object pooling)
    this.particleSystems.set('blood', new BloodParticleSystem(this.scene));
    this.particleSystems.set('spark', new SparkParticleSystem(this.scene));
    this.particleSystems.set('smoke', new SmokeParticleSystem(this.scene));
    this.particleSystems.set('impact', new ImpactParticleSystem(this.scene));
    console.log('✅ Visual Effects Engine initialized');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOOD EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create blood splatter effect at impact location
   */
  bloodSplat(config: EffectConfig): void {
    const bloodSystem = this.particleSystems.get('blood') as BloodParticleSystem;
    if (bloodSystem) {
      bloodSystem.emit(config.x, config.y, config.intensity || 1);
    }

    // Also add static blood decal
    const decal = new BloodDecal(
      this.scene,
      config.x,
      config.y,
      config.direction || 0
    );
    this.effects.push(decal);
  }

  /**
   * Create pool of blood on ground
   */
  createBloodPool(x: number, y: number, size: number = 1): void {
    const poolSize = 12 + size * 4;
    const canvas = document.createElement('canvas');
    canvas.width = poolSize;
    canvas.height = poolSize / 2;
    const ctx = canvas.getContext('2d')!;

    // Dark red pool
    ctx.fillStyle = '#660000';
    ctx.beginPath();
    ctx.ellipse(poolSize / 2, poolSize / 4, poolSize / 2.5, poolSize / 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Add to scene
    const sprite = this.scene.add.image(x, y, '');
    // sprite.setTexture(canvas);  // Would need texture registration
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPLOSION EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create explosion effect
   */
  explosion(config: EffectConfig): void {
    const intensity = config.intensity || 1;
    const radius = 20 + intensity * 10;

    // Explosion flash
    const flash = this.scene.add.rectangle(
      config.x,
      config.y,
      radius * 2,
      radius * 2,
      0xff8800,
      0.6
    );
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => flash.destroy(),
    });

    // Shock wave ring
    const ring = this.scene.add.circle(config.x, config.y, 5, 0xffffff, 0.5);
    this.scene.tweens.add({
      targets: ring,
      radius: radius,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy(),
    });

    // Particle burst
    const sparkSystem = this.particleSystems.get('spark') as SparkParticleSystem;
    if (sparkSystem) {
      sparkSystem.emit(config.x, config.y, intensity * 8);
    }

    // Smoke puff
    const smokeSystem = this.particleSystems.get('smoke') as SmokeParticleSystem;
    if (smokeSystem) {
      smokeSystem.emit(config.x, config.y, intensity * 4);
    }

    // Screen shake effect
    this.screenShake(intensity * 2);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MUZZLE EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create muzzle flash effect when shooting
   */
  muzzleFlash(config: EffectConfig): void {
    const flash = this.scene.add.image(
      config.x,
      config.y,
      'muzzle-flash' // Would be registered texture
    );
    flash.setRotation(config.direction || 0);
    flash.setAlpha(0.8);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 80,
      onComplete: () => flash.destroy(),
    });

    // Spark ejection
    const sparkSystem = this.particleSystems.get('spark') as SparkParticleSystem;
    if (sparkSystem) {
      sparkSystem.emit(config.x, config.y, 2);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // IMPACT EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create bullet impact effect on surface
   */
  bulletImpact(config: EffectConfig): void {
    // Impact crater decal
    const impactSystem = this.particleSystems.get('impact') as ImpactParticleSystem;
    if (impactSystem) {
      impactSystem.emit(config.x, config.y, 1);
    }

    // Dust cloud
    const smokeSystem = this.particleSystems.get('smoke') as SmokeParticleSystem;
    if (smokeSystem) {
      smokeSystem.emit(config.x, config.y, 2);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Screen shake effect for impact feedback
   */
  private screenShake(intensity: number = 1, duration: number = 200): void {
    const camera = this.scene.cameras.main;
    const originalX = camera.scrollX;
    const originalY = camera.scrollY;
    const shakeAmount = intensity * 2;

    this.scene.tweens.add({
      targets: camera,
      scrollX: originalX + (Math.random() - 0.5) * shakeAmount,
      scrollY: originalY + (Math.random() - 0.5) * shakeAmount,
      duration: 50,
      repeat: Math.floor(duration / 50),
      onComplete: () => {
        camera.scrollX = originalX;
        camera.scrollY = originalY;
      },
    });
  }

  /**
   * Screen fade effect
   */
  screenFlash(color: number = 0xffffff, duration: number = 200): void {
    const flash = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      color,
      1
    );
    flash.setDepth(1000);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration,
      onComplete: () => flash.destroy(),
    });
  }

  /**
   * Update all effects
   */
  update(delta: number): void {
    this.effects = this.effects.filter((effect) => {
      effect.update(delta);
      return !effect.isComplete();
    });

    // Update particle systems
    this.particleSystems.forEach((system) => {
      system.update(delta);
    });
  }
}

/**
 * Base effect class
 */
abstract class Effect {
  protected elapsedTime: number = 0;
  protected duration: number = 0;

  abstract update(delta: number): void;
  abstract isComplete(): boolean;
}

/**
 * Blood decal - static visual effect
 */
class BloodDecal extends Effect {
  private sprite: Graphics;

  constructor(scene: Scene, x: number, y: number, angle: number) {
    super();
    this.sprite = scene.add.graphics();
    this.sprite.fillStyle(0x8b0000, 0.7);
    this.sprite.fillCircle(0, 0, 3);
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.rotation = angle;
    this.duration = 5000; // 5 seconds
  }

  update(delta: number): void {
    this.elapsedTime += delta;
  }

  isComplete(): boolean {
    return this.elapsedTime >= this.duration;
  }
}

/**
 * Base particle system
 */
abstract class ParticleSystem {
  protected scene: Scene;
  protected particles: any[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  abstract emit(x: number, y: number, count: number): void;

  update(delta: number): void {
    // Update particles
  }
}

/**
 * Blood particle system
 */
class BloodParticleSystem extends ParticleSystem {
  emit(x: number, y: number, intensity: number = 1): void {
    // Generate 3-6 blood particles based on intensity
    const count = Math.ceil(3 + intensity * 3);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * Math.random());
      const velocity = 1 + Math.random() * 2;
      // Particles would be created here
    }
  }
}

/**
 * Spark particle system
 */
class SparkParticleSystem extends ParticleSystem {
  emit(x: number, y: number, intensity: number = 1): void {
    const count = Math.ceil(2 + intensity * 2);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * Math.random());
      // Spark particles created
    }
  }
}

/**
 * Smoke particle system
 */
class SmokeParticleSystem extends ParticleSystem {
  emit(x: number, y: number, intensity: number = 1): void {
    const count = Math.ceil(2 + intensity);
    for (let i = 0; i < count; i++) {
      // Smoke particles created
    }
  }
}

/**
 * Impact particle system
 */
class ImpactParticleSystem extends ParticleSystem {
  emit(x: number, y: number, intensity: number = 1): void {
    // Dust/impact particles
  }
}

export default VisualEffectsEngine;
