import React, { useState } from 'react';
import GameScene from './components/GameScene';
import './App.css';

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleGameStart = () => {
    console.log('Game started!');
    setGameStarted(true);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎮 VITYAZ: Special Operations</h1>
        <p>Crypto-powered Gaming Ecosystem</p>
      </header>
      
      <main className="app-main">
        <div className="game-wrapper">
          <GameScene 
            width={800} 
            height={600}
            onGameStart={handleGameStart}
          />
        </div>
        
        {gameStarted && (
          <div className="game-status">
            <p>✅ Game Engine Initialized</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 VITYAZ Project | TON Blockchain Gaming</p>
      </footer>
    </div>
  );
};

export default App;
