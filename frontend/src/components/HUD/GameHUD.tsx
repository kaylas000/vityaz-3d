import React from 'react';
import './GameHUD.css';

interface GameHUDProps {
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  kills: number;
  deaths: number;
  score: number;
  timeRemaining: number;
  players: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  health,
  maxHealth,
  ammo,
  maxAmmo,
  kills,
  deaths,
  score,
  timeRemaining,
  players,
}) => {
  const healthPercent = (health / maxHealth) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="game-hud">
      {/* Top bar */}
      <div className="hud-top">
        <div className="hud-timer">
          <span className="timer-icon">⏱</span>
          <span className="timer-value">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="hud-score">
          <span className="score-label">SCORE</span>
          <span className="score-value">{score}</span>
        </div>

        <div className="hud-players">
          <span className="players-icon">👥</span>
          <span className="players-value">{players}</span>
        </div>
      </div>

      {/* Bottom left - Health */}
      <div className="hud-bottom-left">
        <div className="health-container">
          <div className="health-label">HEALTH</div>
          <div className="health-bar">
            <div
              className="health-fill"
              style={{
                width: `${healthPercent}%`,
                backgroundColor:
                  healthPercent > 50 ? '#4caf50' : healthPercent > 25 ? '#ff9800' : '#f44336',
              }}
            />
          </div>
          <div className="health-value">
            {health} / {maxHealth}
          </div>
        </div>
      </div>

      {/* Bottom right - Ammo & Stats */}
      <div className="hud-bottom-right">
        <div className="ammo-container">
          <div className="ammo-icon">🔫</div>
          <div className="ammo-count">
            <span className="ammo-current">{ammo}</span>
            <span className="ammo-separator">/</span>
            <span className="ammo-max">{maxAmmo}</span>
          </div>
        </div>

        <div className="stats-container">
          <div className="stat">
            <span className="stat-label">K</span>
            <span className="stat-value">{kills}</span>
          </div>
          <div className="stat">
            <span className="stat-label">D</span>
            <span className="stat-value">{deaths}</span>
          </div>
          <div className="stat">
            <span className="stat-label">K/D</span>
            <span className="stat-value">
              {deaths === 0 ? kills.toFixed(1) : (kills / deaths).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="crosshair">
        <div className="crosshair-line crosshair-top" />
        <div className="crosshair-line crosshair-bottom" />
        <div className="crosshair-line crosshair-left" />
        <div className="crosshair-line crosshair-right" />
        <div className="crosshair-center" />
      </div>
    </div>
  );
};
