import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  ArcRotateCamera,
} from '@babylonjs/core';

export class GameEngine {
  private engine: Engine | null = null;
  private scene: Scene | null = null;
  private canvas: HTMLCanvasElement;
  private updateCallback: (() => void) | null = null;
  private isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async initialize(): Promise<void> {
    try {
      // Create engine
      this.engine = new Engine(this.canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
      });

      // Create scene
      this.scene = new Scene(this.engine);
      this.scene.collisionsEnabled = true;

      // Create camera (ArcRotateCamera for 3D view)
      const camera = new ArcRotateCamera(
        'camera',
        Math.PI / 2,
        Math.PI / 2.5,
        50,
        new Vector3(0, 0, 0),
        this.scene
      );
      camera.attachControl(this.canvas, true);
      camera.checkCollisions = true;
      camera.inertia = 0.7;
      camera.speed = 0.02;

      // Add lighting
      const light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);
      light.intensity = 0.7;

      // Create ground
      const ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, this.scene);
      const groundMaterial = new StandardMaterial('groundMat', this.scene);
      groundMaterial.diffuse = new Color3(0.2, 0.7, 0.2);
      ground.material = groundMaterial;
      ground.checkCollisions = true;

      // Start render loop
      this.startRenderLoop();

      // Handle window resize
      window.addEventListener('resize', () => this.engine?.resize());
    } catch (error) {
      console.error('GameEngine initialization failed:', error);
      throw error;
    }
  }

  private startRenderLoop(): void {
    if (!this.engine) return;

    this.isRunning = true;
    this.engine.runRenderLoop(() => {
      if (this.updateCallback) {
        this.updateCallback();
      }
      if (this.scene) {
        this.scene.render();
      }
    });
  }

  setUpdateCallback(callback: () => void): void {
    this.updateCallback = callback;
  }

  render(): void {
    if (this.scene) {
      this.scene.render();
    }
  }

  getScene(): Scene | null {
    return this.scene;
  }

  getEngine(): Engine | null {
    return this.engine;
  }

  dispose(): void {
    if (this.engine) {
      this.isRunning = false;
      this.engine.dispose();
      this.engine = null;
    }
    if (this.scene) {
      this.scene.dispose();
      this.scene = null;
    }
  }

  isInitialized(): boolean {
    return this.engine !== null && this.scene !== null;
  }
}
