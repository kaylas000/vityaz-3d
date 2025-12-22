import * as BABYLON from 'babylon.js'
import { GAME_CONFIG, COLORS } from '../utils/constants'

export default class Player {
  mesh: BABYLON.Mesh
  health: number
  maxHealth: number
  speed: number = GAME_CONFIG.PLAYER_SPEED
  isMoving: boolean = false
  moveDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0)

  constructor(scene: BABYLON.Scene, startPos: { x: number; y: number; z: number }) {
    // Create mesh (simple cube as placeholder for 3D model later)
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

    console.log('✅ Player created at', startPos)
    console.log('🎮 Controls: W/A/S/D to move, Mouse to look, Click to shoot')
  }

  /**
   * Update player position based on keyboard input
   * Now with proper debugging and movement tracking
   * @param inputMap - Map of pressed keys
   * @param deltaTime - Time since last frame in milliseconds
   */
  update(inputMap: { [key: string]: boolean }, deltaTime: number = 16.67) {
    const moveVector = new BABYLON.Vector3(0, 0, 0)
    this.isMoving = false

    // Collect input - track what keys are pressed
    if (inputMap['W']) {
      moveVector.z += 1
      this.isMoving = true
    }
    if (inputMap['S']) {
      moveVector.z -= 1
      this.isMoving = true
    }
    if (inputMap['A']) {
      moveVector.x -= 1
      this.isMoving = true
    }
    if (inputMap['D']) {
      moveVector.x += 1
      this.isMoving = true
    }

    // Move with deltaTime (frame-rate independent)
    if (moveVector.length() > 0) {
      moveVector.normalize()
      const movement = moveVector.scale((this.speed * deltaTime) / 1000)
      this.mesh.position.addInPlace(movement)
      this.moveDirection = moveVector

      // Debug: Log movement every 30 frames (~500ms at 60fps)
      if (Math.random() < 0.03) {
        console.log(
          `📍 Player pos: (${this.mesh.position.x.toFixed(2)}, ${this.mesh.position.y.toFixed(2)}, ${this.mesh.position.z.toFixed(2)})`
        )
      }
    }
  }

  /**
   * Apply damage to player
   * @param amount - Damage amount
   */
  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount)
    console.log(`❤️ Player health: ${this.health}/${this.maxHealth}`)
  }

  /**
   * Get player world position
   */
  getPosition(): BABYLON.Vector3 {
    return this.mesh.position.clone()
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.mesh.dispose()
  }
}
