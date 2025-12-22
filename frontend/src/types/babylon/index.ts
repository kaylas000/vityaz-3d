import * as BABYLON from "@babylonjs/core";

// Типы для моделей
export interface LoadedMesh {
  meshes: BABYLON.Mesh[];
  animationGroups: BABYLON.AnimationGroup[];
  skeletons: BABYLON.Skeleton[];
}

export interface ModelConfig {
  path: string;
  filename: string;
  scale?: BABYLON.Vector3;
  position?: BABYLON.Vector3;
  rotation?: BABYLON.Vector3;
}

export interface EnemyModel {
  mesh: BABYLON.Mesh;
  skeleton?: BABYLON.Skeleton;
  animationGroups: BABYLON.AnimationGroup[];
  health: number;
  position: BABYLON.Vector3;
}

// Типы для анимаций
export interface AnimationConfig {
  name: string;
  frames: number[];
  duration: number;
  loop: boolean;
}

export interface AnimationState {
  current: string | null;
  playing: boolean;
  progress: number;
}
