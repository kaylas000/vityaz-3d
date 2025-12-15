/**
 * VITYAZ PROFESSIONAL GRAPHICS GENERATOR
 * =====================================
 * 
 * Creates high-quality sprites with:
 * - Maroon (krapovy) beret on LEFT side
 * - Vityaz special forces symbolism
 * - Canvas-based rendering
 * - Scalable and professional look
 * 
 * Features:
 * - Player character with tactical gear
 * - Enemy soldiers with varied uniforms
 * - Weapon sprites (AK-74M, SVD, RPK-74, PMM)
 * - Environmental elements
 * - Particle effects
 */

export class VityazGraphicsGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Color palette - Professional military
  private colors = {
    // Maroon/Krapovy colors
    beretMaroon: '#8B3A3A',        // Maroon beret
    beretDark: '#6B2A2A',          // Shadow
    beretLight: '#A54A4A',         // Highlight

    // Uniform colors
    uniformGreen: '#2F5233',       // Tactical green
    uniformLight: '#3D6B42',       // Light green
    uniformDark: '#1F3520',        // Dark green

    // Skin tones
    skinTone: '#D4A574',           // Caucasian skin
    skinShadow: '#B8956F',         // Shadow

    // Equipment
    weaponGray: '#3D3D3D',         // Gun metal
    weaponBlack: '#1A1A1A',        // Deep black
    weaponBronze: '#8B6F47',       // Bronze/gold accents

    // Other
    white: '#FFFFFF',
    black: '#000000',
    gray: '#808080',
  };

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Generate Player Character Sprite
   * Maroon beret on LEFT side, tactical gear
   */
  public generatePlayerSprite(width: number = 64, height: number = 64): HTMLCanvasElement {
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.ctx;

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, width, height);

    // Scale factors
    const scale = width / 64;

    // Draw character facing DOWN (default)
    this.drawPlayerCharacter(ctx, width, height, scale);

    return this.canvas;
  }

  /**
   * Generate Enemy Sprite
   * Varied uniforms, no special beret
   */
  public generateEnemySprite(width: number = 64, height: number = 64): HTMLCanvasElement {
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.ctx;

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, width, height);

    const scale = width / 64;
    this.drawEnemyCharacter(ctx, width, height, scale);

    return this.canvas;
  }

  /**
   * Generate Weapon Sprite
   */
  public generateWeaponSprite(
    weaponType: 'AK74M' | 'SVD' | 'RPK74' | 'PMM',
    width: number = 48,
    height: number = 24
  ): HTMLCanvasElement {
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.ctx;

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, width, height);

    const scale = width / 48;

    switch (weaponType) {
      case 'AK74M':
        this.drawAK74M(ctx, width, height, scale);
        break;
      case 'SVD':
        this.drawSVD(ctx, width, height, scale);
        break;
      case 'RPK74':
        this.drawRPK74(ctx, width, height, scale);
        break;
      case 'PMM':
        this.drawPMM(ctx, width, height, scale);
        break;
    }

    return this.canvas;
  }

  /**
   * Generate Explosion Effect
   */
  public generateExplosionSprite(size: number = 48): HTMLCanvasElement {
    this.canvas.width = size;
    this.canvas.height = size;
    const ctx = this.ctx;

    const centerX = size / 2;
    const centerY = size / 2;

    // Outer explosion ring
    ctx.fillStyle = 'rgba(255, 140, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Middle explosion
    ctx.fillStyle = 'rgba(255, 200, 0, 0.9)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    ctx.fillStyle = 'rgba(255, 255, 100, 1)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 5, 0, Math.PI * 2);
    ctx.fill();

    return this.canvas;
  }

  /**
   * Generate Blood Splatter Effect
   */
  public generateBloodSplatter(size: number = 32): HTMLCanvasElement {
    this.canvas.width = size;
    this.canvas.height = size;
    const ctx = this.ctx;

    const centerX = size / 2;
    const centerY = size / 2;

    // Main blood stain
    ctx.fillStyle = 'rgba(139, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 3, 0, Math.PI * 2);
    ctx.fill();

    // Splatter effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const splatterX = centerX + Math.cos(angle) * (size / 3.5);
      const splatterY = centerY + Math.sin(angle) * (size / 3.5);

      ctx.fillStyle = 'rgba(139, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(splatterX, splatterY, size / 12, 0, Math.PI * 2);
      ctx.fill();
    }

    return this.canvas;
  }

  /**
   * Generate Ammo Box Sprite
   */
  public generateAmmoBoxSprite(size: number = 32): HTMLCanvasElement {
    this.canvas.width = size;
    this.canvas.height = size;
    const ctx = this.ctx;

    // Main box
    ctx.fillStyle = this.colors.weaponBronze;
    ctx.fillRect(4, 8, size - 8, size - 16);

    // Top face
    ctx.fillStyle = this.colors.weaponGray;
    ctx.beginPath();
    ctx.moveTo(4, 8);
    ctx.lineTo(size / 2, 4);
    ctx.lineTo(size - 4, 8);
    ctx.lineTo(size / 2, 12);
    ctx.closePath();
    ctx.fill();

    // Ammo detail
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(6 + i * 7, 14, 4, size - 20);
    }

    return this.canvas;
  }

  // ==================== PRIVATE DRAWING METHODS ====================

  private drawPlayerCharacter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number
  ): void {
    const centerX = width / 2;
    const centerY = height / 2;

    // Legs (green tactical pants)
    ctx.fillStyle = this.colors.uniformGreen;
    ctx.fillRect(centerX - 5 * scale, centerY + 2 * scale, 4 * scale, 12 * scale);
    ctx.fillRect(centerX + 1 * scale, centerY + 2 * scale, 4 * scale, 12 * scale);

    // Body (tactical vest)
    ctx.fillStyle = this.colors.uniformGreen;
    ctx.fillRect(centerX - 6 * scale, centerY - 4 * scale, 12 * scale, 8 * scale);

    // Equipment on vest
    ctx.fillStyle = this.colors.weaponBronze;
    ctx.fillRect(centerX - 4 * scale, centerY - 2 * scale, 2 * scale, 3 * scale);
    ctx.fillRect(centerX + 2 * scale, centerY - 2 * scale, 2 * scale, 3 * scale);

    // Neck/shoulders connector
    ctx.fillStyle = this.colors.skinTone;
    ctx.fillRect(centerX - 4 * scale, centerY - 5 * scale, 8 * scale, 1 * scale);

    // Head (skin tone)
    ctx.fillStyle = this.colors.skinTone;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 10 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Hair (dark brown)
    ctx.fillStyle = '#3D2817';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 11 * scale, 4 * scale, Math.PI, 0);
    ctx.fill();

    // MAROON BERET - LEFT SIDE (VITYAZ SYMBOLISM)
    // This is the distinctive feature
    ctx.fillStyle = this.colors.beretMaroon;
    ctx.beginPath();
    // Beret shape - tilted left side
    ctx.ellipse(centerX - 3 * scale, centerY - 12 * scale, 5 * scale, 3 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Beret shadow
    ctx.fillStyle = this.colors.beretDark;
    ctx.beginPath();
    ctx.ellipse(centerX - 3.5 * scale, centerY - 12.5 * scale, 4 * scale, 2.5 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Beret highlight
    ctx.fillStyle = this.colors.beretLight;
    ctx.beginPath();
    ctx.ellipse(centerX - 2 * scale, centerY - 11 * scale, 2 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vityaz emblem on beret (small red star)
    ctx.fillStyle = '#FFD700';
    this.drawStar(ctx, centerX - 3 * scale, centerY - 12 * scale, 0.8 * scale, 5);

    // Eyes
    ctx.fillStyle = this.colors.black;
    ctx.beginPath();
    ctx.arc(centerX - 2 * scale, centerY - 10 * scale, 0.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 2 * scale, centerY - 10 * scale, 0.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (determined expression)
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 0.5 * scale;
    ctx.beginPath();
    ctx.moveTo(centerX - 1.5 * scale, centerY - 8 * scale);
    ctx.lineTo(centerX + 1.5 * scale, centerY - 8 * scale);
    ctx.stroke();

    // Arms
    ctx.fillStyle = this.colors.skinTone;
    ctx.fillRect(centerX - 7 * scale, centerY - 2 * scale, 2 * scale, 8 * scale);
    ctx.fillRect(centerX + 5 * scale, centerY - 2 * scale, 2 * scale, 8 * scale);

    // Gloves (dark)
    ctx.fillStyle = this.colors.weaponBlack;
    ctx.fillRect(centerX - 7 * scale, centerY + 6 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(centerX + 5 * scale, centerY + 6 * scale, 2 * scale, 2 * scale);
  }

  private drawEnemyCharacter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number
  ): void {
    const centerX = width / 2;
    const centerY = height / 2;

    // Legs (different color - gray uniform)
    ctx.fillStyle = '#4A4A4A';
    ctx.fillRect(centerX - 5 * scale, centerY + 2 * scale, 4 * scale, 12 * scale);
    ctx.fillRect(centerX + 1 * scale, centerY + 2 * scale, 4 * scale, 12 * scale);

    // Body (gray uniform - enemy distinction)
    ctx.fillStyle = '#5A5A5A';
    ctx.fillRect(centerX - 6 * scale, centerY - 4 * scale, 12 * scale, 8 * scale);

    // Equipment (different style)
    ctx.fillStyle = '#8B6F47';
    ctx.fillRect(centerX - 4 * scale, centerY - 2 * scale, 2 * scale, 3 * scale);
    ctx.fillRect(centerX + 2 * scale, centerY - 2 * scale, 2 * scale, 3 * scale);

    // Neck
    ctx.fillStyle = this.colors.skinTone;
    ctx.fillRect(centerX - 4 * scale, centerY - 5 * scale, 8 * scale, 1 * scale);

    // Head
    ctx.fillStyle = this.colors.skinTone;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 10 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Hair (dark)
    ctx.fillStyle = '#2D1810';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 11 * scale, 4 * scale, Math.PI, 0);
    ctx.fill();

    // Standard military hat (no beret - distinguishes from Vityaz)
    ctx.fillStyle = '#4A4A4A';
    ctx.fillRect(centerX - 5 * scale, centerY - 13 * scale, 10 * scale, 2 * scale);

    // Eyes (angry expression)
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(centerX - 2 * scale, centerY - 10 * scale, 0.6 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 2 * scale, centerY - 10 * scale, 0.6 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Aggressive mouth
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 0.5 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 8 * scale, 1.5 * scale, 0, Math.PI);
    ctx.stroke();

    // Arms
    ctx.fillStyle = this.colors.skinTone;
    ctx.fillRect(centerX - 7 * scale, centerY - 2 * scale, 2 * scale, 8 * scale);
    ctx.fillRect(centerX + 5 * scale, centerY - 2 * scale, 2 * scale, 8 * scale);

    // Gloves
    ctx.fillStyle = this.colors.weaponBlack;
    ctx.fillRect(centerX - 7 * scale, centerY + 6 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(centerX + 5 * scale, centerY + 6 * scale, 2 * scale, 2 * scale);
  }

  private drawAK74M(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number
  ): void {
    const centerX = width / 2;
    const centerY = height / 2;

    // Barrel
    ctx.fillStyle = this.colors.weaponGray;
    ctx.fillRect(2, centerY - 1, width * 0.6, 2);

    // Gas tube (above barrel)
    ctx.fillStyle = this.colors.weaponBlack;
    ctx.fillRect(6, centerY - 4, width * 0.5, 1);

    // Receiver (main body)
    ctx.fillStyle = this.colors.weaponBlack;
    ctx.fillRect(width * 0.5, centerY - 2, width * 0.25, 4);

    // Charging handle (right side)
    ctx.fillStyle = this.colors.weaponBronze;
    ctx.fillRect(width * 0.75, centerY - 1, 3, 2);

    // Stock (rear)
    ctx.fillStyle = '#654321';
    ctx.fillRect(width * 0.75, centerY - 2, width * 0.2, 4);

    // Muzzle brake (front)
    ctx.fillStyle = this.colors.gray;
    ctx.fillRect(2, centerY - 2, 2, 4);
  }

  private drawSVD(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number
  ): void {
    const centerY = height / 2;

    // Long barrel
    ctx.fillStyle = this.colors.weaponGray;
    ctx.fillRect(2, centerY - 1, width * 0.7, 2);

    // Scope rails
    ctx.fillStyle = this.colors.weaponBlack;
    ctx.fillRect(10, centerY - 3, width * 0.5, 1);

    // Receiver
    ctx.fillStyle = this.colors.weaponBlack;
    ctx.fillRect(width * 0.55, centerY - 2, width * 0.2, 4);

    // Wood furniture
    ctx.fillStyle = '#8B6F47';
    ctx.fillRect(width * 0.75, centerY - 2, width * 0.2, 4);

    // Muzzle brake (distinctive SVD style)
    ctx.fillStyle = this.colors.gray;
    ctx.fillRect(2, centerY - 3, 3, 6);
  }

  private drawRPK74(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number
  ): void {
    const centerY = height / 2;

    // Heavy barrel
    ctx.fillStyle = this.colors.weaponGray;
    ctx.fillRect(2, centerY - 1.5, width * 0.65, 3);

    // Gas tube
    ctx.fillStyle = this.colors.weaponBlack;
    ctx.fillRect(6, centerY - 4, width * 0.55, 1);

    // Heavy receiver
    ctx.fillStyle = this.colors.weaponBlack;
    ctx.fillRect(width * 0.5, centerY - 2.5, width * 0.25, 5);

    // Bipod (characteristic of RPK)
    ctx.fillStyle = this.colors.weaponBronze;
    ctx.fillRect(width * 0.6, centerY + 2.5, 2, 1);
    ctx.fillRect(width * 0.7, centerY + 2.5, 2, 1);

    // Stock
    ctx.fillStyle = '#654321';
    ctx.fillRect(width * 0.75, centerY - 2, width * 0.2, 4);
  }

  private drawPMM(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number
  ): void {
    const centerY = height / 2;

    // Slide
    ctx.fillStyle = this.colors.weaponGray;
    ctx.fillRect(width * 0.3, centerY - 2, width * 0.5, 4);

    // Frame
    ctx.fillStyle = '#8B6F47';
    ctx.fillRect(width * 0.3, centerY - 1, width * 0.55, 2);

    // Trigger guard
    ctx.strokeStyle = this.colors.weaponBlack;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(width * 0.6, centerY, 2, 0, Math.PI * 2);
    ctx.stroke();

    // Muzzle (compact)
    ctx.fillStyle = this.colors.weaponGray;
    ctx.fillRect(width * 0.27, centerY - 1.5, 2, 3);
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    points: number = 5
  ): void {
    let angle = Math.PI / 2;
    const step = Math.PI / points;

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.5;
      const x = cx + Math.cos(angle) * r;
      const y = cy - Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      angle += step;
    }
    ctx.closePath();
    ctx.fill();
  }
}

export default VityazGraphicsGenerator;
