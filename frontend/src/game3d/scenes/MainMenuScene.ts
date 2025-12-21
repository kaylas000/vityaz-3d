import * as BABYLON from '@babylonjs/core';

/**
 * MainMenuScene - Main menu with Vityaz branding
 * Uses Babylon.js for 3D rendering
 */
export class MainMenuScene {
  private scene: BABYLON.Scene;
  private engine: BABYLON.Engine;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    
    // Get 2D canvas context for UI drawing
    this.ctx = canvas.getContext('2d');
  }

  /**
   * Create main menu scene
   */
  create() {
    // Setup lighting
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 1), this.scene);
    light.intensity = 0.8;

    // Create background
    this.createBackground();

    // Create Vityaz branding
    this.createVityazBranding();

    // Create menu buttons
    this.createMenuButtons();

    // Setup camera
    const camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 5, -10), this.scene);
    camera.attachControl(this.canvas, true);

    // Start render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
      this.renderUI();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  /**
   * Create background plane
   */
  private createBackground() {
    const plane = BABYLON.MeshBuilder.CreatePlane('background', { width: 16, height: 9 }, this.scene);
    plane.position.z = 10;

    const material = new BABYLON.StandardMaterial('bgMaterial', this.scene);
    material.emissiveColor = new BABYLON.Color3(0.15, 0.15, 0.2); // Dark blue-gray
    plane.material = material;
  }

  /**
   * Create Vityaz branding with crimson beret
   */
  private createVityazBranding() {
    // Create a sphere for the beret shape
    const beret = BABYLON.MeshBuilder.CreateSphere('beret', { diameter: 1.5 }, this.scene);
    beret.position.set(0, 3, 0);

    const beretMaterial = new BABYLON.StandardMaterial('beretMaterial', this.scene);
    beretMaterial.emissiveColor = new BABYLON.Color3(0.8, 0, 0); // Crimson red
    beret.material = beretMaterial;

    // Create text label
    this.drawTextLabel('VITYAZ', 0, 2, '#FF6B6B', 32);
    this.drawTextLabel('Special Operations', 0, 1.2, '#FFFFFF', 16);
  }

  /**
   * Create menu buttons
   */
  private createMenuButtons() {
    // Create button boxes
    const buttonPositions = [
      { text: 'Play Game', y: -1, color: 0x2ECC71 },
      { text: 'Settings', y: -2, color: 0x3498DB },
      { text: 'Leaderboard', y: -3, color: 0xF39C12 },
    ];

    buttonPositions.forEach(btn => {
      const button = BABYLON.MeshBuilder.CreateBox(`button_${btn.text}`, { size: 1.5 }, this.scene);
      button.position.y = btn.y;

      const material = new BABYLON.StandardMaterial(`buttonMat_${btn.text}`, this.scene);
      material.emissiveColor = new BABYLON.Color3(
        ((btn.color >> 16) & 255) / 255,
        ((btn.color >> 8) & 255) / 255,
        (btn.color & 255) / 255
      );
      button.material = material;

      // Add click handler (simplified)
      button.actionManager = new BABYLON.ActionManager(this.scene);
    });
  }

  /**
   * Draw text label using 2D canvas context
   */
  private drawTextLabel(text: string, x: number, y: number, color: string, fontSize: number) {
    if (!this.ctx) return;

    // Convert 3D position to 2D screen coordinates (simplified)
    const screenX = (this.canvas.width / 2) + (x * 100);
    const screenY = (this.canvas.height / 2) - (y * 100);

    this.ctx.save();
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, screenX, screenY);
    this.ctx.restore();
  }

  /**
   * Draw Crimson Beret symbol
   */
  private drawCrimsonBeret() {
    if (!this.ctx) return;

    const canvas = this.engine.getRenderingCanvas();
    if (!canvas) return;

    const x = canvas.width * 0.85;
    const y = canvas.height * 0.1;

    this.ctx.save();
    
    // Translate to position
    this.ctx.translate(x, y);
    
    // Draw beret circle
    this.ctx.fillStyle = '#8B0000'; // Crimson
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw visor
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(-35, 25, 70, 10);

    // Draw emblem
    this.ctx.fillStyle = '#FFD700'; // Gold
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * Render UI overlay
   */
  private renderUI() {
    if (!this.ctx) return;

    // Clear UI area
    const canvas = this.engine.getRenderingCanvas();
    if (!canvas) return;

    // Draw crimson beret logo
    this.drawCrimsonBeret();

    // Draw FPS counter
    const fps = BABYLON.Engine.LastCreatedEngine?.fps || 0;
    this.ctx.save();
    this.ctx.fillStyle = '#00FF00';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`FPS: ${fps.toFixed(1)}`, 10, 20);
    this.ctx.restore();
  }

  /**
   * Handle button click
   */
  onPlayClick() {
    console.log('Play Game clicked');
    // Navigate to game scene
  }

  /**
   * Dispose scene
   */
  dispose() {
    this.scene.dispose();
    this.engine.dispose();
  }
}
