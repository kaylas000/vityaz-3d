import Phaser from 'phaser';

export class AssetLoader {
  static preload(scene: Phaser.Scene) {
    // Player sprites
    scene.load.image('player', '/assets/sprites/player.png');
    scene.load.image('player-idle', '/assets/sprites/player-idle.png');
    scene.load.spritesheet('player-run', '/assets/sprites/player-run.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    scene.load.spritesheet('player-shoot', '/assets/sprites/player-shoot.png', {
      frameWidth: 32,
      frameHeight: 64,
    });

    // Enemy sprites
    scene.load.image('enemy', '/assets/sprites/enemy.png');
    scene.load.spritesheet('enemy-run', '/assets/sprites/enemy-run.png', {
      frameWidth: 32,
      frameHeight: 64,
    });

    // Weapons
    scene.load.image('bullet', '/assets/weapons/bullet.png');
    scene.load.image('muzzle-flash', '/assets/weapons/muzzle-flash.png');
    scene.load.image('ak47', '/assets/weapons/ak47.png');
    scene.load.image('svd', '/assets/weapons/svd.png');

    // Maps
    scene.load.image('map-default', '/assets/maps/default.png');
    scene.load.image('map-forest', '/assets/maps/forest.png');
    scene.load.image('map-urban', '/assets/maps/urban.png');

    // UI elements
    scene.load.image('health-bar', '/assets/ui/health-bar.png');
    scene.load.image('ammo-icon', '/assets/ui/ammo-icon.png');
    scene.load.image('crosshair', '/assets/ui/crosshair.png');
    scene.load.image('button', '/assets/ui/button.png');
    scene.load.image('panel', '/assets/ui/panel.png');

    // Audio
    scene.load.audio('shoot', '/assets/audio/shoot.mp3');
    scene.load.audio('reload', '/assets/audio/reload.mp3');
    scene.load.audio('hit', '/assets/audio/hit.mp3');
    scene.load.audio('death', '/assets/audio/death.mp3');
    scene.load.audio('background-music', '/assets/audio/background.mp3');
  }

  static createAnimations(scene: Phaser.Scene) {
    // Player animations
    if (!scene.anims.exists('player-run')) {
      scene.anims.create({
        key: 'player-run',
        frames: scene.anims.generateFrameNumbers('player-run', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!scene.anims.exists('player-shoot')) {
      scene.anims.create({
        key: 'player-shoot',
        frames: scene.anims.generateFrameNumbers('player-shoot', { start: 0, end: 2 }),
        frameRate: 15,
        repeat: 0,
      });
    }

    // Enemy animations
    if (!scene.anims.exists('enemy-run')) {
      scene.anims.create({
        key: 'enemy-run',
        frames: scene.anims.generateFrameNumbers('enemy-run', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  static createPlaceholderAssets(scene: Phaser.Scene) {
    // Create simple colored rectangles as placeholders
    const graphics = scene.add.graphics();

    // Player (green)
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 64);
    graphics.generateTexture('player', 32, 64);

    // Enemy (red)
    graphics.clear();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 64);
    graphics.generateTexture('enemy', 32, 64);

    // Bullet (yellow)
    graphics.clear();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture('bullet', 4, 4);

    // Crosshair (white)
    graphics.clear();
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeCircle(16, 16, 12);
    graphics.beginPath();
    graphics.moveTo(16, 4);
    graphics.lineTo(16, 12);
    graphics.moveTo(16, 20);
    graphics.lineTo(16, 28);
    graphics.moveTo(4, 16);
    graphics.lineTo(12, 16);
    graphics.moveTo(20, 16);
    graphics.lineTo(28, 16);
    graphics.strokePath();
    graphics.generateTexture('crosshair', 32, 32);

    graphics.destroy();
  }
}
