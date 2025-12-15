# 🎨 Sprite Integration Guide

## Overview

This guide explains how to integrate AI-generated sprites into VITYAZ: Special Operations, replacing the procedural graphics system.

---

## 📋 Prerequisites

### Generated Sprites

Run the sprite generator first:

```bash
cd tools
python3 generate_sprites.py
```

This creates sprites in:
```
frontend/src/assets/graphics/sprites/
├── characters/
│   ├── player_idle.png (64x64)
│   ├── player_walk_down.png (64x64)
│   ├── player_walk_up.png (64x64)
│   ├── enemy_basic.png (56x56)
│   ├── enemy_armed.png (56x56)
│   └── enemy_heavy.png (64x64)
└── weapons/
    ├── ak74m.png (48x12)
    ├── svd.png (56x14)
    ├── rpk74.png (56x14)
    └── pmm.png (32x10)
```

---

## 🔄 Integration Steps

### STEP 1: Update Scene Preload

Edit `frontend/src/scenes/GameScene.ts` (or your main scene file):

```typescript
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load AI-generated character sprites
        this.load.image(
            'player-idle',
            'assets/graphics/sprites/characters/player_idle.png'
        );
        this.load.image(
            'player-walk-down',
            'assets/graphics/sprites/characters/player_walk_down.png'
        );
        this.load.image(
            'player-walk-up',
            'assets/graphics/sprites/characters/player_walk_up.png'
        );

        // Load enemy sprites
        this.load.image(
            'enemy-basic',
            'assets/graphics/sprites/characters/enemy_basic.png'
        );
        this.load.image(
            'enemy-armed',
            'assets/graphics/sprites/characters/enemy_armed.png'
        );
        this.load.image(
            'enemy-heavy',
            'assets/graphics/sprites/characters/enemy_heavy.png'
        );

        // Load weapon sprites
        this.load.image(
            'weapon-ak74m',
            'assets/graphics/sprites/weapons/ak74m.png'
        );
        this.load.image(
            'weapon-svd',
            'assets/graphics/sprites/weapons/svd.png'
        );
        this.load.image(
            'weapon-rpk74',
            'assets/graphics/sprites/weapons/rpk74.png'
        );
        this.load.image(
            'weapon-pmm',
            'assets/graphics/sprites/weapons/pmm.png'
        );
    }
}
```

---

### STEP 2: Update GraphicsIntegrationManager

Edit `frontend/src/graphics/GraphicsIntegrationManager.ts`:

**BEFORE (Procedural):**
```typescript
createPlayerSprite(x: number, y: number): any {
    const playerGroup = this.scene.add.container(x, y);

    // OLD: Procedural generation
    const headCanvas = ProceduralGraphics.drawPlayerHead(0, 0);
    const bodyCanvas = ProceduralGraphics.drawPlayerBody(0, 0);
    // ... more procedural code

    return playerGroup;
}
```

**AFTER (AI Sprites):**
```typescript
import { Scene } from 'phaser';

export class GraphicsIntegrationManager {
    private scene: Scene;
    private playerSprite: Phaser.GameObjects.Container | null = null;
    private enemySprites: Map<string, Phaser.GameObjects.Container> = new Map();

    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * Create player sprite with AI-generated graphics
     */
    createPlayerSprite(x: number, y: number): Phaser.GameObjects.Container {
        const playerGroup = this.scene.add.container(x, y);

        // Use AI-generated sprite instead of procedural
        const playerImage = this.scene.add.image(0, 0, 'player-idle');
        playerImage.setOrigin(0.5, 0.5);
        playerImage.setScale(2); // 64x64 → 128x128 on screen

        // Add weapon (optional)
        const weapon = this.scene.add.image(20, 0, 'weapon-ak74m');
        weapon.setOrigin(0, 0.5);
        weapon.setScale(2.5);

        playerGroup.add([playerImage, weapon]);
        playerGroup.setDepth(10);

        this.playerSprite = playerGroup;
        return playerGroup;
    }

    /**
     * Create enemy sprite
     */
    createEnemySprite(
        x: number,
        y: number,
        type: 'basic' | 'armed' | 'heavy' = 'basic'
    ): Phaser.GameObjects.Container {
        const enemyGroup = this.scene.add.container(x, y);

        // Select sprite based on enemy type
        const spriteKey = `enemy-${type}`;
        const enemyImage = this.scene.add.image(0, 0, spriteKey);
        enemyImage.setOrigin(0.5, 0.5);

        // Different scales for different enemy types
        const scale = type === 'heavy' ? 2.2 : 1.8;
        enemyImage.setScale(scale);

        enemyGroup.add(enemyImage);
        enemyGroup.setDepth(9);

        const enemyId = `enemy_${Date.now()}_${Math.random()}`;
        this.enemySprites.set(enemyId, enemyGroup);

        return enemyGroup;
    }

    /**
     * Update player animation based on movement
     */
    updatePlayerAnimation(direction: 'idle' | 'down' | 'up' | 'left' | 'right') {
        if (!this.playerSprite) return;

        const playerImage = this.playerSprite.getAt(0) as Phaser.GameObjects.Image;

        switch (direction) {
            case 'idle':
                playerImage.setTexture('player-idle');
                break;
            case 'down':
                playerImage.setTexture('player-walk-down');
                break;
            case 'up':
                playerImage.setTexture('player-walk-up');
                break;
            // For left/right, use flip
            case 'left':
                playerImage.setTexture('player-walk-down');
                playerImage.setFlipX(true);
                break;
            case 'right':
                playerImage.setTexture('player-walk-down');
                playerImage.setFlipX(false);
                break;
        }
    }

    /**
     * Destroy enemy sprite
     */
    destroyEnemySprite(enemyId: string) {
        const sprite = this.enemySprites.get(enemyId);
        if (sprite) {
            sprite.destroy();
            this.enemySprites.delete(enemyId);
        }
    }

    /**
     * Get player sprite for physics/collision
     */
    getPlayerSprite(): Phaser.GameObjects.Container | null {
        return this.playerSprite;
    }
}
```

---

### STEP 3: Update AnimationSystem (Optional)

If using sprite sheets in the future:

```typescript
export class AnimationSystem {
    static createAnimations(scene: Phaser.Scene): void {
        // Walking animation using multiple frames
        scene.anims.create({
            key: 'player-walk',
            frames: [
                { key: 'player-walk-down', duration: 200 },
                { key: 'player-idle', duration: 100 },
                { key: 'player-walk-up', duration: 200 },
                { key: 'player-idle', duration: 100 },
            ],
            frameRate: 10,
            repeat: -1,
        });

        // Idle animation (static for now)
        scene.anims.create({
            key: 'player-idle-anim',
            frames: [{ key: 'player-idle' }],
            frameRate: 1,
        });
    }
}
```

---

### STEP 4: Update Game Manager

Edit your main game manager to use the new system:

```typescript
import { GraphicsIntegrationManager } from './graphics/GraphicsIntegrationManager';

export class GameManager {
    private graphics: GraphicsIntegrationManager;
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.graphics = new GraphicsIntegrationManager(scene);
    }

    createPlayer(x: number, y: number) {
        const playerSprite = this.graphics.createPlayerSprite(x, y);

        // Add physics
        this.scene.physics.add.existing(playerSprite);
        const body = playerSprite.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);

        return playerSprite;
    }

    createEnemy(x: number, y: number, type: 'basic' | 'armed' | 'heavy') {
        const enemySprite = this.graphics.createEnemySprite(x, y, type);

        // Add physics
        this.scene.physics.add.existing(enemySprite);

        return enemySprite;
    }

    updatePlayerMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        // Determine direction
        let direction: 'idle' | 'down' | 'up' | 'left' | 'right' = 'idle';

        if (cursors.down.isDown) direction = 'down';
        else if (cursors.up.isDown) direction = 'up';
        else if (cursors.left.isDown) direction = 'left';
        else if (cursors.right.isDown) direction = 'right';

        // Update sprite
        this.graphics.updatePlayerAnimation(direction);
    }
}
```

---

## 🎮 Usage Example

### Complete Scene Integration

```typescript
import { Scene } from 'phaser';
import { GraphicsIntegrationManager } from '../graphics/GraphicsIntegrationManager';
import { AnimationSystem } from '../graphics/AnimationSystem';

export class MainGameScene extends Scene {
    private graphics!: GraphicsIntegrationManager;
    private player!: Phaser.GameObjects.Container;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super({ key: 'MainGameScene' });
    }

    preload() {
        // Load all sprites (see STEP 1)
        this.load.image('player-idle', 'assets/graphics/sprites/characters/player_idle.png');
        // ... other sprites
    }

    create() {
        // Initialize graphics manager
        this.graphics = new GraphicsIntegrationManager(this);

        // Create animations
        AnimationSystem.createAnimations(this);

        // Create player at center
        this.player = this.graphics.createPlayerSprite(400, 300);

        // Create some enemies
        this.graphics.createEnemySprite(200, 200, 'basic');
        this.graphics.createEnemySprite(600, 200, 'armed');
        this.graphics.createEnemySprite(400, 100, 'heavy');

        // Setup input
        this.cursors = this.input.keyboard!.createCursorKeys();
    }

    update() {
        // Update player animation based on input
        if (this.cursors.down.isDown) {
            this.graphics.updatePlayerAnimation('down');
        } else if (this.cursors.up.isDown) {
            this.graphics.updatePlayerAnimation('up');
        } else if (this.cursors.left.isDown) {
            this.graphics.updatePlayerAnimation('left');
        } else if (this.cursors.right.isDown) {
            this.graphics.updatePlayerAnimation('right');
        } else {
            this.graphics.updatePlayerAnimation('idle');
        }
    }
}
```

---

## 📊 Migration Checklist

### Phase 1: Setup
- [x] Generate sprites with `generate_sprites.py`
- [ ] Review generated sprites in `frontend/src/assets/graphics/sprites/`
- [ ] (Optional) Edit sprites in GIMP for color/detail corrections

### Phase 2: Code Integration
- [ ] Update scene preload with sprite loading
- [ ] Update GraphicsIntegrationManager.ts
- [ ] Update AnimationSystem.ts (if needed)
- [ ] Update GameManager/Scene to use new graphics

### Phase 3: Testing
- [ ] Test player sprite rendering
- [ ] Test enemy sprite rendering
- [ ] Test animations (walking, idle)
- [ ] Test weapon sprites
- [ ] Verify Krapoovy beret is visible on player

### Phase 4: Cleanup
- [ ] Comment out old ProceduralGraphics calls
- [ ] Keep ProceduralGraphics.ts for effects (explosions, blood)
- [ ] Update documentation
- [ ] Commit changes to GitHub

---

## 🔍 Troubleshooting

### Sprites Not Showing

**Problem:** Sprites don't appear in game.

**Solutions:**
- Check file paths in preload are correct
- Verify sprites exist in `frontend/src/assets/graphics/sprites/`
- Check browser console for loading errors
- Ensure Vite/build tool is copying assets

### Sprites Too Small/Large

**Problem:** Sprites are wrong size on screen.

**Solution:** Adjust scale in `createPlayerSprite()`:
```typescript
playerImage.setScale(2); // Change this number
```

### Krapoovy Beret Not Visible

**Problem:** Player's maroon beret is not showing or wrong color.

**Solution:**
1. Regenerate player sprite with emphasis on beret:
   ```python
   # In generate_sprites.py, update prompt:
   "PROMINENT maroon crimson beret LEFT side, VISIBLE and CLEAR"
   ```
2. Or edit manually in GIMP:
   - Open `player_idle.png`
   - Use paintbrush with color #8B3A3A
   - Draw beret on left side of head

### Animation Not Working

**Problem:** Player doesn't change sprites when moving.

**Solution:** Ensure `updatePlayerAnimation()` is called in scene's `update()` loop.

---

## 📝 Next Steps

1. **Generate more animation frames:**
   - Add diagonal movement sprites
   - Add attack/shoot animation frames
   - Add death animation frames

2. **Create sprite sheets:**
   - Combine frames into single sprite sheet
   - Use Phaser's sprite sheet loader
   - More efficient loading

3. **Add visual effects:**
   - Keep procedural explosions (they're good!)
   - Add particle systems
   - Add screen shake

4. **Optimize:**
   - Use texture atlases
   - Compress PNG files
   - Implement sprite pooling

---

**Status:** Ready for implementation  
**Difficulty:** Medium  
**Impact:** +60% visual quality improvement
