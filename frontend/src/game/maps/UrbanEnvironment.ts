import Phaser from 'phaser';

/**
 * Urban Environment Map
 * 
 * VITYAZ Theme: Special Operations in urban combat
 * Features:
 * - Destroyed buildings with tactical positions
 * - Military checkpoints and fortifications
 * - Vityaz unit symbolism (crimson beret, tactical gear)
 * - Dynamic lighting and weather effects
 * - Multiple engagement zones
 */

export interface MapConfig {
  width: number;
  height: number;
  tileSize: number;
  difficulty: number;
}

export interface TacticalPosition {
  x: number;
  y: number;
  type: 'cover' | 'sniper' | 'spawn' | 'objective';
  armor?: number;
}

export class UrbanEnvironment {
  scene: Phaser.Scene;
  config: MapConfig;
  tacticalPositions: TacticalPosition[] = [];
  graphics: Phaser.GameObjects.Graphics;
  
  // VITYAZ Colors (Official Unit Colors)
  readonly VITYAZ_CRIMSON = 0xA01030;      // Crimson beret color (краповый цвет)
  readonly VITYAZ_GOLD = 0xD4AF37;         // Gold insignia
  readonly MILITARY_GRAY = 0x4A5568;       // Military gray
  readonly CONCRETE = 0x8B8B8B;            // Concrete/stone
  readonly SMOKE = 0x555555;               // Smoke color
  
  constructor(scene: Phaser.Scene, config: MapConfig) {
    this.scene = scene;
    this.config = config;
    this.graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  }

  /**
   * Initialize and render Urban Environment
   */
  create(): void {
    // Create background (destroyed city)
    this.createBackground();
    
    // Create buildings and cover
    this.createBuildings();
    
    // Create tactical positions
    this.createTacticalPositions();
    
    // Add Vityaz unit symbolism
    this.addVityazSymbolism();
    
    // Create destructible elements
    this.createDestructibles();
    
    // Add atmospheric effects
    this.createAtmosphere();
  }

  /**
   * Create urban background with destroyed cityscape
   */
  private createBackground(): void {
    // Sky (dawn/combat time)
    const sky = this.scene.make.graphics({ x: 0, y: 0, add: true });
    sky.fillStyle(0x3A4A5C, 1); // Dawn sky
    sky.fillRect(0, 0, this.config.width, this.config.height * 0.3);
    
    // Smoke haze from distant explosions
    sky.fillStyle(0x2A3A4C, 0.4);
    sky.fillRect(0, this.config.height * 0.1, this.config.width, 100);
    
    // Distant destroyed buildings silhouette
    this.drawDistantBuildingsSilhouette(sky);
  }

  /**
   * Draw silhouette of destroyed buildings
   */
  private drawDistantBuildingsSilhouette(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0x1A2A3C, 1);
    
    // Far left ruined tower
    graphics.fillRect(0, this.config.height * 0.15, 80, this.config.height * 0.25);
    graphics.fillRect(20, this.config.height * 0.05, 30, this.config.height * 0.15);
    
    // Center destroyed complex
    graphics.fillRect(200, this.config.height * 0.2, 150, this.config.height * 0.2);
    graphics.fillRect(250, this.config.height * 0.1, 50, this.config.height * 0.25);
    
    // Right industrial sector
    graphics.fillRect(this.config.width - 200, this.config.height * 0.18, 180, this.config.height * 0.22);
    graphics.fillRect(this.config.width - 100, this.config.height * 0.08, 80, this.config.height * 0.3);
  }

  /**
   * Create main buildings and structures
   */
  private createBuildings(): void {
    const graphics = this.graphics;
    graphics.clear();

    // Building 1: Main Police Station (damaged) - Left side
    this.drawDamagedBuilding(
      graphics,
      100, 250,
      200, 300,
      'police', // Fortress-like, now tactical position
      0.7
    );

    // Building 2: Administrative Center - Center
    this.drawDamagedBuilding(
      graphics,
      this.config.width / 2 - 150, 200,
      300, 250,
      'admin',
      0.6
    );

    // Building 3: Industrial Warehouse - Right side
    this.drawDamagedBuilding(
      graphics,
      this.config.width - 350, 300,
      280, 220,
      'warehouse',
      0.5
    );

    // Building 4: Apartment Complex - Bottom
    this.drawDamagedBuilding(
      graphics,
      this.config.width / 2 - 100, this.config.height - 250,
      250, 200,
      'apartment',
      0.65
    );

    graphics.strokePath();
  }

  /**
   * Draw a damaged building with tactical characteristics
   */
  private drawDamagedBuilding(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    type: string,
    damageLevel: number // 0-1, 1 = fully destroyed
  ): void {
    // Main structure
    graphics.fillStyle(this.CONCRETE, 1);
    graphics.fillRect(x, y, width, height);
    
    // Damage cracks (more cracks = more damage)
    const crackCount = Math.floor(damageLevel * 8);
    graphics.lineStyle(2, 0x3A3A3A, 0.8);
    
    for (let i = 0; i < crackCount; i++) {
      const startX = x + Math.random() * width;
      const startY = y + Math.random() * height;
      const endX = startX + (Math.random() - 0.5) * 100;
      const endY = startY + (Math.random() - 0.5) * 100;
      graphics.lineBetween(startX, startY, endX, endY);
    }
    
    // Windows (some destroyed)
    this.drawBuildingWindows(graphics, x, y, width, height, damageLevel, type);
    
    // Bullet holes
    this.drawBulletHoles(graphics, x, y, width, height, damageLevel);
    
    // Burnt marks from explosions
    if (damageLevel > 0.4) {
      graphics.fillStyle(0x1A1A1A, 0.5);
      for (let i = 0; i < Math.floor(damageLevel * 5); i++) {
        const spotX = x + Math.random() * width;
        const spotY = y + Math.random() * height;
        graphics.fillCircle(spotX, spotY, 20 + Math.random() * 30);
      }
    }
  }

  /**
   * Draw windows on buildings (some broken)
   */
  private drawBuildingWindows(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    damageLevel: number,
    type: string
  ): void {
    const windowSize = 30;
    const spacing = 50;
    const rows = Math.floor(height / spacing);
    const cols = Math.floor(width / spacing);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const wx = x + col * spacing + 10;
        const wy = y + row * spacing + 10;
        
        // Randomly broken windows based on damage
        if (Math.random() > damageLevel) {
          graphics.fillStyle(0x1A3A5A, 1); // Glass blue
          graphics.fillRect(wx, wy, windowSize, windowSize);
          
          // Reflection highlight
          graphics.fillStyle(0x4A5A7A, 0.5);
          graphics.fillRect(wx + 5, wy + 5, 8, 8);
        } else {
          // Broken window - show interior darkness
          graphics.fillStyle(0x0A0A0A, 1);
          graphics.fillRect(wx, wy, windowSize, windowSize);
          
          // Broken glass shards
          graphics.lineStyle(1, 0x303030, 0.8);
          graphics.lineBetween(wx, wy, wx + windowSize, wy + windowSize);
          graphics.lineBetween(wx + windowSize, wy, wx, wy + windowSize);
        }
      }
    }
  }

  /**
   * Draw bullet holes for realistic combat damage
   */
  private drawBulletHoles(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    damageLevel: number
  ): void {
    const holeCount = Math.floor(damageLevel * 15);
    graphics.fillStyle(0x0A0A0A, 1);
    
    for (let i = 0; i < holeCount; i++) {
      const hx = x + Math.random() * width;
      const hy = y + Math.random() * height;
      const holeRadius = 2 + Math.random() * 3;
      
      graphics.fillCircle(hx, hy, holeRadius);
      
      // Radial cracks around hole
      graphics.lineStyle(0.5, 0x3A3A3A, 0.6);
      for (let j = 0; j < 4; j++) {
        const angle = (Math.PI * 2 * j) / 4;
        const endX = hx + Math.cos(angle) * (10 + Math.random() * 15);
        const endY = hy + Math.sin(angle) * (10 + Math.random() * 15);
        graphics.lineBetween(hx, hy, endX, endY);
      }
    }
  }

  /**
   * Create tactical positions (cover points, sniper nests, etc.)
   */
  private createTacticalPositions(): void {
    // Main cover positions
    this.tacticalPositions.push(
      // Left building positions
      { x: 150, y: 300, type: 'cover', armor: 100 },
      { x: 220, y: 400, type: 'cover', armor: 80 },
      { x: 180, y: 500, type: 'sniper', armor: 60 },
      
      // Center positions
      { x: this.config.width / 2, y: 250, type: 'cover', armor: 120 },
      { x: this.config.width / 2 + 100, y: 350, type: 'cover', armor: 100 },
      
      // Right side positions
      { x: this.config.width - 250, y: 320, type: 'cover', armor: 90 },
      { x: this.config.width - 150, y: 400, type: 'sniper', armor: 50 },
      
      // Objective markers
      { x: this.config.width / 2, y: this.config.height - 100, type: 'objective' }
    );

    // Draw tactical markers
    this.drawTacticalMarkers();
  }

  /**
   * Draw tactical position markers
   */
  private drawTacticalMarkers(): void {
    const graphics = this.graphics;
    
    this.tacticalPositions.forEach((pos) => {
      if (pos.type === 'cover') {
        // Draw cover marker
        graphics.fillStyle(0x4A7C4E, 0.7);
        graphics.fillCircle(pos.x, pos.y, 15);
        graphics.lineStyle(2, 0x8AFF8A, 1);
        graphics.strokeCircleShape(new Phaser.Geom.Circle(pos.x, pos.y, 15));
      } else if (pos.type === 'sniper') {
        // Draw sniper position
        graphics.fillStyle(0x8B7355, 0.7);
        graphics.fillRect(pos.x - 10, pos.y - 10, 20, 20);
        graphics.lineStyle(2, 0xFFB347, 1);
        graphics.strokeRect(pos.x - 10, pos.y - 10, 20, 20);
      } else if (pos.type === 'objective') {
        // Draw objective marker with Vityaz colors
        graphics.fillStyle(this.VITYAZ_CRIMSON, 0.6);
        graphics.fillStar(pos.x, pos.y, 5, 20, 10);
        graphics.lineStyle(2, this.VITYAZ_GOLD, 1);
        graphics.strokeCircleShape(new Phaser.Geom.Circle(pos.x, pos.y, 25));
      }
    });
  }

  /**
   * Add Vityaz unit symbolism to the map
   */
  private addVityazSymbolism(): void {
    const graphics = this.graphics;
    
    // 1. CRIMSON BERET ICON on dominant building
    this.drawCrimsonBeretIcon(graphics, 150, 220, 40);
    
    // 2. VITYAZ UNIT EMBLEM at objective
    this.drawVityazUnitEmblem(graphics, this.config.width / 2 - 35, this.config.height - 150);
    
    // 3. TACTICAL CALLSIGNS on buildings
    this.drawTacticalCallsigns(graphics);
    
    // 4. UNIT FLAG (torn, battle-worn)
    this.drawBattleWornFlag(graphics, this.config.width - 100, 150);
  }

  /**
   * Draw Crimson Beret Icon (Vityaz symbol)
   * Берет заложен на левую сторону
   */
  private drawCrimsonBeretIcon(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number
  ): void {
    // Beret base shape (tilted left)
    graphics.fillStyle(this.VITYAZ_CRIMSON, 1); // Crimson color
    
    // Main beret circle (tilted to left side)
    graphics.save();
    graphics.translate(x, y);
    graphics.rotate(-0.3); // 30-degree tilt to the left
    
    // Beret dome
    graphics.beginPath();
    graphics.arc(0, 0, size * 0.7, 0, Math.PI, true);
    graphics.lineTo(size * 0.7, 0);
    graphics.closePath();
    graphics.fillPath();
    
    // Beret band (visor)
    graphics.fillStyle(0x1A1A1A, 1);
    graphics.fillRect(-size * 0.75, size * 0.6, size * 1.5, size * 0.2);
    
    // Gold insignia on beret (star with hammer and sickle)
    graphics.fillStyle(this.VITYAZ_GOLD, 1);
    graphics.fillStar(0, -size * 0.3, 5, size * 0.25, size * 0.15);
    
    graphics.restore();
    
    // Label underneath
    graphics.fillStyle(this.VITYAZ_GOLD, 1);
    graphics.fillText('VITYAZ', x - 20, y + 60, { fontSize: '12px', color: '#D4AF37' });
  }

  /**
   * Draw Vityaz Unit Emblem (official unit insignia)
   */
  private drawVityazUnitEmblem(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number
  ): void {
    // Outer circle (medal style)
    graphics.lineStyle(3, this.VITYAZ_CRIMSON, 1);
    graphics.strokeCircleShape(new Phaser.Geom.Circle(x, y, 50));
    
    // Inner circle
    graphics.lineStyle(2, this.VITYAZ_GOLD, 1);
    graphics.strokeCircleShape(new Phaser.Geom.Circle(x, y, 40));
    
    // Central star (5-pointed)
    graphics.fillStyle(this.VITYAZ_GOLD, 1);
    graphics.fillStar(x, y - 5, 5, 25, 15);
    
    // Bottom banner area
    graphics.fillStyle(this.VITYAZ_CRIMSON, 0.8);
    graphics.fillRect(x - 40, y + 25, 80, 20);
    
    // Text on banner
    graphics.fillStyle(this.VITYAZ_GOLD, 1);
    graphics.fillText('SPETSNAZ', x - 30, y + 37, { fontSize: '10px', color: '#D4AF37' });
  }

  /**
   * Draw tactical callsigns on buildings
   */
  private drawTacticalCallsigns(graphics: Phaser.GameObjects.Graphics): void {
    const callsigns = [
      { x: 120, y: 260, text: 'ALPHA' },
      { x: this.config.width / 2 - 80, y: 220, text: 'BRAVO' },
      { x: this.config.width - 320, y: 300, text: 'CHARLIE' },
    ];
    
    callsigns.forEach((callsign) => {
      // Callsign box
      graphics.fillStyle(this.MILITARY_GRAY, 0.7);
      graphics.fillRect(callsign.x - 25, callsign.y - 12, 50, 24);
      
      // Border
      graphics.lineStyle(2, this.VITYAZ_CRIMSON, 1);
      graphics.strokeRect(callsign.x - 25, callsign.y - 12, 50, 24);
      
      // Text
      graphics.fillStyle(this.VITYAZ_GOLD, 1);
      graphics.fillText(callsign.text, callsign.x - 20, callsign.y, {
        fontSize: '10px',
        color: '#D4AF37',
      });
    });
  }

  /**
   * Draw battle-worn unit flag
   */
  private drawBattleWornFlag(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number
  ): void {
    // Flag pole (damaged)
    graphics.lineStyle(3, 0x3A3A3A, 1);
    graphics.lineBetween(x, y, x, y + 120);
    
    // Flag cloth (torn Russian flag colors)
    graphics.fillStyle(0xFFFFFF, 0.8); // White stripe
    graphics.fillRect(x + 5, y + 10, 60, 20);
    
    graphics.fillStyle(0x0039A6, 0.8); // Blue stripe
    graphics.fillRect(x + 5, y + 30, 60, 20);
    
    graphics.fillStyle(this.VITYAZ_CRIMSON, 0.8); // Crimson stripe (Vityaz colors)
    graphics.fillRect(x + 5, y + 50, 60, 20);
    
    // Flag damage (torn corners)
    graphics.fillStyle(0x1A1A1A, 1);
    graphics.fillTriangle(x + 65, y + 10, x + 70, y, x + 70, y + 20);
    graphics.fillTriangle(x + 65, y + 70, x + 70, y + 60, x + 70, y + 80);
    
    // Bullet holes in flag
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(x + 30, y + 25, 2);
    graphics.fillCircle(x + 45, y + 40, 2);
    graphics.fillCircle(x + 25, y + 55, 2);
  }

  /**
   * Create destructible elements (barrels, boxes)
   */
  private createDestructibles(): void {
    const graphics = this.graphics;
    
    // Metal barrels (for cover and destruction)
    this.drawDestructibleBarrel(graphics, 300, 400, 20);
    this.drawDestructibleBarrel(graphics, 350, 420, 20);
    this.drawDestructibleBarrel(graphics, 250, 380, 20);
    
    // Concrete barriers
    this.drawConcreteBarrier(graphics, 500, 350, 80, 30);
    this.drawConcreteBarrier(graphics, this.config.width - 300, 450, 100, 25);
    
    // Sandbag positions
    this.drawSandbagPosition(graphics, 600, 500, 8);
    this.drawSandbagPosition(graphics, this.config.width - 150, 300, 6);
  }

  /**
   * Draw destructible barrel
   */
  private drawDestructibleBarrel(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    radius: number
  ): void {
    // Barrel body
    graphics.fillStyle(0xFF6B35, 1);
    graphics.fillCircle(x, y, radius);
    
    // Metal bands
    graphics.lineStyle(2, 0x333333, 1);
    graphics.strokeCircleShape(new Phaser.Geom.Circle(x, y, radius));
    graphics.strokeCircleShape(new Phaser.Geom.Circle(x, y, radius * 0.6));
    
    // Rust spots
    graphics.fillStyle(0x8B4513, 0.6);
    graphics.fillCircle(x - 5, y - 8, 3);
    graphics.fillCircle(x + 8, y + 5, 2);
  }

  /**
   * Draw concrete barrier
   */
  private drawConcreteBarrier(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    // Main barrier
    graphics.fillStyle(this.CONCRETE, 1);
    graphics.fillRect(x, y, width, height);
    
    // Border definition
    graphics.lineStyle(2, 0x5A5A5A, 1);
    graphics.strokeRect(x, y, width, height);
    
    // Weathering (darker spots)
    graphics.fillStyle(0x3A3A3A, 0.4);
    for (let i = 0; i < 5; i++) {
      const wx = x + Math.random() * width;
      const wy = y + Math.random() * height;
      graphics.fillCircle(wx, wy, 3 + Math.random() * 5);
    }
  }

  /**
   * Draw sandbag position
   */
  private drawSandbagPosition(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    count: number
  ): void {
    for (let i = 0; i < count; i++) {
      const sx = x + (i % 3) * 20;
      const sy = y - Math.floor(i / 3) * 20;
      
      graphics.fillStyle(0xD2B48C, 1);
      graphics.fillRect(sx, sy, 18, 15);
      
      graphics.lineStyle(1, 0x8B7355, 0.8);
      graphics.strokeRect(sx, sy, 18, 15);
      
      // Canvas texture
      graphics.lineBetween(sx + 2, sy + 5, sx + 16, sy + 5);
      graphics.lineBetween(sx + 2, sy + 10, sx + 16, sy + 10);
    }
  }

  /**
   * Create atmospheric effects (smoke, dust, lighting)
   */
  private createAtmosphere(): void {
    const graphics = this.graphics;
    
    // Smoke plumes from distant fires
    this.drawSmokePlume(graphics, 400, 150, 50, 0.6);
    this.drawSmokePlume(graphics, this.config.width - 200, 200, 60, 0.5);
    
    // Dust particles floating
    this.drawDustParticles(graphics);
    
    // Lighting effects (morning light)
    graphics.fillStyle(0xFFD700, 0.15);
    graphics.fillRect(0, 0, this.config.width, 200);
    
    // Add graphics to scene
    this.scene.add.existing(graphics);
  }

  /**
   * Draw smoke plume
   */
  private drawSmokePlume(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    height: number,
    opacity: number
  ): void {
    graphics.fillStyle(this.SMOKE, opacity);
    
    // Smoke waves
    for (let i = 0; i < 3; i++) {
      const offsetY = y - i * 30;
      graphics.fillCircle(x + Math.sin(i) * 20, offsetY, 30 - i * 8);
    }
  }

  /**
   * Draw floating dust particles
   */
  private drawDustParticles(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0xCCCCCC, 0.2);
    
    for (let i = 0; i < 30; i++) {
      const px = Math.random() * this.config.width;
      const py = Math.random() * this.config.height;
      const size = 1 + Math.random() * 2;
      graphics.fillCircle(px, py, size);
    }
  }

  /**
   * Get collider geometry for buildings
   */
  getCollisionBodies(): Phaser.Geom.Rectangle[] {
    return [
      new Phaser.Geom.Rectangle(100, 250, 200, 300),
      new Phaser.Geom.Rectangle(this.config.width / 2 - 150, 200, 300, 250),
      new Phaser.Geom.Rectangle(this.config.width - 350, 300, 280, 220),
      new Phaser.Geom.Rectangle(this.config.width / 2 - 100, this.config.height - 250, 250, 200),
    ];
  }

  /**
   * Get tactical positions
   */
  getTacticalPositions(): TacticalPosition[] {
    return this.tacticalPositions;
  }
}
