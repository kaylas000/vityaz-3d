import React, { useEffect, useRef, useState } from 'react';
import './App.css';

// Babylon imports
let BabylonModule: any = null;

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initGame = async () => {
      try {
        console.log('Starting game initialization...');

        // Dynamic import to ensure Babylon is loaded
        const babylon = await import('@babylonjs/core');
        BabylonModule = babylon;
        console.log('Babylon.js loaded:', BabylonModule);

        if (!canvasRef.current) {
          throw new Error('Canvas element not found');
        }

        // Create Babylon Engine
        const engine = new babylon.Engine(canvasRef.current, true);
        engineRef.current = engine;
        console.log('Engine created');

        // Create Scene
        const scene = new babylon.Scene(engine);
        sceneRef.current = scene;
        console.log('Scene created');

        // Create Camera
        const camera = new babylon.ArcRotateCamera(
          'camera',
          Math.PI / 2,
          Math.PI / 2.5,
          50,
          new babylon.Vector3(0, 10, 0),
          scene
        );
        camera.attachControl(canvasRef.current, true);
        camera.speed = 10;
        camera.inertia = 0.7;
        console.log('Camera created');

        // Create Light
        const light = new babylon.HemisphericLight(
          'light',
          new babylon.Vector3(1, 1, 0),
          scene
        );
        light.intensity = 0.8;
        console.log('Light created');

        // Create Ground
        const ground = babylon.MeshBuilder.CreateGround(
          'ground',
          { width: 200, height: 200 },
          scene
        );
        const groundMat = new babylon.StandardMaterial('groundMat', scene);
        groundMat.diffuse = new babylon.Color3(0.2, 0.7, 0.2);
        ground.material = groundMat;
        console.log('Ground created');

        // Create Test Box
        const box = babylon.MeshBuilder.CreateBox('box', { size: 2 }, scene);
        box.position.y = 2;
        const boxMat = new babylon.StandardMaterial('boxMat', scene);
        boxMat.diffuse = new babylon.Color3(0, 0.5, 1);
        box.material = boxMat;
        console.log('Box created');

        // Animation loop
        engine.runRenderLoop(() => {
          scene.render();
        });

        // Handle resize
        window.addEventListener('resize', () => {
          engine.resize();
        });

        setLoading(false);
        console.log('Game initialized successfully!');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('Game initialization error:', errorMsg);
        setError(errorMsg);
        setLoading(false);
      }
    };

    initGame();

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="app-container">
        <div style={{ padding: '40px', color: '#e94560' }}>
          <h1>🥊 VITYAZ: Special Operations</h1>
          <p style={{ color: '#ff6b6b', fontSize: '16px' }}>Ошибка инициализации: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🥊 VITYAZ: Special Operations</h1>
        <p>Tactical FPS with Crypto-Economics</p>
      </div>
      <div className="app-main">
        <div style={{ position: 'relative', width: '100%', height: '600px', maxWidth: '800px' }}>
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                zIndex: 10,
                color: '#00ff00',
                fontSize: '24px',
                fontFamily: 'monospace',
              }}
            >
              Инициализация игры...
            </div>
          )}
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              border: '3px solid #e94560',
              borderRadius: '8px',
            }}
          />
        </div>
        <div className="game-status">
          <p>✓ Babylon.js запущен | Используй WASD для движения, мышь для камеры</p>
        </div>
      </div>
      <div className="app-footer">© 2025 VITYAZ Special Operations</div>
    </div>
  );
};

export default App;
