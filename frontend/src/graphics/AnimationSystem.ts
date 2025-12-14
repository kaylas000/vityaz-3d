/**
 * 🎬 ANIMATION SYSTEM - VITYAZ
 * Frame-based animation engine with procedural sprite generation
 * Smooth transitions and state machine management
 * 
 * @author VITYAZ Development Team
 * @version 1.0.0
 * @date 2025-12-14
 */

import { Physics, Sprites } from 'phaser';
import ProceduralGraphics from './ProceduralGraphics';

/**
 * Animation frame definition
 */
interface AnimationFrame {
  sprite: HTMLCanvasElement;
  duration: number; // milliseconds
  offset?: { x: number; y: number };
}

/**
 * Animation state definition
 */
interface AnimationState {
  frames: AnimationFrame[];
  loop: boolean;
  onComplete?: () => void;
}

/**
 * Main animation system
 */
export class AnimationSystem {
  private static animations: Map<string, AnimationState> = new Map();
  private static activeAnimations: Map<string, AnimationData> = new Map();

  /**
   * Animation data for tracking playback
   */
  private static animationData = class {
    currentFrame: number = 0;
    elapsedTime: number = 0;
    isPlaying: boolean = false;
    currentAnimation: string = '';
  };

  /**
   * Initialize animation system
   */
  static initialize(): void {
    console.log('✅ Animation System initialized');
    this.buildAnimations();
  }

  /**
   * Build all animation states
   */
  private static buildAnimations(): void {
    // Player Walking Animation
    this.addAnimation('player-walk', {
      frames: this.generateWalkingFrames(4),
      loop: true,
      onComplete: undefined,
    });

    // Player Attack Animation
    this.addAnimation('player-attack', {
      frames: this.generateAttackFrames(3),
      loop: false,
    });

    // Player Idle Animation
    this.addAnimation('player-idle', {
      frames: [{ sprite: ProceduralGraphics.drawPlayerBody(0, 0), duration: 100 }],
      loop: true,
    });

    // Enemy Walk Animation
    this.addAnimation('enemy-walk', {
      frames: this.generateEnemyWalkFrames(4),
      loop: true,
    });

    // Enemy Attack Animation
    this.addAnimation('enemy-attack', {
      frames: this.generateEnemyAttackFrames(2),
      loop: false,
    });

    // Explosion Animation
    this.addAnimation('explosion', {
      frames: this.generateExplosionFrames(6),
      loop: false,
    });

    // Death Animation (ragdoll effect)
    this.addAnimation('death', {
      frames: this.generateDeathFrames(3),
      loop: false,
    });

    console.log(`✅ Built ${this.animations.size} animations`);
  }

  /**
   * Register animation
   */
  private static addAnimation(key: string, state: AnimationState): void {
    this.animations.set(key, state);
  }

  /**
   * Get animation by key
   */
  static getAnimation(key: string): AnimationState | undefined {
    return this.animations.get(key);
  }

  /**
   * Play animation on sprite
   */
  static playAnimation(
    sprite: Sprites.Sprite,
    animationKey: string,
    onComplete?: () => void
  ): boolean {
    const animation = this.getAnimation(animationKey);
    if (!animation) {
      console.warn(`⚠️ Animation not found: ${animationKey}`);
      return false;
    }

    const spriteId = sprite.name || `sprite-${Math.random()}`;
    this.activeAnimations.set(spriteId, {
      animation,
      currentFrame: 0,
      elapsedTime: 0,
      onComplete,
    });

    return true;
  }

  /**
   * Update active animations
   */
  static update(delta: number): void {
    this.activeAnimations.forEach((data, spriteId) => {
      if (!data.animation.frames.length) return;

      data.elapsedTime += delta;
      const currentFrameData = data.animation.frames[data.currentFrame];

      if (data.elapsedTime >= currentFrameData.duration) {
        data.elapsedTime = 0;
        data.currentFrame++;

        // Check if animation should loop
        if (data.currentFrame >= data.animation.frames.length) {
          if (data.animation.loop) {
            data.currentFrame = 0;
          } else {
            this.activeAnimations.delete(spriteId);
            if (data.onComplete) {
              data.onComplete();
            }
            return;
          }
        }
      }
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FRAME GENERATORS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Generate walking animation frames (4 directions)
   */
  private static generateWalkingFrames(frameCount: number): AnimationFrame[] {
    const frames: AnimationFrame[] = [];
    for (let i = 0; i < frameCount; i++) {
      const walkPhase = (i / frameCount) * Math.PI * 2;
      frames.push({
        sprite: ProceduralGraphics.drawPlayerLimbs(0, 0, walkPhase),
        duration: 100,
      });
    }
    return frames;
  }

  /**
   * Generate attack animation frames
   */
  private static generateAttackFrames(frameCount: number): AnimationFrame[] {
    const frames: AnimationFrame[] = [];
    const recoilPattern = [0, -0.3, -0.15, 0]; // Recoil easing

    for (let i = 0; i < frameCount; i++) {
      const angle = recoilPattern[Math.min(i, recoilPattern.length - 1)];
      frames.push({
        sprite: ProceduralGraphics.drawPlayerWeapon(0, 0, angle),
        duration: 80,
      });
    }
    return frames;
  }

  /**
   * Generate enemy walking frames
   */
  private static generateEnemyWalkFrames(frameCount: number): AnimationFrame[] {
    const frames: AnimationFrame[] = [];
    for (let i = 0; i < frameCount; i++) {
      // Alternate between two positions for simple walking effect
      const offsetY = (i % 2) * 1.5;
      frames.push({
        sprite: ProceduralGraphics.drawBasicEnemy(0, 0),
        duration: 120,
        offset: { x: 0, y: offsetY },
      });
    }
    return frames;
  }

  /**
   * Generate enemy attack frames
   */
  private static generateEnemyAttackFrames(frameCount: number): AnimationFrame[] {
    const frames: AnimationFrame[] = [];
    for (let i = 0; i < frameCount; i++) {
      frames.push({
        sprite: ProceduralGraphics.drawArmedEnemy(0, 0),
        duration: 150,
      });
    }
    return frames;
  }

  /**
   * Generate explosion animation frames
   */
  private static generateExplosionFrames(frameCount: number): AnimationFrame[] {
    const frames: AnimationFrame[] = [];
    for (let i = 0; i < frameCount; i++) {
      frames.push({
        sprite: ProceduralGraphics.drawExplosion(0, 0, 20, i),
        duration: 80,
      });
    }
    return frames;
  }

  /**
   * Generate death animation frames (falling/ragdoll effect)
   */
  private static generateDeathFrames(frameCount: number): AnimationFrame[] {
    const frames: AnimationFrame[] = [];
    for (let i = 0; i < frameCount; i++) {
      const rotation = (i / frameCount) * Math.PI * 0.5; // 90 degree fall
      frames.push({
        sprite: ProceduralGraphics.drawBasicEnemy(0, 0),
        duration: 100,
        offset: { x: rotation * 10, y: rotation * 5 },
      });
    }
    return frames;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SMOOTH INTERPOLATION (for real-time animation blending)
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Lerp (linear interpolation) between two values
   */
  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * Math.min(Math.max(t, 0), 1);
  }

  /**
   * Easing function for smooth animations
   */
  static easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * Get current animation frame progress (0 to 1)
   */
  static getFrameProgress(spriteId: string): number {
    const data = this.activeAnimations.get(spriteId);
    if (!data) return 0;

    const currentFrameData = data.animation.frames[data.currentFrame];
    return data.elapsedTime / currentFrameData.duration;
  }
}

/**
 * Animation data interface
 */
interface AnimationData {
  animation: AnimationState;
  currentFrame: number;
  elapsedTime: number;
  onComplete?: () => void;
}

/**
 * Direction-based animation controller
 */
export class DirectionalAnimationController {
  private sprite: Sprites.Sprite;
  private currentDirection: number = 0; // 0-7 (8 directions)
  private currentState: string = 'idle'; // idle, walk, attack

  constructor(sprite: Sprites.Sprite) {
    this.sprite = sprite;
  }

  /**
   * Update animation based on direction and state
   */
  updateAnimation(direction: number, state: string): void {
    // Change direction
    if (direction !== this.currentDirection) {
      this.currentDirection = direction;
      this.sprite.setRotation((direction / 8) * Math.PI * 2);
    }

    // Change state
    if (state !== this.currentState) {
      this.currentState = state;
      const animationKey = `player-${state}`;
      AnimationSystem.playAnimation(this.sprite, animationKey);
    }
  }

  /**
   * Get current direction
   */
  getDirection(): number {
    return this.currentDirection;
  }

  /**
   * Get current state
   */
  getState(): string {
    return this.currentState;
  }
}

/**
 * Particle animation system for effects
 */
export class ParticleAnimationSystem {
  private particles: Particle[] = [];

  /**
   * Create particle effect
   */
  createParticles(
    x: number,
    y: number,
    type: 'blood' | 'spark' | 'smoke',
    count: number = 5
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const velocity = 2 + Math.random() * 3;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1000, // ms
        maxLife: 1000,
        type,
      });
    }
  }

  /**
   * Update particles
   */
  update(delta: number): void {
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravity
      p.life -= delta;

      return p.life > 0;
    });
  }

  /**
   * Get particles for rendering
   */
  getParticles(): Particle[] {
    return this.particles;
  }
}

/**
 * Particle definition
 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: 'blood' | 'spark' | 'smoke';
}

export default AnimationSystem;
