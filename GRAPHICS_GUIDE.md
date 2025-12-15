# 🎨 VITYAZ Graphics Guide

## Overview

This document outlines the professional graphics and visual design system for VITYAZ: Special Operations, a tactical FPS with crypto-economics gameplay.

---

## 🎖️ Player Sprite Design (Krapoovy Beret)

### Physical Appearance

**Krapoovy Beret (Марина синего цвета)**
- **Color**: Maroon-Brown (#8B4513 - authentic Vityaz color)
- **Position**: LEFT SIDE of head (tilted left)
- **Size**: Medium (takes up ~1/3 of head width)
- **Style**: Military beret with slight tilt downward
- **Badge**: Gold 5-pointed star insignia centered on beret

```
┌─────────────────────────────────────┐
│        PLAYER SPRITE LAYOUT         │
├─────────────────────────────────────┤
│                                     │
│           ★ (Gold Star)             │  ← Beret with star
│          ╱════╲ (Beret)            │
│         ║  ○ ○  ║ (Head/Eyes)      │
│          ╲════╱ (Face)             │
│                                     │
│        ████████████                 │  ← Military uniform
│       ██████████████                │     (Dark green)
│       ████████████                  │
│       ██  █████  ██                 │  ← Tactical gear
│                                     │
│        █████  █████                 │  ← Legs (black)
│        █████  █████                 │
│                                     │
└─────────────────────────────────────┘
```

### Body Armor & Uniform

**Military Tactical Gear**
- **Uniform Color**: Dark Military Green (#2d5a2d)
- **Armor Chest**: Darker green (#1a3d1a) with tactical vest straps
- **Sleeves**: Dark green with outlined details
- **Tactical Vest Straps**: Visible center and side straps (#5a7a5a)

**Arms**
- **Color**: Dark military green (#1a3d1a)
- **Style**: Fitted sleeves with subtle shadows
- **Length**: Extends from shoulder to wrist

**Legs**
- **Color**: Black tactical pants (#1a1a1a)
- **Style**: Military combat pants with pockets
- **Boots**: Very dark military boots (#0d0d0d)

### Head & Face

**Head**
- **Shape**: Circle (military cut)
- **Color**: Military tan skin tone (#d9a97a)
- **Eyes**: Black pupils with white highlights (alert expression)
- **Expression**: Combat-ready, focused

### Insignia & Symbols

**Gold Star on Beret**
- **Shape**: 5-pointed star
- **Color**: Gold (#ffd700)
- **Size**: Small (12-15% of beret size)
- **Position**: Centered on beret front
- **Meaning**: Vityaz special forces unit emblem

---

## 🔫 Enemy Sprite Design

**Red Soldier Appearance**
- **Uniform Color**: Red (#aa0000)
- **Helmet Color**: Dark gray (#333333)
- **Head Color**: Military tan (#c9a17a)
- **Eyes**: Hostile red glow (#ff0000)
- **Arms**: Dark red (#660000)
- **Legs**: Black (#1a1a1a)
- **Size**: Slightly smaller than player (90% scale)

---

## 🎯 Weapon Design

### AK-74M Rifle Appearance

**Barrel**
- **Color**: Black steel (#1a1a1a)
- **Style**: Realistic rifle profile
- **Length**: 24-28 pixels at 1x scale

**Stock**
- **Color**: Brown wood (#5a4a3a)
- **Style**: Traditional wooden stock
- **Length**: 12 pixels

**Muzzle Brake**
- **Color**: Dark steel (#2a2a2a)
- **Style**: Protective muzzle device
- **Size**: 4x6 pixels

---

## ✨ Visual Effects

### Blood Effect
- **Color**: Dark red (#660000)
- **Opacity**: 80% transparent
- **Pattern**: Splatter with 2-3 droplets
- **Size**: 16-24 pixels
- **Duration**: Fades out over 600ms

### Explosion Effect
- **Colors**: 
  - Center: Orange (#ff8800)
  - Middle: Golden yellow (#ffaa00)
  - Outer: Light yellow (#ffff00)
- **Opacity**: Graduated (1.0 → 0.7 → 0.5)
- **Size**: 32+ pixels
- **Duration**: Instant flash

### Smoke Effect
- **Color**: Gray (#888888, #aaaaaa)
- **Opacity**: 60% → 40%
- **Pattern**: 2-3 circular clouds
- **Size**: 24 pixels
- **Duration**: 400-600ms fade

---

## 🎮 HUD & UI Design

### Color Palette

```
┌─────────────────────────────────────────┐
│ HUD COLOR REFERENCE                     │
├─────────────────────────────────────────┤
│ Primary Color (Vityaz Krapoovy):        │
│   #8B4513 - Maroon-brown (branding)    │
│                                         │
│ Health Bar Colors:                      │
│   #22c55e - Green (100-50%)             │
│   #eab308 - Yellow (50-25%)             │
│   #ef4444 - Red (25-0%)                 │
│                                         │
│ UI Accent Colors:                       │
│   #ffd700 - Gold (ammunition, victory)  │
│   #ff6b6b - Bright Red (enemy, danger)  │
│   #1a1a1a - Black (backgrounds)         │
│   #ffffff - White (text, borders)       │
└─────────────────────────────────────────┘
```

### Health Bar
- **Background**: Dark (#1a1a1a) with 80% opacity
- **Bar Height**: 26 pixels
- **Bar Width**: 196 pixels (100% health)
- **Border**: 1px white outline
- **Color Transition**: Green → Yellow → Red

### HUD Panel
- **Background**: Dark (#1a1a1a) with 90% opacity
- **Height**: 50 pixels
- **Width**: Full screen width
- **Border**: Subtle top border

### Text Styling
- **Font**: Arial, Helvetica (system default)
- **Health Text**: Bold, #22c55e (green)
- **Ammo Text**: Bold, #ffd700 (gold)
- **Wave Text**: Bold, #ff6b6b (red)
- **Score Text**: Bold, #8b4513 (krapovy)
- **Vityaz Branding**: Bold, #8b4513

### Crosshair
- **Type**: Simple + (plus sign)
- **Color**: Krapovy maroon-brown (#8b4513)
- **Size**: 20x20 pixels
- **Opacity**: 100%
- **Scroll Factor**: 0 (stays fixed on screen)

---

## 🎬 Animation Guidelines

### Player Animations

**Idle Animation**
- **Frames**: Subtle breathing motion (2-3 frames)
- **Duration**: 2 seconds per cycle
- **Interpolation**: Smooth (ease-in-out)
- **Purpose**: Show player is alert and ready

**Walk Animation**
- **Frames**: 4 directional frames minimum
- **Duration**: 1 second per cycle
- **Interpolation**: Linear
- **Purpose**: Smooth character movement

**Fire Animation**
- **Duration**: 50-100ms
- **Effect**: Weapon recoil (backward 10-15px)
- **Recovery**: Instant snap-back
- **Purpose**: Feedback to player

### Enemy Animations

**Idle**
- **Frames**: 2-3 frames
- **Duration**: 1.5 seconds per cycle
- **Purpose**: Show readiness

**Chase**
- **Frames**: 4 directional frames
- **Duration**: 0.8 seconds per cycle
- **Purpose**: Dynamic movement toward player

**Death**
- **Duration**: 200-300ms
- **Effect**: Fade to blood color
- **Purpose**: Clear visual feedback

---

## 📐 Sprite Dimensions

```
┌──────────────────────────────────────┐
│ SPRITE SIZE SPECIFICATIONS           │
├──────────────────────────────────────┤
│ Player Sprite (Base):     64x64 px  │
│ Player Sprite (Scaled):   128x128 px │
│                                      │
│ Enemy Sprite (Base):      56x56 px  │
│ Enemy Sprite (Scaled):    100x100 px │
│                                      │
│ Weapon Sprite (Base):     48x12 px  │
│ Weapon Sprite (Scaled):   120x30 px  │
│                                      │
│ Effect Sprites:                      │
│   - Blood:                16x16 px  │
│   - Explosion:            32x32 px  │
│   - Smoke:                24x24 px  │
│                                      │
│ HUD Elements:                        │
│   - Health Bar:           196x26 px │
│   - Crosshair:            20x20 px  │
│   - UI Panel:             800x50 px │
└──────────────────────────────────────┘
```

---

## 🎨 Color Reference Chart

| Element | Color | Hex | RGB | Usage |
|---------|-------|-----|-----|-------|
| Krapoovy Beret | Maroon-Brown | #8B4513 | (139,69,19) | Primary brand color |
| Military Green | Dark Green | #2d5a2d | (45,90,45) | Uniform/armor |
| Enemy Red | Red | #aa0000 | (170,0,0) | Enemy identification |
| Gold Star | Gold | #ffd700 | (255,215,0) | Insignia/ammo |
| Health Good | Green | #22c55e | (34,197,94) | Healthy status |
| Health Warn | Yellow | #eab308 | (234,179,8) | Medium health |
| Health Bad | Red | #ef4444 | (239,68,68) | Low health |
| Danger | Bright Red | #ff6b6b | (255,107,107) | Alert/enemies |
| Skin Tone | Tan | #d9a97a | (217,169,122) | Face/exposed skin |
| Dark Steel | Black | #1a1a1a | (26,26,26) | Weapons/armor |
| Wood | Brown | #5a4a3a | (90,74,58) | Wooden parts |
| Text Light | White | #ffffff | (255,255,255) | Text on dark |

---

## 🖼️ Asset Organization

```
frontend/src/graphics/
├── PlayerSpriteGenerator.ts        (Procedural generation)
├── EnemyGenerator.ts               (Enemy sprites)
├── WeaponGenerator.ts              (Weapon sprites)
├── EffectGenerator.ts              (Visual effects)
└── assets/
    ├── sprites/
    │   ├── characters/
    │   │   ├── vityaz_operator.png (Player)
    │   │   └── red_soldier.png     (Enemy)
    │   └── weapons/
    │       ├── ak74m.png
    │       ├── svd.png
    │       └── pmm.png
    ├── effects/
    │   ├── particles/
    │   │   ├── blood_splatter.png
    │   │   ├── explosion.png
    │   │   └── muzzle_flash.png
    │   └── ui/
    │       ├── hud/
    │       │   └── crosshair.png
    │       └── vityaz_emblem.png
    └── ui/
        ├── fonts/
        ├── icons/
        └── hud/
```

---

## 🎯 Design Principles

1. **Military Authenticity**: All visual elements reflect real tactical gear and equipment
2. **Krapovy Symbolism**: Krapoovy beret is always visible and iconic
3. **High Contrast**: Colors chosen for clear visibility in fast-paced gameplay
4. **Consistent Theme**: All UI elements use the krapovy maroon-brown as primary brand color
5. **Clear Feedback**: Visual effects immediately communicate game state (health, ammo, hits)
6. **Professional Quality**: Graphics suitable for commercial game release

---

## 📋 Future Graphics Improvements

- [ ] Animated textures for beret and uniform
- [ ] Directional variant sprites (8-way directional animations)
- [ ] Additional weapon sprite variants
- [ ] Environmental hazards and obstacles
- [ ] Boss enemy sprites
- [ ] Scoring visual effects
- [ ] Menu animations
- [ ] Camera shake effects on explosions
- [ ] Smoke trails for projectiles
- [ ] Environmental destruction (bullet holes, craters)

---

## 📝 Implementation Checklist

- [x] Krapoovy beret generation (maroon-brown #8B4513, left side)
- [x] Military tactical gear design
- [x] Vityaz gold star insignia
- [x] Enemy sprite generation
- [x] Weapon sprite generation
- [x] Visual effects (blood, explosions, smoke)
- [x] Color palette definition
- [x] HUD design and implementation
- [ ] Additional animation frames
- [ ] High-resolution sprite variants
- [ ] Particle system enhancements
- [ ] Post-processing effects (bloom, glow)

---

**Last Updated**: December 15, 2025
**Status**: Graphics System v1.0 Complete
**Next Steps**: Animation enhancements and high-res sprite variants
