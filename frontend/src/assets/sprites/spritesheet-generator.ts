/**
 * Procedural Sprite Generator
 * Generates HD combat character sprites with multiple animations
 */

export interface SpriteConfig {
  width: number;
  height: number;
  scale: number; // 1x, 2x, 4x HD
}

export class SpriteGenerator {
  private canvas: OffscreenCanvas | HTMLCanvasElement;
  private ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

  constructor(config: SpriteConfig) {
    if (typeof OffscreenCanvas !== 'undefined') {
      this.canvas = new OffscreenCanvas(config.width * config.scale, config.height * config.scale);
      this.ctx = this.canvas.getContext('2d')!;
    } else {
      this.canvas = document.createElement('canvas');
      this.canvas.width = config.width * config.scale;
      this.canvas.height = config.height * config.scale;
      this.ctx = this.canvas.getContext('2d')!;
    }
  }

  /**
   * Generate soldier sprite
   */
  generateSoldier(faction: 'russian' | 'international', frameIndex: number): ImageData {
    const scale = 2;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Body color based on faction
    const bodyColor = faction === 'russian' ? '#2a4a2a' : '#3a3a5a';
    const accentColor = faction === 'russian' ? '#d4af37' : '#4a9eff';

    // Draw body
    this.ctx.fillStyle = bodyColor;
    this.drawRoundRect(
      8 * scale,
      12 * scale,
      10 * scale,
      18 * scale,
      2 * scale,
    );

    // Draw head
    this.ctx.fillStyle = '#d4a574';
    this.ctx.beginPath();
    this.ctx.arc(13 * scale, 8 * scale, 4 * scale, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw helmet
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.beginPath();
    this.ctx.arc(13 * scale, 7 * scale, 5 * scale, 0, Math.PI, true);
    this.ctx.fill();

    // Draw goggles
    this.ctx.fillStyle = '#666666';
    this.ctx.fillRect(11 * scale, 5 * scale, 1.5 * scale, 1.5 * scale);
    this.ctx.fillRect(14.5 * scale, 5 * scale, 1.5 * scale, 1.5 * scale);

    // Draw arms (animated)
    const armOffset = Math.sin(frameIndex * 0.2) * 2;
    this.ctx.fillStyle = '#d4a574';
    this.drawRoundRect(7 * scale, 14 * scale + armOffset, 2 * scale, 8 * scale, 1 * scale);
    this.drawRoundRect(18 * scale, 14 * scale - armOffset, 2 * scale, 8 * scale, 1 * scale);

    // Draw rifle
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(18 * scale, 15 * scale - armOffset, 2 * scale, 12 * scale);

    // Draw accent stripe
    this.ctx.fillStyle = accentColor;
    this.ctx.fillRect(8 * scale, 13 * scale, 10 * scale, 1 * scale);

    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Generate muzzle flash effect
   */
  generateMuzzleFlash(): ImageData {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const scale = 2;
    // Bright yellow-white flash
    this.ctx.fillStyle = '#ffff99';
    this.ctx.beginPath();
    this.ctx.arc(10 * scale, 10 * scale, 3 * scale, 0, Math.PI * 2);
    this.ctx.fill();

    // Orange corona
    this.ctx.fillStyle = 'rgba(255, 165, 0, 0.7)';
    this.ctx.beginPath();
    this.ctx.arc(10 * scale, 10 * scale, 5 * scale, 0, Math.PI * 2);
    this.ctx.fill();

    // Red outer
    this.ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(10 * scale, 10 * scale, 7 * scale, 0, Math.PI * 2);
    this.ctx.fill();

    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Generate blood splatter effect
   */
  generateBloodSplat(): ImageData {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#8B0000';

    const scale = 2;
    const centerX = 10 * scale;
    const centerY = 10 * scale;

    // Create irregular splatter
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 3 * scale + Math.random() * 2 * scale;
      const size = 1.5 * scale + Math.random() * 1 * scale;

      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Generate explosion particle
   */
  generateExplosion(intensity: number = 0.5): ImageData {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const scale = 2;
    const centerX = 10 * scale;
    const centerY = 10 * scale;
    const radius = 4 * scale * intensity;

    // Yellow core
    this.ctx.fillStyle = '#ffff00';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    this.ctx.fill();

    // Orange middle
    this.ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
    this.ctx.fill();

    // Red outer
    this.ctx.fillStyle = 'rgba(255, 69, 0, 0.5)';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();

    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Export canvas as data URL
   */
  toDataURL(type: string = 'image/png'): string {
    if (this.canvas instanceof OffscreenCanvas) {
      return this.canvas.convertToBlob().then((blob) => URL.createObjectURL(blob)) as any;
    } else {
      return this.canvas.toDataURL(type);
    }
  }

  /**
   * Export canvas as Blob
   */
  async toBlob(): Promise<Blob> {
    if (this.canvas instanceof OffscreenCanvas) {
      return this.canvas.convertToBlob();
    } else {
      return new Promise((resolve) => {
        this.canvas.toBlob((blob) => resolve(blob!));
      });
    }
  }

  private drawRoundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.fill();
  }
}

/**
 * Generate sprite sheet texture atlas
 */
export async function generateSpriteSheet(): Promise<HTMLCanvasElement> {
  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = 512; // 512x512 atlas
  sheetCanvas.height = 512;
  const ctx = sheetCanvas.getContext('2d')!;

  const generator = new SpriteGenerator({ width: 32, height: 32, scale: 2 });

  let x = 0,
    y = 0;
  const spriteSize = 64;

  // Generate 8x8 grid of sprites (64 total)
  for (let i = 0; i < 64; i++) {
    const spriteData =
      i % 2 === 0
        ? generator.generateSoldier('russian', i)
        : generator.generateSoldier('international', i);

    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = spriteSize;
    spriteCanvas.height = spriteSize;
    const spriteCtx = spriteCanvas.getContext('2d')!;
    spriteCtx.putImageData(spriteData, 0, 0);

    ctx.drawImage(spriteCanvas, x, y);

    x += spriteSize;
    if (x >= sheetCanvas.width) {
      x = 0;
      y += spriteSize;
    }
  }

  return sheetCanvas;
}
