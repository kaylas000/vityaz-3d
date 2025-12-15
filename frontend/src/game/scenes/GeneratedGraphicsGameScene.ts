import Phaser from 'phaser';
import { PlayerSpriteGenerator } from '../../graphics/PlayerSpriteGenerator';

/**
 * Game Scene with Krapoovy Beret Graphics
 * 
 * Features:
 * - Procedurally generated player sprite with krapoovy beret (maroon-brown, left side)
 * - Gold Vityaz star insignia
 * - Military tactical gear
 * - Enemy sprites with red uniforms
 * - Enhanced visual effects
 * - Professional HUD
 */
export class GeneratedGraphicsGameScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite | null = null;
  private weapon: Phaser.Physics.Arcade.Sprite | null = null;
  private healthBar: Phaser.GameObjects.Graphics | null = null;
  private muzzleFlash: Phaser.GameObjects.Sprite | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private health: number = 100;
  private ammo: number = 30;
  private maxAmmo: number = 30;
  private score: number = 0;
  private wave: number = 1;
  private enemies: Phaser.Physics.Arcade.Sprite[] = [];
  private enemyGroup: Phaser.Physics.Arcade.Group | null = null;

  constructor() {
    super({ key: 'GeneratedGraphicsGameScene' });
  }

  /**
   * Create all game animations
   */
  private createAnimations() {
    // Character idle animation (breathing)
    this.anims.create({
      key: 'operator_idle',
      frames: this.anims.generateFrameNumbers('playerSprite', {
        start: 0,
        end: 0,
      }),
      frameRate: 4,
      repeat: -1,
    });

    // Character walk animation
    this.anims.create({
      key: 'operator_walk',
      frames: this.anims.generateFrameNumbers('playerSprite', {
        start: 0,
        end: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Enemy idle
    this.anims.create({
      key: 'enemy_idle',
      frames: this.anims.generateFrameNumbers('enemySprite', {
        start: 0,
        end: 0,
      }),
      frameRate: 4,
      repeat: -1,
    });
  }

  /**
   * Create the game world
   */
  create() {
    console.log('🎮 GeneratedGraphicsGameScene started with Krapoovy Beret');

    // Generate sprites using PlayerSpriteGenerator
    this.generateSprites();

    // Create animations
    this.createAnimations();

    // Create background
    this.createBackground();

    // Create player character
    this.createPlayer();

    // Create weapon
    this.createWeapon();

    // Create UI
    this.createUI();

    // Create enemy group
    this.enemyGroup = this.physics.add.group();

    // Spawn initial enemies
    this.spawnWave();

    // Create input
    this.cursors = this.input.keyboard?.createCursorKeys() || null;

    // Setup camera
    this.setupCamera();

    console.log('✅ Game scene created successfully with Vityaz graphics');
  }

  /**
   * Generate all sprites using PlayerSpriteGenerator
   */
  private generateSprites() {
    // Generate player sprite with krapoovy beret
    PlayerSpriteGenerator.generatePlayerSprite(this, 64, 64);
    console.log('✅ Generated player sprite with krapoovy beret (maroon-brown, left side)');

    // Generate enemy sprite
    PlayerSpriteGenerator.generateEnemySprite(this, 56, 56);
    console.log('✅ Generated enemy sprite');

    // Generate weapon sprite
    PlayerSpriteGenerator.generateWeaponSprite(this, 48, 12);
    console.log('✅ Generated weapon sprite');

    // Generate effect sprites
    PlayerSpriteGenerator.generateEffectSprite(this, 'blood', 16);
    PlayerSpriteGenerator.generateEffectSprite(this, 'explosion', 32);
    PlayerSpriteGenerator.generateEffectSprite(this, 'smoke', 24);
    console.log('✅ Generated visual effect sprites');
  }

  /**
   * Create background/map
   */
  private createBackground() {
    // Create tilemap background (simulated)
    const graphicsBackground = this.make.graphics({
      x: 0,
      y: 0,
      add: true,
    });

    // Draw ground tiles (simulated)
    const tileSize = 32;
    for (let x = 0; x < 800; x += tileSize) {
      for (let y = 0; y < 600; y += tileSize) {
        // Alternate tile colors for checkerboard
        const isEvenX = (x / tileSize) % 2 === 0;
        const isEvenY = (y / tileSize) % 2 === 0;
        const color = isEvenX === isEvenY ? 0x3d4a3d : 0x4a5c4a; // Military green
        graphicsBackground.fillStyle(color, 1);
        graphicsBackground.fillRect(x, y, tileSize, tileSize);
        graphicsBackground.lineStyle(1, 0x2a2a2a, 0.5);
        graphicsBackground.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // Add decorative elements
    graphicsBackground.lineStyle(2, 0x5a7a5a, 1);
    graphicsBackground.strokeRect(50, 50, 700, 500); // Battle arena border
  }

  /**
   * Create player character with krapoovy beret
   */
  private createPlayer() {
    this.player = this.physics.add.sprite(400, 300, 'playerSprite');
    this.player.setScale(2); // Scale up the sprite
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.play('operator_idle');

    // Add glow effect
    this.player.setPipeline('Light2D');

    console.log('✅ Player created with krapoovy beret graphics');
  }

  /**
   * Create weapon sprite
   */
  private createWeapon() {
    if (!this.player) return;

    // Create weapon sprite at player position
    this.weapon = this.add.sprite(this.player.x + 20, this.player.y, 'weaponSprite');
    this.weapon.setScale(2.5);
    this.weapon.setDepth(1); // Render on top

    console.log('✅ Weapon created');
  }

  /**
   * Spawn wave of enemies
   */
  private spawnWave() {
    if (!this.enemyGroup) return;

    const enemyCount = 3 + this.wave;
    for (let i = 0; i < enemyCount; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const enemy = this.enemyGroup.create(x, y, 'enemySprite') as Phaser.Physics.Arcade.Sprite;
      enemy.setScale(1.8);
      enemy.play('enemy_idle');
      enemy.setData('health', 30 + this.wave * 5);
      
      this.enemies.push(enemy);
    }

    console.log(`🌊 Wave ${this.wave} spawned with ${enemyCount} enemies`);
  }

  /**
   * Create UI elements
   */
  private createUI() {
    // Background for HUD panel
    this.add.rectangle(400, 25, 800, 50, 0x1a1a1a, 0.9).setDepth(100);

    // Vityaz Logo/Branding
    this.add.text(10, 8, '🥊 VITYAZ: SPECIAL OPERATIONS 🥊', {
      fontSize: '14px',
      color: '#8b4513',
      fontStyle: 'bold',
      fontFamily: 'Arial',
    }).setDepth(101);

    // Health bar background
    this.add.rectangle(100, 50, 200, 30, 0x1a1a1a, 0.8).setOrigin(0, 0).setDepth(100);

    // Health bar
    this.healthBar = this.make.graphics({
      x: 102,
      y: 52,
      add: true,
    }, false);
    this.healthBar.setDepth(100);
    this.updateHealthBar();

    // Health text
    this.add.text(310, 35, `HP: ${this.health}`, {
      fontSize: '14px',
      color: '#22c55e',
      fontStyle: 'bold',
    }).setDepth(101).setName('health_text');

    // Ammo counter with Krapovy color
    this.add.text(400, 35, `Ammo: ${this.ammo}/${this.maxAmmo}`, {
      fontSize: '14px',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setDepth(101).setName('ammo_text');

    // Wave counter
    this.add.text(600, 35, `Wave: ${this.wave}`, {
      fontSize: '14px',
      color: '#ff6b6b',
      fontStyle: 'bold',
    }).setDepth(101).setName('wave_text');

    // Score
    this.add.text(700, 35, `Score: ${this.score}`, {
      fontSize: '14px',
      color: '#8b4513',
      fontStyle: 'bold',
    }).setDepth(101).setName('score_text');

    // Crosshair
    const crosshairGraphics = this.make.graphics({ x: 0, y: 0, add: true }, false);
    crosshairGraphics.lineStyle(1, 0x8b4513, 1);
    crosshairGraphics.beginPath();
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    crosshairGraphics.moveTo(cx - 10, cy);
    crosshairGraphics.lineTo(cx + 10, cy);
    crosshairGraphics.moveTo(cx, cy - 10);
    crosshairGraphics.lineTo(cx, cy + 10);
    crosshairGraphics.strokePath();
    crosshairGraphics.setDepth(100);
    crosshairGraphics.setScrollFactor(0);

    console.log('✅ UI created with Vityaz branding');
  }

  /**
   * Update health bar display
   */
  private updateHealthBar() {
    if (!this.healthBar) return;

    this.healthBar.clear();

    // Health bar color based on health percentage
    let barColor = 0x22c55e; // Green
    if (this.health < 50) {
      barColor = 0xeab308; // Yellow
    }
    if (this.health < 25) {
      barColor = 0xef4444; // Red
    }

    const barWidth = 196 * (this.health / 100);
    this.healthBar.fillStyle(barColor, 1);
    this.healthBar.fillRect(0, 0, barWidth, 26);

    // Border
    this.healthBar.lineStyle(1, 0xffffff, 1);
    this.healthBar.strokeRect(0, 0, 196, 26);
  }

  /**
   * Setup game camera
   */
  private setupCamera() {
    if (!this.player) return;

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBounds(0, 0, 800, 600);
  }

  /**
   * Handle player movement
   */
  private handleMovement() {
    if (!this.player || !this.cursors) return;

    this.player.setVelocity(0, 0);

    let isMoving = false;

    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-160);
      isMoving = true;
    }
    if (this.cursors.right?.isDown) {
      this.player.setVelocityX(160);
      isMoving = true;
    }
    if (this.cursors.up?.isDown) {
      this.player.setVelocityY(-160);
      isMoving = true;
    }
    if (this.cursors.down?.isDown) {
      this.player.setVelocityY(160);
      isMoving = true;
    }

    if (isMoving) {
      this.player.play('operator_walk', true);
    } else {
      this.player.play('operator_idle', true);
    }
  }

  /**
   * Handle weapon firing
   */
  private handleFiring() {
    if (!this.input.activePointer.isDown || this.ammo <= 0) return;

    // Show muzzle flash
    this.showMuzzleFlash();

    // Use ammo
    this.ammo = Math.max(0, this.ammo - 1);
    const ammoText = this.children.getByName('ammo_text') as Phaser.GameObjects.Text;
    if (ammoText) {
      ammoText.setText(`Ammo: ${this.ammo}/${this.maxAmmo}`);
    }

    // Weapon recoil (visual feedback)
    if (this.weapon) {
      this.tweens.add({
        targets: this.weapon,
        x: this.weapon.x - 10,
        duration: 50,
        yoyo: true,
      });
    }

    // Check for hits on enemies
    this.checkEnemyHits();
  }

  /**
   * Check for enemy hits
   */
  private checkEnemyHits() {
    if (!this.player) return;

    // Simple distance-based hit detection
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      if (distance < 200) {
        const health = enemy.getData('health') - 10;
        if (health <= 0) {
          this.createBloodEffect(enemy.x, enemy.y);
          enemy.destroy();
          this.enemies.splice(i, 1);
          this.score += 100;

          // Check if wave cleared
          if (this.enemies.length === 0) {
            this.nextWave();
          }
        } else {
          enemy.setData('health', health);
          this.createBloodEffect(enemy.x, enemy.y);
        }
      }
    }
  }

  /**
   * Create blood effect
   */
  private createBloodEffect(x: number, y: number) {
    const blood = this.add.sprite(x, y, 'effect_blood');
    blood.setScale(1.5);

    this.tweens.add({
      targets: blood,
      alpha: 0,
      duration: 600,
      onComplete: () => blood.destroy(),
    });
  }

  /**
   * Show muzzle flash effect
   */
  private showMuzzleFlash() {
    if (!this.weapon) return;

    // Create muzzle flash at weapon tip
    if (!this.muzzleFlash) {
      this.muzzleFlash = this.add.sprite(
        this.weapon.x + 20,
        this.weapon.y,
        'effect_explosion'
      );
      this.muzzleFlash.setScale(0.8);
    }

    this.muzzleFlash.setPosition(this.weapon.x + 20, this.weapon.y);
    this.muzzleFlash.setAlpha(1);

    this.tweens.add({
      targets: this.muzzleFlash,
      alpha: 0,
      duration: 100,
    });
  }

  /**
   * Handle damage
   */
  private takeDamage(amount: number = 10) {
    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();

    const healthText = this.children.getByName('health_text') as Phaser.GameObjects.Text;
    if (healthText) {
      healthText.setText(`HP: ${this.health}`);
    }

    // Flash screen on damage
    this.cameras.main.flash(200, 255, 0, 0);

    if (this.health <= 0) {
      this.handleDeath();
    }
  }

  /**
   * Next wave
   */
  private nextWave() {
    this.wave++;
    const waveText = this.children.getByName('wave_text') as Phaser.GameObjects.Text;
    if (waveText) {
      waveText.setText(`Wave: ${this.wave}`);
    }

    this.ammo = this.maxAmmo;
    const ammoText = this.children.getByName('ammo_text') as Phaser.GameObjects.Text;
    if (ammoText) {
      ammoText.setText(`Ammo: ${this.ammo}/${this.maxAmmo}`);
    }

    this.spawnWave();
  }

  /**
   * Handle player death
   */
  private handleDeath() {
    if (!this.player) return;

    console.log('💀 Player defeated!');
    this.player.setTint(0x8b4513); // Krapovy color tint
    this.physics.pause();

    // Game Over
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(200).setScrollFactor(0);
  }

  /**
   * Update game state
   */
  update() {
    this.handleMovement();
    this.handleFiring();

    // Keep weapon in hand
    if (this.player && this.weapon) {
      this.weapon.setPosition(this.player.x + 30, this.player.y - 5);
    }

    // Update score
    const scoreText = this.children.getByName('score_text') as Phaser.GameObjects.Text;
    if (scoreText) {
      scoreText.setText(`Score: ${this.score}`);
    }

    // Enemy AI (simple)
    for (const enemy of this.enemies) {
      if (!this.player) continue;

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      if (distance < 300) {
        // Chase player
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );
        const speed = 80;
        enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      } else {
        enemy.setVelocity(0, 0);
      }

      // Deal damage if touching player
      if (distance < 30) {
        this.takeDamage(1);
      }
    }
  }
}

/**
 * Preload Scene with Generated Graphics
 */
export class GeneratedGraphicsPreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GeneratedGraphicsPreloadScene' });
  }

  preload() {
    console.log('📦 Loading Vityaz game with Krapoovy Beret graphics...');

    // Create progress bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    // Update progress
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x8b4513, 1); // Krapovy maroon-brown
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      console.log('✅ All Vityaz graphics loaded successfully!');
      progressBox.destroy();
      progressBar.destroy();
    });
  }

  create() {
    this.scene.start('GeneratedGraphicsGameScene');
  }
}
