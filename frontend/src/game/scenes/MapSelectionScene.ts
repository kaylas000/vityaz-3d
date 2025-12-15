import Phaser from 'phaser';
import { GameMap } from '../maps/MapManager';

/**
 * Map Selection Scene
 * 
 * Features:
 * - 5 available maps with previews
 * - Difficulty selection (1-10)
 * - Map description and stats
 * - Vityaz branding throughout
 */

export class MapSelectionScene extends Phaser.Scene {
  private selectedMapIndex: number = 0;
  private selectedDifficulty: number = 1;
  private maps: MapInfo[] = [
    {
      id: GameMap.URBAN,
      name: 'URBAN ENVIRONMENT',
      description: 'Destroyed city with tactical positions',
      difficulty: 'Medium',
      enemyCount: '3-12+',
      playtime: '8-12 min',
      color: 0x8B8B8B,
    },
    {
      id: GameMap.INDUSTRIAL,
      name: 'INDUSTRIAL COMPLEX',
      description: 'Military industrial zone with platforms',
      difficulty: 'Hard',
      enemyCount: '4-12+',
      playtime: '10-14 min',
      color: 0x5A6268,
    },
    {
      id: GameMap.DESERT,
      name: 'DESERT TERRAIN',
      description: 'Minimal cover, maximum difficulty',
      difficulty: 'Hard',
      enemyCount: '5-12+',
      playtime: '12-16 min',
      color: 0xDEB887,
    },
    {
      id: GameMap.ARCTIC,
      name: 'ARCTIC BASE',
      description: 'Frozen military fortress',
      difficulty: 'Medium',
      enemyCount: '4-12+',
      playtime: '10-15 min',
      color: 0xF0F8FF,
    },
    {
      id: GameMap.UNDERGROUND,
      name: 'UNDERGROUND FACILITY',
      description: 'Dark bunker with limited visibility',
      difficulty: 'Very Hard',
      enemyCount: '6-12+',
      playtime: '15-20 min',
      color: 0x3A3A3A,
    },
  ];

  // Vityaz Colors
  readonly VITYAZ_CRIMSON = 0xA01030;
  readonly VITYAZ_GOLD = 0xD4AF37;
  readonly BACKGROUND_DARK = 0x1A1A1A;

  constructor() {
    super({ key: 'MapSelectionScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.createBackground();

    // Title
    this.createTitle(width);

    // Map carousel
    this.createMapCarousel(width, height);

    // Difficulty selector
    this.createDifficultySelector(width, height);

    // Bottom control panel
    this.createControlPanel(width, height);

    // Setup input
    this.setupInputHandlers();
  }

  private createBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillStyle(this.BACKGROUND_DARK, 1);
    bg.fillRect(0, 0, width, height);

    // Tactical grid
    bg.lineStyle(1, 0x333333, 0.1);
    for (let x = 0; x < width; x += 50) {
      bg.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 50) {
      bg.lineBetween(0, y, width, y);
    }
  }

  private createTitle(width: number): void {
    this.add.text(width / 2, 40, 'MAP SELECTION', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#A01030',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(width / 2, 85, 'Choose your battlefield', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#D4AF37',
    }).setOrigin(0.5);
  }

  private createMapCarousel(width: number, height: number): void {
    const carouselY = height * 0.3;
    const cardWidth = 280;
    const cardHeight = 220;
    const spacing = 100;

    // Draw map cards
    this.maps.forEach((map, index) => {
      const xOffset = index - this.selectedMapIndex;
      const cardX = width / 2 + xOffset * spacing - cardWidth / 2;
      const cardY = carouselY;

      const isSelected = index === this.selectedMapIndex;
      this.drawMapCard(cardX, cardY, cardWidth, cardHeight, map, isSelected);
    });
  }

  private drawMapCard(
    x: number,
    y: number,
    width: number,
    height: number,
    map: MapInfo,
    isSelected: boolean
  ): void {
    const graphics = this.add.graphics();

    if (isSelected) {
      // Selected state - large and highlighted
      graphics.fillStyle(map.color, 0.3);
      graphics.fillRect(x, y, width, height);
      graphics.lineStyle(3, this.VITYAZ_GOLD, 1);
      graphics.strokeRect(x, y, width, height);

      // Inner border glow
      graphics.lineStyle(1, this.VITYAZ_CRIMSON, 0.5);
      graphics.strokeRect(x - 3, y - 3, width + 6, height + 6);
    } else {
      // Unselected state - dimmed
      graphics.fillStyle(map.color, 0.15);
      graphics.fillRect(x, y, width, height);
      graphics.lineStyle(1, 0x555555, 0.5);
      graphics.strokeRect(x, y, width, height);
    }

    // Map name
    const nameColor = isSelected ? '#FFD700' : '#FFFFFF';
    this.add.text(x + width / 2, y + 20, map.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: isSelected ? '18px' : '14px',
      fontStyle: 'bold',
      color: nameColor,
      align: 'center',
      wordWrap: { width: width - 20 },
    }).setOrigin(0.5);

    // Description
    if (isSelected) {
      this.add.text(x + width / 2, y + 60, map.description, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#CCCCCC',
        align: 'center',
        wordWrap: { width: width - 20 },
      }).setOrigin(0.5);

      // Stats
      this.add.text(x + 15, y + 100, `Difficulty: ${map.difficulty}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#D4AF37',
      });

      this.add.text(x + 15, y + 120, `Enemies: ${map.enemyCount}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#D4AF37',
      });

      this.add.text(x + 15, y + 140, `Playtime: ${map.playtime}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#D4AF37',
      });
    }
  }

  private createDifficultySelector(width: number, height: number): void {
    const selectorY = height * 0.65;

    this.add.text(width * 0.2, selectorY - 30, 'DIFFICULTY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#D4AF37',
    });

    // Difficulty buttons
    for (let i = 1; i <= 10; i++) {
      const buttonX = width * 0.1 + (i - 1) * 45;
      this.drawDifficultyButton(buttonX, selectorY, i, i === this.selectedDifficulty);
    }

    // Difficulty description
    const descriptions: { [key: number]: string } = {
      1: 'Easy - Perfect for learning',
      5: 'Medium - Balanced challenge',
      8: 'Hard - Experienced players',
      10: 'Nightmare - For the brave',
    };

    if (descriptions[this.selectedDifficulty]) {
      this.add.text(width / 2, selectorY + 60, descriptions[this.selectedDifficulty], {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#CCCCCC',
      }).setOrigin(0.5);
    }
  }

  private drawDifficultyButton(x: number, y: number, level: number, isSelected: boolean): void {
    const size = 40;
    const graphics = this.add.graphics();

    if (isSelected) {
      graphics.fillStyle(this.VITYAZ_CRIMSON, 0.8);
      graphics.fillRect(x - size / 2, y - size / 2, size, size);
      graphics.lineStyle(2, this.VITYAZ_GOLD, 1);
      graphics.strokeRect(x - size / 2, y - size / 2, size, size);
    } else {
      graphics.fillStyle(0x333333, 0.5);
      graphics.fillRect(x - size / 2, y - size / 2, size, size);
      graphics.lineStyle(1, 0x555555, 1);
      graphics.strokeRect(x - size / 2, y - size / 2, size, size);
    }

    // Level number
    const color = isSelected ? '#FFD700' : '#FFFFFF';
    this.add.text(x, y, level.toString(), {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: color,
    }).setOrigin(0.5);
  }

  private createControlPanel(width: number, height: number): void {
    const panelY = height - 100;

    const panel = this.add.graphics();
    panel.fillStyle(0x333333, 0.3);
    panel.fillRect(0, panelY, width, 100);
    panel.lineStyle(2, this.VITYAZ_GOLD, 0.8);
    panel.lineBetween(0, panelY, width, panelY);

    // Left side: Navigation
    this.add.text(20, panelY + 15, 'LEFT/RIGHT: Navigate Maps', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#CCCCCC',
    });

    this.add.text(20, panelY + 35, 'UP/DOWN: Change Difficulty', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#CCCCCC',
    });

    this.add.text(20, panelY + 55, 'ENTER: Start | ESC: Back', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#CCCCCC',
    });

    // Right side: Map info
    const selectedMap = this.maps[this.selectedMapIndex];
    this.add.text(width - 20, panelY + 15, `Selected: ${selectedMap.name}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#FFD700',
      align: 'right',
    }).setOrigin(1, 0);

    this.add.text(
      width - 20,
      panelY + 35,
      `Difficulty: ${this.selectedDifficulty}/10`,
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#FFD700',
        align: 'right',
      }
    ).setOrigin(1, 0);
  }

  private setupInputHandlers(): void {
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'arrowleft':
          this.selectedMapIndex =
            (this.selectedMapIndex - 1 + this.maps.length) % this.maps.length;
          this.scene.restart();
          break;

        case 'arrowright':
          this.selectedMapIndex = (this.selectedMapIndex + 1) % this.maps.length;
          this.scene.restart();
          break;

        case 'arrowup':
          this.selectedDifficulty = Math.min(10, this.selectedDifficulty + 1);
          this.scene.restart();
          break;

        case 'arrowdown':
          this.selectedDifficulty = Math.max(1, this.selectedDifficulty - 1);
          this.scene.restart();
          break;

        case 'enter':
          this.startGame();
          break;

        case 'escape':
          this.scene.start('MainMenuScene');
          break;
      }
    });
  }

  private startGame(): void {
    const selectedMap = this.maps[this.selectedMapIndex];
    console.log(
      `[MapSelectionScene] Starting ${selectedMap.name} at difficulty ${this.selectedDifficulty}`
    );

    // Pass data to game scene
    this.scene.start('GameScene', {
      mapId: selectedMap.id,
      difficulty: this.selectedDifficulty,
    });
  }
}

interface MapInfo {
  id: GameMap;
  name: string;
  description: string;
  difficulty: string;
  enemyCount: string;
  playtime: string;
  color: number;
}
