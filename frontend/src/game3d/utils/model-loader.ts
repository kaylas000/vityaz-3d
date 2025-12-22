import * as BABYLON from 'babylon.js'

/**
 * Model Loader Service
 * Handles loading 3D models (GLB format) for characters
 */
export class ModelLoader {
  /**
   * Load a GLB model asynchronously
   * @param scene - Babylon.js scene
   * @param modelPath - Path to GLB file
   * @param name - Name for the mesh
   * @returns Promise with loaded mesh
   */
  static async loadCharacterModel(
    scene: BABYLON.Scene,
    modelPath: string,
    name: string = 'character'
  ): Promise<BABYLON.Mesh> {
    try {
      console.log(`📦 Loading model: ${modelPath}`)

      const result = await BABYLON.SceneLoader.ImportMeshAsync(
        '', // Import all meshes
        '', // Use full path
        modelPath,
        scene
      )

      const mesh = result.meshes[0] as BABYLON.Mesh
      mesh.name = name

      console.log(`✅ Model loaded: ${name}`)
      return mesh
    } catch (error) {
      console.error(`❌ Failed to load model ${modelPath}:`, error)
      throw error
    }
  }

  /**
   * Clone a loaded model
   * @param originalMesh - Original mesh to clone
   * @returns Cloned mesh
   */
  static cloneModel(originalMesh: BABYLON.Mesh): BABYLON.Mesh {
    const clone = originalMesh.clone(`${originalMesh.name}_clone`, null, false, false)
    if (!clone) throw new Error('Failed to clone mesh')
    return clone as BABYLON.Mesh
  }

  /**
   * Scale model to game units
   * @param mesh - Mesh to scale
   * @param scale - Scale factor (default 1)
   */
  static scaleModel(mesh: BABYLON.Mesh, scale: number = 1): void {
    mesh.scaling = new BABYLON.Vector3(scale, scale, scale)
  }

  /**
   * Position model in scene
   * @param mesh - Mesh to position
   * @param position - Vector3 position
   */
  static positionModel(mesh: BABYLON.Mesh, position: BABYLON.Vector3): void {
    mesh.position = position
  }
}
