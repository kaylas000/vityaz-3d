import React, { useEffect, useRef, useState } from 'react';
import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  ArcRotateCamera,
} from '@babylonjs/core';
import './GameScene.css';

interface GameSceneProps {
  playerName?: string;
  onGameReady?: () => void;
  onError?: (error: string) => void;
}

export const GameScene: React.FC<GameSceneProps> = ({
  playerName = 'Player',
  onGameReady,
  onError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        if (!canvasRef.current) {
          throw new Error('Canvas element not found');
        }

        console.log('🎮 Initializing Babylon.js Game Scene...');

        // Create Babylon Engine
        const engine = new Engine(canvasRef.current, true, {
          preserveDrawingBuffer: true,
          stencil: true,
        });
        engineRef.current = engine;
        console.log('✓ Engine created');

        // Create Scene
        const scene = new Scene(engine);
        sceneRef.current = scene;
        scene.collisionsEnabled = true;
        console.log('✓ Scene created');

        // Create Camera
        const camera = new ArcRotateCamera(
          'camera',
          Math.PI / 2,
          Math.PI / 2.5,
          50,
          new Vector3(0, 0, 0),
          scene
        );
        camera.attachControl(canvasRef.current, true);
        camera.checkCollisions = true;
        camera.inertia = 0.7;
        camera.speed = 0.02;
        console.log('✓ Camera created');

        // Create Lighting
        const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;
        console.log('✓ Light created');

        // Create Ground
        const ground = MeshBuilder.CreateGround(
          'ground',
          { width: 100, height: 100 },
          scene
        );
        const groundMaterial = new StandardMaterial('groundMat', scene);
        groundMaterial.diffuse = new Color3(0.2, 0.7, 0.2);
        ground.material = groundMaterial;
        ground.checkCollisions = true;
        console.log('✓ Ground created');

        // Create Player Box
        const playerBox = MeshBuilder.CreateBox('player', { size: 2 }, scene);
        playerBox.position.y = 2;
        const playerMaterial = new StandardMaterial('playerMat', scene);
        playerMaterial.diffuse = new Color3(0, 0.5, 1);
        playerBox.material = playerMaterial;
        playerBox.checkCollisions = true;
        console.log('✓ Player created');

        // Create enemy dummy
        const enemyBox = MeshBuilder.CreateBox('enemy', { size: 1.5 }, scene);
        enemyBox.position.set(10, 1, 10);
        const enemyMaterial = new StandardMaterial('enemyMat', scene);
        enemyMaterial.diffuse = new Color3(1, 0, 0);
        enemyBox.material = enemyMaterial;
        enemyBox.checkCollisions = true;
        console.log('✓ Enemy created');

        // Setup input handling
        const keys: { [key: string]: boolean } = {};
        const handleKeyDown = (e: KeyboardEvent) => {
          keys[e.key.toLowerCase()] = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
          keys[e.key.toLowerCase()] = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Start render loop
        let lastTime = Date.now();
        engine.runRenderLoop(() => {
          const now = Date.now();
          const deltaTime = (now - lastTime) / 1000;
          lastTime = now;

          // Simple player movement
          const moveSpeed = 0.5;
          if (keys['w'] || keys['arrowup']) playerBox.position.z += moveSpeed * deltaTime;
          if (keys['s'] || keys['arrowdown']) playerBox.position.z -= moveSpeed * deltaTime;
          if (keys['a'] || keys['arrowleft']) playerBox.position.x -= moveSpeed * deltaTime;
          if (keys['d'] || keys['arrowright']) playerBox.position.x += moveSpeed * deltaTime;

          // Simple enemy AI - move towards player
          const dirToPlayer = playerBox.position.subtract(enemyBox.position);
          const dist = Vector3.Distance(playerBox.position, enemyBox.position);
          if (dist > 2) {
            const direction = dirToPlayer.normalize();
            enemyBox.position.addInPlace(direction.scale(0.1 * deltaTime));
          }

          // Render scene
          scene.render();
        });

        // Handle resize
        window.addEventListener('resize', () => engine.resize());

        setGameStatus('ready');
        setIsLoading(false);
        onGameReady?.();
        console.log('✓ Game ready!');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('❌ Game initialization failed:', errorMsg);
        setError(errorMsg);
        setGameStatus('error');
        setIsLoading(false);
        onError?.(errorMsg);
      }
    };

    initializeGame();

    return () => {
      if (engineRef.current) {
        console.log('🔴 Disposing engine...');
        engineRef.current.dispose();
      }
    };
  }, [playerName, onGameReady, onError]);

  if (gameStatus === 'error') {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>🚨 Game Initialization Failed</h2>
        <p style={styles.errorMsg}>{error}</p>
        <p style={styles.errorHint}>Please refresh the page to try again.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {isLoading && <div style={styles.loadingOverlay}>⏳ Initializing Game...</div>}
      <canvas
        ref={canvasRef}
        style={styles.canvas}
        className="babylon-canvas"
      />
      <div style={styles.hud}>
        <div style={styles.playerInfo}>
          <p style={{ margin: '5px 0' }}>🎮 Player: {playerName}</p>
          <p style={{ margin: '5px 0' }}>Status: {gameStatus}</p>
          <p style={{ margin: '5px 0', fontSize: '12px', opacity: 0.8 }}>
            Use WASD to move | Right-click to rotate camera
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: '#00ff00',
    fontSize: '24px',
    fontFamily: 'monospace',
    zIndex: 10,
  },
  hud: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '14px',
    zIndex: 5,
  },
  playerInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '10px 15px',
    borderRadius: '4px',
    border: '2px solid #00ff00',
  },
  errorContainer: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    color: '#ff6b6b',
    fontFamily: 'monospace',
  },
  errorTitle: {
    fontSize: '32px',
    marginBottom: '20px',
    color: '#ff6b6b',
  },
  errorMsg: {
    fontSize: '16px',
    marginBottom: '10px',
    color: '#ffff00',
  },
  errorHint: {
    fontSize: '14px',
    color: '#999',
  },
};
