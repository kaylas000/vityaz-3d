import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { Player } from '../game/Player';

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
  const gameEngineRef = useRef<GameEngine | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');

  useEffect(() => {
    const initializeGame = async () => {
      try {
        if (!canvasRef.current) {
          throw new Error('Canvas element not found');
        }

        // Initialize game engine
        gameEngineRef.current = new GameEngine(canvasRef.current);
        await gameEngineRef.current.initialize();

        // Create player
        playerRef.current = new Player(playerName, gameEngineRef.current);
        playerRef.current.initialize();

        // Setup input handlers
        setupInputHandlers();

        // Setup game loop
        setupGameLoop();

        setGameStatus('ready');
        setIsLoading(false);
        onGameReady?.();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Game initialization error:', errorMessage);
        setGameStatus('error');
        setIsLoading(false);
        onError?.(errorMessage);
      }
    };

    initializeGame();

    // Cleanup on component unmount
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
      }
    };
  }, [playerName, onGameReady, onError]);

  const setupInputHandlers = () => {
    if (!playerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const keys: { [key: string]: boolean } = {};
      keys[event.key.toLowerCase()] = true;
      playerRef.current?.handleInput(keys);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const keys: { [key: string]: boolean } = {};
      keys[event.key.toLowerCase()] = false;
      playerRef.current?.handleInput(keys);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  };

  const setupGameLoop = () => {
    if (!gameEngineRef.current || !playerRef.current) return;

    const gameLoop = () => {
      try {
        // Update game state
        playerRef.current?.update(1 / 60); // Assuming 60 FPS

        // Render scene
        gameEngineRef.current?.render();
      } catch (error) {
        console.error('Game loop error:', error);
        setGameStatus('error');
      }
    };

    gameEngineRef.current.setUpdateCallback(gameLoop);
  };

  if (gameStatus === 'error') {
    return (
      <div className="game-error" style={styles.errorContainer}>
        <h2>Game Initialization Failed</h2>
        <p>Please refresh the page to try again.</p>
      </div>
    );
  }

  return (
    <div className="game-scene" style={styles.container}>
      {isLoading && <div style={styles.loadingOverlay}>Initializing Game...</div>}
      <canvas
        ref={canvasRef}
        style={styles.canvas}
        className="babylon-canvas"
      />
      <div style={styles.hud}>
        <div style={styles.playerInfo}>
          <p>Player: {playerName}</p>
          <p>Status: {gameStatus}</p>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    fontSize: '24px',
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '10px 15px',
    borderRadius: '4px',
    border: '1px solid #00ff00',
  },
};
