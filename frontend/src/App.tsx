import React, { useState } from 'react';
import { StartPage } from './pages/StartPage';
import { PlayPage } from './pages/PlayPage';
import { GamePage } from './pages/GamePage';
import './App.css';

type Page = 'start' | 'play' | 'game';

interface GameConfig {
  playerName: string;
  difficulty: string;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('start');
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    playerName: 'Player',
    difficulty: 'normal',
  });

  const handleStartClick = () => {
    setCurrentPage('play');
  };

  const handlePlayClick = (playerName: string, difficulty: string) => {
    setGameConfig({ playerName, difficulty });
    setCurrentPage('game');
  };

  const handleBackClick = () => {
    setCurrentPage('start');
  };

  const handleExitClick = () => {
    setCurrentPage('start');
  };

  return (
    <div>
      {currentPage === 'start' && <StartPage onStart={handleStartClick} />}
      {currentPage === 'play' && <PlayPage onPlay={handlePlayClick} onBack={handleBackClick} />}
      {currentPage === 'game' && (
        <GamePage
          playerName={gameConfig.playerName}
          difficulty={gameConfig.difficulty}
          onExit={handleExitClick}
        />
      )}
    </div>
  );
};

export default App;
