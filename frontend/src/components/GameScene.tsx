import React, { useEffect, useRef, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>(['Starting initialization...']);

  const addLog = (msg: string) => {
    console.log(msg);
    setDebugLog(prev => [...prev, msg]);
  };

  useEffect(() => {
    const initializeGame = async () => {
      try {
        addLog('🔍 Step 1: Checking canvas element...');
        if (!canvasRef.current) {
          throw new Error('Canvas element not found');
        }
        addLog('✓ Canvas found');

        addLog('🔍 Step 2: Importing Babylon.js...');
        const babylon = await import('@babylonjs/core');
        addLog('✓ Babylon.js imported');

        addLog('🔍 Step 3: Creating engine...');
        const engine = new babylon.Engine(canvasRef.current, true, {
          preserveDrawingBuffer: true,
          stencil: true,
        });
        addLog('✓ Engine created');

        addLog('🔍 Step 4: Creating scene...');
        const scene = new babylon.Scene(engine);
        scene.collisionsEnabled = true;
        addLog('✓ Scene created');

        addLog('🔍 Step 5: Creating camera...');
        const camera = new babylon.ArcRotateCamera(
          'camera',
          Math.PI / 2,
          Math.PI / 2.5,
          50,
          new babylon.Vector3(0, 0, 0),
          scene
        );
        camera.attachControl(canvasRef.current, true);
        camera.checkCollisions = true;
        camera.inertia = 0.7;
        camera.speed = 0.02;
        addLog('✓ Camera created');

        addLog('🔍 Step 6: Creating light...');
        const light = new babylon.HemisphericLight('light1', new babylon.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;
        addLog('✓ Light created');

        addLog('🔍 Step 7: Creating ground...');
        const ground = babylon.MeshBuilder.CreateGround(
          'ground',
          { width: 100, height: 100 },
          scene
        );
        const groundMaterial = new babylon.StandardMaterial('groundMat', scene);
        groundMaterial.diffuse = new babylon.Color3(0.2, 0.7, 0.2);
        ground.material = groundMaterial;
        ground.checkCollisions = true;
        addLog('✓ Ground created');

        addLog('🔍 Step 8: Creating player...');
        const playerBox = babylon.MeshBuilder.CreateBox('player', { size: 2 }, scene);
        playerBox.position.y = 2;
        const playerMaterial = new babylon.StandardMaterial('playerMat', scene);
        playerMaterial.diffuse = new babylon.Color3(0, 0.5, 1);
        playerBox.material = playerMaterial;
        playerBox.checkCollisions = true;
        addLog('✓ Player created');

        addLog('🔍 Step 9: Creating enemy...');
        const enemyBox = babylon.MeshBuilder.CreateBox('enemy', { size: 1.5 }, scene);
        enemyBox.position.set(10, 1, 10);
        const enemyMaterial = new babylon.StandardMaterial('enemyMat', scene);
        enemyMaterial.diffuse = new babylon.Color3(1, 0, 0);
        enemyBox.material = enemyMaterial;
        enemyBox.checkCollisions = true;
        addLog('✓ Enemy created');

        addLog('🔍 Step 10: Setting up input...');
        const keys: { [key: string]: boolean } = {};
        const handleKeyDown = (e: KeyboardEvent) => {
          keys[e.key.toLowerCase()] = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
          keys[e.key.toLowerCase()] = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        addLog('✓ Input handlers attached');

        addLog('🔍 Step 11: Starting render loop...');
        let lastTime = Date.now();
        engine.runRenderLoop(() => {
          const now = Date.now();
          const deltaTime = (now - lastTime) / 1000;
          lastTime = now;

          const moveSpeed = 0.5;
          if (keys['w'] || keys['arrowup']) playerBox.position.z += moveSpeed * deltaTime;
          if (keys['s'] || keys['arrowdown']) playerBox.position.z -= moveSpeed * deltaTime;
          if (keys['a'] || keys['arrowleft']) playerBox.position.x -= moveSpeed * deltaTime;
          if (keys['d'] || keys['arrowright']) playerBox.position.x += moveSpeed * deltaTime;

          const dirToPlayer = playerBox.position.subtract(enemyBox.position);
          const dist = babylon.Vector3.Distance(playerBox.position, enemyBox.position);
          if (dist > 2) {
            const direction = dirToPlayer.normalize();
            enemyBox.position.addInPlace(direction.scale(0.1 * deltaTime));
          }

          scene.render();
        });
        addLog('✓ Render loop started');

        window.addEventListener('resize', () => engine.resize());

        setGameStatus('ready');
        setIsLoading(false);
        onGameReady?.();
        addLog('✅ Game ready!');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        addLog('❌ ERROR: ' + errorMsg);
        console.error('Game initialization error:', err);
        setError(errorMsg);
        setGameStatus('error');
        setIsLoading(false);
        onError?.(errorMsg);
      }
    };

    initializeGame();

    return () => {
      // Cleanup
    };
  }, [playerName, onGameReady, onError]);

  if (gameStatus === 'error') {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>🚨 Game Initialization Failed</h2>
        <p style={styles.errorMsg}>{error}</p>
        <div style={styles.debugBox}>
          <strong>Debug Log:</strong>
          <pre>{debugLog.join('\n')}</pre>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div>
            <div style={styles.spinner} />
            <p>Initializing Game...</p>
            <div style={styles.debugBox}>
              <strong>Debug Log:</strong>
              <pre>{debugLog.join('\n')}</pre>
            </div>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={styles.canvas}
        className="babylon-canvas"
      />
      <div style={styles.hud}>
        <div style={styles.playerInfo}>
          <p style={{ margin: '5px 0' }}>🎮 Player: {playerName}</p>
          <p style={{ margin: '5px 0' }}>Status: {gameStatus}</p>
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    color: '#00ff00',
    fontFamily: 'monospace',
    zIndex: 10,
    flexDirection: 'column',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #00ff00',
    borderTop: '4px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  debugBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid #00ff00',
    padding: '10px',
    borderRadius: '4px',
    maxWidth: '600px',
    maxHeight: '300px',
    overflow: 'auto',
    marginTop: '20px',
    fontSize: '12px',
    textAlign: 'left',
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
    padding: '20px',
  },
  errorTitle: {
    fontSize: '32px',
    marginBottom: '20px',
    color: '#ff6b6b',
  },
  errorMsg: {
    fontSize: '16px',
    marginBottom: '20px',
    color: '#ffff00',
  },
};
