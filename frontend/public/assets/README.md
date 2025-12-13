# 🎨 VITYAZ Game Assets

**Project:** VITYAZ: Special Operations  
**Updated:** December 13, 2025

---

## 📁 Directory Structure

```
assets/
├── sprites/
│   ├── characters/          # Player and NPC sprites
│   ├── weapons/            # Weapon sprites and animations
│   └── equipment/          # Grenades, items, etc.
├── ui/
│   ├── vityaz_emblem.png  # Official unit emblem
│   ├── buttons/           # Menu buttons
│   ├── hud/              # In-game HUD elements
│   └── icons/            # Various UI icons
├── effects/
│   ├── muzzle_flash.png  # Gunfire effects
│   ├── explosions/       # Grenade/explosion sprites
│   └── particles/        # Blood, smoke, etc.
├── maps/
│   ├── tilesets/        # Ground and wall tiles
│   └── objects/         # Environmental objects
└── audio/
    ├── weapons/         # Gunfire sounds
    ├── ui/             # Menu sounds
    └── ambient/        # Background audio
```

---

## 🎯 Generated Core Assets

### 1. Vityaz Operator Sprite
**File:** `sprites/characters/vityaz_operator.png`  
**Description:** Top-down special forces soldier with краповый берет (tilted left)  
**Original Source:** Generated December 13, 2025  
**Specifications:**
- Maroon beret (NOT red!)
- Tactical gear in dark green/black
- AK-74M rifle
- Top-down 45° view

**Usage in Phaser 3:**
```typescript
// Load sprite
this.load.spritesheet('vityaz_operator', 
  'assets/sprites/characters/vityaz_operator.png',
  { frameWidth: 64, frameHeight: 64 }
);

// Create player
const player = this.add.sprite(400, 300, 'vityaz_operator');
```

### 2. Vityaz Unit Emblem
**File:** `ui/vityaz_emblem.png`  
**Description:** Official-style emblem with medieval Russian warrior  
**Colors:** Maroon (#8B1538), Black, Gold (#D4AF37)  
**Text:** Cyrillic "ВИТЯЗЬ"  

**Usage:**
- Main menu logo (256x256)
- Loading screen (512x512)
- Character patches (32x32)
- UI watermark (64x64)

**Example:**
```typescript
this.load.image('emblem', 'assets/ui/vityaz_emblem.png');
const logo = this.add.image(960, 100, 'emblem');
logo.setScale(0.5); // Adjust size
```

### 3. Weapons Collection
**Files:** Individual weapon sprites in `sprites/weapons/`  
**Included:**
- AK-74M (assault rifle)
- SVD Dragunov (sniper rifle)
- RPK-74 (light machine gun)
- PMM Makarov (pistol)
- GP-25 (grenade launcher)

**Extraction Required:** Separate each weapon from collection image

**Example:**
```typescript
this.load.image('ak74m', 'assets/sprites/weapons/ak74m.png');
this.load.image('svd', 'assets/sprites/weapons/svd.png');
```

---

## 🔧 Asset Integration Steps

### Step 1: Download Generated Images

The following images were generated and need to be saved:

1. **Vityaz Operator:**
   - Save to: `frontend/public/assets/sprites/characters/vityaz_operator_original.png`
   - Resize to 64x64 for game use
   - Create animation frames (8 directions)

2. **Vityaz Emblem:**
   - Save to: `frontend/public/assets/ui/vityaz_emblem.png`
   - Create multiple sizes: 512x512, 256x256, 128x128, 64x64

3. **Weapons Collection:**
   - Save to: `frontend/public/assets/sprites/weapons/collection_original.png`
   - Extract individual weapons
   - Resize appropriately:
     - AK-74M: 32x16 px
     - SVD: 48x12 px
     - RPK-74: 40x18 px
     - PMM: 16x12 px

### Step 2: Process Assets

```bash
# Install image processing tools
npm install --save-dev jimp

# Run asset processor (create this script)
node tools/process-assets.js
```

**Asset Processor Script (`tools/process-assets.js`):**
```javascript
const Jimp = require('jimp');
const fs = require('fs');

async function processAssets() {
  // Resize operator sprite
  const operator = await Jimp.read(
    'frontend/public/assets/sprites/characters/vityaz_operator_original.png'
  );
  await operator.resize(64, 64).writeAsync(
    'frontend/public/assets/sprites/characters/vityaz_operator.png'
  );
  
  // Create multiple emblem sizes
  const emblem = await Jimp.read(
    'frontend/public/assets/ui/vityaz_emblem.png'
  );
  await emblem.clone().resize(512, 512).writeAsync('frontend/public/assets/ui/emblem_512.png');
  await emblem.clone().resize(256, 256).writeAsync('frontend/public/assets/ui/emblem_256.png');
  await emblem.clone().resize(128, 128).writeAsync('frontend/public/assets/ui/emblem_128.png');
  await emblem.clone().resize(64, 64).writeAsync('frontend/public/assets/ui/emblem_64.png');
  
  console.log('✅ Assets processed successfully!');
}

processAssets().catch(console.error);
```

### Step 3: Update Preload Scene

**Edit:** `frontend/src/game/scenes/PreloadScene.ts`

```typescript
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Progress bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    // Load emblem for loading screen
    this.load.image('emblem', 'assets/ui/emblem_256.png');
    
    // Characters
    this.load.spritesheet('vityaz_operator', 
      'assets/sprites/characters/vityaz_operator.png',
      { frameWidth: 64, frameHeight: 64 }
    );
    
    // Weapons
    this.load.image('ak74m', 'assets/sprites/weapons/ak74m.png');
    this.load.image('svd', 'assets/sprites/weapons/svd.png');
    this.load.image('rpk74', 'assets/sprites/weapons/rpk74.png');
    this.load.image('pmm', 'assets/sprites/weapons/pmm.png');
    
    // UI
    this.load.image('health_bar', 'assets/ui/hud/health_bar.png');
    this.load.image('armor_bar', 'assets/ui/hud/armor_bar.png');
    this.load.image('crosshair', 'assets/ui/hud/crosshair.png');
    
    // Effects
    this.load.spritesheet('muzzle_flash',
      'assets/effects/muzzle_flash.png',
      { frameWidth: 16, frameHeight: 16 }
    );
    
    // Update progress bar
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x8B1538, 1); // Krapovy maroon
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });
  }

  create() {
    this.scene.start('MainMenuScene');
  }
}
```

---

## 🎨 Asset Creation Guidelines

### Color Palette

**Primary:**
```
Krapovy Maroon: #8B1538
Military Green:  #3D4A3D
Tactical Black:  #1A1A1A
Gold Accent:     #D4AF37
```

**Secondary:**
```
Russian Flag:
  White:  #FFFFFF
  Blue:   #0039A6
  Red:    #D52B1E

Combat Brown: #4A3C2A
Urban Gray:   #5A5A5A
```

### Sprite Specifications

| Type | Size | Format | Transparency |
|------|------|--------|-------------|
| Character | 64x64 | PNG-24 | Yes |
| Weapon | 32x16 | PNG-24 | Yes |
| UI Icon | 64x64 | PNG-24 | Yes |
| Particle | 4x4-16x16 | PNG-8 | Yes |
| Background | Any | JPEG | No |

### Performance Targets

- **Total Assets Size:** < 50MB
- **Individual Sprite:** < 100KB
- **Load Time:** < 3 seconds
- **Memory Usage:** < 200MB

---

## 🛠️ Tools & Resources

### Required Software

**Free:**
- [GIMP](https://www.gimp.org/) - Image editing
- [Aseprite](https://www.aseprite.org/) - Pixel art ($20 or compile free)
- [Tiled](https://www.mapeditor.org/) - Map editor
- [ShoeBox](http://renderhjs.net/shoebox/) - Sprite sheet packer

### Online Tools

- [Piskel](https://www.piskelapp.com/) - Browser pixel art editor
- [Photopea](https://www.photopea.com/) - Online Photoshop alternative
- [TinyPNG](https://tinypng.com/) - PNG compression
- [Sprite Sheet Packer](https://www.codeandweb.com/free-sprite-sheet-packer) - Free packer

### Asset Libraries (Temporary/Prototype)

- [OpenGameArt.org](https://opengameart.org/) - Free game assets
- [itch.io](https://itch.io/game-assets/free) - Free & paid assets
- [Kenney.nl](https://kenney.nl/) - Free asset packs

---

## 📋 Asset Checklist

### Phase 1: Core Assets ✅
- [x] Vityaz operator sprite (generated)
- [x] Unit emblem (generated)
- [x] Weapon collection (generated)
- [ ] Extract individual weapons
- [ ] Create animation frames
- [ ] Resize for game use

### Phase 2: UI Elements
- [ ] Main menu background
- [ ] Button sprites (normal, hover, pressed)
- [ ] Health/armor bars
- [ ] Crosshair designs (3 variants)
- [ ] Minimap border
- [ ] Inventory slots

### Phase 3: Effects
- [ ] Muzzle flash (3 frames)
- [ ] Blood splatter (particle)
- [ ] Explosion (8 frames)
- [ ] Smoke (particle)
- [ ] Shell casings (sprite)
- [ ] Bullet tracers (line)

### Phase 4: Environment
- [ ] Ground tiles (concrete, asphalt, dirt, grass)
- [ ] Wall tiles (brick, concrete, metal)
- [ ] Doors (closed, open)
- [ ] Windows (intact, broken)
- [ ] Crates, barrels
- [ ] Vehicles (cars, trucks)

### Phase 5: Polish
- [ ] Character shadows
- [ ] Lighting effects
- [ ] Weather particles (rain, snow)
- [ ] Victory/defeat screens
- [ ] Loading animations

---

## 📝 Naming Conventions

**Format:** `{category}_{name}_{variant}_{state}.png`

**Examples:**
- `char_vityaz_assault_idle.png`
- `weap_ak74m_fire_01.png`
- `ui_button_play_hover.png`
- `fx_muzzle_flash_02.png`
- `tile_ground_concrete_01.png`

**Rules:**
- Lowercase only
- Underscores for spaces
- Descriptive but concise
- Frame numbers: 01, 02, 03...

---

## 🚀 Quick Start

### 1. Set Up Asset Directory

```bash
cd frontend/public
mkdir -p assets/{sprites/{characters,weapons,equipment},ui/{buttons,hud,icons},effects/{explosions,particles},maps/{tilesets,objects},audio/{weapons,ui,ambient}}
```

### 2. Download Generated Assets

Save the 3 generated images from the graphics guide:
1. Vityaz operator → `assets/sprites/characters/`
2. Vityaz emblem → `assets/ui/`
3. Weapons collection → `assets/sprites/weapons/`

### 3. Process Assets

```bash
# Install image tools
npm install --save-dev jimp

# Create processing script
touch tools/process-assets.js

# Run processor
node tools/process-assets.js
```

### 4. Test in Game

```bash
# Start frontend
cd frontend
npm run dev

# Open browser: http://localhost:3000
# Assets should load in PreloadScene
```

---

## 🎯 Integration with Existing Code

### Current Asset Usage

The game already references some assets in:
- `frontend/src/game/scenes/PreloadScene.ts`
- `frontend/src/game/scenes/GameScene.ts`
- `frontend/src/components/Game.tsx`

**Update these files** to use new asset paths:

```typescript
// Before (placeholder)
this.load.image('player', 'assets/player.png');

// After (new assets)
this.load.spritesheet('vityaz_operator', 
  'assets/sprites/characters/vityaz_operator.png',
  { frameWidth: 64, frameHeight: 64 }
);
```

---

## 📊 Asset Performance Metrics

### Current Status
- **Total Assets:** 3 core assets (generated)
- **Total Size:** ~5MB (unoptimized)
- **Load Time:** < 1s (estimated)
- **Formats:** PNG

### Optimization Needed
- [ ] Compress PNGs with TinyPNG
- [ ] Create texture atlases
- [ ] Implement lazy loading
- [ ] Use WebP where supported

**Target After Optimization:**
- Total Size: < 2MB
- Load Time: < 500ms

---

## 🔗 Related Documentation

- [Graphics Guide](../../docs/GRAPHICS_GUIDE.md) - Complete graphics creation guide
- [Phaser 3 Docs](https://photonstorm.github.io/phaser3-docs/) - Game engine documentation
- [Sprite Sheet Tutorial](https://phaser.io/tutorials/making-your-first-phaser-3-game/part2) - Official Phaser tutorial

---

## 🆘 Troubleshooting

### Asset Not Loading

**Problem:** "Failed to load texture: assets/..."

**Solution:**
1. Check file path is correct (case-sensitive!)
2. Verify file exists in `public/assets/`
3. Check browser console for errors
4. Clear browser cache (Ctrl+Shift+R)

### Sprite Appears Blurry

**Problem:** Sprites look blurry/pixelated

**Solution:**
```typescript
// Disable antialiasing for pixel art
const config = {
  type: Phaser.AUTO,
  pixelArt: true, // Add this!
  // ...
};
```

### Asset Size Too Large

**Problem:** Long load times

**Solution:**
1. Compress PNGs: `pngquant --quality=70-90 file.png`
2. Use appropriate resolutions (don't use 4K for 64px sprite)
3. Create sprite atlases to combine multiple images

---

## ✅ Next Steps

1. **Download Generated Assets** from Graphics Guide
2. **Create Asset Processing Script** for resizing
3. **Extract Individual Weapons** from collection
4. **Update PreloadScene** with new assets
5. **Test in Browser** - verify loading
6. **Create Missing Assets** (UI, effects, etc.)

---

**Created:** December 13, 2025  
**Status:** 🟡 Initial Setup (3 core assets generated)  
**Progress:** 15% (3/20 core assets)  
**Next Milestone:** Extract weapons, create UI elements

🎮 **ВИТЯЗЬ - Честь, Отвага, Профессионализм!** ⚔️
