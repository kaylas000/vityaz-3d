import * as BABYLON from 'babylon.js'
import { GAME_CONFIG, COLORS } from '../utils/constants'
import { ModelLoader } from '../utils/model-loader'

export default class Enemy {
  mesh: BABYLON.Mesh
  type: 'basic' | 'tank'
  health: number
  maxHealth: number
  speed: number
  damage: number
  lastHitTime: number = 0  // FIXED: For attack cooldown tracking
  private modelLoaded: boolean = false
  private scene: BABYLON.Scene

  constructor(scene: BABYLON.Scene, startPos: BABYLON.Vector3, type: 'basic' | 'tank' = 'basic') {
    this.type = type
    this.scene = scene

    // Create temporary placeholder mesh
    this.mesh = BABYLON.MeshBuilder.CreateBox('enemy', { size: 0.8 }, scene)
    this.mesh.position = startPos.clone()

    // Setup by type (tank has more health/damage, slower)
    if (type === 'tank') {
      this.health = GAME_CONFIG.ENEMY_TANK_HEALTH
      this.maxHealth = GAME_CONFIG.ENEMY_TANK_HEALTH
      this.speed = GAME_CONFIG.ENEMY_TANK_SPEED
      this.damage = GAME_CONFIG.ENEMY_TANK_DAMAGE

      const material = new BABYLON.StandardMaterial('enemyTankMat', scene)
      material.emissiveColor = new BABYLON.Color3(
        COLORS.ENEMY_TANK.r,
        COLORS.ENEMY_TANK.g,
        COLORS.ENEMY_TANK.b
      )
      this.mesh.material = material
    } else {
      // basic type
      this.health = GAME_CONFIG.ENEMY_BASIC_HEALTH
      this.maxHealth = GAME_CONFIG.ENEMY_BASIC_HEALTH
      this.speed = GAME_CONFIG.ENEMY_BASIC_SPEED
      this.damage = GAME_CONFIG.ENEMY_BASIC_DAMAGE

      const material = new BABYLON.StandardMaterial('enemyBasicMat', scene)
      material.emissiveColor = new BABYLON.Color3(
        COLORS.ENEMY_BASIC.r,
        COLORS.ENEMY_BASIC.g,
        COLORS.ENEMY_BASIC.b
      )
      this.mesh.material = material
    }

    // Load 3D model asynchronously
    this.loadModel(startPos)

    console.log(`✅ Enemy ${type} created`)
  }

  /**
   * Load 3D character model asynchronously
   * @param startPos - Starting position
   */
  private async loadModel(startPos: BABYLON.Vector3): Promise<void> {
    try {
      const characterModel = await ModelLoader.loadCharacterModel(
        this.scene,
        '/models/soldier.glb',
        `enemy_${this.type}_model_${Date.now()}`
      )

      // Scale and position the model
      ModelLoader.scaleModel(characterModel, GAME_CONFIG.ENEMY_MODEL_SCALE || 1)
      ModelLoader.positionModel(characterModel, startPos)

      // Dispose the old placeholder mesh
      this.mesh.dispose()

      // Use the loaded model as the enemy mesh
      this.mesh = characterModel
      this.modelLoaded = true

      console.log(`🎮 Enemy ${this.type} model loaded successfully`)
    } catch (error) {
      console.warn(`⚠️ Failed to load enemy model, using placeholder:`, error)
      // Keep using the placeholder cube if model fails to load
    }
  }

  /**
   * Check if model is loaded
   */
  isModelLoaded(): boolean {
    return this.modelLoaded
  }

  /**
   * FIXED: Now uses deltaTime for frame-rate independent movement
   * Move towards target position
   * @param targetPos - Target position (player)
   * @param deltaTime - Time since last frame in milliseconds
   */
  update(targetPos: BABYLON.Vector3, deltaTime: number) {
    const direction = targetPos.subtract(this.mesh.position).normalize()
    // FIXED: Using deltaTime instead of hardcoded /60
    this.mesh.position.addInPlace(direction.scale((this.speed * deltaTime) / 1000))
  }

  /**
   * Apply damage to enemy
   * @param amount - Damage amount
   */
  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount)
    console.log(`💥 Enemy ${this.type} health: ${this.health}/${this.maxHealth}`)
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.mesh.dispose()
  }
}
