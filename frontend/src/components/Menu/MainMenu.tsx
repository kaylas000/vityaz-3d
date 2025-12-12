import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainMenu.css';

interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
  onLeaderboard: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onSettings,
  onLeaderboard,
}) => {
  return (
    <div className="main-menu">
      <div className="menu-container">
        <h1 className="game-title">VITYAZ</h1>
        <p className="game-subtitle">Special Operations</p>

        <div className="menu-buttons">
          <button className="menu-button primary" onClick={onPlay}>
            <span className="button-icon">▶</span>
            Play Now
          </button>

          <button className="menu-button" onClick={onLeaderboard}>
            <span className="button-icon">🏆</span>
            Leaderboard
          </button>

          <button className="menu-button" onClick={onSettings}>
            <span className="button-icon">⚙</span>
            Settings
          </button>

          <button className="menu-button" onClick={() => window.open('/docs')}>
            <span className="button-icon">📖</span>
            How to Play
          </button>
        </div>

        <div className="menu-footer">
          <p>v0.1.0-alpha | Testnet</p>
          <div className="social-links">
            <a href="https://t.me/vityaz" target="_blank" rel="noopener noreferrer">
              Telegram
            </a>
            <a href="https://twitter.com/vityaz" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
            <a href="https://discord.gg/vityaz" target="_blank" rel="noopener noreferrer">
              Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
