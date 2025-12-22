# 3D Models Directory

This directory contains 3D character models in GLB (Binary glTF 2.0) format for VITYAZ: Special Operations.

## Available Models

### player.glb

**Status**: 📥 Download Required

**Source**: Official Babylon.js SummerFestival Example
- **License**: MIT (free to use)
- **Format**: GLB (Binary glTF 2.0)
- **Size**: ~5MB
- **Polygons**: Optimized for real-time

**Download Link**:
```
https://raw.githubusercontent.com/BabylonJS/SummerFestival/master/public/models/player.glb
```

**How to Use**:
1. Click the link above or copy the URL
2. Download the file: `player.glb`
3. Save it to: `frontend/public/models/player.glb`
4. Commit and push to this branch

---

## Alternative Models

If you want other models, check these sources:

### Free GLB Models with Soldiers + Weapons:

1. **[Soldier with gun 397](https://sketchfab.com/3d-models/soldier-with-gun-397-19e2654134854d94b91b8e90a7350cfc)** (Sketchfab)
   - 150k triangles (detailed)
   - British infantry 1940s style
   - License: CC Attribution
   - **Note**: Requires Sketchfab login to download

2. **[M4A1 Rifle](https://sketchfab.com/3d-models/rifle-m4a1-no-silencer-weapon-model-cs2-4710ad34989b4088914f6718bdafb215)** (Sketchfab)
   - 43.3k triangles
   - CS2 weapon model
   - License: CC Attribution
   - **Note**: Requires Sketchfab login

3. **[BabylonJS MeshesLibrary](https://models.babylonjs.com/)** (Official)
   - Multiple models available
   - All free and open source
   - MIT License

---

## Integration

Once `player.glb` is in this directory, update your game code:

```typescript
// In GameScene3D.ts or Player.ts
const result = await BABYLON.SceneLoader.ImportMeshAsync(
  '',
  '/models/',
  'player.glb',
  this.scene
)

const playerMesh = result.meshes[0]
```

---

## License

- **player.glb** (from SummerFestival): MIT License
- **Other models**: Check individual source licenses
