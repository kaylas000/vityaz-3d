import Phaser from 'phaser'

/**
 * Settings Scene - Game configuration and preferences
 * Features:
 * - Volume controls (Master, Music, SFX)
 * - Language selection (Russian/English)
 * - Fullscreen mode toggle
 * - Settings persistence
 * - Military aesthetic
 */
export default class SettingsScene extends Phaser.Scene {
  private volumeSettings = {
    master: 0.8,
    music: 0.6,
    sfx: 0.8,
  }

  private languageSettings = 'ru' // 'ru' or 'en'
  private fullscreenMode = false

  private sliderValues = {
    master: { text: null as Phaser.GameObjects.Text | null, value: 80 },
    music: { text: null as Phaser.GameObjects.Text | null, value: 60 },
    sfx: { text: null as Phaser.GameObjects.Text | null, value: 80 },
  }

  private languageButtons: {
    ru: Phaser.GameObjects.Container | null
    en: Phaser.GameObjects.Container | null
  } = { ru: null, en: null }

  constructor() {
    super({ key: 'SettingsScene' })
  }

  preload() {
    // Load settings from localStorage
    this.loadSettings()
  }

  create() {
    const width = this.game.config.width as number
    const height = this.game.config.height as number
    const centerX = width / 2
    const centerY = height / 2

    // ===== BACKGROUND =====
    const bg = this.add
      .rectangle(centerX, centerY, width, height, 0x0d1117)
      .setOrigin(0.5, 0.5)
      .setAlpha(0)

    // Camouflage overlay
    this.createCamouflagePattern(width, height)

    // Top banner
    const topBanner = this.add
      .rectangle(centerX, 60, width, 120, 0x2d4a2e)
      .setOrigin(0.5, 0.5)
      .setAlpha(0)

    // ===== TITLE =====
    const titleText = this.add
      .text(centerX, 100, '⚙️ НАСТРОЙКИ', {
        fontSize: '72px',
        fontStyle: 'bold',
        color: '#d4af37',
        fontFamily: 'Impact, Arial Black, sans-serif',
        stroke: '#1a1a1a',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
      .setShadow(3, 3, '#000000', 6, true, true)

    // ===== VOLUME SECTION =====
    const volumeSectionY = centerY - 120

    // Volume title
    this.add
      .text(centerX - 300, volumeSectionY, '🔊 ГРОМКОСТЬ', {
        fontSize: '24px',
        color: '#9eb89e',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0, 0.5)
      .setAlpha(0)

    // Master Volume Slider
    this.createVolumeSlider(
      centerX - 250,
      volumeSectionY + 50,
      'Master',
      'master',
      this.volumeSettings.master
    )

    // Music Volume Slider
    this.createVolumeSlider(
      centerX - 250,
      volumeSectionY + 110,
      'Music',
      'music',
      this.volumeSettings.music
    )

    // SFX Volume Slider
    this.createVolumeSlider(
      centerX - 250,
      volumeSectionY + 170,
      'Sound Effects',
      'sfx',
      this.volumeSettings.sfx
    )

    // ===== LANGUAGE SECTION =====
    const languageSectionY = volumeSectionY + 280

    this.add
      .text(centerX - 300, languageSectionY, '🌐 ЯЗЫК', {
        fontSize: '24px',
        color: '#9eb89e',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0, 0.5)
      .setAlpha(0)

    // Russian button
    this.languageButtons.ru = this.createLanguageButton(
      centerX - 150,
      languageSectionY + 60,
      '🇷🇺 Русский',
      'ru'
    )

    // English button
    this.languageButtons.en = this.createLanguageButton(
      centerX + 100,
      languageSectionY + 60,
      '🇬🇧 English',
      'en'
    )

    // ===== DISPLAY SECTION =====
    const displaySectionY = languageSectionY + 150

    this.add
      .text(centerX - 300, displaySectionY, '📺 ОТОБРАЖЕНИЕ', {
        fontSize: '24px',
        color: '#9eb89e',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0, 0.5)
      .setAlpha(0)

    // Fullscreen toggle
    this.createToggleButton(
      centerX - 150,
      displaySectionY + 60,
      'Полноэкран',
      this.fullscreenMode,
      () => {
        this.fullscreenMode = !this.fullscreenMode
        if (this.fullscreenMode) {
          this.scale.startFullscreen()
        } else {
          this.scale.stopFullscreen()
        }
      }
    )

    // ===== ACTION BUTTONS =====
    const actionButtonY = height - 100
    const buttonWidth = 220
    const buttonHeight = 60

    // Apply button (green)
    this.createActionButton(
      centerX - 150,
      actionButtonY,
      buttonWidth,
      buttonHeight,
      '✓ ПРИМЕНИТЬ',
      () => {
        this.saveSettings()
        this.cameras.main.fade(300, 0, 0, 0)
        this.time.delayedCall(300, () => {
          this.scene.start('MainMenuScene')
        })
      },
      '#4a7a4a' // Green
    )

    // Back button (red)
    this.createActionButton(
      centerX + 150,
      actionButtonY,
      buttonWidth,
      buttonHeight,
      '← НАЗАД',
      () => {
        this.cameras.main.fade(300, 0, 0, 0)
        this.time.delayedCall(300, () => {
          this.scene.start('MainMenuScene')
        })
      },
      '#7a4a4a' // Dark red
    )

    // ===== ANIMATIONS =====
    this.tweens.add({
      targets: [bg, topBanner],
      alpha: 1,
      duration: 500,
      ease: 'Power2',
    })

    this.tweens.add({
      targets: titleText,
      alpha: 1,
      duration: 600,
      delay: 200,
      ease: 'Back.easeOut',
    })

    // Fade in all text elements
    this.tweens.add({
      targets: this.children.list.filter(
        (obj) => obj instanceof Phaser.GameObjects.Text && obj !== titleText
      ),
      alpha: 1,
      duration: 400,
      delay: 400,
      ease: 'Power2',
    })
  }

  /**
   * Create a volume slider
   */
  private createVolumeSlider(
    x: number,
    y: number,
    label: string,
    key: 'master' | 'music' | 'sfx',
    initialValue: number
  ): void {
    const sliderWidth = 250
    const sliderHeight = 8

    // Label
    this.add
      .text(x, y - 25, label, {
        fontSize: '16px',
        color: '#b8a885',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0, 0.5)
      .setAlpha(0)

    // Background track
    const track = this.add
      .rectangle(x + 120, y, sliderWidth, sliderHeight, 0x4a5a4a)
      .setOrigin(0, 0.5)
      .setAlpha(0)

    // Filled portion
    const fill = this.add
      .rectangle(
        x + 120,
        y,
        sliderWidth * initialValue,
        sliderHeight,
        0x6b9e6b
      )
      .setOrigin(0, 0.5)
      .setAlpha(0)

    // Slider handle
    const handle = this.add
      .circle(x + 120 + sliderWidth * initialValue - sliderWidth / 2, y, 12, 0xd4af37)
      .setInteractive()
      .setAlpha(0)

    // Value text
    const valueText = this.add
      .text(
        x + 120 + sliderWidth + 40,
        y,
        Math.round(initialValue * 100) + '%',
        {
          fontSize: '16px',
          color: '#d4af37',
          fontFamily: 'Arial, sans-serif',
          fontStyle: 'bold',
        }
      )
      .setOrigin(0, 0.5)
      .setAlpha(0)

    this.sliderValues[key].text = valueText
    this.sliderValues[key].value = Math.round(initialValue * 100)

    // Handle drag
    const pointer = this.input.activePointer
    let isDragging = false

    handle.on('pointerdown', () => {
      isDragging = true
    })

    this.input.on('pointerup', () => {
      isDragging = false
    })

    this.input.on('pointermove', (event: Phaser.Input.Pointer) => {
      if (!isDragging) return

      // Calculate position
      let newX = event.worldX
      const minX = x + 120 - sliderWidth / 2
      const maxX = x + 120 + sliderWidth / 2

      newX = Phaser.Math.Clamp(newX, minX, maxX)

      // Update handle position
      handle.setX(newX)

      // Calculate value (0-1)
      const value = (newX - minX) / sliderWidth
      this.volumeSettings[key] = value

      // Update fill width
      fill.setDisplayWidth(sliderWidth * value)
      fill.setX(x + 120 - sliderWidth / 2 + (sliderWidth * value) / 2)

      // Update text
      const percent = Math.round(value * 100)
      valueText.setText(percent + '%')
      this.sliderValues[key].value = percent
    })
  }

  /**
   * Create a language selection button
   */
  private createLanguageButton(
    x: number,
    y: number,
    label: string,
    lang: 'ru' | 'en'
  ): Phaser.GameObjects.Container {
    const width = 160
    const height = 50

    const container = this.add.container(x, y).setAlpha(0)

    const bg = this.add.graphics()
    const isSelected = this.languageSettings === lang
    const bgColor = isSelected ? 0x5a7a5a : 0x3d5a3d
    const borderColor = isSelected ? 0xd4af37 : 0x5a7a5a

    bg.fillStyle(bgColor, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6)
    bg.lineStyle(2, borderColor, 1)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6)

    const text = this.add
      .text(0, 0, label, {
        fontSize: '16px',
        color: isSelected ? '#ffd700' : '#e8f0e8',
        fontStyle: 'bold',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(0.5, 0.5)

    container.add([bg, text])
    container.setSize(width, height)
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    )

    container.on('pointerdown', () => {
      this.languageSettings = lang
      // Reset all language buttons
      if (this.languageButtons.ru) {
        this.updateLanguageButtonStyle(this.languageButtons.ru, lang === 'ru')
      }
      if (this.languageButtons.en) {
        this.updateLanguageButtonStyle(this.languageButtons.en, lang === 'en')
      }
    })

    return container
  }

  /**
   * Update language button styling
   */
  private updateLanguageButtonStyle(
    button: Phaser.GameObjects.Container,
    isSelected: boolean
  ): void {
    const graphics = button.getAt(0) as Phaser.GameObjects.Graphics
    const textObj = button.getAt(1) as Phaser.GameObjects.Text

    graphics.clear()
    const bgColor = isSelected ? 0x5a7a5a : 0x3d5a3d
    const borderColor = isSelected ? 0xd4af37 : 0x5a7a5a

    graphics.fillStyle(bgColor, 1)
    graphics.fillRoundedRect(-80, -25, 160, 50, 6)
    graphics.lineStyle(2, borderColor, 1)
    graphics.strokeRoundedRect(-80, -25, 160, 50, 6)

    textObj.setColor(isSelected ? '#ffd700' : '#e8f0e8')
  }

  /**
   * Create a toggle button
   */
  private createToggleButton(
    x: number,
    y: number,
    label: string,
    isActive: boolean,
    callback: () => void
  ): void {
    const labelText = this.add
      .text(x - 80, y, label, {
        fontSize: '16px',
        color: '#b8a885',
        fontFamily: 'Arial, sans-serif',
      })
      .setOrigin(1, 0.5)
      .setAlpha(0)

    // Toggle switch
    const toggleBg = this.add
      .rectangle(x + 60, y, 80, 40, isActive ? 0x4a7a4a : 0x7a4a4a)
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
      .setInteractive()

    const toggleCircle = this.add
      .circle(isActive ? x + 90 : x + 30, y, 16, 0xd4af37)
      .setAlpha(0)

    toggleBg.on('pointerdown', () => {
      callback()
      // Animate toggle
      this.tweens.add({
        targets: toggleCircle,
        x: !isActive ? x + 90 : x + 30,
        duration: 200,
        ease: 'Power2',
      })
      // Change background color
      this.tweens.add({
        targets: toggleBg,
        fillColor: !isActive ? 0x4a7a4a : 0x7a4a4a,
        duration: 200,
      })
    })
  }

  /**
   * Create an action button
   */
  private createActionButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    callback: () => void,
    color: string
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y).setAlpha(0)

    const bg = this.add.graphics()
    const colorInt = parseInt(color.replace('#', '0x'), 16)

    bg.fillStyle(colorInt, 1)
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
    bg.lineStyle(3, 0xd4af37, 1)
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)

    const text = this.add
      .text(0, 0, label, {
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#ffffff',
        fontFamily: 'Arial Black, sans-serif',
      })
      .setOrigin(0.5, 0.5)

    container.add([bg, text])
    container.setSize(width, height)
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    )

    container.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(colorInt, 0.8)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
      bg.lineStyle(4, 0xffffff, 1)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
      text.setColor('#ffd700')
      container.setScale(1.05)
    })

    container.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(colorInt, 1)
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8)
      bg.lineStyle(3, 0xd4af37, 1)
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8)
      text.setColor('#ffffff')
      container.setScale(1)
    })

    container.on('pointerdown', () => {
      container.setScale(0.95)
      this.time.delayedCall(150, () => {
        container.setScale(1.05)
        callback()
      })
    })

    return container
  }

  /**
   * Create camouflage pattern
   */
  private createCamouflagePattern(width: number, height: number): void {
    const pattern = this.add.graphics().setAlpha(0.15)
    const colors = [0x3a4d3a, 0x2d3d2d, 0x4a5a4a, 0x1a2a1a]

    for (let i = 0; i < 25; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = 40 + Math.random() * 80
      const color = colors[Math.floor(Math.random() * colors.length)]

      pattern.fillStyle(color, 1)
      pattern.fillEllipse(x, y, radius, radius * 0.7)
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    const saved = localStorage.getItem('vityazSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      this.volumeSettings = settings.volume || this.volumeSettings
      this.languageSettings = settings.language || 'ru'
      this.fullscreenMode = settings.fullscreen || false
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    const settings = {
      volume: this.volumeSettings,
      language: this.languageSettings,
      fullscreen: this.fullscreenMode,
    }
    localStorage.setItem('vityazSettings', JSON.stringify(settings))
  }

  update() {
    // Update loop if needed
  }
}
