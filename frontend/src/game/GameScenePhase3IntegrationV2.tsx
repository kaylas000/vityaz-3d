import React, { useState, useRef, useEffect } from 'react';
import * as BABYLON from '@babylonjs/core';

export const GameScenePhase3IntegrationV2 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameLoaded, setGameLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const engine = new BABYLON.Engine(canvasRef.current);
      const scene = new BABYLON.Scene(engine);
      const camera = new BABYLON.ArcRotateCamera(
        'camera', Math.PI / 2, Math.PI / 2, 30,
        new BABYLON.Vector3(0, 0, 0), scene
      );
      camera.attachControl(canvasRef.current, true);

      const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
      light.intensity = 0.7;

      const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 50, height: 50 }, scene);
      (ground.material as any).diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);

      const player = BABYLON.MeshBuilder.CreateSphere('player', { diameter: 2 }, scene);
      player.position.z = -10;
      (player.material as any).diffuse = new BABYLON.Color3(0, 0, 1);

      for (let i = 0; i < 3; i++) {
        const enemy = BABYLON.MeshBuilder.CreateSphere('enemy' + i, { diameter: 1.5 }, scene);
        enemy.position.x = -10 + i * 10;
        enemy.position.z = 10;
        (enemy.material as any).diffuse = new BABYLON.Color3(1, 0, 0);
      }

      engine.runRenderLoop(() => scene.render());
      setGameLoaded(true);

      return () => engine.dispose();
    } catch (error) {
      console.error('Game error:', error);
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      {!gameLoaded && (
        <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'white', zIndex: 100 }}>
          <h2>🥊 VITYAZ: Special Operations</h2>
          <p>Game is loading...</p>
          <p>Status: React is working!</p>
        </div>
      )}
    </div>
  );
};
