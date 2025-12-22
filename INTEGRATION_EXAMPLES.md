# 💻 Integration Examples

## Loading 3D Models in GameScene3D.ts

### Basic Model Loading

```typescript
// Import BABYLON
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

// In GameScene3D.ts - Load soldier model
async function loadSoldier(scene: BABYLON.Scene) {
  try {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "./assets/models/soldiers/",
      "soldier.glb",
      scene
    );
    
    const soldier = result.meshes[0];
    soldier.position = new BABYLON.Vector3(0, 0, 10);
    soldier.scaling = new BABYLON.Vector3(1, 1, 1);
    
    return soldier;
  } catch (error) {
    console.error("Error loading soldier:", error);
  }
}
```

### Loading Multiple Enemies

```typescript
async function spawnEnemies(scene: BABYLON.Scene, count: number) {
  const enemies = [];
  
  for (let i = 0; i < count; i++) {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "./assets/models/soldiers/",
      "soldier.glb",
      scene
    );
    
    const enemy = result.meshes[0];
    enemy.name = `enemy_${i}`;
    enemy.position.x = i * 5;
    enemy.position.z = Math.random() * 20;
    
    enemies.push(enemy);
  }
  
  return enemies;
}
```

### Load Weapon and Attach to Character

```typescript
async function loadWeapon(scene: BABYLON.Scene, parentMesh: BABYLON.Mesh) {
  try {
    const weaponResult = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "./assets/models/weapons/",
      "gun.glb",
      scene
    );
    
    const weapon = weaponResult.meshes[0];
    weapon.parent = parentMesh; // Attach to soldier's hand
    weapon.position = new BABYLON.Vector3(0.5, 0.3, 0.2);
    weapon.rotation = new BABYLON.Vector3(0, 0, 0.2);
    
    return weapon;
  } catch (error) {
    console.error("Error loading weapon:", error);
  }
}
```

### Load Environment/Building

```typescript
async function loadEnvironment(scene: BABYLON.Scene) {
  try {
    const envResult = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "./assets/models/environment/",
      "building.glb",
      scene
    );
    
    const building = envResult.meshes[0];
    building.position.y = 0;
    building.scaling = new BABYLON.Vector3(2, 2, 2);
    
    return building;
  } catch (error) {
    console.error("Error loading environment:", error);
  }
}
```

## Full Example in GameScene3D.ts

```typescript
export class GameScene3D {
  private scene: BABYLON.Scene;
  private enemies: BABYLON.Mesh[] = [];
  
  async initialize() {
    // Load player
    const player = await this.loadSoldier("./assets/models/soldiers/soldier.glb");
    
    // Attach weapon to player
    const weapon = await this.loadWeapon("./assets/models/weapons/gun.glb", player);
    
    // Load environment
    await this.loadEnvironment();
    
    // Spawn enemies
    this.enemies = await this.spawnEnemies(5);
  }
  
  private async loadSoldier(path: string): Promise<BABYLON.Mesh> {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "", path, this.scene);
    return result.meshes[0];
  }
  
  private async loadWeapon(path: string, parent: BABYLON.Mesh): Promise<BABYLON.Mesh> {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "", path, this.scene);
    const weapon = result.meshes[0];
    weapon.parent = parent;
    return weapon;
  }
  
  private async loadEnvironment(): Promise<void> {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/models/environment/", "building.glb", this.scene);
    result.meshes.forEach(mesh => {
      mesh.position.y = 0;
    });
  }
  
  private async spawnEnemies(count: number): Promise<BABYLON.Mesh[]> {
    const enemies: BABYLON.Mesh[] = [];
    for (let i = 0; i < count; i++) {
      const enemy = await this.loadSoldier("./assets/models/soldiers/soldier.glb");
      enemy.position = new BABYLON.Vector3(i * 5, 0, 10 + Math.random() * 5);
      enemies.push(enemy);
    }
    return enemies;
  }
}
```

## Asset Loading Checklist

- [ ] Download soldier.glb from Mugen87/dive
- [ ] Download gun.glb from MixedRealityToolkit
- [ ] Place files in `frontend/src/assets/models/[type]/`
- [ ] Update paths in GameScene3D.ts
- [ ] Test model loading in Babylon.js Sandbox
- [ ] Verify animations work (if available)
- [ ] Check LOD (Level of Detail) if applicable

## Troubleshooting

### Model loads but doesn't display
- Check lighting: Add HemisphericLight
- Verify model scale is appropriate
- Check camera position

### Texture missing
- Verify textures are embedded in GLB
- Check file paths are correct

### Performance issues
- Use LOD versions of models
- Limit number of instances
- Use model cloning instead of re-importing
