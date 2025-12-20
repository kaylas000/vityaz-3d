import * as BABYLON from '@babylonjs/core';

/**
 * Arena - 3D Combat Environment
 * 50x50 unit arena with physics boundaries
 */

export class Arena {
  private scene: BABYLON.Scene;
  private floorMesh: BABYLON.Mesh;
  private wallMeshes: BABYLON.Mesh[] = [];
  private spawnPoints: BABYLON.Vector3[] = [];

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
    this.createArenaEnvironment();
  }

  private createArenaEnvironment(): void {
    // Create floor
    this.floorMesh = BABYLON.MeshBuilder.CreateGround(
      'arenaFloor',
      { width: 50, height: 50 },
      this.scene
    );

    const floorMaterial = new BABYLON.StandardMaterial('floorMat', this.scene);
    floorMaterial.diffuse = new BABYLON.Color3(0.5, 0.7, 0.3);
    this.floorMesh.material = floorMaterial;

    // Add physics to floor
    this.floorMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      this.floorMesh,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0.2 },
      this.scene
    );

    // Create boundary walls
    this.createWalls();

    // Setup spawn points
    this.createSpawnPoints();
  }

  private createWalls(): void {
    const wallHeight = 5;
    const wallThickness = 0.5;
    const arenaSize = 50;

    // Wall positions: [x, z]
    const wallConfigs = [
      { pos: new BABYLON.Vector3(arenaSize / 2 + wallThickness, wallHeight / 2, 0), size: new BABYLON.Vector3(wallThickness, wallHeight, arenaSize) },
      { pos: new BABYLON.Vector3(-arenaSize / 2 - wallThickness, wallHeight / 2, 0), size: new BABYLON.Vector3(wallThickness, wallHeight, arenaSize) },
      { pos: new BABYLON.Vector3(0, wallHeight / 2, arenaSize / 2 + wallThickness), size: new BABYLON.Vector3(arenaSize, wallHeight, wallThickness) },
      { pos: new BABYLON.Vector3(0, wallHeight / 2, -arenaSize / 2 - wallThickness), size: new BABYLON.Vector3(arenaSize, wallHeight, wallThickness) },
    ];

    wallConfigs.forEach((config, index) => {
      const wall = BABYLON.MeshBuilder.CreateBox(`wall${index}`, { width: config.size.x, height: config.size.y, depth: config.size.z }, this.scene);
      wall.position = config.pos;

      const wallMaterial = new BABYLON.StandardMaterial(`wallMat${index}`, this.scene);
      wallMaterial.diffuse = new BABYLON.Color3(0.7, 0.7, 0.8);
      wall.material = wallMaterial;

      wall.physicsImpostor = new BABYLON.PhysicsImpostor(
        wall,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.5 },
        this.scene
      );

      this.wallMeshes.push(wall);
    });
  }

  private createSpawnPoints(): void {
    // Player spawn points
    this.spawnPoints.push(new BABYLON.Vector3(-15, 1, 0));
    this.spawnPoints.push(new BABYLON.Vector3(15, 1, 0));
    this.spawnPoints.push(new BABYLON.Vector3(0, 1, -15));
    this.spawnPoints.push(new BABYLON.Vector3(0, 1, 15));
  }

  public getSpawnPoint(index: number = 0): BABYLON.Vector3 {
    return this.spawnPoints[index % this.spawnPoints.length].clone();
  }

  public getArenaSize(): number {
    return 50;
  }
}
