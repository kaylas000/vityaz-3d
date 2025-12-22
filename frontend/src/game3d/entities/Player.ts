import * as BABYLON from 'babylon.js'
import { GAME_CONFIG, COLORS } from '../utils/constants'
import { ModelLoader } from '../utils/model-loader'

export default class Player {
  mesh: BABYLON.Mesh
  health: number
  maxHealth: number
  speed: number = GAME_CONFIG.PLAYER_SPEED
  private modelLoaded: boolean = false

  constructor(scene: BABYLON.Scene, startPos: { x: number; y: number; z: number }) {
    // Create temporary placeholder mesh
    this.mesh = BABYLON.MeshBuilder.CreateBox('player', { size: 1 }, scene)
    this.mesh.position = new BABYLON.Vector3(startPos.x, startPos.y, startPos.z)

    // Material (green)
    const material = new BABYLON.StandardMaterial('playerMat', scene)
    material.emissiveColor = new BABYLON.Color3(
      COLORS.PLAYER.r,
      COLORS.PLAYER.g,
      COLORS.PLAYER.b
    )
    this.mesh.material = material

    // Health system
    this.health = GAME_CONFIG.PLAYER_HEALTH
    this.maxHealth = GAME_CONFIG.PLAYER_HEALTH

    // Load 3D model asynchronously
    this.loadModel(scene, startPos)

    console.log('✅ Player created')
  }

  /**
   * Load 3D character model asynchronously
   * @param scene - Babylon.js scene
   * @param startPos - Starting position
   */
  private async loadModel(
    scene: BABYLON.Scene,
    startPos: { x: number; y: number; z: number }
  ): Promise<void> {
    try {
      const characterModel = await ModelLoader.loadCharacterModel(
        scene,
        '/models/soldier.glb',
        'player_model'
      )

      // Scale and position the model
      ModelLoader.scaleModel(characterModel, GAME_CONFIG.PLAYER_MODEL_SCALE || 1)
      ModelLoader.positionModel(
        characterModel,
        new BABYLON.Vector3(startPos.x, startPos.y, startPos.z)
      )

      // Dispose the old placeholder mesh
      this.mesh.dispose()

      // Use the loaded model as the player mesh
      this.mesh = characterModel
      this.modelLoaded = true

      console.log('🎮 Player model loaded successfully')
    } catch (error) {
      console.warn('⚠️ Failed to load player model, using placeholder:', error)
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
   * Update player position based on keyboard input
   * @param inputMap - Map of pressed keys
   * @param deltaTime - Time since last frame in milliseconds
   */
  update(inputMap: { [key: string]: boolean }, deltaTime: number = 16.67) {
    const moveVector = new BABYLON.Vector3(0, 0, 0)

    // Collect input
    if (inputMap['W']) moveVector.z += 1
    if (inputMap['S']) moveVector.z -= 1
    if (inputMap['A']) moveVector.x -= 1
    if (inputMap['D']) moveVector.x += 1

    // Move with deltaTime (frame-rate independent)
    if (moveVector.length() > 0) {
      moveVector.normalize()
      // FIXED: Using deltaTime instead of hardcoded /60
      this.mesh.position.addInPlace(moveVector.scale((this.speed * deltaTime) / 1000))
    }
  }

  /**
   * FIXED: Added Math.max() to prevent negative health
   * Apply damage to player
   * @param amount - Damage amount
   */
  takeDamage(amount: number) {
    // FIXED: Prevent negative health
    this.health = Math.max(0, this.health - amount)
    console.log(`❤️ Player health: ${this.health}/${this.maxHealth}`)
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.mesh.dispose()
  }
}
