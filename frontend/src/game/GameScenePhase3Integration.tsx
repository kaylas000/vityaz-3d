import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { Arena } from './Arena';
import { SpecNavyFighter } from './SpecNavyFighter';
import { EnemyFighter } from './EnemyFighter';
import { CombatSystem } from './CombatSystem';
import { CombatUI } from './CombatUI';

/**
 * GameScenePhase3Integration
 * - Initializes a 50x50 Arena
 * - Spawns player and 2 enemies
 * - Starts CombatSystem
 * - Renders CombatUI
 */
export const GameScenePhase3Integration: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const combatRef = useRef<CombatSystem | null>(null);

  const [player, setPlayer] = useState<SpecNavyFighter | null>(null);
  const [enemies, setEnemies] = useState<SpecNavyFighter[]>([]);
  const [, setTick] = useState<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    engineRef.current = engine;

    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;

    // Camera
    const camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, 60, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvasRef.current, true);

    // Light
    new BABYLON.HemisphericLight('hLight', new BABYLON.Vector3(0, 1, 0), scene);

    // Create arena (50x50)
    const arena = new Arena(scene);

    // Get spawn points
    const spawn0 = arena.getSpawnPoint(0);
    const spawn1 = arena.getSpawnPoint(1);
    const spawn2 = arena.getSpawnPoint(2);

    // Create player at spawn0
    const playerEntity = new SpecNavyFighter('SpecNavy_Player', scene, spawn0);

    // Create 2 enemies
    const enemy1 = new EnemyFighter('Enemy_1', scene, spawn1);
    const enemy2 = new EnemyFighter('Enemy_2', scene, spawn2);

    // Combat system
    const combat = new CombatSystem(scene);
    combat.addPlayer(playerEntity);
    combat.addEnemy(enemy1);
    combat.addEnemy(enemy2);
    combat.start();

    // Keep refs and state
    combatRef.current = combat;
    setPlayer(playerEntity);
    setEnemies([enemy1, enemy2]);

    // Update loop: update combat and render
    scene.registerBeforeRender(() => {
      const delta = engine.getDeltaTime() / 1000; // seconds
      combat.update(delta);
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    // UI tick to force React updates for UI values
    const uiTick = setInterval(() => setTick(t => t + 1), 250);

    return () => {
      clearInterval(uiTick);
      try {
        combat.stop();
      } catch (e) {
        // ignore
      }
      scene.dispose();
      engine.stopRenderLoop();
      engine.dispose();
      engineRef.current = null;
      sceneRef.current = null;
      combatRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Combat UI overlays the canvas */}
      <div style={{ position: 'absolute', left: 12, top: 12 }}>
        <CombatUI player={player} enemies={enemies} />
      </div>
    </div>
  );
};

export default GameScenePhase3Integration;
