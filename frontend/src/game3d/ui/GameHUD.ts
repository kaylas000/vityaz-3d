import * as BABYLON from 'babylon.js'
import * as GUI from '@babylonjs/gui'

export default class GameHUD {
  texture: GUI.AdvancedDynamicTexture
  healthText: GUI.TextBlock
  scoreText: GUI.TextBlock
  waveText: GUI.TextBlock

  constructor(scene: BABYLON.Scene) {
    // Create fullscreen GUI
    this.texture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI', true, scene)

    // Health display (top-left, green)
    this.healthText = new GUI.TextBlock()
    this.healthText.text = 'HP: 100/100'
    this.healthText.fontSize = 20
    this.healthText.fontFamily = 'monospace'
    this.healthText.color = '#00ff00'
    this.healthText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
    this.healthText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP
    this.healthText.left = '20px'
    this.healthText.top = '20px'
    this.texture.addControl(this.healthText)

    // Score display (top-left, yellow)
    this.scoreText = new GUI.TextBlock()
    this.scoreText.text = 'SCORE: 0'
    this.scoreText.fontSize = 20
    this.scoreText.fontFamily = 'monospace'
    this.scoreText.color = '#ffff00'
    this.scoreText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
    this.scoreText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP
    this.scoreText.left = '20px'
    this.scoreText.top = '60px'
    this.texture.addControl(this.scoreText)

    // Wave display (top-left, red)
    this.waveText = new GUI.TextBlock()
    this.waveText.text = 'WAVE: 1'
    this.waveText.fontSize = 20
    this.waveText.fontFamily = 'monospace'
    this.waveText.color = '#ff0000'
    this.waveText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
    this.waveText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP
    this.waveText.left = '20px'
    this.waveText.top = '100px'
    this.texture.addControl(this.waveText)

    // Crosshair in center (yellow rectangle outline)
    const crosshair = new GUI.Rectangle('crosshair')
    crosshair.width = '30px'
    crosshair.height = '30px'
    crosshair.background = 'transparent'
    crosshair.thickness = 2
    crosshair.color = '#ffff00'
    crosshair.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    crosshair.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER
    this.texture.addControl(crosshair)

    console.log('✅ GameHUD created')
  }

  /**
   * Update health display
   */
  updateHealth(current: number, max: number) {
    this.healthText.text = `HP: ${current}/${max}`
  }

  /**
   * Update score display
   */
  updateScore(score: number) {
    this.scoreText.text = `SCORE: ${score}`
  }

  /**
   * Update wave display
   */
  updateWave(wave: number) {
    this.waveText.text = `WAVE: ${wave}`
  }

  /**
   * Show game over screen with final stats
   */
  showGameOver(score: number, wave: number) {
    // Game Over title (red, large)
    const gameOverText = new GUI.TextBlock()
    gameOverText.text = 'GAME OVER'
    gameOverText.fontSize = 60
    gameOverText.color = '#ff0000'
    gameOverText.fontFamily = 'monospace'
    gameOverText.fontWeight = 'bold'
    gameOverText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    gameOverText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER
    this.texture.addControl(gameOverText)

    // Final stats (yellow)
    const statsText = new GUI.TextBlock()
    statsText.text = `FINAL SCORE: ${score}\nWAVES SURVIVED: ${wave}`
    statsText.fontSize = 30
    statsText.color = '#ffff00'
    statsText.fontFamily = 'monospace'
    statsText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    statsText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER
    statsText.top = '100px'
    this.texture.addControl(statsText)
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.texture.dispose()
  }
}
