import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import { GAME_CONFIG, COLORS } from '../utils/constants';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import Projectile from '../entities/Projectile';
import GameHUD from '../ui/GameHUD';

/**
 * GameScene3D - Main 3D game scene with Babylon.js
 * Handles game logic, rendering, and entity management
 */
export default class GameScene3D {
  // Babylon components
  scene: BABYLON.Scene;
  engine: BABYLON.Engine;
  canvas: HTMLCanvasElement;
  camera: BABYLON.UniversalCamera | null = null;

  // Game entities
  player: Player | null = null;
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  hud: GameHUD | null = null;

  // Game state
  wave: number = 1;
  score: number = 0;
  gameActive: boolean = true;
  lastFrameTime: number = Date.now();

  // Input handling
  inputMap: { [key: string]: boolean } = {};
  mousePos: { x: number; y: number } = { x: 0, y: 0 };
  lastShootTime: number = 0;
  lastInputLog: number = 0;

  constructor(canvas: HTMLCanvasElement, engine: BABYLON.Engine) {
    this.canvas = canvas;
    this.engine = engine;
    this.scene = new BABYLON.Scene(engine);

    // Initialize all components synchronously
    this.setupScene();
    this.setupInput();
    this.startGameLoop();

    console.log('✅ GameScene3D initialized');
    console.log('📖 Press W/A/S/D to move, hold click to look around, click to shoot');
  }

  /**
   * Setup scene: lights, sky, ground, player, enemies, HUD
   */
  private setupScene() {
    // Light (hemisphere light for better visibility)
    const light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(1, 1, 1),
      this.scene
    );
    light.intensity = 0.7;

    // Sky (simple large cube)
    const skybox = BABYLON.MeshBuilder.CreateBox('skybox', { size: 1000 }, this.scene);
    const skyMaterial = new BABYLON.StandardMaterial('skyMat', this.scene);
    skyMaterial.emissiveColor = new BABYLON.Color3(
      COLORS.SKY.r,
      COLORS.SKY.g,
      COLORS.SKY.b
    );
    skybox.material = skyMaterial;

    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width: 200, height: 200 },
      this.scene
    );
    const groundMat = new BABYLON.StandardMaterial('groundMat', this.scene);
    groundMat.emissiveColor = new BABYLON.Color3(
      COLORS.GROUND.r,
      COLORS.GROUND.g,
      COLORS.GROUND.b
    );
    ground.material = groundMat;

    // Camera (FPS style with mouse look)
    this.camera = new BABYLON.UniversalCamera(
      'camera',
      new BABYLON.Vector3(0, 2, -10),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);
    this.camera.inertia = 0.7;
    this.camera.angularSensibility = 1000;
    // Set speed to 0 - we'll control camera manually via player position
    this.camera.speed = 0;

    // Create player
    this.player = new Player(this.scene, GAME_CONFIG.PLAYER_START_POS);

    // Create HUD
    this.hud = new GameHUD(this.scene);
    if (this.player) {
      this.hud.updateHealth(this.player.health, this.player.maxHealth);
    }
    this.hud.updateScore(this.score);
    this.hud.updateWave(this.wave);

    // Spawn initial enemies
    this.spawnWave(this.wave);
  }

  /**
   * Setup keyboard and mouse input handlers
   */
  private setupInput() {
    // Keyboard input (WASD, Space, etc.)
    this.scene.onKeyboardObservable.add((kbInfo) => {
      const key = kbInfo.event.key.toUpperCase();

      if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
        this.inputMap[key] = true;
        // Debug: Log key press
        if (Date.now() - this.lastInputLog > 500) {
          console.log(`🎮 Key pressed: ${key}`);
          this.lastInputLog = Date.now();
        }
      } else if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
        this.inputMap[key] = false;
      }
    });

    // Mouse input (camera look + shooting)
    this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
        this.mousePos = {
          x: pointerInfo.event.clientX,
          y: pointerInfo.event.clientY,
        };
      }

      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
        this.shoot();
      }
    });
  }

  /**
   * Start main game loop (runs every frame)
   */
  private startGameLoop() {
    this.engine.runRenderLoop(() => {
      if (this.gameActive) {
        this.update();
      }
      this.scene.render();
    });
  }

  /**
   * Main update loop (called every frame)
   */
  private update() {
    const now = Date.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Update player with deltaTime
    if (this.player) {
      this.player.update(this.inputMap, deltaTime);

      // Move camera to follow player (FPS-style)
      if (this.camera) {
        // Camera offset from player (eyes height)
        const cameraOffset = new BABYLON.Vector3(0, 1.5, 0);
        const targetCameraPos = this.player.mesh.position.add(cameraOffset);
        
        // Smooth camera follow
        this.camera.position = BABYLON.Vector3.Lerp(
          this.camera.position,
          targetCameraPos,
          0.2 // Smoothing factor
        );
      }
    }

    // Update enemies (with deltaTime for consistent movement)
    if (this.player) {
      this.enemies.forEach((enemy) => {
        enemy.update(this.player!.mesh.position, deltaTime);
      });
    }

    // Update projectiles
    this.projectiles = this.projectiles.filter((p) => p.update(deltaTime));

    // Check collisions
    this.checkCollisions();

    // Wave management: spawn next wave when all enemies are defeated
    if (this.enemies.length === 0 && this.gameActive) {
      this.wave++;
      console.log(`⬆️ Wave increased to ${this.wave}`);
      this.spawnWave(this.wave);
    }

    // Check game over condition
    if (this.player && this.player.health <= 0) {
      this.gameOver();
    }

    // Update HUD
    if (this.hud && this.player) {
      this.hud.updateHealth(this.player.health, this.player.maxHealth);
      this.hud.updateScore(this.score);
      this.hud.updateWave(this.wave);
    }
  }

  /**
   * Collision detection with corrected distance and attack cooldown
   */
  private checkCollisions() {
    // Projectiles vs Enemies
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];

        const distance = BABYLON.Vector3.Distance(
          projectile.mesh.position,
          enemy.mesh.position
        );

        if (distance < GAME_CONFIG.COLLISION_DISTANCE) {
          enemy.takeDamage(projectile.damage);
          projectile.dispose();
          this.projectiles.splice(i, 1);

          if (enemy.health <= 0) {
            enemy.dispose();
            this.enemies.splice(j, 1);
            this.score += enemy.type === 'tank' ? 200 : 100;
            console.log(`🎯 Enemy killed! Score: ${this.score}`);
          }
          break;
        }
      }
    }

    // Enemies vs Player with attack cooldown
    if (this.player) {
      const now = Date.now();

      for (const enemy of this.enemies) {
        const distance = BABYLON.Vector3.Distance(
          enemy.mesh.position,
          this.player.mesh.position
        );

        // Player gets hit if enemy gets too close
        if (distance < GAME_CONFIG.COLLISION_DISTANCE) {
          if (now - (enemy as any).lastHitTime > GAME_CONFIG.ENEMY_ATTACK_COOLDOWN) {
            this.player.takeDamage(enemy.damage);
            (enemy as any).lastHitTime = now;
            console.log('💥 Player hit by enemy!');
          }
        }
      }
    }
  }

  /**
   * Spawn a new wave of enemies
   * Difficulty increases with each wave
   */
  private spawnWave(waveNumber: number) {
    const count = GAME_CONFIG.INITIAL_ENEMIES_PER_WAVE + Math.floor(waveNumber / 2);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const pos = new BABYLON.Vector3(
        Math.cos(angle) * GAME_CONFIG.ENEMY_SPAWN_DISTANCE,
        1,
        Math.sin(angle) * GAME_CONFIG.ENEMY_SPAWN_DISTANCE
      );

      // Introduce tank enemies from wave 2 onwards
      const type = i === 0 && waveNumber > 1 ? 'tank' : 'basic';
      this.enemies.push(new Enemy(this.scene, pos, type));
    }

    console.log(`🌊 Wave ${waveNumber} spawned (${this.enemies.length} enemies)`);
  }

  /**
   * Shoot projectile from camera forward direction
   */
  private shoot() {
    const now = Date.now();
    if (now - this.lastShootTime < GAME_CONFIG.SHOOT_COOLDOWN) return;
    if (!this.camera || !this.player) return;

    this.lastShootTime = now;

    const startPos = this.camera.position.clone();
    const direction = BABYLON.Vector3.Forward().applyRotationQuaternionInPlace(
      this.camera.absoluteRotation
    );

    const projectile = new Projectile(this.scene, startPos, direction);
    this.projectiles.push(projectile);

    console.log('🔫 Shot fired!');
  }

  /**
   * Handle game over
   */
  private gameOver() {
    this.gameActive = false;
    console.log('💠 GAME OVER!');
    console.log(`Final Score: ${this.score}`);
    console.log(`Waves Survived: ${this.wave}`);

    if (this.hud) {
      this.hud.showGameOver(this.score, this.wave);
    }
  }

  /**
   * Cleanup and dispose all resources
   */
  dispose() {
    this.scene.dispose();
  }
}
