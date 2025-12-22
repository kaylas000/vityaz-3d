# 📋 ПОЛНЫЙ ПЛАН ВНЕДРЕНИЯ ГРАФИКИ И АНИМАЦИИ

**Проект:** VITYAZ Special Operations  
**Дата создания:** 22 декабря 2025  
**Статус:** Ready for Implementation  
**Сложность:** Средняя  
**Время реализации:** 2-3 недели  

---

## 📑 СОДЕРЖАНИЕ

1. [Фаза 0: Подготовка (День 1)](#фаза-0-подготовка)
2. [Фаза 1: Настройка Babylon.js (Дни 2-3)](#фаза-1-настройка-babylonjs)
3. [Фаза 2: Загрузка 3D моделей (Дни 4-5)](#фаза-2-загрузка-3d-моделей)
4. [Фаза 3: Система анимаций (Дни 6-8)](#фаза-3-система-анимаций)
5. [Фаза 4: Интеграция врагов (Дни 9-10)](#фаза-4-интеграция-врагов)
6. [Фаза 5: Боевая система (Дни 11-13)](#фаза-5-боевая-система)
7. [Фаза 6: Оптимизация (Дни 14-15)](#фаза-6-оптимизация)
8. [Чек-лист ошибок и их исправления](#чек-лист-ошибок)

---

## 🔧 ФАЗА 0: ПОДГОТОВКА

### День 1

#### ✅ Задача 1.1: Обновить зависимости

**Что делать:**
```bash
cd vityaz-3d
npm update
npm install babylonjs@latest babylonjs-loaders@latest
npm install --save-dev @types/babylonjs
```

**Возможные ошибки и исправления:**

❌ **Ошибка:** "Cannot find module 'babylonjs'"
```bash
✅ Исправить:
rm -rf node_modules package-lock.json
npm install
```

❌ **Ошибка:** "Type mismatch in Babylon.js version"
```bash
✅ Исправить:
npm install babylonjs@6.0.0 --legacy-peer-deps
```

**Проверка:**
```bash
npm list babylonjs
# Должно показать: babylonjs@6.0.0 (или выше)
```

---

#### ✅ Задача 1.2: Создать структуру папок

**Что делать:**
```bash
# Создать необходимые папки
mkdir -p frontend/src/assets/models
mkdir -p frontend/src/assets/textures
mkdir -p frontend/src/assets/animations
mkdir -p frontend/src/game3d/models
mkdir -p frontend/src/game3d/animations
mkdir -p frontend/src/game3d/loaders
mkdir -p frontend/src/types/babylon
```

**Проверка:**
```bash
ls -la frontend/src/assets/
# Должны быть: models/, textures/, animations/
```

---

#### ✅ Задача 1.3: Скачать готовые модели

**Что делать:**

1. **Скачать солдата:**
   - Открыть: https://sketchfab.com/3d-models?q=soldier&license=free
   - Найти: "Military RTS Character 1 (CC0)"
   - Скачать: GLB формат
   - Сохранить: `frontend/src/assets/models/soldier.glb`

2. **Скачать оружие:**
   - Открыть: https://kenney.nl/assets/military-asset-pack
   - Скачать: ZIP
   - Распаковать в: `frontend/src/assets/models/weapons/`

3. **Скачать окружение:**
   - Открыть: https://kenney.nl/assets/city-kit
   - Скачать: ZIP
   - Распаковать в: `frontend/src/assets/models/environment/`

**Проверка:**
```bash
ls -la frontend/src/assets/models/
# Должны быть файлы .glb, .obj
```

**Возможные ошибки:**

❌ **Ошибка:** "Скачанные файлы повреждены"
```
✅ Исправить:
1. Удалить файл
2. Скачать заново (проверить размер)
3. Распаковать в отдельную папку
```

❌ **Ошибка:** "Не скачиваются оружие и окружение"
```
✅ Исправить:
1. Использовать VPN (если есть блокировка)
2. Скачать через браузер вручную
3. Скопировать на ПК
```

---

#### ✅ Задача 1.4: Создать типы TypeScript

**Файл:** `frontend/src/types/babylon/index.ts`

```typescript
import * as BABYLON from "babylonjs";

// Типы для моделей
export interface LoadedMesh {
  meshes: BABYLON.Mesh[];
  animationGroups: BABYLON.AnimationGroup[];
  skeletons: BABYLON.Skeleton[];
}

export interface ModelConfig {
  path: string;
  filename: string;
  scale?: BABYLON.Vector3;
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
}

export interface EnemyModel {
  mesh: BABYLON.Mesh;
  skeleton?: BABYLON.Skeleton;
  animationGroups: BABYLON.AnimationGroup[];
  health: number;
  position: BABYLON.Vector3;
}

// Типы для анимаций
export interface AnimationConfig {
  name: string;
  frames: number[];
  duration: number;
  loop: boolean;
}

export interface AnimationState {
  current: string | null;
  playing: boolean;
  progress: number;
}
```

**Проверка:**
```bash
cd frontend
npm run build
# Не должно быть ошибок компиляции
```

---

## 🔨 ФАЗА 1: НАСТРОЙКА BABYLON.JS

### Дни 2-3

#### ✅ Задача 2.1: Обновить GameScene3D.ts

**Файл:** `frontend/src/game3d/scenes/GameScene3D.ts`

```typescript
import * as BABYLON from "babylonjs";
import "babylonjs-loaders"; // ВАЖНО!

export class GameScene3D {
  private scene: BABYLON.Scene;
  private camera: BABYLON.UniversalCamera;
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    this.scene = new BABYLON.Scene(this.engine);
    this.setupScene();
    this.setupCamera();
    this.setupLights();
    this.startRenderLoop();
  }

  private setupScene(): void {
    // Физика (если нужна)
    const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    const physicsPlugin = new BABYLON.CannonJSPlugin();
    this.scene.enablePhysics(gravityVector, physicsPlugin);

    // Коллизии
    this.scene.collisionsEnabled = true;

    // Фон
    this.scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  }

  private setupCamera(): void {
    this.camera = new BABYLON.UniversalCamera(
      "camera",
      new BABYLON.Vector3(0, 5, -15),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);
    this.camera.inertia = 0.7;
    this.camera.angularSensibility = 1000;

    // Ограничить углы обзора
    this.camera.lowerBetaLimit = 0;
    this.camera.upperBetaLimit = Math.PI;
  }

  private setupLights(): void {
    // Основной свет
    const light1 = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(1, 1, 0),
      this.scene
    );
    light1.intensity = 0.8;

    // Направленный свет
    const light2 = new BABYLON.PointLight(
      "light2",
      new BABYLON.Vector3(10, 20, 10),
      this.scene
    );
    light2.intensity = 0.7;
    light2.range = 100;

    // Тень
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
    shadowGenerator.useBlurVarianceShadowMap = true;
  }

  private startRenderLoop(): void {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  public getScene(): BABYLON.Scene {
    return this.scene;
  }

  public getEngine(): BABYLON.Engine {
    return this.engine;
  }

  public dispose(): void {
    this.scene.dispose();
    this.engine.dispose();
  }
}
```

**Проверка:**
```bash
cd frontend
npm run dev
# Должно открыться окно с 3D сценой (черный фон)
```

**Возможные ошибки:**

❌ **Ошибка:** "babylonjs-loaders is not imported"
```typescript
✅ Исправить:
// Добавить в начало файла
import "babylonjs-loaders";
```

❌ **Ошибка:** "Cannot read property 'render' of undefined"
```typescript
✅ Исправить:
// Проверить что this.scene не null
if (!this.scene) {
  throw new Error("Scene not initialized");
}
```

---

#### ✅ Задача 2.2: Создать ModelLoader

**Файл:** `frontend/src/game3d/loaders/ModelLoader.ts`

```typescript
import * as BABYLON from "babylonjs";
import { LoadedMesh, ModelConfig } from "../../types/babylon";

export class ModelLoader {
  private scene: BABYLON.Scene;
  private loadedModels: Map<string, LoadedMesh> = new Map();

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }

  /**
   * Загрузить модель из файла
   */
  async loadModel(config: ModelConfig): Promise<LoadedMesh> {
    try {
      console.log(`Loading model: ${config.filename}`);

      // Проверить кэш
      if (this.loadedModels.has(config.filename)) {
        console.log(`Model ${config.filename} found in cache`);
        return this.loadedModels.get(config.filename)!;
      }

      // Загрузить модель
      const result = await BABYLON.SceneLoader.ImportMeshAsync(
        "",
        config.path,
        config.filename,
        this.scene
      );

      const loaded: LoadedMesh = {
        meshes: result.meshes as BABYLON.Mesh[],
        animationGroups: result.animationGroups,
        skeletons: result.skeletons,
      };

      // Применить трансформации
      if (config.scale) {
        loaded.meshes.forEach((mesh) => {
          mesh.scaling = config.scale!;
        });
      }

      if (config.position) {
        loaded.meshes[0].position = config.position;
      }

      if (config.rotation) {
        loaded.meshes[0].rotation = config.rotation;
      }

      // Сохранить в кэш
      this.loadedModels.set(config.filename, loaded);

      console.log(`Model ${config.filename} loaded successfully`);
      return loaded;
    } catch (error) {
      console.error(`Failed to load model ${config.filename}:`, error);
      throw error;
    }
  }

  /**
   * Клонировать загруженную модель
   */
  cloneModel(
    modelName: string,
    newPosition: BABYLON.Vector3
  ): LoadedMesh | null {
    const original = this.loadedModels.get(modelName);
    if (!original) {
      console.error(`Model ${modelName} not found in cache`);
      return null;
    }

    const cloned: LoadedMesh = {
      meshes: original.meshes.map((mesh) => mesh.clone()),
      animationGroups: original.animationGroups.map((group) =>
        group.clone()
      ),
      skeletons: original.skeletons,
    };

    if (cloned.meshes[0]) {
      cloned.meshes[0].position = newPosition;
    }

    return cloned;
  }

  /**
   * Удалить модель
   */
  unloadModel(modelName: string): void {
    const model = this.loadedModels.get(modelName);
    if (model) {
      model.meshes.forEach((mesh) => mesh.dispose());
      this.loadedModels.delete(modelName);
      console.log(`Model ${modelName} unloaded`);
    }
  }

  /**
   * Очистить все модели
   */
  clearAll(): void {
    this.loadedModels.forEach((model) => {
      model.meshes.forEach((mesh) => mesh.dispose());
    });
    this.loadedModels.clear();
  }
}
```

**Проверка:**
```bash
cd frontend
npm run build
# Не должно быть ошибок
```

---

#### ✅ Задача 2.3: Обновить главный компонент Game

**Файл:** `frontend/src/components/Game.tsx`

```typescript
import React, { useEffect, useRef, useState } from "react";
import { GameScene3D } from "../game3d/scenes/GameScene3D";
import { ModelLoader } from "../game3d/loaders/ModelLoader";
import "../styles/Game.css";

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameScene3D | null>(null);
  const loaderRef = useRef<ModelLoader | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initGame = async () => {
      try {
        if (!canvasRef.current) {
          throw new Error("Canvas not found");
        }

        // Инициализировать сцену
        const game = new GameScene3D(canvasRef.current);
        gameRef.current = game;

        // Инициализировать загрузчик моделей
        const loader = new ModelLoader(game.getScene());
        loaderRef.current = loader;

        // Загрузить первую модель (тест)
        await loader.loadModel({
          path: "./assets/models/",
          filename: "soldier.glb",
          scale: { x: 1, y: 1, z: 1 } as any,
          position: { x: 0, y: 0, z: 10 } as any,
        });

        console.log("Game initialized successfully");
        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Game initialization error:", err);
        setError(message);
        setIsLoading(false);
      }
    };

    initGame();

    return () => {
      if (gameRef.current) {
        gameRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="game-container">
      {isLoading && <div className="loading">Loading game...</div>}
      {error && <div className="error">Error: {error}</div>}
      <canvas
        ref={canvasRef}
        className="game-canvas"
        style={{
          width: "100%",
          height: "100%",
          display: isLoading || error ? "none" : "block",
        }}
      />
    </div>
  );
};
```

**Добавить CSS:**

**Файл:** `frontend/src/styles/Game.css`

```css
.game-container {
  width: 100%;
  height: 100vh;
  position: relative;
  background: #1a1a1a;
}

.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 24px;
  z-index: 100;
}

.error {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff4444;
  color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
  z-index: 100;
}
```

**Проверка:**
```bash
cd frontend
npm run dev
# Должна появиться сцена с загруженной моделью солдата
```

---

## 📦 ФАЗА 2: ЗАГРУЗКА 3D МОДЕЛЕЙ

### Дни 4-5

#### ✅ Задача 3.1: Тест загрузки различных форматов

**Файл:** `frontend/src/game3d/loaders/FormatTester.ts`

```typescript
import * as BABYLON from "babylonjs";

export class FormatTester {
  static async testFormats(scene: BABYLON.Scene): Promise<void> {
    const formats = [
      { name: "GLB", path: "./assets/models/", file: "soldier.glb" },
      { name: "GLTF", path: "./assets/models/", file: "soldier.gltf" },
      { name: "OBJ", path: "./assets/models/weapons/", file: "rifle.obj" },
    ];

    for (const format of formats) {
      try {
        console.log(`Testing ${format.name} format...`);
        const result = await BABYLON.SceneLoader.ImportMeshAsync(
          "",
          format.path,
          format.file,
          scene
        );
        console.log(`✓ ${format.name} format works`);
        result.meshes.forEach((m) => m.dispose());
      } catch (error) {
        console.error(`✗ ${format.name} format error:`, error);
      }
    }
  }
}
```

**Запустить тест:**
```typescript
// В Game.tsx добавить:
await FormatTester.testFormats(game.getScene());
```

**Возможные ошибки:**

❌ **Ошибка:** "404 not found" для одного из форматов
```
✅ Исправить:
1. Проверить путь к файлу
2. Переконвертировать модель в нужный формат
3. Использовать другой источник модели
```

---

#### ✅ Задача 3.2: Создать менеджер ассетов

**Файл:** `frontend/src/game3d/managers/AssetManager.ts`

```typescript
import * as BABYLON from "babylonjs";
import { ModelLoader } from "../loaders/ModelLoader";
import { ModelConfig } from "../../types/babylon";

export class AssetManager {
  private modelLoader: ModelLoader;
  private loadedAssets: Map<string, any> = new Map();

  constructor(scene: BABYLON.Scene) {
    this.modelLoader = new ModelLoader(scene);
  }

  /**
   * Загрузить несколько моделей параллельно
   */
  async loadModels(configs: ModelConfig[]): Promise<void> {
    const promises = configs.map((config) => 
      this.modelLoader.loadModel(config).catch((error) => {
        console.error(`Failed to load ${config.filename}:`, error);
        return null;
      })
    );

    const results = await Promise.all(promises);
    results.forEach((result, index) => {
      if (result) {
        this.loadedAssets.set(configs[index].filename, result);
      }
    });
  }

  /**
   * Получить загруженный асcет
   */
  getAsset(name: string): any {
    return this.loadedAssets.get(name);
  }

  /**
   * Проверить что все асcеты загружены
   */
  areAllAssetsLoaded(requiredAssets: string[]): boolean {
    return requiredAssets.every((asset) => this.loadedAssets.has(asset));
  }
}
```

---

## 🎬 ФАЗА 3: СИСТЕМА АНИМАЦИЙ

### Дни 6-8

#### ✅ Задача 4.1: Создать AnimationManager

**Файл:** `frontend/src/game3d/animations/AnimationManager.ts`

```typescript
import * as BABYLON from "babylonjs";
import { AnimationState } from "../../types/babylon";

export class AnimationManager {
  private mesh: BABYLON.Mesh;
  private animationGroups: Map<string, BABYLON.AnimationGroup> = new Map();
  private state: AnimationState = {
    current: null,
    playing: false,
    progress: 0,
  };

  constructor(mesh: BABYLON.Mesh, animationGroups: BABYLON.AnimationGroup[]) {
    this.mesh = mesh;
    animationGroups.forEach((group) => {
      this.animationGroups.set(group.name, group);
    });
  }

  /**
   * Проиграть анимацию
   */
  play(animationName: string, loop: boolean = true): void {
    // Остановить текущую анимацию
    if (this.state.current) {
      const current = this.animationGroups.get(this.state.current);
      if (current && current.isPlaying) {
        current.stop();
      }
    }

    // Проиграть новую
    const animation = this.animationGroups.get(animationName);
    if (animation) {
      animation.loopAnimation = loop;
      animation.play();
      this.state.current = animationName;
      this.state.playing = true;
      console.log(`Playing animation: ${animationName}`);
    } else {
      console.warn(`Animation ${animationName} not found`);
    }
  }

  /**
   * Остановить анимацию
   */
  stop(): void {
    if (this.state.current) {
      const current = this.animationGroups.get(this.state.current);
      if (current) {
        current.stop();
      }
    }
    this.state.playing = false;
  }

  /**
   * Пауза
   */
  pause(): void {
    if (this.state.current) {
      const current = this.animationGroups.get(this.state.current);
      if (current && current.isPlaying) {
        // Babylon.js не имеет встроенной паузы, используем stop
        current.stop();
        this.state.playing = false;
      }
    }
  }

  /**
   * Получить текущее состояние
   */
  getState(): AnimationState {
    return { ...this.state };
  }

  /**
   * Получить список всех анимаций
   */
  getAvailableAnimations(): string[] {
    return Array.from(this.animationGroups.keys());
  }
}
```

**Проверка:**
```typescript
// Добавить в Game.tsx после загрузки модели
const model = loader.loadModel(...);
const animator = new AnimationManager(model.meshes[0], model.animationGroups);
animator.play("run"); // Проиграть анимацию бега
```

---

#### ✅ Задача 4.2: Тест анимаций

**Файл:** `frontend/src/game3d/animations/AnimationTester.ts`

```typescript
import * as BABYLON from "babylonjs";

export class AnimationTester {
  static listAnimations(mesh: BABYLON.AbstractMesh): void {
    console.log("Available animations:");
    if (mesh.animationPropertiesOverride?.animationPropertiesOverride) {
      console.log("Has animation properties");
    }

    // Проверить animation groups
    if ((mesh.getScene() as any).animationGroups) {
      (mesh.getScene() as any).animationGroups.forEach(
        (group: BABYLON.AnimationGroup) => {
          console.log(`- ${group.name}`);
        }
      );
    }
  }
}
```

**Возможные ошибки:**

❌ **Ошибка:** "Animation not playing"
```typescript
✅ Исправить:
// Проверить что animationGroups не пустой
if (animationGroups.length === 0) {
  console.error("No animations in model");
  return;
}
```

---

## 👾 ФАЗА 4: ИНТЕГРАЦИЯ ВРАГОВ

### Дни 9-10

#### ✅ Задача 5.1: Создать класс Enemy

**Файл:** `frontend/src/game3d/entities/Enemy.ts`

```typescript
import * as BABYLON from "babylonjs";
import { AnimationManager } from "../animations/AnimationManager";
import { EnemyModel } from "../../types/babylon";

export class Enemy {
  private model: EnemyModel;
  private animator: AnimationManager;
  private speed: number = 5;
  private direction: BABYLON.Vector3 = BABYLON.Vector3.Forward();
  private targetPosition: BABYLON.Vector3;

  constructor(
    mesh: BABYLON.Mesh,
    animationGroups: BABYLON.AnimationGroup[],
    startPosition: BABYLON.Vector3
  ) {
    this.model = {
      mesh,
      animationGroups,
      health: 100,
      position: startPosition,
    };

    this.animator = new AnimationManager(mesh, animationGroups);
    this.targetPosition = startPosition.clone();

    this.mesh.position = startPosition;
  }

  /**
   * Получить mesh
   */
  get mesh(): BABYLON.Mesh {
    return this.model.mesh;
  }

  /**
   * Получить здоровье
   */
  getHealth(): number {
    return this.model.health;
  }

  /**
   * Получить урон
   */
  takeDamage(damage: number): void {
    this.model.health -= damage;
    console.log(`Enemy health: ${this.model.health}`);

    if (this.model.health <= 0) {
      this.die();
    }
  }

  /**
   * Движение к цели
   */
  moveTo(target: BABYLON.Vector3): void {
    this.targetPosition = target;
    this.animator.play("run", true);
  }

  /**
   * Атаковать
   */
  attack(): void {
    this.animator.play("attack", false);
  }

  /**
   * Смерть
   */
  die(): void {
    console.log("Enemy died");
    this.animator.play("death", false);
    // Удалить через 2 секунды
    setTimeout(() => {
      this.dispose();
    }, 2000);
  }

  /**
   * Обновление в каждом фрейме
   */
  update(deltaTime: number): void {
    // Движение к цели
    const direction = BABYLON.Vector3.Normalize(
      this.targetPosition.subtract(this.mesh.position)
    );
    const distance = BABYLON.Vector3.Distance(
      this.mesh.position,
      this.targetPosition
    );

    if (distance > 0.5) {
      const movement = direction.scale(this.speed * deltaTime);
      this.mesh.position.addInPlace(movement);

      // Развернуть в сторону движения
      this.mesh.lookAt(this.targetPosition);
    }
  }

  /**
   * Удалить врага
   */
  dispose(): void {
    this.animator.stop();
    this.mesh.dispose();
  }
}
```

---

#### ✅ Задача 5.2: Создать EnemyManager

**Файл:** `frontend/src/game3d/managers/EnemyManager.ts`

```typescript
import * as BABYLON from "babylonjs";
import { Enemy } from "../entities/Enemy";
import { ModelLoader } from "../loaders/ModelLoader";

export class EnemyManager {
  private enemies: Enemy[] = [];
  private modelLoader: ModelLoader;
  private scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene, modelLoader: ModelLoader) {
    this.scene = scene;
    this.modelLoader = modelLoader;
  }

  /**
   * Создать врага
   */
  async spawnEnemy(
    position: BABYLON.Vector3,
    modelName: string = "soldier.glb"
  ): Promise<Enemy> {
    try {
      // Клонировать модель
      const cloned = this.modelLoader.cloneModel(modelName, position);
      if (!cloned) {
        throw new Error(`Model ${modelName} not found`);
      }

      // Создать врага
      const enemy = new Enemy(
        cloned.meshes[0] as BABYLON.Mesh,
        cloned.animationGroups,
        position
      );

      this.enemies.push(enemy);
      console.log(`Enemy spawned at`, position);
      return enemy;
    } catch (error) {
      console.error("Failed to spawn enemy:", error);
      throw error;
    }
  }

  /**
   * Создать нескольких врагов
   */
  async spawnWave(count: number, positions: BABYLON.Vector3[]): Promise<void> {
    for (let i = 0; i < count && i < positions.length; i++) {
      await this.spawnEnemy(positions[i]);
    }
  }

  /**
   * Обновить всех врагов
   */
  update(deltaTime: number): void {
    this.enemies.forEach((enemy) => enemy.update(deltaTime));
    // Удалить мертвых врагов
    this.enemies = this.enemies.filter((enemy) => enemy.getHealth() > 0);
  }

  /**
   * Получить всех врагов
   */
  getEnemies(): Enemy[] {
    return this.enemies;
  }

  /**
   * Очистить всех врагов
   */
  clear(): void {
    this.enemies.forEach((enemy) => enemy.dispose());
    this.enemies = [];
  }
}
```

---

## ⚔️ ФАЗА 5: БОЕВАЯ СИСТЕМА

### Дни 11-13

#### ✅ Задача 6.1: Создать CombatSystem

**Файл:** `frontend/src/game3d/combat/CombatSystem.ts`

```typescript
import * as BABYLON from "babylonjs";
import { Enemy } from "../entities/Enemy";

export class CombatSystem {
  private attackRange: number = 2;
  private attackCooldown: number = 1;
  private lastAttackTime: number = 0;
  private bulletSpeed: number = 50;
  private bulletDamage: number = 10;

  /**
   * Выстрелить
   */
  shoot(
    from: BABYLON.Vector3,
    direction: BABYLON.Vector3,
    target: Enemy
  ): void {
    const now = Date.now() / 1000;
    if (now - this.lastAttackTime < this.attackCooldown) {
      console.log("Cooldown active");
      return;
    }

    this.lastAttackTime = now;

    // Создать снаряд
    const bullet = BABYLON.MeshBuilder.CreateSphere(
      "bullet",
      { diameter: 0.2 },
      target.mesh.getScene()
    );
    bullet.position = from.clone();

    // Материал
    const material = new BABYLON.StandardMaterial(
      "bulletMat",
      target.mesh.getScene()
    );
    material.emissiveColor = new BABYLON.Color3(1, 1, 0);
    bullet.material = material;

    // Физика (если включена)
    const scene = target.mesh.getScene();
    if (scene.getPhysicsEngine()) {
      const physicsBody = new BABYLON.PhysicsAggregate(
        bullet,
        BABYLON.PhysicsShapeType.SPHERE,
        { mass: 0.1 },
        scene
      );
      physicsBody.body.applyForce(
        direction.scale(this.bulletSpeed),
        bullet.getAbsolutePosition()
      );
    }

    // Удалить через 10 секунд
    setTimeout(() => {
      bullet.dispose();
    }, 10000);

    // Проверить попадание
    this.checkHit(bullet, target);
  }

  /**
   * Проверить попадание
   */
  private checkHit(bullet: BABYLON.Mesh, target: Enemy): void {
    const hitDetection = setInterval(() => {
      const distance = BABYLON.Vector3.Distance(
        bullet.position,
        target.mesh.position
      );

      if (distance < 1) {
        target.takeDamage(this.bulletDamage);
        bullet.dispose();
        clearInterval(hitDetection);
      }
    }, 50);
  }
}
```

---

## 🚀 ФАЗА 6: ОПТИМИЗАЦИЯ

### Дни 14-15

#### ✅ Задача 7.1: Оптимизировать рендеринг

**Файл:** `frontend/src/game3d/utils/OptimizationUtils.ts`

```typescript
import * as BABYLON from "babylonjs";

export class OptimizationUtils {
  /**
   * Включить LOD (Level of Detail)
   */
  static enableLOD(mesh: BABYLON.Mesh, scene: BABYLON.Scene): void {
    // Создать версии низкого качества
    const lowQuality = mesh.clone();
    lowQuality.visibility = 0;

    // Использовать низкое качество на расстоянии > 30
    const LODMesh = new BABYLON.LODLevel(30, lowQuality);
    mesh.addLODLevel(LODMesh);
  }

  /**
   * Включить fog для дальних объектов
   */
  static enableFog(scene: BABYLON.Scene): void {
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart = 50;
    scene.fogEnd = 200;
    scene.fogColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  }

  /**
   * Отключить ненужные функции
   */
  static optimizePerformance(scene: BABYLON.Scene): void {
    // Отключить отсеивание пиксельного шейдера
    scene.skipPointerMovePicking = true;

    // Оптимизировать скелетные анимации
    scene.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
    scene.animationPropertiesOverride.enableBlending = true;

    // Использовать низкое качество теней
    const lights = scene.lights;
    lights.forEach((light) => {
      const shadowGenerator = light.getShadowGenerator();
      if (shadowGenerator) {
        shadowGenerator.usePoissonSampling = true;
        shadowGenerator.mapSize = 512; // Вместо 1024
      }
    });
  }
}
```

---

#### ✅ Задача 7.2: Добавить профилирование

**Файл:** `frontend/src/game3d/utils/Profiler.ts`

```typescript
import * as BABYLON from "babylonjs";

export class Profiler {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Начать измерение
   */
  start(label: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label)!.push(duration);
    };
  }

  /**
   * Получить статистику
   */
  getStats(label: string): { avg: number; min: number; max: number } | null {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return null;

    return {
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
    };
  }

  /**
   * Вывести все статистики
   */
  printStats(): void {
    console.log("Performance Stats:");
    this.metrics.forEach((_, label) => {
      const stats = this.getStats(label);
      if (stats) {
        console.log(
          `${label}: avg=${stats.avg.toFixed(2)}ms, min=${stats.min.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms`
        );
      }
    });
  }
}
```

---

## 🐛 ЧЕК-ЛИСТ ОШИБОК И ИСПРАВЛЕНИЯ

### Часто встречающиеся ошибки

#### ❌ 1. "Cannot find module 'babylonjs-loaders'"

**Причина:** Не установлена библиотека для загрузки моделей

**Исправление:**
```bash
npm install babylonjs-loaders
# И добавить в начало файла:
import "babylonjs-loaders";
```

#### ❌ 2. "404 Not Found" при загрузке модели

**Причина:** Неправильный путь к файлу

**Исправление:**
```typescript
// НЕПРАВИЛЬНО:
path: "assets/models/"  // Отсутствует ./

// ПРАВИЛЬНО:
path: "./assets/models/"
```

#### ❌ 3. Модель не видна на сцене

**Причина:** Позиция камеры неправильная или модель черная

**Исправление:**
```typescript
// Проверить позицию камеры
camera.position = new BABYLON.Vector3(0, 5, -15);

// Убедиться в наличии освещения
const light = new BABYLON.HemisphericLight(...);
light.intensity = 1; // Яркость
```

#### ❌ 4. Анимация не воспроизводится

**Причина:** AnimationGroup пустой или не найден

**Исправление:**
```typescript
// Проверить список анимаций
console.log(animationGroups.map(g => g.name));

// Убедиться что название совпадает
if (animationGroups.length > 0) {
  animationGroups[0].play();
}
```

#### ❌ 5. Низкий FPS (менее 30)

**Причина:** Слишком много врагов или высокое качество

**Исправление:**
```typescript
// Включить оптимизацию
OptimizationUtils.optimizePerformance(scene);

// Уменьшить количество врагов
maxEnemies = 20; // Вместо 100

// Уменьшить размер теней
shadowGenerator.mapSize = 512; // Вместо 2048
```

#### ❌ 6. "Type 'Mesh' is not assignable to type 'Mesh'"

**Причина:** Проблема с типами TypeScript

**Исправление:**
```typescript
// Правильный импорт типов
import * as BABYLON from "babylonjs";

// Использовать правильные типы
const mesh: BABYLON.Mesh = loaded.meshes[0];
```

#### ❌ 7. Memory leak (утечка памяти)

**Причина:** Не удаляются старые mesh'и

**Исправление:**
```typescript
// Всегда вызывать dispose()
mesh.dispose();
if (material) material.dispose();
if (texture) texture.dispose();

// Удалять в правильном порядке
// 1. Сначала mesh
// 2. Потом material
// 3. Потом texture
```

#### ❌ 8. Врагов много, но их невидно

**Причина:** Они за камерой или очень далеко

**Исправление:**
```typescript
// Проверить позицию спавна
const spawnPosition = new BABYLON.Vector3(0, 0, 10);

// Убедиться камера смотрит в нужном направлении
camera.position = new BABYLON.Vector3(0, 5, -20);
camera.setTarget(new BABYLON.Vector3(0, 0, 0));
```

#### ❌ 9. Коллизии не работают

**Причина:** Физика не включена

**Исправление:**
```typescript
// Включить физику в сцене
const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
const physicsPlugin = new BABYLON.CannonJSPlugin();
scene.enablePhysics(gravityVector, physicsPlugin);

// Добавить физику к mesh
const physicsBody = new BABYLON.PhysicsAggregate(
  mesh,
  BABYLON.PhysicsShapeType.SPHERE,
  { mass: 1 },
  scene
);
```

#### ❌ 10. Websocket не синхронизирует анимации

**Причина:** Не передается информация об анимации

**Исправление:**
```typescript
// Отправлять состояние анимации на сервер
socket.emit("enemy:animate", {
  enemyId: enemy.id,
  animationName: "run",
  timestamp: Date.now()
});

// На сервере пересылать другим игрокам
broadcast("enemy:animate", data);
```

---

## 📊 ГРАФИК РЕАЛИЗАЦИИ

### Неделя 1
- **День 1-2:** Фаза 0 (Подготовка)
- **День 3-4:** Фаза 1 (Babylon.js)
- **День 5:** Фаза 2 (Загрузка моделей)

### Неделя 2
- **День 6-7:** Фаза 3 (Анимации)
- **День 8-9:** Фаза 4 (Враги)
- **День 10:** Тестирование и исправления

### Неделя 3
- **День 11-12:** Фаза 5 (Боевка)
- **День 13-14:** Фаза 6 (Оптимизация)
- **День 15:** Финальное тестирование и деплой

---

## ✅ ФИНАЛЬНЫЙ ЧЕК-ЛИСТ

### Перед стартом:
- [ ] Обновлены все зависимости
- [ ] Созданы все необходимые папки
- [ ] Скачаны 3D модели
- [ ] Созданы типы TypeScript
- [ ] Код компилируется без ошибок

### После каждой фазы:
- [ ] Нет ошибок в консоли
- [ ] FPS >= 30
- [ ] Все функции работают
- [ ] Тесты проходят
- [ ] Закоммичено в Git

### Перед релизом:
- [ ] Все ошибки исправлены
- [ ] Производительность оптимальна
- [ ] Документация обновлена
- [ ] Проведено финальное тестирование
- [ ] Готово к деплою

---

## 🎯 КЛЮЧЕВЫЕ МОМЕНТЫ

1. **Всегда использовать try-catch** для загрузки моделей
2. **Проверять консоль браузера** на ошибки
3. **Сохранять checkpoints** после каждой фазы (git commit)
4. **Профилировать производительность** с помощью Profiler
5. **Тестировать на разных устройствах** (мобильные, планшеты)
6. **Читать логи** - они помогут понять проблему
7. **Использовать Babylon.js Playground** для быстрых тестов

---

**ГОТОВО К ВНЕДРЕНИЮ! 🚀**

Следуй этому плану шаг за шагом, и внедрение пройдет гладко!
