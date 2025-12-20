import React, { useEffect, useRef } from 'react';
import './GameScene.css';

interface GameSceneProps {
  width?: number;
  height?: number;
  onGameStart?: () => void;
}

const GameScene: React.FC<GameSceneProps> = ({ 
  width = 800, 
  height = 600, 
  onGameStart 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw game background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw grid for guidance
    ctx.strokeStyle = '#0f3460';
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw placeholder player
    drawPlayer(ctx, width / 2, height / 2);
  }, [width, height]);

  const drawPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Draw player sprite placeholder (32x64 pixel)
    ctx.fillStyle = '#e94560';
    ctx.fillRect(x - 16, y - 32, 32, 64);
    
    // Draw head
    ctx.fillStyle = '#f4a460';
    ctx.beginPath();
    ctx.arc(x, y - 36, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 4, y - 38, 2, 2);
    ctx.fillRect(x + 2, y - 38, 2, 2);
  };

  return (
    <div className="game-scene-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="game-canvas"
      />
      <div className="game-controls">
        <button className="btn btn-primary" onClick={onGameStart}>
          🎮 Start Game
        </button>
      </div>
    </div>
  );
};

export default GameScene;
