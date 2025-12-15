import Phaser from 'phaser'

/**
 * Main Menu Scene - Professional military-themed main menu
 * Features:
 * - VITYAZ logo with Spetsnaz emblem (Krapoovy beret on left)
 * - Russian language UI
 * - Play, Settings, Exit buttons
 * - Military aesthetic with camouflage pattern
 * - Smooth animations
 */
export default class MainMenuScene extends Phaser.Scene {
  private isHovering = {
    play: false,
    settings: false,
    exit: false,
  }

  constructor() {
    super({ key: 'MainMenuScene' })
  }

  preload() {
    // Assets will be loaded here in future
  }

  create() {
    const width = this.game.config.width as number
    const height = this.game.config.height as number
    const centerX = width / 2
    const centerY = height / 2

    // ===== BACKGROUND =====
    // Dark military background
    const bg = this.add
      .rectangle(centerX, centerY, width, height, 0x0d1117)
      .setOrigin(0.5, 0.5)
      .setAlpha(0)

    // Animated camouflage pattern overlay
    this.createCamouflagePattern(width, height)

    // Top military banner
    const topBanner = this.add
      .rectangle(centerX, 60, width, 120, 0x2d4a2e) // Dark military green
      .setOrigin(0.5, 0.5)
      .setAlpha(0)

    // Bottom military stripe
    const bottomStripe = this.add
      .rectangle(centerX, height - 40, width, 80, 0x4a3c2e) // Krapoovy dark
      .setOrigin(0.5, 0.5)
      .setAlpha(0)

    // ===== VITYAZ EMBLEM =====
    // Draw Krapoovy beret emblem (left side)
    this.createVityazEmblem(centerX - 300, 120)

    // ===== MAIN TITLE =====
    const titleText = this.add
      .text(centerX, 120, '🥊 ВИТЯЗЬ', {
        fontSize: '104px',
        fontStyle: 'bold',
        color: '#d4af37', // Military gold
        fontFamily: 'Impact, Arial Black, sans-serif',
        stroke: '#1a1a1a',
        strokeThickness: 6,
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
      .setShadow(4, 4, '#000000', 8, true, true)

    // Subtitle
    const subtitleText = this.add
      .text(centerX, 200, 'СПЕЦИАЛЬНЫЕ ОПЕРАЦИИ', {
        fontSize: '36px',
        color: '#9eb89e', // Light military green
        fontStyle: 'bold',
        letterSpacing: 4,
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)

    // Unit motto - Official Vityaz motto
    const motto = this.add
      .text(centerX, 250, '«Если не я, то кто? Если не сейчас, то когда?»', {
        fontSize: '18px',
        color: '#b8a885', // Light khaki
        fontStyle: 'italic',
        fontFamily: 'Georgia, serif',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)

    // Version badge with military styling
    const versionBadge = this.add
      .text(width - 120, 30, 'v0.1.0 АЛЬФА', {
        fontSize: '14px',
        color: '#d4af37',
        backgroundColor: '#1a1a1a',
        padding: { x: 12, y: 6 },
        fontFamily: 'Courier New, monospace',
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)

    // ===== BUTTONS SECTION =====
    const buttonWidth = 280
    const buttonHeight = 70
    const buttonSpacing = 100
    const startY = centerY + 80

    // ИГРАТЬ Button
    const playButton = this.createMilitaryButton(
      centerX,
      startY,
      buttonWidth,
      buttonHeight,
      '⚔️ ИГРАТЬ',
      () => {
        // Play confirmation sound
        this.cameras.main.flash(200, 45, 45, 45)
        this.cameras.main.fade(400, 0, 0, 0)
        this.time.delayedCall(400, () => {
          this.scene.start('CompleteGame')
        })
      },
      'play'
    )

    // НАСТРОЙКИ Button
    const settingsButton = this.createMilitaryButton(
      centerX,
      startY + buttonSpacing,
      buttonWidth,
      buttonHeight,
      '⚙️ НАСТРОЙКИ',
      () => {
        this.cameras.main.fade(300, 0, 0, 0)
        this.time.delayedCall(300, () => {
          this.scene.start('SettingsScene')
        })
      },
      'settings'
    )

    // ВЫХОД Button
    const exitButton = this.createMilitaryButton(
      centerX,
      startY + buttonSpacing * 2,
      buttonWidth,
      buttonHeight,
      '🚪 ВЫХОД',
      () => {
        this.cameras.main.fade(300, 0, 0, 0)
        this.time.delayedCall(300, () => {
          window.location.href = '/'
        })
      },
      'exit'
    )

    // ===== FOOTER =====
    const footerText = this.add
      .text(
        centerX,
        height - 40,
        '© 2025 ВИТЯЗЬ: Спецоперации | Разработано на Phaser 3',
        {
          fontSize: '13px',
          color: '#6b5d4f',
          fontFamily: 'Arial, sans-serif',
        }
      )
      .setOrigin(0.5, 0.5)
      .setAlpha(0)

    // Tactical grid decoration
    this.createTacticalGrid(width, height)

    // ===== ANIMATIONS =====
    // Fade in sequence
    this.tweens.add({
      targets: bg,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
    })

    this.tweens.add({
      targets: [topBanner, bottomStripe],
      alpha: 1,
      duration: 600,
      delay: 200,
      ease: 'Power2',
    })

    this.tweens.add({
      targets: titleText,
      alpha: 1,
      y: 120,
      duration: 800,
      delay: 400,
      ease: 'Back.easeOut',
    })

    this.tweens.add({
      targets: subtitleText,
      alpha: 1,
      duration: 600,
      delay: 600,
      ease: 'Power2',
    })

    this.tweens.add({
      targets: motto,
      alpha: 1,
      duration: 600,
      delay: 800,
      ease: 'Power2',
    })

    this.tweens.add({
      targets: [playButton, settingsButton, exitButton],
      alpha: 1,
      duration: 500,
      delay: 1000,
      ease: 'Power2',
    })

    this.tweens.add({
      targets: [versionBadge, footerText],
      alpha: 1,
      duration: 400,
      delay: 1200,
      ease: 'Power2',
    })

    // Subtle title pulse animation
    this.tweens.add({
      targets: titleText,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  /**
   * Create Vityaz emblem with Krapoovy beret (left side)
   */
  private createVityazEmblem(x: number, y: number): void {
    const emblem = this.add.container(x, y).setAlpha(0)

    // Shield background
    const shield = this.add.graphics()
    shield.fillStyle(0x2d4a2e, 1) // Dark military green
    shield.fillRoundedRect(-40, -50, 80, 100, 8)
    shield.lineStyle(3, 0xd4af37, 1) // Gold border
    shield.strokeRoundedRect(-40, -50, 80, 100, 8)

    // Krapoovy beret (tilted left)
    const beret = this.add.graphics()
    beret.fillStyle(0x8b4513, 1) // Krapoovy (maroon-brown)
    beret.fillEllipse(-8, -25, 45, 30) // Main beret shape, shifted left
    beret.lineStyle(2, 0x5a2d0c, 1) // Dark brown outline
    beret.strokeEllipse(-8, -25, 45, 30)

    // Beret badge (star)
    const star = this.add.graphics()
    star.fillStyle(0xd4af37, 1) // Gold star
    this.drawStar(star, -8, -25, 5, 8, 4)

    // Unit text
    const unitText = this.add.text(0, 30, 'ВИТЯЗЬ', {
      fontSize: '12px',
      color: '#d4af37',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5, 0.5)

    emblem.add([shield, beret, star, unitText])

    // Animate emblem appearance
    this.tweens.add({
      targets: emblem,
      alpha: 1,
      duration: 800,
      delay: 300,
      ease: 'Power2',
    })
  }

  /**
   * Draw a star shape
   */
  private drawStar(
    graphics: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ): void {
    let rot = (Math.PI / 2) * 3
    let x = cx
    let y = cy
    const step = Math.PI / spikes

    graphics.beginPath()
    graphics.moveTo(cx, cy - outerRadius)

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius
      y = cy + Math.sin(rot) * outerRadius
      graphics.lineTo(x, y)
      rot += step

      x = cx + Math.cos(rot) * innerRadius
      y = cy + Math.sin(rot) * innerRadius
      graphics.lineTo(x, y)
      rot += step
    }

    graphics.lineTo(cx, cy - outerRadius)
    graphics.closePath()
    graphics.fillPath()
  }

  /**
   * Create camouflage pattern background
   */
  private createCamouflagePattern(width: number, height: number): void {
    const pattern = this.add.graphics().setAlpha(0.15)

    // Random camouflage blobs
    const colors = [0x3a4d3a, 0x2d3d2d, 0x4a5a4a, 0x1a2a1a]

    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = 40 + Math.random() * 80
      const color = colors[Math.floor(Math.random() * colors.length)]

      pattern.fillStyle(color, 1)
      pattern.fillEllipse(x, y, radius, radius * 0.7)
    }
  }

  /**
   * Create tactical grid decoration
   */
  private createTacticalGrid(width: number, height: number): void {
    const grid = this.add.graphics().setAlpha(0.08)
    grid.lineStyle(1, 0x4a5a4a, 1)

    // Vertical lines
    for (let x = 0; x < width; x += 100) {
      grid.lineBetween(x, 0, x, height)
    }

    // Horizontal lines
    for (let y = 0; y < height; y += 100) {
      grid.lineBetween(0, y, width, y)
    }
  }

  /**
   * Create a military-styled button with hover effects
   */
  private createMilitaryButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    callback: () => void,
    key: 'play' | 'settings' | 'exit'
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y).setAlpha(0)

    // Button background with military styling
    const bg = this.add.graphics()
    bg.fillStyle(0x3d5a3d, 1) // Military green
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
    bg.lineStyle(3, 0x5a7a5a, 1) // Lighter green border
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)

    // Inner shadow effect
    const innerShadow = this.add.graphics()
    innerShadow.fillStyle(0x2d4a2d, 0.5)
    innerShadow.fillRoundedRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 8, 6)

    // Button text
    const text = this.add
      .text(0, 0, label, {
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#e8f0e8',
        fontFamily: 'Arial Black, sans-serif',
      })
      .setOrigin(0.5, 0.5)

    container.add([bg, innerShadow, text])
    container.setSize(width, height)
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    )

    // Hover effects
    container.on('pointerover', () => {
      this.isHovering[key] = true
      bg.clear()
      bg.fillStyle(0x5a7a5a, 1) // Lighter green
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
      bg.lineStyle(4, 0xd4af37, 1) // Gold border
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
      text.setColor('#ffd700') // Gold text
      container.setScale(1.05)
    })

    container.on('pointerout', () => {
      this.isHovering[key] = false
      bg.clear()
      bg.fillStyle(0x3d5a3d, 1)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
      bg.lineStyle(3, 0x5a7a5a, 1)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
      text.setColor('#e8f0e8')
      container.setScale(1)
    })

    // Click handler
    container.on('pointerdown', () => {
      container.setScale(0.95)
      this.time.delayedCall(150, () => {
        container.setScale(1.05)
        callback()
      })
    })

    return container
  }

  update() {
    // Future: Add particle effects, animated background elements
  }
}
