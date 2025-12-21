import * as BABYLON from '@babylonjs/core';

export type TerrainType = 'plain' | 'water' | 'rock' | 'obstacle';

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  traversable: boolean;
  color?: string;
}

/**
 * Arena - 3D Combat Environment
 * 50x50 unit arena with physics boundaries
 */
export class Arena {
  private scene: BABYLON.Scene;
  private floorMesh: BABYLON.Mesh | null = null;
  private wallMeshes: BABYLON.Mesh[] = [];
  private spawnPoints: BABYLON.Vector3[] = [];

  // grid of tiles (width x height)
  public grid: Tile[][] = [];

  constructor(scene: BABYLON.Scene, width: number = 50, height: number = 50) {
    this.scene = scene;
    this.generateArena(width, height);
    this.createArenaEnvironment(width, height);
  }

  /**
   * Generate an internal tile grid with terrain + traversability
   * Returns the grid for testability as well
   */
  public generateArena(width: number, height: number, seed?: number): Tile[][] {
    const rng = seed !== undefined ? mulberry32(seed) : Math.random;

    this.grid = new Array(height).fill(0).map((_, y) =>
      new Array(width).fill(0).map((__, x) => {
        const edge = x === 0 || y === 0 || x === width - 1 || y === height - 1;
        const roll = rng();
        let terrain: TerrainType = 'plain';
        let traversable = true;
        let color = '#2ecc71';

        if (edge) {
          terrain = 'rock';
          traversable = false;
          color = '#777';
        } else if (roll < 0.06) {
          terrain = 'obstacle';
          traversable = false;
          color = '#4b4b4b';
        } else if (roll < 0.14) {
          terrain = 'water';
          traversable = false;
          color = '#3498db';
        }

        return { x, y, terrain, traversable, color } as Tile;
      })
    );

    // regenerate spawn points based on new size
    this.spawnPoints = Arena.generateSpawnPointsIndices(width, height).map(([x, y]) =>
      new BABYLON.Vector3((x - width / 2), 0, (y - height / 2))
    );

    return this.grid;
  }

  /**
   * Accessor for tiles
   */
  public getTile(x: number, y: number): Tile | null {
    if (!this.grid || y < 0 || x < 0 || y >= this.grid.length || x >= this.grid[0].length) return null;
    return this.grid[y][x];
  }

  /**
   * Create and place visual floor/walls in the provided scene
   */
  private createArenaEnvironment(width: number, height: number): void {
    const sizeX = width;
    const sizeZ = height;

    // Create floor
    this.floorMesh = BABYLON.MeshBuilder.CreateGround('arenaFloor', { width: sizeX, height: sizeZ }, this.scene);

    const floorMaterial = new BABYLON.StandardMaterial('floorMat', this.scene);
    floorMaterial.diffuse = new BABYLON.Color3(0.5, 0.7, 0.3);
    this.floorMesh.material = floorMaterial;

    // Add physics to floor
    this.floorMesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.floorMesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2 }, this.scene);

    // Create boundary walls around the grid
    const wallHeight = 5;
    const wallThickness = 0.5;

    const wallConfigs = [
      { pos: new BABYLON.Vector3(sizeX / 2 + wallThickness, wallHeight / 2, 0), size: new BABYLON.Vector3(wallThickness, wallHeight, sizeZ) },
      { pos: new BABYLON.Vector3(-sizeX / 2 - wallThickness, wallHeight / 2, 0), size: new BABYLON.Vector3(wallThickness, wallHeight, sizeZ) },
      { pos: new BABYLON.Vector3(0, wallHeight / 2, sizeZ / 2 + wallThickness), size: new BABYLON.Vector3(sizeX, wallHeight, wallThickness) },
      { pos: new BABYLON.Vector3(0, wallHeight / 2, -sizeZ / 2 - wallThickness), size: new BABYLON.Vector3(sizeX, wallHeight, wallThickness) },
    ];

    wallConfigs.forEach((config, index) => {
      const wall = BABYLON.MeshBuilder.CreateBox(`wall${index}`, { width: config.size.x, height: config.size.y, depth: config.size.z }, this.scene);
      wall.position = config.pos;

      const wallMaterial = new BABYLON.StandardMaterial(`wallMat${index}`, this.scene);
      wallMaterial.diffuse = new BABYLON.Color3(0.7, 0.7, 0.8);
      wall.material = wallMaterial;

      wall.physicsImpostor = new BABYLON.PhysicsImpostor(wall, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5 }, this.scene);

      this.wallMeshes.push(wall);
    });

    // Optionally create debug tile visuals for obstacles/water edges
    if (this.grid && this.scene) {
      this.createDebugMesh();
    }
  }

  private createDebugMesh() {
    if (!this.grid || !this.scene) return;
    const cs = 1;
    const root = new BABYLON.TransformNode('arena-root', this.scene);

    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[0].length; x++) {
        const t = this.grid[y][x];
        const color = t.color || '#2ecc71';

        const box = BABYLON.MeshBuilder.CreateBox(`tile-${x}-${y}`, { width: cs * 0.95, height: 0.05, depth: cs * 0.95 }, this.scene);
        box.position = new BABYLON.Vector3((x - this.grid[0].length / 2), -0.01, (y - this.grid.length / 2));
        const mat = new BABYLON.StandardMaterial(`mat-${x}-${y}`, this.scene);
        mat.diffuseColor = BABYLON.Color3.FromHexString(color);
        box.material = mat;
        box.parent = root;
      }
    }

    return root;
  }

  /**
   * Spawn points indices (x,y) distribution independent of scene for tests
   */
  public static generateSpawnPointsIndices(width: number, height: number): Array<[number, number]> {
    const w = width;
    const h = height;
    return [
      [1, 1],
      [w - 2, 1],
      [1, h - 2],
      [w - 2, h - 2],
      [Math.floor(w / 2), 1],
      [Math.floor(w / 2), h - 2],
      [1, Math.floor(h / 2)],
      [w - 2, Math.floor(h / 2)],
    ];
  }

  public getSpawnPoint(index: number = 0): BABYLON.Vector3 {
    if (this.spawnPoints.length === 0) {
      // fallback to generated indices
      const idx = Arena.generateSpawnPointsIndices(this.grid[0].length, this.grid.length)[index % 8];
      return new BABYLON.Vector3((idx[0] - this.grid[0].length / 2), 0, (idx[1] - this.grid.length / 2));
    }
    return this.spawnPoints[index % this.spawnPoints.length].clone();
  }

  public getArenaSize(): { width: number; height: number } {
    return { width: this.grid[0].length, height: this.grid.length };
  }
}

// Simple deterministic PRNG for reproducible grids when seed provided
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default Arena;
