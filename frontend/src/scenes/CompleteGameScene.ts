import Phaser from 'phaser';

// Level configuration interface
interface LevelConfig {
  id: string;
  name: string;
  difficulty: string;
  difficultyLevel: number;
  initialEnemies: number;
  enemyWaveMultiplier: number;
  enemyDamageMultiplier: number;
  rewardMultiplier: number;
}

interface PlayerData {
  x: number;
  y: number;
  angle: number;
  health: number;
  maxHealth: number;
  currentWeapon: number;
  ammo: { [key: number]: number };
  score: number;
  kills: number;
  wave: number;
}

interface EnemyData {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
}

interface WeaponSpec {
  id: number;
  name: string;
  damage: number;
  fireRate: number;
  ammoPerMag: number;
  accuracy: number;
  range: number;
  reloadTime: number;
}

export default class CompleteGameScene extends Phaser.Scene {
  // Level configuration
  private levelConfig: LevelConfig | null = null;

  // Player
  private player: Phaser.Physics.Arcade.Sprite | null = null;
  private playerData: PlayerData = {
    x: 400,
    y: 300,
    angle: 0,
    health: 100,
    maxHealth: 100,
    currentWeapon: 0,
    ammo: { 0: 300, 1: 150, 2: 300, 3: 150 },
    score: 0,
    kills: 0,
    wave: 1,
  };

  // Weapons
  private weapons: Map<number, WeaponSpec> = new Map([
    [
      0,
      {
        id: 0,
        name: 'AK-74M',
        damage: 15,
        fireRate: 0.1,
        ammoPerMag: 30,
        accuracy: 0.85,
        range: 500,
        reloadTime: 2.5,
      },
    ],
    [
      1,
      {
        id: 1,
        name: 'SVD',
        damage: 45,
        fireRate: 0.5,
        ammoPerMag: 10,
        accuracy: 0.95,
        range: 800,
        reloadTime: 2.0,
      },
    ],
    [
      2,
      {
        id: 2,
        name: 'RPK-74',
        damage: 18,
        fireRate: 0.08,
        ammoPerMag: 45,
        accuracy: 0.8,
        range: 600,
        reloadTime: 3.0,
      },
    ],
    [
      3,
      {
        id: 3,
        name: 'PMM',
        damage: 20,
        fireRate: 0.2,
        ammoPerMag: 12,
        accuracy: 0.75,
        range: 300,
        reloadTime: 1.5,
      },
    ],
  ]);

  // Enemies
  private enemies: Phaser.Physics.Arcade.Group | null = null;
  private enemyCount: number = 0;
  private enemiesSpawned: number = 0;
  private enemiesPerWave: number = 5;
  private waveInProgress: boolean = false;
  private waveDelay: number = 0;

  // Projectiles
  private bullets: Phaser.Physics.Arcade.Group | null = null;
  private lastFireTime: number = 0;

  // Effects
  private explosions: Phaser.Physics.Arcade.Group | null = null;
  private bloodSplats: Phaser.Physics.Arcade.Group | null = null;

  // UI
  private healthText: Phaser.GameObjects.Text | null = null;
  private ammoText: Phaser.GameObjects.Text | null = null;
  private scoreText: Phaser.GameObjects.Text | null = null;
  private waveText: Phaser.GameObjects.Text | null = null;
  private weaponText: Phaser.GameObjects.Text | null = null;
  private difficultyText: Phaser.GameObjects.Text | null = null;
  private fpsText: Phaser.GameObjects.Text | null = null;

  // Game state
  private gameOver: boolean = false;
  private paused: boolean = false;
  private reloading: boolean = false;
  private reloadTimer: number = 0;

  // Input
  private keys: any = {};
  private mousePos: { x: number; y: number } = { x: 0, y: 0 };

  // Sounds
  private sounds: { [key: string]: Phaser.Sound.BaseSound | null } = {};

  constructor() {
    super('CompleteGame');
  }

  preload() {
    // ===== ЗАГРУЗКА СПРАЙТОВ =====
    // Персонажи
    this.load.image('player', './assets/sprites/player.png');
    this.load.image('enemy_basic', './assets/sprites/enemy_basic.png');
    this.load.image('enemy_tank', './assets/sprites/enemy_tank.png');

    // Оружие
    this.load.image('weapon_ak74', './assets/sprites/weapon_ak74.png');
    this.load.image('weapon_pmm', './assets/sprites/weapon_pmm.png');
    this.load.image('weapon_rpk', './assets/sprites/weapon_rpk.png');
    this.load.image('weapon_svd', './assets/sprites/weapon_svd.png');

    // Load audio
    try {
      this.load.audio('gunshot', './assets/sounds/gunshot.mp3');
      this.load.audio('reload', './assets/sounds/reload.mp3');
      this.load.audio('enemyDeath', './assets/sounds/enemy-death.mp3');
      this.load.audio('playerHit', './assets/sounds/player-hit.mp3');
      this.load.audio('bgm', './assets/sounds/bgm-intense.mp3');
    } catch (e) {
      console.log('Audio files not found (optional)');
    }
  }

  create(data: any) {
    // Load level configuration from data
    if (data && data.level) {
      this.levelConfig = data.level;
      console.log(`Starting level: ${this.levelConfig.name} (${this.levelConfig.difficulty})`);
      this.enemiesPerWave = this.levelConfig.initialEnemies;
    }

    // Create game world
    this.setupPhysics();
    this.createPlayer();
    this.createEnemyGroup();
    this.createBulletGroup();
    this.createEffectsGroups();
    this.createUI();
    this.setupInput();
    this.setupAudio();
    this.startWave();

    // Start background music
    if (this.sounds['bgm']) {
      this.sounds['bgm'].play({ loop: true, volume: 0.5 });
    }
  }

  private setupPhysics() {
    this.physics.world.setBounds(0, 0, 800, 600);
  }

  private createPlayer() {
    // ===== ИСПОЛЬЗУЕМ РЕАЛЬНЫЙ СПРАЙТ =====
    this.player = this.physics.add.sprite(
      this.playerData.x,
      this.playerData.y,
      'player'
    );
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(300, 300);
    
    // Масштабируем спрайт (1024x1024 -> ~50x50)
    this.player.setScale(0.05);
    this.player.setDisplaySize(50, 50);
  }

  private createEnemyGroup() {
    this.enemies = this.physics.add.group();
  }

  private createBulletGroup() {
    this.bullets = this.physics.add.group();
  }

  private createEffectsGroups() {
    this.explosions = this.add.group();
    this.bloodSplats = this.add.group();
  }

  private createUI() {
    this.healthText = this.add.text(10, 10, 'HP: 100/100', {
      font: '16px Arial',
      color: '#ffffff',
    });
    this.healthText.setScrollFactor(0);

    this.ammoText = this.add.text(10, 35, 'AMMO: 30', {
      font: '16px Arial',
      color: '#ffffff',
    });
    this.ammoText.setScrollFactor(0);

    this.scoreText = this.add.text(10, 60, 'SCORE: 0', {
      font: '16px Arial',
      color: '#ffff00',
    });
    this.scoreText.setScrollFactor(0);

    this.waveText = this.add.text(10, 85, 'WAVE: 1', {
      font: '16px Arial',
      color: '#ff0000',
    });
    this.waveText.setScrollFactor(0);

    this.weaponText = this.add.text(10, 110, 'WEAPON: AK-74M', {
      font: '16px Arial',
      color: '#00ff00',
    });
    this.weaponText.setScrollFactor(0);

    const difficultyColor = this.getDifficultyColor();
    this.difficultyText = this.add.text(
      10,
      135,
      `DIFFICULTY: ${this.levelConfig?.difficulty || 'NORMAL'}`,
      {
        font: '16px Arial',
        color: difficultyColor,
        fontStyle: 'bold',
      }
    );
    this.difficultyText.setScrollFactor(0);

    this.fpsText = this.add.text(700, 10, 'FPS: 60', {
      font: '12px Arial',
      color: '#ffffff',
    });
    this.fpsText.setScrollFactor(0);
  }

  private setupInput() {
    this.keys = {
      W: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      R: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      E: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      P: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.P),
      ONE: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      TWO: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      THREE: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      FOUR: this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
    };

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.mousePos = { x: pointer.x, y: pointer.y };
    });

    this.input.on('pointerdown', () => {
      if (!this.gameOver && !this.paused) {
        this.fireWeapon();
      }
    });
  }

  private setupAudio() {
    if (this.sound.locked) {
      this.sound.unlock();
    }
  }

  private startWave() {
    this.waveInProgress = true;
    this.enemiesSpawned = 0;
    this.enemyCount = 0;
  }

  update(time: number, delta: number) {
    if (this.gameOver || this.paused) return;

    this.updatePlayer();
    this.updatePlayerRotation();
    this.updateEnemies(time);
    this.updateCollisions();
    this.updateUI();
    this.updateWaveManagement();

    if (this.reloading) {
      this.reloadTimer -= delta;
      if (this.reloadTimer <= 0) {
        this.finishReload();
      }
    }
  }

  private updatePlayer() {
    if (this.player) {
      this.player.setAcceleration(0, 0);
    }

    const speed = 300;
    if (this.keys.W?.isDown) {
      if (this.player) this.player.setAccelerationY(-speed);
    }
    if (this.keys.S?.isDown) {
      if (this.player) this.player.setAccelerationY(speed);
    }
    if (this.keys.A?.isDown) {
      if (this.player) this.player.setAccelerationX(-speed);
    }
    if (this.keys.D?.isDown) {
      if (this.player) this.player.setAccelerationX(speed);
    }

    if (this.keys.R?.isDown && !this.reloading) {
      this.startReload();
    }

    if (this.keys.ONE?.isDown) this.switchWeapon(0);
    if (this.keys.TWO?.isDown) this.switchWeapon(1);
    if (this.keys.THREE?.isDown) this.switchWeapon(2);
    if (this.keys.FOUR?.isDown) this.switchWeapon(3);

    if (this.keys.P?.isDown) {
      this.paused = true;
      this.showPauseMenu();
    }
  }

  private updatePlayerRotation() {
    if (!this.player) return;
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      this.mousePos.x,
      this.mousePos.y
    );
    this.playerData.angle = angle;
    this.player.rotation = angle;
  }

  private updateEnemies(time: number) {
    if (!this.enemies) return;

    this.enemies.children.forEach((enemy: any) => {
      if (!this.player) return;

      const distance = Phaser.Math.Distance.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );

      if (distance > 0) {
        const vx =
          ((this.player.x - enemy.x) / distance) * (enemy.speed || 100);
        const vy =
          ((this.player.y - enemy.y) / distance) * (enemy.speed || 100);
        enemy.setVelocity(vx, vy);
      }

      const angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );
      enemy.rotation = angle;
    });
  }

  private updateCollisions() {
    if (!this.player || !this.enemies || !this.bullets) return;

    this.physics.overlap(
      this.bullets,
      this.enemies,
      (bullet: any, enemy: any) => {
        this.hitEnemy(enemy, 20);
        bullet.destroy();
      }
    );

    this.physics.overlap(
      this.player,
      this.enemies,
      (player: any, enemy: any) => {
        this.damagePlayer(enemy.damage || 10);
      }
    );
  }

  private fireWeapon() {
    if (!this.player || !this.bullets || this.reloading) return;

    const now = Date.now();
    const weapon = this.weapons.get(this.playerData.currentWeapon);
    if (!weapon) return;

    if (now - this.lastFireTime < weapon.fireRate * 1000) return;

    const ammo = this.playerData.ammo[this.playerData.currentWeapon];
    if (ammo <= 0) {
      this.startReload();
      return;
    }

    this.lastFireTime = now;
    this.playerData.ammo[this.playerData.currentWeapon]--;

    const speed = 600;
    const vx = Math.cos(this.playerData.angle) * speed;
    const vy = Math.sin(this.playerData.angle) * speed;

    const bullet = this.bullets.create(this.player.x, this.player.y);
    bullet.setVelocity(vx, vy);
    bullet.setData('damage', weapon.damage);

    if (this.sounds['gunshot']) {
      this.sounds['gunshot'].play();
    }

    this.createMuzzleFlash();
  }

  private createMuzzleFlash() {
    if (!this.player) return;

    const flash = this.add.circle(
      this.player.x + Math.cos(this.playerData.angle) * 20,
      this.player.y + Math.sin(this.playerData.angle) * 20,
      8,
      0xffaa00
    );

    this.time.delayedCall(50, () => flash.destroy());
  }

  private hitEnemy(enemy: any, damage: number) {
    enemy.health -= damage;

    if (enemy.health <= 0) {
      const baseReward = 100;
      const reward = baseReward * (this.levelConfig?.rewardMultiplier || 1);
      this.playerData.score += Math.round(reward);
      this.playerData.kills++;
      this.enemyCount--;

      if (this.sounds['enemyDeath']) {
        this.sounds['enemyDeath'].play();
      }

      enemy.destroy();
    } else {
      if (this.sounds['playerHit']) {
        this.sounds['playerHit'].play();
      }
    }
  }

  private damagePlayer(damage: number) {
    this.playerData.health -= damage;
    if (this.playerData.health <= 0) {
      this.endGame();
    }
  }

  private startReload() {
    this.reloading = true;
    const weapon = this.weapons.get(this.playerData.currentWeapon);
    this.reloadTimer = (weapon?.reloadTime || 2) * 1000;

    if (this.sounds['reload']) {
      this.sounds['reload'].play();
    }
  }

  private finishReload() {
    this.reloading = false;
    const weapon = this.weapons.get(this.playerData.currentWeapon);
    if (weapon) {
      this.playerData.ammo[this.playerData.currentWeapon] = weapon.ammoPerMag;
    }
  }

  private switchWeapon(id: number) {
    this.playerData.currentWeapon = id;
    const weapon = this.weapons.get(id);
    if (weapon) {
      console.log(`Switched to ${weapon.name}`);
    }
  }

  private updateWaveManagement() {
    if (!this.waveInProgress) return;
    if (!this.enemies) return;

    if (
      this.enemiesSpawned < this.enemiesPerWave &&
      this.enemyCount < this.enemiesPerWave
    ) {
      this.spawnEnemy();
      this.enemiesSpawned++;
      this.enemyCount++;
    }

    if (this.enemiesSpawned >= this.enemiesPerWave && this.enemyCount === 0) {
      this.completeWave();
    }
  }

  private spawnEnemy() {
    if (!this.enemies || !this.player) return;

    const angle = Math.random() * Math.PI * 2;
    const distance = 300;
    const x = this.player.x + Math.cos(angle) * distance;
    const y = this.player.y + Math.sin(angle) * distance;

    const enemyType = Math.random() > 0.7 ? 'enemy_tank' : 'enemy_basic';

    const baseEnemyHealth = 30 + this.playerData.wave * 5;
    const baseEnemySpeed = 80 + this.playerData.wave * 10;
    const baseEnemyDamage = 5 + this.playerData.wave * 2;

    const enemyHealth = this.levelConfig
      ? baseEnemyHealth * this.levelConfig.enemyDamageMultiplier
      : baseEnemyHealth;
    const enemyDamage = this.levelConfig
      ? baseEnemyDamage * this.levelConfig.enemyDamageMultiplier
      : baseEnemyDamage;

    const enemy = this.enemies.create(x, y, enemyType) as any;
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
    enemy.health = enemyHealth;
    enemy.maxHealth = enemyHealth;
    enemy.speed = baseEnemySpeed;
    enemy.damage = enemyDamage;

    enemy.setScale(0.04);
    enemy.setDisplaySize(40, 40);
  }

  private completeWave() {
    this.playerData.wave++;

    let newEnemiesPerWave = this.levelConfig?.initialEnemies || 5;
    if (this.levelConfig) {
      newEnemiesPerWave = Math.round(
        this.levelConfig.initialEnemies *
        Math.pow(this.levelConfig.enemyWaveMultiplier, this.playerData.wave - 1)
      );
    } else {
      newEnemiesPerWave = Math.min(5 + this.playerData.wave, 20);
    }

    this.enemiesPerWave = newEnemiesPerWave;
    this.waveInProgress = false;

    this.time.delayedCall(3000, () => {
      this.startWave();
    });
  }

  private updateUI() {
    if (this.healthText) {
      this.healthText.setText(
        `HP: ${this.playerData.health}/${this.playerData.maxHealth}`
      );
    }

    if (this.ammoText) {
      const ammo = this.playerData.ammo[this.playerData.currentWeapon];
      this.ammoText.setText(`AMMO: ${ammo}`);
    }

    if (this.scoreText) {
      this.scoreText.setText(`SCORE: ${this.playerData.score}`);
    }

    if (this.waveText) {
      this.waveText.setText(`WAVE: ${this.playerData.wave}`);
    }

    if (this.weaponText) {
      const weapon = this.weapons.get(this.playerData.currentWeapon);
      this.weaponText.setText(
        `WEAPON: ${weapon?.name || 'UNKNOWN'} ${this.reloading ? '[RELOADING]' : ''}`
      );
    }

    if (this.fpsText) {
      const fps = Math.round(this.game.loop.actualFps);
      this.fpsText.setText(`FPS: ${fps}`);
    }
  }

  private getDifficultyColor(): string {
    switch (this.levelConfig?.difficulty) {
      case 'Easy':
        return '#4a9e4a';
      case 'Normal':
        return '#4a7a9e';
      case 'Hard':
        return '#9e6b4a';
      case 'Insane':
        return '#9e4a4a';
      default:
        return '#ffffff';
    }
  }

  private showPauseMenu() {
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    overlay.setScrollFactor(0);

    const text = this.add.text(400, 300, 'PAUSED\n\nPress P to Resume', {
      font: '32px Arial',
      color: '#ffffff',
      align: 'center',
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0);

    const resumeHandler = () => {
      this.paused = false;
      overlay.destroy();
      text.destroy();
      this.input.keyboard?.off('keydown-P', resumeHandler);
    };

    this.input.keyboard?.on('keydown-P', resumeHandler);
  }

  private endGame() {
    this.gameOver = true;
    this.physics.pause();

    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    overlay.setScrollFactor(0);
    overlay.setDepth(100);

    const levelName = this.levelConfig?.name || 'UNKNOWN';
    const text = this.add.text(
      400,
      200,
      `GAME OVER\n\nLevel: ${levelName}\nFinal Score: ${this.playerData.score}\nWave: ${this.playerData.wave}\nKills: ${this.playerData.kills}`,
      {
        font: '28px Arial',
        color: '#ff0000',
        align: 'center',
        backgroundColor: '#000000',
        padding: { x: 20, y: 20 }
      }
    );
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(101);

    const buttonWidth = 200;
    const buttonHeight = 50;
    const button = this.add.rectangle(400, 380, buttonWidth, buttonHeight, 0x6b5d4f);
    button.setStrokeStyle(2, 0xe8d4b0);
    button.setScrollFactor(0);
    button.setDepth(101);
    button.setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(400, 380, 'RETURN TO MENU', {
      font: '18px Arial',
      color: '#ffffff',
    });
    buttonText.setOrigin(0.5);
    buttonText.setScrollFactor(0);
    buttonText.setDepth(102);

    button.on('pointerover', () => {
      button.setFillStyle(0x8b7d6b);
      buttonText.setColor('#ffd700');
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x6b5d4f);
      buttonText.setColor('#ffffff');
    });

    button.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('MainMenuScene');
      });
    });
  }
}

