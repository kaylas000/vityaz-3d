import React from 'react';
import { GameScene } from './components/GameScene';

export default function App() {
  return (
    <GameScene
      playerName="Player"
      onGameReady={() => console.log('Game is ready!')}
      onError={(error) => console.error('Game error:', error)}
    />
  );
}
