import React, { useState } from 'react';
import { GameScene } from './components/GameScene';
import './App.css';

const App: React.FC = () => {
  const [gameError, setGameError] = useState<string | null>(null);
  const [gameReady, setGameReady] = useState(false);

  return (
    <div className="app-container">
      <GameScene
        playerName="VITYAZ Operator"
        onGameReady={() => {
          console.log('✓ Game is ready!');
          setGameReady(true);
        }}
        onError={(error) => {
          console.error('Game error:', error);
          setGameError(error);
        }}
      />
    </div>
  );
};

export default App;
