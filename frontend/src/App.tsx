import React, { useState, useEffect, useRef } from 'react';
import './App.css';

type Page = 'start' | 'play' | 'game';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('start');
  const [playerName, setPlayerName] = useState('Player');
  const [difficulty, setDifficulty] = useState('normal');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameReady, setGameReady] = useState(false);

  // Initialize game when on game page
  useEffect(() => {
    if (page !== 'game') return;

    const init = async () => {
      try {
        if (!canvasRef.current) return;
        
        const babylon = await import('@babylonjs/core');
        
        const engine = new babylon.Engine(canvasRef.current, true);
        const scene = new babylon.Scene(engine);
        
        const camera = new babylon.ArcRotateCamera(
          'camera',
          Math.PI / 2,
          Math.PI / 2.5,
          50,
          new babylon.Vector3(0, 0, 0),
          scene
        );
        camera.attachControl(canvasRef.current, true);
        
        new babylon.HemisphericLight('light', new babylon.Vector3(0, 1, 0), scene);
        
        const ground = babylon.MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, scene);
        const gmat = new babylon.StandardMaterial('gmat', scene);
        gmat.diffuse = new babylon.Color3(0.2, 0.7, 0.2);
        ground.material = gmat;
        
        const player = babylon.MeshBuilder.CreateBox('player', { size: 2 }, scene);
        player.position.y = 2;
        const pmat = new babylon.StandardMaterial('pmat', scene);
        pmat.diffuse = new babylon.Color3(0, 0.5, 1);
        player.material = pmat;
        
        const enemy = babylon.MeshBuilder.CreateBox('enemy', { size: 1.5 }, scene);
        enemy.position.set(10, 1, 10);
        const emat = new babylon.StandardMaterial('emat', scene);
        emat.diffuse = new babylon.Color3(1, 0, 0);
        enemy.material = emat;
        
        const keys: { [key: string]: boolean } = {};
        window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
        window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
        
        let lastTime = Date.now();
        engine.runRenderLoop(() => {
          const now = Date.now();
          const dt = (now - lastTime) / 1000;
          lastTime = now;
          
          const speed = 0.5;
          if (keys['w'] || keys['arrowup']) player.position.z += speed * dt;
          if (keys['s'] || keys['arrowdown']) player.position.z -= speed * dt;
          if (keys['a'] || keys['arrowleft']) player.position.x -= speed * dt;
          if (keys['d'] || keys['arrowright']) player.position.x += speed * dt;
          
          const dir = player.position.subtract(enemy.position);
          const dist = babylon.Vector3.Distance(player.position, enemy.position);
          if (dist > 2) {
            const norm = dir.normalize();
            enemy.position.addInPlace(norm.scale(0.1 * dt));
          }
          
          scene.render();
        });
        
        window.addEventListener('resize', () => engine.resize());
        setGameReady(true);
      } catch (err) {
        console.error('Game error:', err);
      }
    };
    
    init();
  }, [page]);

  // START PAGE
  if (page === 'start') {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        color: '#fff',
        flexDirection: 'column',
      }}>
        <h1 style={{ fontSize: '72px', margin: '0 0 10px 0', color: '#e94560' }}>🥊 VITYAZ</h1>
        <p style={{ fontSize: '28px', margin: '0 0 40px 0', color: '#b0b0ff' }}>Special Operations</p>
        <button
          style={{
            padding: '15px 40px',
            fontSize: '20px',
            fontWeight: 'bold',
            backgroundColor: '#e94560',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          onClick={() => setPage('play')}
        >
          START GAME
        </button>
      </div>
    );
  }

  // PLAY PAGE
  if (page === 'play') {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        color: '#fff',
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '12px',
          border: '2px solid #e94560',
        }}>
          <h2 style={{ fontSize: '36px', margin: '0 0 30px 0', color: '#e94560' }}>Game Settings</h2>
          
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#b0b0ff', fontWeight: 'bold' }}>Player Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                backgroundColor: '#1a1a2e',
                color: '#fff',
                border: '1px solid #e94560',
                borderRadius: '4px',
              }}
            />
          </div>
          
          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#b0b0ff', fontWeight: 'bold' }}>Difficulty:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                backgroundColor: '#1a1a2e',
                color: '#fff',
                border: '1px solid #e94560',
                borderRadius: '4px',
              }}
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
              <option value="impossible">Impossible</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#e94560',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              onClick={() => setPage('game')}
            >
              PLAY
            </button>
            <button
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: 'transparent',
                color: '#e94560',
                border: '2px solid #e94560',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              onClick={() => setPage('start')}
            >
              BACK
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GAME PAGE
  if (page === 'game') {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 100,
          display: 'flex',
          gap: '15px',
          flexDirection: 'column',
        }}>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '2px solid #00ff00',
            color: '#00ff00',
            padding: '15px',
            fontFamily: 'monospace',
            fontSize: '14px',
            borderRadius: '4px',
          }}>
            <p style={{ margin: '5px 0' }}>🎮 Player: {playerName}</p>
            <p style={{ margin: '5px 0' }}>🌟 Difficulty: {difficulty.toUpperCase()}</p>
            <p style={{ margin: '5px 0' }}>📡 Status: {gameReady ? '✓ Ready' : '⏳ Loading'}</p>
          </div>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#e94560',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            onClick={() => setPage('start')}
          >
            EXIT GAME
          </button>
        </div>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            backgroundColor: '#000',
          }}
        />
      </div>
    );
  }

  return null;
};

export default App;
