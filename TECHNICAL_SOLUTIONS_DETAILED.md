# 🛠️ VITYAZ-3D: TECHNICAL SOLUTIONS & CODE LIBRARY

## Дата создания: 19 декабря 2025
## Версия: 1.0.0 (Technical Deep Dive)

**Цель документа**: Собрать все технические решения, код, механики, графику, анимацию и оптимизации для создания лучшей тактической FPS игры.

---

## 📚 СОДЕРЖАНИЕ

1. [Babylon.js FPS Implementation](#1-babylonjs-fps-implementation)
2. [Physics Engines (Cannon.js, Ammo.js)](#2-physics-engines)
3. [Delta Time & Frame Independence](#3-delta-time--frame-independence)
4. [Weapon Animation & Recoil Systems](#4-weapon-animation--recoil-systems)
5. [Character Animation State Machine](#5-character-animation-state-machine)
6. [GPU Instancing & Performance](#6-gpu-instancing--performance)
7. [Multiplayer Netcode Architecture](#7-multiplayer-netcode-architecture)
8. [Lag Compensation Techniques](#8-lag-compensation-techniques)
9. [Client-Side Prediction](#9-client-side-prediction)
10. [Server-Side Anti-Cheat](#10-server-side-anti-cheat)
11. [3D Audio & Sound Design](#11-3d-audio--sound-design)
12. [Mobile Touch Controls](#12-mobile-touch-controls)
13. [Memory Management & Optimization](#13-memory-management--optimization)
14. [Advanced Graphics Techniques](#14-advanced-graphics-techniques)

---

## 1️⃣ BABYLON.JS FPS IMPLEMENTATION

### 1.1 Основная структура игры

```typescript
// app.ts - Главный файл приложения
class App {
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;
  private _scene: Scene;
  private _state: State;
  
  constructor() {
    // Создание canvas
    this._canvas = this._createCanvas();
    
    // Инициализация Babylon движка
    this._engine = new Engine(this._canvas, true);
    
    // Создание базовой сцены
    this._scene = new Scene(this._engine);
    
    // Запуск state machine
    this._state = State.START;
    this._main();
  }
  
  private _createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.id = "gameCanvas";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    document.body.appendChild(canvas);
    return canvas;
  }
  
  private async _main(): Promise<void> {
    await this._goToStart();
    
    // Render loop
    this._engine.runRenderLoop(() => {
      switch (this._state) {
        case State.START:
          this._scene.render();
          break;
        case State.GAME:
          this._scene.render();
          break;
        case State.LOSE:
          this._scene.render();
          break;
        default:
          break;
      }
    });
    
    // Resize handler
    window.addEventListener("resize", () => {
      this._engine.resize();
    });
  }
  
  private async _goToStart(): Promise<void> {
    this._engine.displayLoadingUI();
    
    // Создание стартовой сцены
    let scene = new Scene(this._engine);
    scene.clearColor = new Color4(0, 0, 0, 1);
    
    // Камера
    let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
    camera.setTarget(Vector3.Zero());
    
    // GUI
    const startUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const startBtn = Button.CreateSimpleButton("start", "START");
    startBtn.width = 0.2;
    startBtn.height = "40px";
    startBtn.color = "white";
    startBtn.thickness = 0;
    startUI.addControl(startBtn);
    
    // Кнопка запуска игры
    startBtn.onPointerDownObservable.add(() => {
      this._goToGame();
      scene.detachControl();
    });
    
    // Ждем загрузку сцены
    await scene.whenReadyAsync();
    this._engine.hideLoadingUI();
    
    // Переключаемся на стартовую сцену
    this._scene.dispose();
    this._scene = scene;
    this._state = State.START;
  }
  
  private async _goToGame(): Promise<void> {
    this._engine.displayLoadingUI();
    
    // Создание игровой сцены
    let scene = new Scene(this._engine);
    
    // 3D игровой мир
    const environment = new Environment(scene);
    await environment.load();
    
    // Игрок
    const player = new Player(scene);
    
    // Загружаем ресурсы
    await scene.whenReadyAsync();
    this._engine.hideLoadingUI();
    
    // Переключение на игровую сцену
    this._scene.dispose();
    this._scene = scene;
    this._state = State.GAME;
  }
}

// State enum
enum State {
  START = 0,
  GAME = 1,
  LOSE = 2,
}

// Инициализация приложения
new App();
```

### 1.2 FPS Camera Controller

```typescript
// fpsController.ts
class FPSController {
  private _camera: UniversalCamera;
  private _scene: Scene;
  private _canvas: HTMLCanvasElement;
  private _inputMap: { [key: string]: boolean } = {};
  
  // Параметры движения
  private readonly SPEED = 0.1;
  private readonly SPRINT_MULTIPLIER = 1.5;
  private readonly CROUCH_MULTIPLIER = 0.5;
  
  // Параметры мыши
  private readonly MOUSE_SENSITIVITY = 0.002;
  private readonly PITCH_LIMIT = Math.PI / 2 - 0.1; // 89 градусов
  
  // Состояние
  private _pitch: number = 0;
  private _yaw: number = 0;
  private _isSprinting: boolean = false;
  private _isCrouching: boolean = false;
  
  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this._scene = scene;
    this._canvas = canvas;
    
    // Создание камеры
    this._camera = new UniversalCamera(
      "fpsCamera",
      new Vector3(0, 1.8, 0), // Высота глаз игрока
      scene
    );
    
    this._camera.attachControl(canvas, true);
    this._camera.speed = this.SPEED;
    this._camera.angularSensibility = 1000; // Низкая чувствительность
    
    // Gravity and collisions
    this._camera.applyGravity = true;
    this._camera.checkCollisions = true;
    this._camera.ellipsoid = new Vector3(0.5, 0.9, 0.5); // Capsule collision
    
    // Pointer lock для мыши
    this._setupPointerLock();
    
    // Keyboard input
    this._setupKeyboardInput();
    
    // Mouse input
    this._setupMouseInput();
  }
  
  private _setupPointerLock(): void {
    this._canvas.addEventListener("click", () => {
      this._canvas.requestPointerLock();
    });
    
    document.addEventListener("pointerlockchange", () => {
      const locked = document.pointerLockElement === this._canvas;
      if (!locked) {
        // Pointer lock lost
      }
    });
  }
  
  private _setupKeyboardInput(): void {
    this._scene.actionManager = new ActionManager(this._scene);
    
    // Key down
    this._scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
        this._inputMap[evt.sourceEvent.key] = true;
      })
    );
    
    // Key up
    this._scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        this._inputMap[evt.sourceEvent.key] = false;
      })
    );
  }
  
  private _setupMouseInput(): void {
    this._scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
        const event = pointerInfo.event as PointerEvent;
        
        if (document.pointerLockElement === this._canvas) {
          // Yaw (horizontal)
          this._yaw -= event.movementX * this.MOUSE_SENSITIVITY;
          
          // Pitch (vertical)
          this._pitch -= event.movementY * this.MOUSE_SENSITIVITY;
          this._pitch = Math.max(
            -this.PITCH_LIMIT,
            Math.min(this.PITCH_LIMIT, this._pitch)
          );
          
          // Применяем rotation
          this._camera.rotation.x = this._pitch;
          this._camera.rotation.y = this._yaw;
        }
      }
    });
  }
  
  public update(deltaTime: number): void {
    // Sprint
    this._isSprinting = this._inputMap["Shift"] ?? false;
    
    // Crouch
    if (this._inputMap["Control"] && !this._isCrouching) {
      this._isCrouching = true;
      this._camera.position.y = 1.2; // Присел
    } else if (!this._inputMap["Control"] && this._isCrouching) {
      this._isCrouching = false;
      this._camera.position.y = 1.8; // Встал
    }
    
    // Скорость
    let currentSpeed = this.SPEED;
    if (this._isSprinting) {
      currentSpeed *= this.SPRINT_MULTIPLIER;
    }
    if (this._isCrouching) {
      currentSpeed *= this.CROUCH_MULTIPLIER;
    }
    
    // Движение (с deltaTime для frame independence)
    const velocity = new Vector3(0, 0, 0);
    
    if (this._inputMap["w"] || this._inputMap["W"]) {
      velocity.addInPlace(this._camera.getDirection(Vector3.Forward()));
    }
    if (this._inputMap["s"] || this._inputMap["S"]) {
      velocity.addInPlace(this._camera.getDirection(Vector3.Backward()));
    }
    if (this._inputMap["a"] || this._inputMap["A"]) {
      velocity.addInPlace(this._camera.getDirection(Vector3.Left()));
    }
    if (this._inputMap["d"] || this._inputMap["D"]) {
      velocity.addInPlace(this._camera.getDirection(Vector3.Right()));
    }
    
    // Нормализация + скорость + deltaTime
    if (velocity.length() > 0) {
      velocity.normalize();
      velocity.scaleInPlace(currentSpeed * deltaTime * 60); // 60fps baseline
      this._camera.position.addInPlace(velocity);
    }
  }
  
  public getCamera(): UniversalCamera {
    return this._camera;
  }
}
```

### 1.3 Базовый Environment Setup

```typescript
// environment.ts
class Environment {
  private _scene: Scene;
  
  constructor(scene: Scene) {
    this._scene = scene;
  }
  
  public async load(): Promise<void> {
    // Skybox
    const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this._scene);
    const skyboxMaterial = new StandardMaterial("skyBox", this._scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture(
      "textures/skybox",
      this._scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    
    // Освещение
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), this._scene);
    light.intensity = 0.7;
    
    // Земля с collision
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 100, height: 100 },
      this._scene
    );
    const groundMaterial = new StandardMaterial("groundMat", this._scene);
    groundMaterial.diffuseColor = new Color3(0.4, 0.4, 0.4);
    ground.material = groundMaterial;
    ground.checkCollisions = true;
    
    // Некоторые стены для теста collision
    const wall1 = MeshBuilder.CreateBox("wall1", { width: 20, height: 5, depth: 1 }, this._scene);
    wall1.position = new Vector3(0, 2.5, 10);
    wall1.checkCollisions = true;
    
    const wall2 = MeshBuilder.CreateBox("wall2", { width: 20, height: 5, depth: 1 }, this._scene);
    wall2.position = new Vector3(0, 2.5, -10);
    wall2.checkCollisions = true;
  }
}
```

---

## 2️⃣ PHYSICS ENGINES

### 2.1 Cannon.js Integration

```typescript
// physics.ts - Cannon.js setup
import * as CANNON from 'cannon';

class PhysicsWorld {
  public world: CANNON.World;
  private _scene: Scene;
  
  // Маппинг Babylon mesh -> Cannon body
  private _meshBodyMap: Map<Mesh, CANNON.Body> = new Map();
  
  constructor(scene: Scene) {
    this._scene = scene;
    
    // Создание физического мира
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0); // Гравитация
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;
    
    // Материалы и их взаимодействие
    this._setupMaterials();
  }
  
  private _setupMaterials(): void {
    // Материал для земли
    const groundMaterial = new CANNON.Material("groundMaterial");
    
    // Материал для игрока
    const playerMaterial = new CANNON.Material("playerMaterial");
    
    // Контакт между землей и игроком
    const playerGroundContact = new CANNON.ContactMaterial(
      groundMaterial,
      playerMaterial,
      {
        friction: 0.4,
        restitution: 0.0, // Без отскока
      }
    );
    
    this.world.addContactMaterial(playerGroundContact);
  }
  
  public addBox(
    mesh: Mesh,
    mass: number,
    position: Vector3,
    rotation: Quaternion = Quaternion.Identity()
  ): CANNON.Body {
    // Получаем размер меша
    const boundingInfo = mesh.getBoundingInfo();
    const size = boundingInfo.boundingBox.extendSize.scale(2);
    
    // Создаем Cannon shape
    const shape = new CANNON.Box(
      new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
    );
    
    // Создаем body
    const body = new CANNON.Body({
      mass: mass,
      shape: shape,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      quaternion: new CANNON.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w),
    });
    
    this.world.addBody(body);
    this._meshBodyMap.set(mesh, body);
    
    return body;
  }
  
  public addSphere(
    mesh: Mesh,
    mass: number,
    radius: number,
    position: Vector3
  ): CANNON.Body {
    const shape = new CANNON.Sphere(radius);
    
    const body = new CANNON.Body({
      mass: mass,
      shape: shape,
      position: new CANNON.Vec3(position.x, position.y, position.z),
    });
    
    this.world.addBody(body);
    this._meshBodyMap.set(mesh, body);
    
    return body;
  }
  
  public update(deltaTime: number): void {
    // Обновляем физический мир
    this.world.step(deltaTime);
    
    // Синхронизация Babylon mesh с Cannon body
    this._meshBodyMap.forEach((body, mesh) => {
      mesh.position.set(body.position.x, body.position.y, body.position.z);
      mesh.rotationQuaternion = new Quaternion(
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w
      );
    });
  }
  
  public applyImpulse(body: CANNON.Body, impulse: Vector3, point: Vector3): void {
    body.applyImpulse(
      new CANNON.Vec3(impulse.x, impulse.y, impulse.z),
      new CANNON.Vec3(point.x, point.y, point.z)
    );
  }
}
```

### 2.2 Ammo.js Alternative (Bullet Physics)

```typescript
// ammoPhysics.ts
class AmmoPhysicsWorld {
  private _physicsWorld: Ammo.btDiscreteDynamicsWorld;
  private _rigidBodies: Array<{ mesh: Mesh; body: Ammo.btRigidBody }> = [];
  
  constructor() {
    // Ammo.js initialization
    Ammo().then(() => {
      this._initPhysics();
    });
  }
  
  private _initPhysics(): void {
    // Collision configuration
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    
    // Create physics world
    this._physicsWorld = new Ammo.btDiscreteDynamicsWorld(
      dispatcher,
      overlappingPairCache,
      solver,
      collisionConfiguration
    );
    
    // Gravity
    this._physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0));
  }
  
  public createRigidBody(
    mesh: Mesh,
    mass: number,
    shape: Ammo.btCollisionShape,
    position: Vector3,
    quaternion: Quaternion
  ): Ammo.btRigidBody {
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(
      new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
    );
    
    const motionState = new Ammo.btDefaultMotionState(transform);
    
    const localInertia = new Ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass, localInertia);
    
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      shape,
      localInertia
    );
    const body = new Ammo.btRigidBody(rbInfo);
    
    this._physicsWorld.addRigidBody(body);
    this._rigidBodies.push({ mesh, body });
    
    return body;
  }
  
  public update(deltaTime: number): void {
    // Step simulation
    this._physicsWorld.stepSimulation(deltaTime, 10);
    
    // Sync meshes with rigid bodies
    const transform = new Ammo.btTransform();
    
    this._rigidBodies.forEach(({ mesh, body }) => {
      const motionState = body.getMotionState();
      if (motionState) {
        motionState.getWorldTransform(transform);
        const origin = transform.getOrigin();
        const rotation = transform.getRotation();
        
        mesh.position.set(origin.x(), origin.y(), origin.z());
        mesh.rotationQuaternion = new Quaternion(
          rotation.x(),
          rotation.y(),
          rotation.z(),
          rotation.w()
        );
      }
    });
  }
}
```

---

## 3️⃣ DELTA TIME & FRAME INDEPENDENCE

### 3.1 Delta Time Implementation

```typescript
// deltaTime.ts
class DeltaTimeManager {
  private _lastTime: number = 0;
  private _deltaTime: number = 0;
  private _targetFPS: number = 60;
  private _fixedTimeStep: number = 1 / 60; // 16.67ms
  
  constructor(targetFPS: number = 60) {
    this._targetFPS = targetFPS;
    this._fixedTimeStep = 1 / targetFPS;
    this._lastTime = performance.now();
  }
  
  public update(): number {
    const now = performance.now();
    this._deltaTime = (now - this._lastTime) / 1000; // Convert to seconds
    this._lastTime = now;
    
    // Clamp deltaTime to prevent huge jumps
    this._deltaTime = Math.min(this._deltaTime, 0.1); // Max 100ms
    
    return this._deltaTime;
  }
  
  public getDeltaTime(): number {
    return this._deltaTime;
  }
  
  public getFixedTimeStep(): number {
    return this._fixedTimeStep;
  }
  
  public getFPS(): number {
    return this._deltaTime > 0 ? 1 / this._deltaTime : 0;
  }
}

// Использование в game loop
class Game {
  private _deltaTimeManager: DeltaTimeManager;
  private _scene: Scene;
  private _engine: Engine;
  
  constructor() {
    this._deltaTimeManager = new DeltaTimeManager(60);
    
    // ... setup scene and engine
    
    this._engine.runRenderLoop(() => {
      const deltaTime = this._deltaTimeManager.update();
      this.update(deltaTime);
      this._scene.render();
    });
  }
  
  private update(deltaTime: number): void {
    // Все обновления должны использовать deltaTime
    
    // Пример движения
    const speed = 5.0; // units per second
    const movement = speed * deltaTime;
    
    // Теперь движение независимо от FPS!
    // При 60 FPS: movement = 5.0 * 0.0167 = 0.0835
    // При 30 FPS: movement = 5.0 * 0.0333 = 0.1665
    // Результат за 1 секунду одинаковый: 5 units
  }
}
```

### 3.2 Frame-Independent Movement

```typescript
// player.ts
class Player {
  private _position: Vector3;
  private _velocity: Vector3;
  private _acceleration: Vector3;
  
  // Константы (units per second)
  private readonly MAX_SPEED = 10.0;
  private readonly ACCELERATION = 30.0;
  private readonly FRICTION = 15.0;
  
  constructor() {
    this._position = Vector3.Zero();
    this._velocity = Vector3.Zero();
    this._acceleration = Vector3.Zero();
  }
  
  public update(deltaTime: number, inputDirection: Vector3): void {
    // 1. Применяем ускорение (frame-independent)
    if (inputDirection.length() > 0) {
      inputDirection.normalize();
      this._acceleration = inputDirection.scale(this.ACCELERATION);
    } else {
      this._acceleration = Vector3.Zero();
    }
    
    // 2. Обновляем скорость
    this._velocity.addInPlace(this._acceleration.scale(deltaTime));
    
    // 3. Применяем трение
    const friction = this._velocity.scale(-this.FRICTION * deltaTime);
    this._velocity.addInPlace(friction);
    
    // 4. Ограничиваем максимальную скорость
    if (this._velocity.length() > this.MAX_SPEED) {
      this._velocity.normalize().scaleInPlace(this.MAX_SPEED);
    }
    
    // 5. Обновляем позицию (frame-independent)
    this._position.addInPlace(this._velocity.scale(deltaTime));
  }
}
```

### 3.3 Fixed Timestep для Physics

```typescript
// fixedUpdate.ts
class FixedUpdateManager {
  private _accumulator: number = 0;
  private _fixedTimeStep: number = 1 / 60; // 60 Hz physics
  
  constructor(physicsHz: number = 60) {
    this._fixedTimeStep = 1 / physicsHz;
  }
  
  public update(deltaTime: number, fixedUpdateCallback: () => void): void {
    this._accumulator += deltaTime;
    
    // Fixed update loop
    while (this._accumulator >= this._fixedTimeStep) {
      fixedUpdateCallback();
      this._accumulator -= this._fixedTimeStep;
    }
  }
}

// Использование
class Game {
  private _fixedUpdateManager: FixedUpdateManager;
  private _physicsWorld: PhysicsWorld;
  
  constructor() {
    this._fixedUpdateManager = new FixedUpdateManager(60);
  }
  
  private update(deltaTime: number): void {
    // Визуальное обновление (variable timestep)
    this.updateVisuals(deltaTime);
    
    // Физика (fixed timestep)
    this._fixedUpdateManager.update(deltaTime, () => {
      this._physicsWorld.update(this._fixedUpdateManager.getFixedTimeStep());
    });
  }
}
```

---

## 4️⃣ WEAPON ANIMATION & RECOIL SYSTEMS

### 4.1 Procedural Weapon Recoil

```typescript
// weaponRecoil.ts
class WeaponRecoil {
  private _weapon: Mesh;
  private _camera: Camera;
  
  // Recoil parameters
  private _recoilAmount: Vector3 = Vector3.Zero();
  private _recoilTarget: Vector3 = Vector3.Zero();
  private _recoilSmoothing: number = 10.0;
  
  // Weapon sway
  private _swayAmount: Vector2 = Vector2.Zero();
  private _swaySmoothing: number = 5.0;
  
  // Recoil pattern
  private _recoilPattern: Array<Vector2> = [
    new Vector2(0, 0.5),   // Первый выстрел - вверх
    new Vector2(-0.2, 0.4), // Второй - влево-вверх
    new Vector2(0.2, 0.3),  // Третий - вправо-вверх
    new Vector2(-0.1, 0.3), // И так далее...
    new Vector2(0.1, 0.2),
  ];
  private _currentShotInBurst: number = 0;
  
  constructor(weapon: Mesh, camera: Camera) {
    this._weapon = weapon;
    this._camera = camera;
  }
  
  public applyRecoil(deltaTime: number): void {
    // Get recoil pattern
    const patternIndex = this._currentShotInBurst % this._recoilPattern.length;
    const recoilPattern = this._recoilPattern[patternIndex];
    
    // Recoil direction (camera kick)
    this._recoilTarget.x += recoilPattern.x * 0.02; // Horizontal recoil
    this._recoilTarget.y += recoilPattern.y * 0.03; // Vertical recoil
    
    // Weapon position recoil
    this._weapon.position.z -= 0.05; // Kick back
    this._weapon.position.y += 0.02; // Lift up
    
    this._currentShotInBurst++;
    
    // Optional: Muzzle flash, sound, etc.
    this._playMuzzleFlash();
  }
  
  public update(deltaTime: number, mouseMovement: Vector2): void {
    // Smooth recoil recovery
    this._recoilAmount = Vector3.Lerp(
      this._recoilAmount,
      this._recoilTarget,
      this._recoilSmoothing * deltaTime
    );
    
    // Apply recoil to camera
    this._camera.rotation.x += this._recoilAmount.y;
    this._camera.rotation.y += this._recoilAmount.x;
    
    // Decay recoil target
    this._recoilTarget = Vector3.Lerp(
      this._recoilTarget,
      Vector3.Zero(),
      this._recoilSmoothing * deltaTime
    );
    
    // Weapon sway (follows mouse slightly)
    const targetSway = new Vector2(
      mouseMovement.x * 0.001,
      mouseMovement.y * 0.001
    );
    
    this._swayAmount = Vector2.Lerp(
      this._swayAmount,
      targetSway,
      this._swaySmoothing * deltaTime
    );
    
    // Apply sway to weapon
    this._weapon.rotation.x += this._swayAmount.y * 0.5;
    this._weapon.rotation.y += this._swayAmount.x * 0.5;
    
    // Reset weapon position smoothly
    this._weapon.position.z = Scalar.Lerp(
      this._weapon.position.z,
      0,
      8.0 * deltaTime
    );
    this._weapon.position.y = Scalar.Lerp(
      this._weapon.position.y,
      0,
      8.0 * deltaTime
    );
  }
  
  public resetBurst(): void {
    this._currentShotInBurst = 0;
  }
  
  private _playMuzzleFlash(): void {
    // Add particle system for muzzle flash
    // Add light flash
    // Play sound
  }
}
```

### 4.2 Animation-Based Recoil

```typescript
// animatedRecoil.ts
class AnimatedWeaponRecoil {
  private _weapon: Mesh;
  private _animationGroup: AnimationGroup;
  
  // Animation clips
  private _idleAnim: AnimationGroup;
  private _fireAnim: AnimationGroup;
  private _reloadAnim: AnimationGroup;
  private _aimAnim: AnimationGroup;
  
  // State
  private _currentState: WeaponState = WeaponState.IDLE;
  
  constructor(weapon: Mesh, animationGroups: AnimationGroup[]) {
    this._weapon = weapon;
    
    // Find animation groups by name
    this._idleAnim = animationGroups.find(ag => ag.name === "Idle");
    this._fireAnim = animationGroups.find(ag => ag.name === "Fire");
    this._reloadAnim = animationGroups.find(ag => ag.name === "Reload");
    this._aimAnim = animationGroups.find(ag => ag.name === "Aim");
    
    // Play idle by default
    this.setState(WeaponState.IDLE);
  }
  
  public setState(state: WeaponState): void {
    if (this._currentState === state) return;
    
    // Stop current animation
    this._stopCurrentAnimation();
    
    // Play new animation
    switch (state) {
      case WeaponState.IDLE:
        this._idleAnim?.play(true);
        break;
      case WeaponState.FIRING:
        this._fireAnim?.play(false);
        // Return to idle after fire animation
        this._fireAnim?.onAnimationGroupEndObservable.addOnce(() => {
          this.setState(WeaponState.IDLE);
        });
        break;
      case WeaponState.RELOADING:
        this._reloadAnim?.play(false);
        this._reloadAnim?.onAnimationGroupEndObservable.addOnce(() => {
          this.setState(WeaponState.IDLE);
        });
        break;
      case WeaponState.AIMING:
        this._aimAnim?.play(true);
        break;
    }
    
    this._currentState = state;
  }
  
  private _stopCurrentAnimation(): void {
    this._idleAnim?.stop();
    this._fireAnim?.stop();
    this._reloadAnim?.stop();
    this._aimAnim?.stop();
  }
  
  public fire(): void {
    if (this._currentState === WeaponState.FIRING || 
        this._currentState === WeaponState.RELOADING) {
      return; // Can't fire while already firing or reloading
    }
    
    this.setState(WeaponState.FIRING);
  }
  
  public reload(): void {
    if (this._currentState === WeaponState.RELOADING) {
      return; // Already reloading
    }
    
    this.setState(WeaponState.RELOADING);
  }
}

enum WeaponState {
  IDLE,
  FIRING,
  RELOADING,
  AIMING,
}
```

---

## 5️⃣ CHARACTER ANIMATION STATE MACHINE

### 5.1 Character Controller with Animations

```typescript
// characterController.ts
class CharacterController {
  private _character: Mesh;
  private _skeleton: Skeleton;
  private _scene: Scene;
  
  // Animation groups
  private _animations: Map<string, AnimationGroup> = new Map();
  
  // State machine
  private _currentState: CharacterState = CharacterState.IDLE;
  private _previousState: CharacterState = CharacterState.IDLE;
  
  // Movement
  private _velocity: Vector3 = Vector3.Zero();
  private _isGrounded: boolean = true;
  
  constructor(scene: Scene) {
    this._scene = scene;
    this._loadCharacter();
  }
  
  private async _loadCharacter(): Promise<void> {
    // Load character model with animations
    const result = await SceneLoader.ImportMeshAsync(
      "",
      "https://assets.babylonjs.com/meshes/",
      "HVGirl.glb",
      this._scene
    );
    
    this._character = result.meshes[0] as Mesh;
    this._skeleton = result.skeletons[0];
    
    // Scale character
    this._character.scaling.scaleInPlace(0.1);
    
    // Setup animations
    result.animationGroups.forEach((ag) => {
      this._animations.set(ag.name, ag);
      ag.stop(); // Stop all animations initially
    });
    
    // Play idle animation
    this._playAnimation("Idle", true);
  }
  
  public update(deltaTime: number, inputMap: { [key: string]: boolean }): void {
    // Determine new state based on input
    let newState = this._determineState(inputMap);
    
    // State transitions
    if (newState !== this._currentState) {
      this._transitionToState(newState);
    }
    
    // Update movement
    this._updateMovement(deltaTime, inputMap);
  }
  
  private _determineState(inputMap: { [key: string]: boolean }): CharacterState {
    // Jump
    if (inputMap["Space"] && this._isGrounded) {
      return CharacterState.JUMPING;
    }
    
    // Check if moving
    const isMoving = inputMap["w"] || inputMap["s"] || inputMap["a"] || inputMap["d"];
    
    if (!isMoving) {
      return CharacterState.IDLE;
    }
    
    // Sprint
    if (inputMap["Shift"]) {
      return CharacterState.RUNNING;
    }
    
    // Walk
    if (inputMap["s"]) {
      return CharacterState.WALK_BACK;
    }
    
    return CharacterState.WALKING;
  }
  
  private _transitionToState(newState: CharacterState): void {
    console.log(`Transition: ${CharacterState[this._currentState]} -> ${CharacterState[newState]}`);
    
    this._previousState = this._currentState;
    this._currentState = newState;
    
    // Play appropriate animation
    switch (newState) {
      case CharacterState.IDLE:
        this._playAnimation("Idle", true);
        break;
      case CharacterState.WALKING:
        this._playAnimation("Walk", true);
        break;
      case CharacterState.RUNNING:
        this._playAnimation("Run", true);
        break;
      case CharacterState.WALK_BACK:
        this._playAnimation("WalkBack", true);
        break;
      case CharacterState.JUMPING:
        this._playAnimation("Jump", false);
        // Return to idle/walk after jump
        const jumpAnim = this._animations.get("Jump");
        jumpAnim?.onAnimationGroupEndObservable.addOnce(() => {
          this._isGrounded = true;
          this._transitionToState(CharacterState.IDLE);
        });
        break;
    }
  }
  
  private _playAnimation(name: string, loop: boolean): void {
    // Stop all animations
    this._animations.forEach((anim) => anim.stop());
    
    // Play requested animation
    const anim = this._animations.get(name);
    if (anim) {
      anim.start(loop, 1.0, anim.from, anim.to, false);
    }
  }
  
  private _updateMovement(deltaTime: number, inputMap: { [key: string]: boolean }): void {
    const speed = this._currentState === CharacterState.RUNNING ? 10.0 : 5.0;
    const direction = Vector3.Zero();
    
    if (inputMap["w"]) direction.z += 1;
    if (inputMap["s"]) direction.z -= 1;
    if (inputMap["a"]) direction.x -= 1;
    if (inputMap["d"]) direction.x += 1;
    
    if (direction.length() > 0) {
      direction.normalize();
      this._velocity = direction.scale(speed);
      
      // Rotate character to face movement direction
      const angle = Math.atan2(direction.x, direction.z);
      this._character.rotation.y = angle;
    } else {
      this._velocity = Vector3.Zero();
    }
    
    // Apply movement
    this._character.position.addInPlace(this._velocity.scale(deltaTime));
  }
}

enum CharacterState {
  IDLE,
  WALKING,
  RUNNING,
  WALK_BACK,
  JUMPING,
  FALLING,
}
```

### 5.2 Animation Blending

```typescript
// animationBlender.ts
class AnimationBlender {
  private _skeleton: Skeleton;
  private _blendDuration: number = 0.2; // 200ms blend
  
  constructor(skeleton: Skeleton) {
    this._skeleton = skeleton;
  }
  
  public blendTo(
    fromAnim: AnimationGroup,
    toAnim: AnimationGroup,
    duration: number = this._blendDuration
  ): void {
    // Stop from animation
    fromAnim.stop();
    
    // Start to animation with weight 0
    toAnim.start(true, 1.0, toAnim.from, toAnim.to, false);
    toAnim.setWeightForAllAnimatables(0);
    
    // Animate weight from 0 to 1
    Animation.CreateAndStartAnimation(
      "blendWeight",
      toAnim,
      "weight",
      60,
      duration * 60,
      0,
      1,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
  }
}
```

---

*Продолжение следует...*

**Следующие секции:**
- 6️⃣ GPU Instancing & Performance
- 7️⃣ Multiplayer Netcode Architecture
- 8️⃣ Lag Compensation Techniques
- 9️⃣ Client-Side Prediction
- 🔟 Server-Side Anti-Cheat

**Документ будет дополнен всеми оставшимися секциями с примерами кода!**

---

## 📚 ИСТОЧНИКИ

- Babylon.js Official Documentation
- Valve Source Multiplayer Networking
- Gabriel Gambetta's Multiplayer Articles
- Unity/Unreal Engine Best Practices
- CS:GO, Valorant, Tarkov Technical Postmortems
