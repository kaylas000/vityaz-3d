import * as BABYLON from 'babylon.js'
import { GAME_CONFIG, COLORS } from '../utils/constants'

export default class Projectile {
  mesh: BABYLON.Mesh
  velocity: BABYLON.Vector3
  damage: number = GAME_CONFIG.PROJECTILE_DAMAGE
  lifetime: number = GAME_CONFIG.PROJECTILE_LIFETIME
  createdAt: number
  isActive: boolean = true

  constructor(scene: BABYLON.Scene, startPos: BABYLON.Vector3, direction: BABYLON.Vector3) {
    // Create mesh (sphere as bullet)
    this.mesh = BABYLON.MeshBuilder.CreateSphere('projectile', { diameter: 0.2 }, scene)
    this.mesh.position = startPos.clone()

    // Material (yellow)
    const material = new BABYLON.StandardMaterial('projectileMat', scene)
    material.emissiveColor = new BABYLON.Color3(
      COLORS.PROJECTILE.r,
      COLORS.PROJECTILE.g,
      COLORS.PROJECTILE.b
    )
    this.mesh.material = material

    // Velocity (normalized direction * speed)
    const normalizedDir = direction.normalize()
    this.velocity = normalizedDir.scale(GAME_CONFIG.PROJECTILE_SPEED)
    this.createdAt = Date.now()

    console.log(
      `✅ Projectile created at (${startPos.x.toFixed(1)}, ${startPos.y.toFixed(1)}, ${startPos.z.toFixed(1)}) ` +
      `with direction (${normalizedDir.x.toFixed(2)}, ${normalizedDir.y.toFixed(2)}, ${normalizedDir.z.toFixed(2)})`
    )
  }

  /**
   * Update projectile position with deltaTime
   * @param deltaTime - Time since last frame in milliseconds
   * @returns true if projectile is alive, false if should be removed
   */
  update(deltaTime: number): boolean {
    if (!this.isActive) return false

    // Move projectile
    const movement = this.velocity.scale(deltaTime / 1000)
    this.mesh.position.addInPlace(movement)

    // Check lifetime
    const elapsed = Date.now() - this.createdAt
    if (elapsed > this.lifetime) {
      this.dispose()
      return false
    }

    return true
  }

  /**
   * Mark projectile for removal (used by collision system)
   */
  markForRemoval() {
    this.isActive = false
    this.dispose()
  }

  /**
   * Cleanup resources
   */
  dispose() {
    try {
      this.mesh.dispose()
      console.log('🗑️ Projectile disposed')
    } catch (e) {
      console.error('❌ Error disposing projectile:', e)
    }
  }
}
