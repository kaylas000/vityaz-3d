import React, { useEffect, useRef } from 'react';

interface GamePageProps {
  playerName: string;
  difficulty: string;
  onExit: () => void;
}

export const GamePage: React.FC<GamePageProps> = ({ playerName, difficulty, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameReady, setGameReady] = React.useState(false);

  useEffect(() => {
    const initGame = async () => {
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
        gmat.emissiveColor = new babylon.Color3(0.1, 0.3, 0.1);
        ground.material = gmat;

        const player = babylon.MeshBuilder.CreateBox('player', { size: 2 }, scene);
        player.position.y = 2;
        const pmat = new babylon.StandardMaterial('pmat', scene);
        pmat.diffuse = new babylon.Color3(0, 0.5, 1);
        pmat.emissiveColor = new babylon.Color3(0, 0.5, 1);
        player.material = pmat;

        const enemy = babylon.MeshBuilder.CreateBox('enemy', { size: 1.5 }, scene);
        enemy.position.set(10, 1, 10);
        const emat = new babylon.StandardMaterial('emat', scene);
        emat.diffuse = new babylon.Color3(1, 0, 0);
        emat.emissiveColor = new babylon.Color3(1, 0, 0);
        enemy.material = emat;

        const keys: { [key: string]: boolean } = {};
        window.addEventListener('keydown', (e) => {
          keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
          keys[e.key.toLowerCase()] = false;
        });

        let lastTime = Date.now();
        engine.runRenderLoop(() => {
          const now = Date.now();
          const dt = (now - lastTime) / 1000;
          lastTime = now;

          const speed = 20; // FASTER!
          if (keys['w'] || keys['arrowup']) player.position.z += speed * dt;
          if (keys['s'] || keys['arrowdown']) player.position.z -= speed * dt;
          if (keys['a'] || keys['arrowleft']) player.position.x -= speed * dt;
          if (keys['d'] || keys['arrowright']) player.position.x += speed * dt;

          // Enemy AI - chase player
          const dirToPlayer = player.position.subtract(enemy.position);
          const dist = babylon.Vector3.Distance(player.position, enemy.position);
          if (dist > 2) {
            const normalized = dirToPlayer.normalize();
            enemy.position.addInPlace(normalized.scale(8 * dt)); // FASTER!
          }

          scene.render();
        });

        window.addEventListener('resize', () => engine.resize());
        setGameReady(true);
      } catch (err) {
        console.error('Game error:', err);
      }
    };

    initGame();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.hud}>
        <div style={styles.hudBox}>
          <p>🎮 Player: {playerName}</p>
          <p>🌟 Difficulty: {difficulty.toUpperCase()}</p>
          <p>🍗 Status: {gameReady ? '✓ Ready' : '⏳ Loading'}</p>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#00ff00' }}>WASD или стрелки для движения</p>
        </div>
        <button style={styles.exitButton} onClick={onExit}>
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
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  hud: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 100,
    display: 'flex',
    gap: '15px',
    flexDirection: 'column',
  },
  hudBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: '2px solid #00ff00',
    color: '#00ff00',
    padding: '15px',
    fontFamily: 'monospace',
    fontSize: '14px',
    borderRadius: '4px',
  },
  exitButton: {
    padding: '10px 20px',
    backgroundColor: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
