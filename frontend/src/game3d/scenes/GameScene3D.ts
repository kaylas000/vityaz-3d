import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders"; // ВАЖНО!

export class GameScene3D {
  private scene: BABYLON.Scene;
  private camera: BABYLON.UniversalCamera;
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private isDisposed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    try {
      this.engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
      });

      this.scene = new BABYLON.Scene(this.engine);
      this.setupScene();
      this.setupCamera();
      this.setupLights();
      this.startRenderLoop();
      
      console.log("✅ GameScene3D initialized successfully");
    } catch (error) {
      console.error("❌ GameScene3D initialization error:", error);
      throw error;
    }
  }

  private setupScene(): void {
    if (!this.scene) throw new Error("Scene not initialized");
    
    // Коллизии
    this.scene.collisionsEnabled = true;

    // Фон
    this.scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    
    console.log("✅ Scene setup complete");
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
    
    console.log("✅ Camera setup complete");
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
    
    console.log("✅ Lights setup complete");
  }

  private startRenderLoop(): void {
    this.engine.runRenderLoop(() => {
      if (!this.isDisposed) {
        this.scene.render();
      }
    });

    window.addEventListener("resize", () => {
      if (!this.isDisposed) {
        this.engine.resize();
      }
    });
    
    console.log("✅ Render loop started");
  }

  public getScene(): BABYLON.Scene {
    return this.scene;
  }

  public getEngine(): BABYLON.Engine {
    return this.engine;
  }

  public dispose(): void {
    if (this.isDisposed) return;
    
    try {
      this.scene.dispose();
      this.engine.dispose();
      this.isDisposed = true;
      console.log("✅ GameScene3D disposed");
    } catch (error) {
      console.error("❌ Error disposing scene:", error);
    }
  }
}
