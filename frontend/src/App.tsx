import React from 'react';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🥊 VITYAZ: Special Operations</h1>
        <p>Tactical FPS with Crypto-Economics</p>
      </div>
      <div className="app-main">
        <div className="game-wrapper">
          <canvas id="babylonCanvas" style={{ width: '100%', height: '600px', display: 'block' }} />
        </div>
        <div className="game-status">
          <p id="status">Loading game...</p>
        </div>
      </div>
      <div className="app-footer">© 2025 VITYAZ Special Operations</div>
      <script type="module">
        {`
          (async () => {
            console.log('Game init starting...');
            const babylon = await import('@babylonjs/core');
            console.log('Babylon loaded');
            
            const canvas = document.getElementById('babylonCanvas');
            if (!canvas) {
              console.error('No canvas found');
              return;
            }
            
            const engine = new babylon.Engine(canvas, true);
            const scene = new babylon.Scene(engine);
            
            const camera = new babylon.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2.5, 50, new babylon.Vector3(0, 0, 0), scene);
            camera.attachControl(canvas, true);
            
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
            
            engine.runRenderLoop(() => scene.render());
            window.addEventListener('resize', () => engine.resize());
            
            document.getElementById('status').innerText = '✓ Game Ready!';
            console.log('Game ready!');
          })();
        `}
      </script>
    </div>
  );
};

export default App;
