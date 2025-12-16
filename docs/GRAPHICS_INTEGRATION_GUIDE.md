# 🎨 GRAPHICS INTEGRATION GUIDE - VITYAZ

**Версия:** 1.0  
**Дата:** 16.12.2025  
**Статус:** 📋 Ready for Implementation

---

## 📖 Содержание

1. [Структура активов](#структура-активов)
2. [Типы графики](#типы-графики)
3. [Оптимизация](#оптимизация)
4. [Загрузка в Phaser](#загрузка-в-phaser)
5. [Интеграция с компонентами](#интеграция-с-компонентами)
6. [Performance Tips](#performance-tips)
7. [Troubleshooting](#troubleshooting)

---

## 📁 Структура активов

```
frontend/public/assets/
├── graphics/
│   ├── characters/
│   │   ├── player/
│   │   │   ├── idle.png              (128x128, ~15KB)
│   │   │   ├── walk.png              (128x128, ~20KB)
│   │   │   ├── attack.png            (256x128, ~25KB)
│   │   │   ├── damaged.png           (128x128, ~18KB)
│   │   │   └── death.png             (128x128, ~22KB)
│   │   ├── enemies/
│   │   │   ├── opponent/
│   │   │   │   ├── idle.png          (128x128, ~15KB)
│   │   │   │   ├── attack.png        (256x128, ~25KB)
│   │   │   │   └── death.png         (128x128, ~22KB)
│   │   │   ├── heavy/
│   │   │   │   ├── idle.png
│   │   │   │   └── attack.png
│   │   │   └── special/
│   │   │       ├── idle.png
│   │   │       └── attack.png
│   │   └── bosses/
│   │       ├── champion/
│   │       │   ├── idle.png          (256x256, ~50KB)
│   │       │   ├── attack.png        (512x256, ~80KB)
│   │       │   └── special.png       (512x256, ~90KB)
│   │       └── final/
│   │           └── ...
│   ├── weapons/
│   │   ├── punches.png               (64x64, sprite sheet)
│   │   ├── kicks.png                 (96x96, sprite sheet)
│   │   ├── special.png               (128x128, sprite sheet)
│   │   └── effects.png               (256x256, particle effects)
│   ├── ui/
│   │   ├── buttons/
│   │   │   ├── play-idle.png         (200x60, ~5KB)
│   │   │   ├── play-hover.png        (200x60, ~5KB)
│   │   │   ├── play-active.png       (200x60, ~5KB)
│   │   │   └── [outros similares]
│   │   ├── panels/
│   │   │   ├── health-bar.png        (400x40, ~3KB)
│   │   │   ├── stamina-bar.png       (400x40, ~3KB)
│   │   │   ├── mana-bar.png          (400x40, ~3KB)
│   │   │   └── dialog-box.png        (600x200, ~8KB)
│   │   ├── icons/
│   │   │   ├── health.png            (32x32, ~2KB)
│   │   │   ├── stamina.png           (32x32, ~2KB)
│   │   │   ├── combo.png             (32x32, ~2KB)
│   │   │   └── [outros]
│   │   └── hud/
│   │       ├── crosshair.png         (32x32, ~1KB)
│   │       ├── minimap-bg.png        (200x200, ~10KB)
│   │       └── damage-indicator.png  (64x64, ~4KB)
│   ├── environments/
│   │   ├── dojo/
│   │   │   ├── background.png        (1920x1080, ~200KB)
│   │   │   ├── floor.png             (1024x1024, ~100KB)
│   │   │   ├── walls.png             (512x512, ~80KB)
│   │   │   └── decor.png             (512x512, ~60KB)
│   │   ├── arena/
│   │   │   ├── background.png        (1920x1080, ~200KB)
│   │   │   ├── floor.png             (1024x1024, ~100KB)
│   │   │   └── obstacles.png         (512x512, ~70KB)
│   │   └── tournament/
│   │       ├── background.png        (1920x1080, ~200KB)
│   │       ├── stage.png             (1024x512, ~120KB)
│   │       └── crowds.png            (512x512, ~90KB)
│   ├── effects/
│   │   ├── particles/
│   │   │   ├── hit.png               (64x64, ~5KB)
│   │   │   ├── blood.png             (64x64, ~6KB)
│   │   │   ├── dust.png              (64x64, ~4KB)
│   │   │   ├── energy.png            (128x128, ~8KB)
│   │   │   └── magic.png             (128x128, ~10KB)
│   │   ├── transitions/
│   │   │   ├── fade.png              (1x1, <1KB)
│   │   │   └── wipe.png              (256x256, ~3KB)
│   │   └── animations/
│   │       ├── victory.png           (256x256, ~15KB)
│   │       ├── defeat.png            (256x256, ~15KB)
│   │       └── level-up.png          (256x256, ~18KB)
│   ├── text/
│   │   ├── fonts/
│   │   │   └── ...
│   │   └── splash-screens/
│   │       ├── loading.png           (1920x1080, ~150KB)
│   │       ├── game-over.png         (1920x1080, ~180KB)
│   │       └── victory.png           (1920x1080, ~200KB)
│   └── atlases/
│       ├── characters.json           (sprite atlas)
│       ├── characters.png            (2048x2048, ~300KB)
│       ├── ui.json                   (sprite atlas)
│       └── ui.png                    (2048x2048, ~250KB)
└── total: ~2.5-3.0 MB
```

---

## 🎭 Типы графики

### 1. **Character Sprites**

```typescript
// Phaser сцена инициализация
preload() {
  // Загрузить спрайты персонажей
  this.load.spritesheet('player-idle', 'assets/graphics/characters/player/idle.png', {
    frameWidth: 128,
    frameHeight: 128,
    margin: 0,
    spacing: 0
  });

  // Или использовать atlas для оптимизации
  this.load.atlas('characters', 
    'assets/graphics/atlases/characters.png',
    'assets/graphics/atlases/characters.json'
  );
}

create() {
  // Создать анимации
  this.anims.create({
    key: 'player-walk',
    frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  // Создать спрайт и воспроизвести анимацию
  const player = this.add.sprite(100, 100, 'player-idle');
  player.play('player-walk');
}
```

### 2. **Background & Environments**

```typescript
preload() {
  // Загрузить фон
  this.load.image('dojo-bg', 'assets/graphics/environments/dojo/background.png');
  this.load.image('dojo-floor', 'assets/graphics/environments/dojo/floor.png');
}

create() {
  // Добавить фон
  const background = this.add.image(960, 540, 'dojo-bg');
  background.setScale(1);
  background.setScrollFactor(0.5); // Параллакс

  // Добавить пол как физическое тело
  const floor = this.add.image(960, 900, 'dojo-floor');
  this.physics.add.existing(floor, true); // static body
}
```

### 3. **UI Elements**

```typescript
preload() {
  this.load.image('health-bar', 'assets/graphics/ui/panels/health-bar.png');
  this.load.image('play-button', 'assets/graphics/ui/buttons/play-idle.png');
}

create() {
  // Создать UI
  const healthBar = this.add.image(100, 50, 'health-bar');
  
  // Кнопка
  const playButton = this.add.image(400, 300, 'play-button')
    .setInteractive()
    .on('pointerover', () => playButton.setTint(0xcccccc))
    .on('pointerout', () => playButton.clearTint())
    .on('pointerdown', () => this.scene.start('GameScene'));
}
```

### 4. **Particle Effects**

```typescript
preload() {
  this.load.image('particle-hit', 'assets/graphics/effects/particles/hit.png');
}

create() {
  // Создать emitter для частиц
  const particles = this.add.particles('particle-hit');
  
  const emitter = particles.createEmitter({
    speed: { min: -200, max: 200 },
    angle: { min: 240, max: 300 },
    scale: { start: 1, end: 0 },
    lifespan: 600,
    gravityY: 300
  });

  // Испустить частицы при попадании
  emitter.explode(10, 400, 300);
}
```

---

## ⚡ Оптимизация

### **Format Recommendations**

| Тип | Format | Размер | Качество |
|-----|--------|--------|----------|
| Sprites | **PNG** | Маленький | Отличное |
| Backgrounds | **WebP** | Очень маленький | Отличное |
| Fallback | **JPG** | Маленький | Хорошее |
| Particle effects | **PNG** (transparency) | Очень маленький | Отличное |

### **Size Guidelines**

```
Спрайты персонажей:  64x64 - 256x256 px
УИ элементы:        32x32 - 512x512 px
Фоны:              1920x1080 - 4096x4096 px
Партикулы:          16x16 - 128x128 px
Иконки:              16x16 - 64x64 px
```

### **Compression Tips**

```bash
# Используй ImageOptim (macOS)
# Или TinyPNG для batch processing
# Или ImageMagick

convert input.png -quality 85 -strip output.png

# Для WebP (меньший размер, лучшее качество)
cwebp input.png -q 80 -o output.webp

# Оптимизация PNG
optipng -o2 input.png -out output.png
pngquant --quality=80 input.png -o output.png
```

### **Sprite Atlasing**

```bash
# Используй Texture Packer (коммерческий)
# Или бесплатные: Shoebox, Free Texture Packer

# Результат: один .png + один .json
charcters.png     (2048x2048)  ~300KB
characters.json   (metadata)   ~50KB
```

---

## 📥 Загрузка в Phaser

### **Method 1: Image Preloading**

```typescript
preload() {
  // Простая загрузка
  this.load.image('key', 'path/to/image.png');
  
  // С прогрессом
  this.load.on('progress', (value: number) => {
    console.log(Math.round(value * 100) + '%');
  });
}
```

### **Method 2: Sprite Atlases**

```typescript
preload() {
  // Загрузить atlas (эффективнее для многих спрайтов)
  this.load.atlas(
    'characters',
    'assets/atlases/characters.png',
    'assets/atlases/characters.json'
  );
}

create() {
  // Использовать из atlas
  const player = this.add.sprite(100, 100, 'characters', 'player-idle-1');
}
```

### **Method 3: Dynamic Loading**

```typescript
async loadAssetsForScene(sceneName: string) {
  const assets = this.getAssetsForScene(sceneName);
  
  for (const asset of assets) {
    this.load.image(asset.key, asset.path);
  }
  
  return new Promise((resolve) => {
    this.load.once('complete', resolve);
    this.load.start();
  });
}
```

---

## 🔗 Интеграция с компонентами

### **Phaser Scene Setup**

```typescript
// src/scenes/GameScene.ts

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Load all graphics
    this.loadCharacterAssets();
    this.loadEnvironmentAssets();
    this.loadUIAssets();
    this.loadEffectAssets();
  }

  loadCharacterAssets() {
    this.load.atlas(
      'characters',
      'assets/graphics/atlases/characters.png',
      'assets/graphics/atlases/characters.json'
    );
  }

  loadEnvironmentAssets() {
    this.load.image('dojo-bg', 'assets/graphics/environments/dojo/background.png');
    this.load.image('dojo-floor', 'assets/graphics/environments/dojo/floor.png');
  }

  loadUIAssets() {
    // UI loading
  }

  loadEffectAssets() {
    // Effects loading
  }

  create() {
    this.createAnimations();
    this.createEnvironment();
    this.createPlayer();
    this.createEnemy();
    this.createUI();
  }

  private createAnimations() {
    // Create all animations
  }

  private createEnvironment() {
    // Setup environment
  }

  private createPlayer() {
    // Create player sprite with animations
  }

  private createEnemy() {
    // Create enemy sprite
  }

  private createUI() {
    // Create UI elements
  }
}
```

### **React Component Integration**

```typescript
// src/components/GameCanvas.tsx

import Phaser from 'phaser';
import React, { useEffect, useRef } from 'react';
import { GameScene } from '@/scenes/GameScene';

interface GameCanvasProps {
  graphicsPath?: string;
  onGameReady?: (game: Phaser.Game) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  graphicsPath = '/assets/graphics',
  onGameReady
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      canvas: document.getElementById('game-canvas') as HTMLCanvasElement,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 200 },
          debug: false
        }
      },
      render: {
        pixelArt: true,
        antialias: true,
        roundPixels: true
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
      },
      scene: [GameScene]
    };

    gameRef.current = new Phaser.Game(config);

    if (onGameReady && gameRef.current) {
      onGameReady(gameRef.current);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, [graphicsPath, onGameReady]);

  return <canvas id="game-canvas" style={{ display: 'block' }} />;
};
```

---

## ⚙️ Performance Tips

### **1. Culling & Visibility**

```typescript
// Отключить спрайты вне экрана
this.cameras.main.setBounds(0, 0, width, height);
this.physics.world.setBounds(0, 0, width, height);

// Использовать display lists для оптимизации
sprite.setVisible(false); // Не рендерится, но физика работает
```

### **2. Texture Caching**

```typescript
// Кэшировать текстуры
const textureManager = this.textures;

if (!textureManager.exists('my-texture')) {
  this.load.image('my-texture', 'path/to/texture.png');
}
```

### **3. Sprite Pooling**

```typescript
class SpritePool {
  private pool: Phaser.Physics.Arcade.Sprite[] = [];
  private scene: Phaser.Scene;
  private textureKey: string;

  constructor(scene: Phaser.Scene, key: string, count: number) {
    this.scene = scene;
    this.textureKey = key;

    for (let i = 0; i < count; i++) {
      const sprite = this.scene.physics.add.sprite(-9999, -9999, key);
      sprite.setActive(false);
      sprite.setVisible(false);
      this.pool.push(sprite);
    }
  }

  get(): Phaser.Physics.Arcade.Sprite | undefined {
    return this.pool.pop();
  }

  release(sprite: Phaser.Physics.Arcade.Sprite) {
    sprite.setActive(false);
    sprite.setVisible(false);
    sprite.setPosition(-9999, -9999);
    this.pool.push(sprite);
  }
}
```

### **4. Layer Management**

```typescript
// Организовать спрайты по слоям
const backgroundLayer = this.add.layer();
const playersLayer = this.add.layer();
const effectsLayer = this.add.layer();
const uiLayer = this.add.layer();

// Добавить спрайты в нужные слои
backgroundLayer.add(background);
playersLayer.add(player);
playersLayer.add(enemy);
effectsLayer.add(particles);
uiLayer.add(healthBar);
```

---

## 🐛 Troubleshooting

### **Issue: Graphics не загружаются**

```typescript
// ✅ Решение: Проверить пути
this.load.image('key', 'assets/graphics/...');
// путь должен быть правильным относительно public/ папки

// или используй абсолютный путь
this.load.image('key', '/assets/graphics/...');
```

### **Issue: Низкий FPS с graphics**

```typescript
// ✅ Решение: Использовать atlases вместо einzelных спрайтов
this.load.atlas('characters',
  'assets/atlases/characters.png',
  'assets/atlases/characters.json'
);

// Вместо
this.load.image('player-idle', 'assets/graphics/characters/player/idle.png');
this.load.image('player-walk', 'assets/graphics/characters/player/walk.png');
this.load.image('player-attack', 'assets/graphics/characters/player/attack.png');
```

### **Issue: Размытые спрайты**

```typescript
// ✅ Решение: Включить пиксель-арт режим
const config: Phaser.Types.Core.GameConfig = {
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true
  }
};
```

### **Issue: Память утекает при смене сцен**

```typescript
// ✅ Решение: Правильно очищать сцену
shutdown() {
  this.textures.remove('key');
  this.cache.glsl.remove('key');
}

shutdown() {
  // Phaser автоматически очищает спрайты
  // но текстуры нужно удалять вручную если они специфичны для сцены
}
```

---

## 📊 Чек-лист для интеграции

- [ ] Создать `/public/assets/graphics/` структуру
- [ ] Организовать все спрайты по категориям
- [ ] Создать sprite atlases
- [ ] Оптимизировать размеры изображений
- [ ] Настроить Phaser preload()
- [ ] Создать animations для всех спрайтов
- [ ] Интегрировать с React компонентами
- [ ] Протестировать на разных разрешениях
- [ ] Проверить performance (DevTools → Performance)
- [ ] Настроить layer management

---

## 🔗 Дополнительные ресурсы

- [Phaser 3 Graphics](https://phaser.io/examples/v3/category/loader)
- [Sprite Atlasing Guide](https://phaser.io/tutorials/making-your-first-phaser-3-game/part10)
- [Optimization Tips](https://phaser.io/tutorials/getting-started-phaser3/part10)
- [Particle System](https://phaser.io/examples/v3/category/particles)

---

**Версия:** 1.0  
**Дата обновления:** 16.12.2025  
**Статус:** ✅ Ready for Implementation
