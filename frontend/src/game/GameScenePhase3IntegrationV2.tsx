import React, { useState, useRef, useEffect } from 'react';
import * as BABYLON from '@babylonjs/core';
import { Arena } from './Arena';
import { SpecNavyFighter } from './SpecNavyFighter';
// import { CombatEngine } from './CombatEngine';
// import { GameLoop, DifficultyLevel, DifficultyManager, AStarPathfinder, CombatTacticsEngine, AIBehaviorTree } from './AISystem';

/**
 * GameScenePhase3IntegrationV2 - Full AI System Integration
 * Features:
 * - Complete AI system integration with React
 * - 3-level difficulty selector (EASY/MEDIUM/HARD)
 * - Real-time game state display
 * - 60 FPS game loop
 * - Multi-enemy AI management
 * - Full 3D rendering integration
 */

export const GameScenePhase3IntegrationV2 = () => {
  // BABYLON.js References
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const playerMeshRef = useRef<BABYLON.Mesh | null>(null);
  const enemyMeshesRef = useRef<BABYLON.Mesh[]>([]);

  import { GameLoop } from './GameLoop';
  import { DifficultyLevel } from './EnemyAIDifficulty';
  // import { DifficultyManager } from './EnemyAIDifficulty';
  // AI System States
  const [gameLoop, setGameLoop] = useState<GameLoop | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.MEDIUM);
  const [gameState, setGameState] = useState({
    running: true,
    paused: false,
    tick: 0,
    playerHealth: 100,
    playerStamina: 100,
    enemiesCount: 0,
  });
  const [aiEnabled, setAiEnabled] = useState(true);
  const [fps, setFps] = useState(0);

  // Refs for AI management
  const gameLoopRef = useRef<GameLoop | null>(null);
  const difficultyManagerRef = useRef<DifficultyManager | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const frameCountRef = useRef<number>(0);

  // Initialize BABYLON.js Scene and AI System
  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize BABYLON Engine
    const engine = new BABYLON.Engine(canvasRef.current, true);
    engineRef.current = engine;

    // Create Scene
    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;
    scene.collisionsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, 0, 0);

    // Camera Setup
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / 2,
      Math.PI / 2.5,
      100,
      new BABYLON.Vector3(25, 25, 25),
      scene
    );
    camera.attachControl(canvasRef.current, true);

    // Lighting
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 1), scene);
    light.intensity = 0.7;

    // Create Player Mesh
    const playerMesh = BABYLON.MeshBuilder.CreateBox('player', { size: 1 }, scene);
    playerMesh.material = new BABYLON.StandardMaterial('playerMat', scene);
    (playerMesh.material as BABYLON.StandardMaterial).diffuse = BABYLON.Color3.Blue();
    playerMeshRef.current = playerMesh;

    // Initialize AI Systems
    const diffMgr = new DifficultyManager();
    diffMgr.setDifficulty(difficulty);
    difficultyManagerRef.current = diffMgr;

    const loop = new GameLoop(50, 50);
    gameLoopRef.current = loop;
    setGameLoop(loop);

    // Create Enemy Meshes
    const enemies = loop.getEnemies();
    const newEnemyMeshes: BABYLON.Mesh[] = [];
    enemies.forEach((enemy, idx) => {
      const enemyMesh = BABYLON.MeshBuilder.CreateBox(`enemy${idx}`, { size: 0.8 }, scene);
      enemyMesh.material = new BABYLON.StandardMaterial(`enemyMat${idx}`, scene);
      (enemyMesh.material as BABYLON.StandardMaterial).diffuse = BABYLON.Color3.Red();
      newEnemyMeshes.push(enemyMesh);
    });
    enemyMeshesRef.current = newEnemyMeshes;

    // Game Update Loop
    const gameUpdateInterval = setInterval(() => {
      if (!gameLoopRef.current || !aiEnabled) return;

      const playerAction = { type: 'MOVE', direction: { x: 0, y: 0 }, power: 0 };
      const newGameState = gameLoopRef.current.update(playerAction);
      setGameState(newGameState);

      // Update 3D Visuals
      const player = gameLoopRef.current.getPlayer();
      const gameEnemies = gameLoopRef.current.getEnemies();

      if (playerMeshRef.current) {
        playerMeshRef.current.position = new BABYLON.Vector3(
          player.position.x,
          0,
          player.position.y
        );
      }

      gameEnemies.forEach((enemy, idx) => {
        if (enemyMeshesRef.current[idx]) {
          enemyMeshesRef.current[idx].position = new BABYLON.Vector3(
            enemy.position.x,
            0,
            enemy.position.y
          );
        }
      });

      // Calculate FPS
      frameCountRef.current++;
      const now = Date.now();
      if (now - lastUpdateTimeRef.current > 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastUpdateTimeRef.current = now;
      }
    }, 16); // ~60 FPS

    // Render Loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle Window Resize
    window.addEventListener('resize', () => {
      engine.resize();
    });

    return () => {
      clearInterval(gameUpdateInterval);
      engine.dispose();
    };
  }, [aiEnabled, difficulty]);

  // Handle Difficulty Change
  const handleDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty);
    if (difficultyManagerRef.current) {
      difficultyManagerRef.current.setDifficulty(newDifficulty);
    }
  };

  return (
    <div className="game-container">
      <canvas ref={canvasRef} style={{ width: '100%', height: '600px' }} />

      <div className="game-controls" style={{ padding: '20px', backgroundColor: '#1e1e1e', color: '#fff' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '10px' }}>🎮 Уровень Сложности AI:</label>
          <select
            value={difficulty}
            onChange={(e) => handleDifficultyChange(e.target.value as DifficultyLevel)}
            style={{ padding: '8px', borderRadius: '4px' }}
          >
            <option value={DifficultyLevel.EASY}>⚡ Easy (Training)</option>
            <option value={DifficultyLevel.MEDIUM}>⚔️ Medium (Standard)</option>
            <option value={DifficultyLevel.HARD}>🔥 Hard (Spec Ops)</option>
          </select>
          <button
            onClick={() => setAiEnabled(!aiEnabled)}
            style={{
              marginLeft: '15px',
              padding: '8px 16px',
              backgroundColor: aiEnabled ? '#4CAF50' : '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {aiEnabled ? '✓ AI Enabled' : '✗ AI Disabled'}
          </button>
        </div>

        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '4px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>📊 Game Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <p><strong>🔄 Tick:</strong> {gameState.tick}</p>
            <p><strong>❤️ Player Health:</strong> {gameState.playerHealth}%</p>
            <p><strong>💪 Player Stamina:</strong> {gameState.playerStamina}%</p>
            <p><strong>👾 Enemies:</strong> {gameState.enemiesCount}</p>
            <p><strong>⏱️ FPS:</strong> {fps}</p>
            <p><strong>🎯 Status:</strong> {gameState.running ? '🟢 RUNNING' : '🔴 STOPPED'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScenePhase3IntegrationV2;
