# 🎯 BABYLON.JS 3D ARCHITECTURE GUIDE

**Version**: 1.0.0  
**Engine**: Babylon.js 6.0+  
**Date**: December 19, 2025  

---

## 🏗️ OVERVIEW

VITYAZ Special Operations uses **Babylon.js 6.0+** as its 3D game engine. This document describes the complete architecture, implementation details, and best practices for maintaining and extending the 3D game system.

> **Note**: Previous documentation incorrectly referenced Phaser 3. This has been corrected. Babylon.js is the actual 3D engine used.

---

## 📊 TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Scene Management](#scene-management)
3. [Entity System](#entity-system)
4. [Rendering Pipeline](#rendering-pipeline)
5. [Input Handling](#input-handling)
6. [Physics & Collision](#physics--collision)
7. [Performance Optimization](#performance-optimization)
8. [Common Issues & Solutions](#common-issues--solutions)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ ARCHITECTURE OVERVIEW

### High-Level Architecture

```
┌────────────────────────────────┐
│ React Application                               │
│ (UI/Menu/Settings)                             │
└────────────────────────────────┘
        │ Props/State
        │
┌────▼───────────────────────────┐
│ GameCanvas Component                            │
│ <canvas id="babylon-canvas">                    │
└────┬───────────────────────────┘
        │
        │ Ref
        │
┌────▼───────────────────────────┐
│ GameScene3D                                     │
│ - Engine Management                             │
│ - Scene Initialization                          │
│ - Game Loop                                     │
│ - Input Management                              │
└────┬───────────────────────────┘
        │
    ┌─────────┴───────────────┐
    │                        │
┌─▼──────────┐  ┌─▼─────────┐  ┌─▼────────┐
│ Player Entity      │  │ Enemy Entities    │  │ Projectiles   │
│ - Position        │  │ - AI Behavior    │  │ - Physics     │
│ - Movement        │  │ - Wave Spawning  │  │ - Collision   │
│ - Health          │  │ - Damage        │  │ - Lifetime    │
└───────────┐  └─────────┘  └────────┘
```

### Key Components

| Component | File | Responsibility |
|-----------|------|----------------|
| **GameScene3D** | `game3d/scenes/GameScene3D.ts` | Main game logic, scene management, input handling |
| **Player** | `game3d/entities/Player.ts` | Player character, movement, health |
| **Enemy** | `game3d/entities/Enemy.ts` | Enemy AI, behavior, health |
| **Projectile** | `game3d/entities/Projectile.ts` | Projectile physics, collision, lifetime |
| **GameHUD** | `game3d/ui/GameHUD.ts` | UI overlays, health/score display |
| **Constants** | `game3d/utils/constants.ts` | Game configuration, colors, physics values |

---

## 🏗️ SCENE MANAGEMENT

### Scene Initialization (GameScene3D.ts)

```typescript
constructor(canvas: HTMLCanvasElement, engine: BABYLON.Engine) {
  this.canvas = canvas
  this.engine = engine
  this.scene = new BABYLON.Scene(engine)
  
  // Initialize all components synchronously
  this.setupScene()        // Lights, camera, ground, player
  this.setupInput()        // Keyboard & mouse handlers
  this.startGameLoop()     // Main render loop
}
```

### Scene Components

#### 1. Lighting
```typescript
const light = new BABYLON.HemisphericLight(
  'light',
  new BABYLON.Vector3(1, 1, 1),
  this.scene
)
light.intensity = 0.7
```

**Why Hemispheric Light?**
- Simulates sky light + ground reflection
- Better for outdoor environments
- Less performance intensive than multiple lights
- Provides good visibility for all game objects

#### 2. Skybox (Environment)
```typescript
const skybox = BABYLON.MeshBuilder.CreateBox(
  'skybox',
  { size: 1000 },
  this.scene
)
const skyMaterial = new BABYLON.StandardMaterial('skyMat', this.scene)
skyMaterial.emissiveColor = new BABYLON.Color3(
  COLORS.SKY.r,
  COLORS.SKY.g,
  COLORS.SKY.b
)
skybox.material = skyMaterial
```

#### 3. Ground Plane
```typescript
const ground = BABYLON.MeshBuilder.CreateGround(
  'ground',
  { width: 200, height: 200 },
  this.scene
)
const groundMat = new BABYLON.StandardMaterial('groundMat', this.scene)
groundMat.emissiveColor = new BABYLON.Color3(
  COLORS.GROUND.r,
  COLORS.GROUND.g,
  COLORS.GROUND.b
)
ground.material = groundMat
```

#### 4. Camera Setup
```typescript
this.camera = new BABYLON.UniversalCamera(
  'camera',
  new BABYLON.Vector3(0, 2, -10),
  this.scene
)
this.camera.attachControl(this.canvas, true)
this.camera.inertia = 0.7           // Smooth mouse movement
this.camera.angularSensibility = 1000 // Mouse sensitivity
```

### Camera Movement (Follow Player)

```typescript
private update() {
  if (this.player && this.camera) {
    // Camera follows player position + offset (eye height)
    this.camera.position = this.player.mesh.position.add(
      new BABYLON.Vector3(0, 1.5, 0) // Eye height offset
    )
  }
}
```

---

## 🏗️ ENTITY SYSTEM

### Entity Base Architecture

All entities (Player, Enemy, Projectile) follow a common pattern:

```typescript
class Entity {
  mesh: BABYLON.Mesh        // Visual representation
  position: Vector3         // Current position
  health: number            // Current health
  maxHealth: number         // Maximum health
  
  constructor(scene: BABYLON.Scene) {
    // Create mesh
    // Apply material
    // Initialize health
  }
  
  update(deltaTime: number): void {
    // Update position, animation, state
  }
  
  takeDamage(amount: number): void {
    // Reduce health
  }
  
  dispose(): void {
    // Clean up mesh and resources
  }
}
```

### Player Entity (Player.ts)

**Key Features:**
- **Position**: Vector3 (x, y, z)
- **Health System**: Current health + max health
- **Movement**: WASD input with delta-time scaling
- **Speed**: Configurable movement speed

**Delta-time Movement (Frame-rate Independent):**

```typescript
update(inputMap: { [key: string]: boolean }, deltaTime: number = 16.67) {
  const moveVector = new BABYLON.Vector3(0, 0, 0)
  
  // Collect input
  if (inputMap['W']) moveVector.z += 1
  if (inputMap['S']) moveVector.z -= 1
  if (inputMap['A']) moveVector.x -= 1
  if (inputMap['D']) moveVector.x += 1
  
  // Normalize and move
  if (moveVector.length() > 0) {
    moveVector.normalize()
    // deltaTime is milliseconds, divide by 1000 to get seconds
    this.mesh.position.addInPlace(
      moveVector.scale((this.speed * deltaTime) / 1000)
    )
  }
}
```

**Why Delta-time?**
- Movement is independent of frame rate
- If FPS drops from 60 to 30, movement speed stays the same
- Formula: `distance = speed * (deltaTime / 1000)`

### Enemy Entity (Enemy.ts)

**Key Features:**
- **AI Behavior**: Chases player
- **Variants**: Basic and Tank types
- **Attack System**: Cooldown-based damage
- **Wave Progression**: Gets stronger in later waves

**Enemy AI Update:**

```typescript
update(playerPosition: Vector3, deltaTime: number): void {
  // Calculate direction to player
  const direction = BABYLON.Vector3.Normalize(
    playerPosition.subtract(this.mesh.position)
  )
  
  // Move toward player
  const movement = direction.scale(
    (this.speed * deltaTime) / 1000
  )
  this.mesh.position.addInPlace(movement)
}
```

### Projectile Entity (Projectile.ts)

**Key Features:**
- **Physics**: Linear movement in direction
- **Lifetime**: Auto-disposal after time
- **Damage**: Carries damage value
- **Collision**: Disposed on hit

**Projectile Movement:**

```typescript
update(deltaTime: number): boolean {
  // Move in direction
  this.mesh.position.addInPlace(
    this.direction.scale((this.speed * deltaTime) / 1000)
  )
  
  // Check lifetime
  this.lifetime -= deltaTime
  if (this.lifetime <= 0) {
    this.dispose()
    return false // Signal to remove from array
  }
  
  return true // Still active
}
```

---

## 🏗️ RENDERING PIPELINE

### Main Game Loop

```typescript
private startGameLoop() {
  this.engine.runRenderLoop(() => {
    if (this.gameActive) {
      this.update()        // Game logic
    }
    this.scene.render()    // Babylon.js rendering
  })
}
```

### Update Sequence

1. **Calculate Delta Time**
   ```typescript
   const now = Date.now()
   const deltaTime = now - this.lastFrameTime
   this.lastFrameTime = now
   ```

2. **Update Entities**
   ```typescript
   this.player.update(this.inputMap, deltaTime)
   this.enemies.forEach(enemy => enemy.update(...))
   this.projectiles = this.projectiles.filter(p => p.update(deltaTime))
   ```

3. **Check Collisions**
   ```typescript
   this.checkCollisions()  // Projectile-Enemy, Enemy-Player
   ```

4. **Update Game State**
   ```typescript
   if (this.enemies.length === 0) this.spawnWave() // Next wave
   if (this.player.health <= 0) this.gameOver()    // Game over
   ```

5. **Update HUD**
   ```typescript
   this.hud.updateHealth(this.player.health, this.player.maxHealth)
   this.hud.updateScore(this.score)
   this.hud.updateWave(this.wave)
   ```

6. **Babylon.js Renders Scene**
   - Clears canvas
   - Renders all meshes
   - Applies lighting
   - Displays HUD overlay

---

## 📑 INPUT HANDLING

### Keyboard Input (WASD + Space)

```typescript
private setupInput() {
  this.scene.onKeyboardObservable.add((kbInfo) => {
    const key = kbInfo.event.key.toUpperCase()
    
    if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
      this.inputMap[key] = true
    } else if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
      this.inputMap[key] = false
    }
  })
}
```

### Mouse Input (Camera + Shooting)

```typescript
this.scene.onPointerObservable.add((pointerInfo) => {
  // Mouse move: camera look
  if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
    this.mousePos = {
      x: pointerInfo.event.clientX,
      y: pointerInfo.event.clientY,
    }
  }
  
  // Mouse click: shoot
  if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
    this.shoot()
  }
})
```

### Input Mapping

```typescript
interface InputMap {
  [key: string]: boolean  // true = key pressed, false = released
}

// Example:
this.inputMap = {
  'W': true,   // Moving forward
  'A': false,  // Not moving left
  'D': true,   // Moving right
  'S': false,  // Not moving backward
}
```

---

## 📑 PHYSICS & COLLISION

### Collision Detection

**Method**: Distance-based collision (simplified physics)

```typescript
private checkCollisions() {
  // Projectile vs Enemy
  for (let i = this.projectiles.length - 1; i >= 0; i--) {
    const projectile = this.projectiles[i]
    
    for (let j = this.enemies.length - 1; j >= 0; j--) {
      const enemy = this.enemies[j]
      
      // Calculate distance between meshes
      const distance = BABYLON.Vector3.Distance(
        projectile.mesh.position,
        enemy.mesh.position
      )
      
      // COLLISION_DISTANCE = 1.0 unit radius
      if (distance < GAME_CONFIG.COLLISION_DISTANCE) {
        // Hit detected
        enemy.takeDamage(projectile.damage)
        projectile.dispose()
        // Remove from arrays
      }
    }
  }
}
```

### Vector3 Distance Calculation

```
Distance = sqrt((x2-x1)² + (y2-y1)² + (z2-z1)²)

Example:
Player at (0, 1, 0)
Enemy at (0.5, 1, 0)
Distance = sqrt(0.5² + 0² + 0²) = 0.5
```

### Attack Cooldown System

**Problem**: Enemies spam damage too fast  
**Solution**: Attack cooldown between hits

```typescript
// In Enemy class
lastHitTime: number = 0

// In GameScene3D.checkCollisions()
if (now - enemy.lastHitTime > GAME_CONFIG.ENEMY_ATTACK_COOLDOWN) {
  this.player.takeDamage(enemy.damage)
  enemy.lastHitTime = now  // Reset cooldown timer
}
```

---

## 💡 PERFORMANCE OPTIMIZATION

### 1. Object Pooling (Future Implementation)

```typescript
// Instead of creating/destroying projectiles:
// Create pool at start
projectilePool = new ObjectPool(Projectile, 100)

// Reuse instead of create
const projectile = projectilePool.acquire()
projectile.reset(startPos, direction)

// Return to pool instead of destroy
projectilePool.release(projectile)
```

### 2. Efficient Collision Detection

```typescript
// Current: O(n * m) - checks all projectiles vs all enemies
// Better: Spatial hashing with grid
const grid = new SpatialGrid()
grid.insert(enemies)
grid.insert(projectiles)

for (const projectile of projectiles) {
  const nearby = grid.getNearby(projectile.position)
  // Only check projectile vs nearby enemies
}
```

### 3. Draw Call Optimization

```typescript
// Multiple small meshes = many draw calls
const enemy1 = CreateBox()  // Draw call
const enemy2 = CreateBox()  // Draw call
// ...

// Better: Instance rendering
const enemyTemplate = CreateBox()
const enemy1 = new BABYLON.InstancedMesh('enemy1', enemyTemplate)
const enemy2 = new BABYLON.InstancedMesh('enemy2', enemyTemplate)
// Same mesh, different positions
```

### 4. Memory Management

```typescript
private checkCollisions() {
  // Bad: Creates new objects each frame
  const temp = new BABYLON.Vector3()
  
  // Good: Reuse vectors
  private readonly tempVec = new BABYLON.Vector3()
}
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: Camera Jitters
**Cause**: deltaTime too large or inertia too high  
**Solution**:
```typescript
this.camera.inertia = 0.7           // Lower = tighter control
this.camera.angularSensibility = 1000 // Higher = slower turn
```

### Issue 2: Enemy Passes Through Player
**Cause**: Collision distance too small  
**Solution**:
```typescript
COLLISION_DISTANCE = 1.5  // Increase collision radius
```

### Issue 3: Projectiles Move Too Fast
**Cause**: Speed constant too high  
**Solution**:
```typescript
PROJECTILE_SPEED = 20  // Reduce speed value
// Formula: distance = speed * (deltaTime / 1000)
// At 60 FPS: distance = 20 * (16.67 / 1000) = 0.33 units
```

### Issue 4: FPS Drops
**Cause**: Too many enemies or complex scene  
**Solution**:
```typescript
// Reduce enemy count
INITIAL_ENEMIES_PER_WAVE = 5

// Use level of detail
const enemyLOD = new BABYLON.LODLevel(distance, lodMesh)
enemy.addLODLevel(enemyLOD)

// Disable physics where not needed
// Use occlusion culling for large scenes
```

---

## 🆘 TROUBLESHOOTING

### Debug Mode

```typescript
// Enable Babylon.js debug layer
scene.debugLayer.show({
  overlay: true,
  enableClose: true,
  handleResize: true,
  globalrulers: false
})

// View mesh properties
console.log(this.player.mesh.position)
console.log(this.camera.position)
```

### Performance Profiling

```typescript
// Measure frame time
const t0 = performance.now()
this.update()
const t1 = performance.now()
console.log(`Update took ${(t1 - t0).toFixed(2)}ms`)

// Monitor draw calls
console.log(this.engine.drawCalls)
```

### Common Console Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot read property 'position' of null` | Entity not initialized | Check constructor |
| `Vector3 is not defined` | Import missing | Add `import * as BABYLON from 'babylon.js'` |
| `WebGL context lost` | GPU issue | Restart browser |
| `Out of memory` | Memory leak | Check dispose() calls |

---

## 🛠️ EXTENDING THE ENGINE

### Adding New Entity Type

```typescript
// Create new file: PowerUp.ts
export default class PowerUp {
  mesh: BABYLON.Mesh
  type: 'health' | 'ammo' | 'shield'
  lifetime: number = 10000 // 10 seconds
  
  constructor(scene: BABYLON.Scene, position: Vector3, type: string) {
    this.type = type
    this.mesh = BABYLON.MeshBuilder.CreateSphere('powerup', { diameter: 0.5 }, scene)
    this.mesh.position = position
  }
  
  update(deltaTime: number): boolean {
    this.lifetime -= deltaTime
    return this.lifetime > 0
  }
  
  dispose() {
    this.mesh.dispose()
  }
}
```

### Adding New Game Mode

```typescript
// In GameScene3D.ts
enum GameMode {
  WAVE_SURVIVAL = 'wave_survival',
  TIME_ATTACK = 'time_attack',
  BOSS_BATTLE = 'boss_battle'
}

private mode: GameMode = GameMode.WAVE_SURVIVAL

private update() {
  switch (this.mode) {
    case GameMode.WAVE_SURVIVAL:
      this.updateWaveSurvival()
      break
    case GameMode.TIME_ATTACK:
      this.updateTimeAttack()
      break
    // ...
  }
}
```

---

## 🏛️ BABYLON.JS RESOURCES

### Official Documentation
- **[Babylon.js Main Site](https://www.babylonjs.com/)**
- **[API Documentation](https://doc.babylonjs.com/)**
- **[Playground](https://www.babylonjs-playground.com/)** - Interactive examples

### Community
- **[Forum](https://forum.babylonjs.com/)**
- **[GitHub Issues](https://github.com/BabylonJS/Babylon.js/issues)**
- **[Discord](https://discord.gg/babylonjs)**

### Learning Resources
- **[Getting Started Guide](https://doc.babylonjs.com/features/featuresDeepDive/Mesh/mesh_creation)**
- **[Physics Tutorial](https://doc.babylonjs.com/features/featuresDeepDive/Physics)**
- **[Performance Tips](https://doc.babylonjs.com/features/featuresDeepDive/Optimizations)**

---

## 🆗️ VERSION HISTORY

| Version | Date | Changes |
|---------|------|----------|
| 1.0.0 | Dec 19, 2025 | Initial Babylon.js implementation |
| - | - | GameScene3D, Player, Enemy, Projectile entities |
| - | - | Lag compensation ready |
| - | - | Frame-rate independent movement |
| 1.1.0 | - | Server-side validation, anti-cheat |
| 2.0.0 | - | Native mobile apps, advanced AI |

---

**VITYAZ Special Operations**  
**Babylon.js 3D Architecture**  
**© 2025 - All rights reserved**