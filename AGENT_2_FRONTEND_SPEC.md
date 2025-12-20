# AGENT 2: Frontend/Game Developer Specification
## Phase 2.2 - Game Mechanics & Movement System

### 🎯 PRIMARY OBJECTIVE
Implement core game loop and player movement mechanics

### 📋 TASKS (Priority Order)

#### Task 2.1: Game Loop Architecture
```
□ Create GameEngine class with requestAnimationFrame
□ Implement update() loop (60 FPS target)
□ Add delta time calculation
□ Create Entity/GameObject base class
□ Add to src/game/engine.ts
```

#### Task 2.2: Player Movement
```
□ Implement keyboard input handler (WASD + arrows)
□ Create Player class extending Entity
□ Velocity-based movement system
□ Movement bounds/map edges
□ Update GameScene to use new engine
```

#### Task 2.3: Animation Integration
```
□ Create SpriteAnimator class
□ Load sprite sheets
□ Implement frame-based animation
□ Add idle/walk/run animations
□ Smooth animation transitions
```

#### Task 2.4: Testing & Documentation
```
□ Add tests for GameEngine (src/__tests__/GameEngine.test.tsx)
□ Add tests for Player movement
□ Document game architecture
□ Create GAME_ARCHITECTURE.md
```

### 📚 RESOURCES
- GameScene: `/frontend/src/components/GameScene.tsx`
- Canvas docs: MDN Canvas API
- Physics: https://www.html5gamedev.com/

### 🔗 DEPENDENCIES
- None (Agent 1 working in parallel)

### ✅ SUCCESS CRITERIA
- 60 FPS stable game loop
- Player moves smoothly with WASD
- Animations working
- Tests passing (>70% coverage for game module)

### 📤 DELIVERABLE
- src/game/engine.ts
- src/game/player.ts
- src/game/animator.ts
- Updated GameScene component
- Unit tests
- PR: "feat(game): Core game loop and movement"

### ⏱️ ESTIMATED TIME: 4-5 hours
