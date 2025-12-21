import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [debugLog, setDebugLog] = useState<string[]>(['App mounted']);

  const addLog = (msg: string) => {
    console.log(msg);
    setDebugLog(prev => [...prev, msg]);
  };

  useEffect(() => {
    const loadBabylon = async () => {
      try {
        addLog('🔍 Step 1: Canvas check...');
        if (!canvasRef.current) {
          throw new Error('No canvas');
        }
        addLog('✓ Canvas found');

        addLog('🔍 Step 2: Import Babylon...');
        const babylon = await import('@babylonjs/core');
        addLog('✓ Babylon imported: ' + typeof babylon.Engine);

        addLog('🔍 Step 3: Create engine...');
        const engine = new babylon.Engine(canvasRef.current, true);
        addLog('✓ Engine: ' + typeof engine);

        addLog('🔍 Step 4: Create scene...');
        const scene = new babylon.Scene(engine);
        addLog('✓ Scene: ' + typeof scene);

        addLog('🔍 Step 5: Create camera...');
        const camera = new babylon.ArcRotateCamera(
          'cam',
          Math.PI / 2,
          Math.PI / 2.5,
          50,
          new babylon.Vector3(0, 0, 0),
          scene
        );
        camera.attachControl(canvasRef.current, true);
        addLog('✓ Camera OK');

        addLog('🔍 Step 6: Create light...');
        new babylon.HemisphericLight('light', new babylon.Vector3(0, 1, 0), scene);
        addLog('✓ Light OK');

        addLog('🔍 Step 7: Create ground...');
        const ground = babylon.MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, scene);
        const gmat = new babylon.StandardMaterial('gmat', scene);
        gmat.diffuse = new babylon.Color3(0.2, 0.7, 0.2);
        ground.material = gmat;
        addLog('✓ Ground OK');

        addLog('🔍 Step 8: Create player...');
        const player = babylon.MeshBuilder.CreateBox('player', { size: 2 }, scene);
        player.position.y = 2;
        const pmat = new babylon.StandardMaterial('pmat', scene);
        pmat.diffuse = new babylon.Color3(0, 0.5, 1);
        player.material = pmat;
        addLog('✓ Player OK');

        addLog('🔍 Step 9: Render loop...');
        engine.runRenderLoop(() => {
          scene.render();
        });
        addLog('✓ Render OK');

        window.addEventListener('resize', () => engine.resize());
        addLog('✅ READY!');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        addLog('❌ ERROR: ' + msg);
        console.error('FULL ERROR:', err);
      }
    };

    loadBabylon();
  }, []);

  return (
    <div className="app-container">
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(0,0,0,0.9)',
        border: '2px solid #00ff00',
        color: '#00ff00',
        padding: '15px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '400px',
        maxHeight: '300px',
        overflow: 'auto',
        zIndex: 1000,
      }}>
        <strong>Debug Log:</strong>
        <pre style={{ margin: '10px 0 0 0', whiteSpace: 'pre-wrap' }}>
          {debugLog.join('\n')}
        </pre>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100vh',
          display: 'block',
          backgroundColor: '#000',
        }}
      />
    </div>
  );
};

export default App;
