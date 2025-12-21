/**
 * Graphics Integration Module
 * Loads and manages all game graphics (sprites, effects, UI)
 */

import Phaser from 'phaser';

export class GraphicsIntegration {
  /**
   * Load all graphics assets into the game
   */
  static loadGraphics(scene: Phaser.Scene): void {
    // Load player sprite
    scene.load.image('player', 'assets/graphics/sprites/player.svg');
    
    // Load enemy sprites
    scene.load.image('enemy', 'assets/graphics/sprites/enemy.svg');
    scene.load.image('enemy-heavy', 'assets/graphics/sprites/enemy.svg'); // Placeholder
    
    // Load weapon sprites
    scene.load.image('weapon-ak74m', 'assets/graphics/sprites/weapons.svg');
    scene.load.image('weapon-svd', 'assets/graphics/sprites/weapons.svg');
    scene.load.image('weapon-rpk74', 'assets/graphics/sprites/weapons.svg');
    scene.load.image('weapon-pmm', 'assets/graphics/sprites/weapons.svg');
    
    // Load effect sprites
    scene.load.image('effect-explosion', 'assets/graphics/sprites/effects.svg');
    scene.load.image('effect-blood', 'assets/graphics/sprites/effects.svg');
    scene.load.image('effect-muzzleflash', 'assets/graphics/sprites/effects.svg');
    
    // Load UI elements
    scene.load.image('hud-background', 'assets/graphics/ui/hud.svg');
  }

  /**
   * Create player graphics
   */
  static createPlayer(scene: Phaser.Scene, x: number, y: number): Phaser.Physics.Arcade.Sprite {
    const player = scene.physics.add.sprite(x, y, 'player');
    player.setScale(1.5);
    player.setCollideWorldBounds(true);
    player.setBounce(0.1);
    player.setDrag(0.99);
    return player;
  }

  /**
   * Create enemy graphics
   */
  static createEnemy(scene: Phaser.Scene, x: number, y: number): Phaser.Physics.Arcade.Sprite {
    const enemy = scene.physics.add.sprite(x, y, 'enemy');
    enemy.setScale(1.2);
    return enemy;
  }

  /**
   * Create explosion effect
   */
  static createExplosion(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Sprite {
    const explosion = scene.add.sprite(x, y, 'effect-explosion');
    explosion.setScale(2);
    
    // Fade out animation
    scene.tweens.add({
      targets: explosion,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        explosion.destroy();
      }
    });
    
    return explosion;
  }

  /**
   * Create blood splatter effect
   */
  static createBloodSplatter(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Sprite {
    const blood = scene.add.sprite(x, y, 'effect-blood');
    blood.setScale(1.5);
    
    scene.tweens.add({
      targets: blood,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        blood.destroy();
      }
    });
    
    return blood;
  }

  /**
   * Create muzzle flash effect
   */
  static createMuzzleFlash(scene: Phaser.Scene, x: number, y: number, rotation: number): Phaser.GameObjects.Sprite {
    const flash = scene.add.sprite(x, y, 'effect-muzzleflash');
    flash.setRotation(rotation);
    flash.setScale(1.2);
    
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 50,
      onComplete: () => {
        flash.destroy();
      }
    });
    
    return flash;
  }

  /**
   * Create HUD display
   */
  static createHUD(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const hud = scene.add.container(0, 0);
    
    // HUD background
    const hudBg = scene.add.graphics();
    hudBg.fillStyle(0x000000, 0.7);
    hudBg.fillRect(0, 0, scene.sys.game.canvas.width, 100);
    hud.add(hudBg);
    
    // Health bar
    const healthText = scene.add.text(10, 10, 'HP', {
      font: '16px Arial',
      fill: '#00FF00'
    });
    hud.add(healthText);
    
    // Score display
    const scoreText = scene.add.text(scene.sys.game.canvas.width - 100, 10, 'Score: 0', {
      font: '16px Arial',
      fill: '#00FF00'
    });
    hud.add(scoreText);
    
    // Ammo counter
    const ammoText = scene.add.text(200, 10, 'Ammo: 30/150', {
      font: '16px Arial',
      fill: '#FFD700'
    });
    hud.add(ammoText);
    
    // Wave counter
    const waveText = scene.add.text(10, 50, 'Wave: 1', {
      font: '16px Arial',
      fill: '#00FF00'
    });
    hud.add(waveText);
    
    return hud;
  }

  /**
   * Update HUD display values
   */
  static updateHUD(
    scene: Phaser.Scene,
    health: number,
    maxHealth: number,
    ammo: number,
    maxAmmo: number,
    score: number,
    wave: number,
    weapon: string
  ): void {
    // Update logic would go here
    // This is a placeholder for HUD update functionality
    console.log(`Health: ${health}/${maxHealth}, Ammo: ${ammo}/${maxAmmo}, Score: ${score}, Wave: ${wave}`);
  }
}

export default GraphicsIntegration;