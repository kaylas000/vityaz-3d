import * as BABYLON from "@babylonjs/core";
import { LoadedMesh, ModelConfig } from "../../types/babylon";

export class ModelLoader {
  private scene: BABYLON.Scene;
  private loadedModels: Map<string, LoadedMesh> = new Map();

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
  }

  /**
   * Загрузить модель из файла
   */
  async loadModel(config: ModelConfig): Promise<LoadedMesh> {
    try {
      console.log(`📑 Loading model: ${config.filename}`);

      // Проверить кэш
      if (this.loadedModels.has(config.filename)) {
        console.log(`⚡ Model ${config.filename} found in cache`);
        return this.cloneLoadedModel(config.filename, config);
      }

      // Загрузить модель
      const result = await BABYLON.SceneLoader.ImportMeshAsync(
        "",
        config.path,
        config.filename,
        this.scene
      );

      const loaded: LoadedMesh = {
        meshes: result.meshes as BABYLON.Mesh[],
        animationGroups: result.animationGroups,
        skeletons: result.skeletons,
      };

      // Применить трансформации
      if (config.scale) {
        loaded.meshes.forEach((mesh) => {
          mesh.scaling = config.scale!;
        });
      }

      if (config.position) {
        if (loaded.meshes[0]) {
          loaded.meshes[0].position = config.position;
        }
      }

      if (config.rotation) {
        if (loaded.meshes[0]) {
          loaded.meshes[0].rotation = config.rotation;
        }
      }

      // Сохранить в кэш
      this.loadedModels.set(config.filename, loaded);

      console.log(`✅ Model ${config.filename} loaded successfully`);
      return loaded;
    } catch (error) {
      console.error(`❌ Failed to load model ${config.filename}:`, error);
      throw error;
    }
  }

  /**
   * Клонировать загруженную модель
   */
  cloneLoadedModel(modelName: string, config: ModelConfig): LoadedMesh {
    const original = this.loadedModels.get(modelName);
    if (!original) {
      throw new Error(`Model ${modelName} not found in cache`);
    }

    const cloned: LoadedMesh = {
      meshes: original.meshes.map((mesh) => mesh.clone()),
      animationGroups: original.animationGroups.map((group) =>
        group.clone()
      ),
      skeletons: original.skeletons,
    };

    // Применить вариации новому объекту
    if (config.position && cloned.meshes[0]) {
      cloned.meshes[0].position = config.position;
    }

    if (config.scale && cloned.meshes[0]) {
      cloned.meshes[0].scaling = config.scale;
    }

    return cloned;
  }

  /**
   * Удалить модель
   */
  unloadModel(modelName: string): void {
    const model = this.loadedModels.get(modelName);
    if (model) {
      model.meshes.forEach((mesh) => mesh.dispose());
      this.loadedModels.delete(modelName);
      console.log(`✅ Model ${modelName} unloaded`);
    }
  }

  /**
   * Очистить все модели
   */
  clearAll(): void {
    this.loadedModels.forEach((model) => {
      model.meshes.forEach((mesh) => mesh.dispose());
    });
    this.loadedModels.clear();
    console.log("✅ All models cleared");
  }
}
