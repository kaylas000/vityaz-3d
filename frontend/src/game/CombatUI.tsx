import React from 'react';
import { SpecNavyFighter } from './SpecNavyFighter';
import './CombatUI.css';

interface CombatUIProps {
  player: SpecNavyFighter | null;
  enemies: SpecNavyFighter[];
}

export const CombatUI: React.FC<CombatUIProps> = ({ player, enemies }) => {
  if (!player) return null;

  return (
    <div className="combat-ui">
      {/* Player Stats */}
      <div className="player-stats">
        <h3>PLAYER</h3>
        <div className="stat-bar">
          <div className="label">Health</div>
          <div className="bar-container">
            <div
              className="bar-fill health"
              style={{ width: `${player.getHealth() * 100}%` }}
            />
          </div>
          <span className="value">
            {Math.ceil(player.stats.health)}/{player.stats.maxHealth}
          </span>
        </div>

        <div className="stat-bar">
          <div className="label">Armor</div>
          <div className="bar-container">
            <div
              className="bar-fill armor"
              style={{ width: `${player.getArmor() * 100}%` }}
            />
          </div>
          <span className="value">
            {Math.ceil(player.stats.armor)}/{player.stats.maxArmor}
          </span>
        </div>

        <div className="stat-bar">
          <div className="label">Stamina</div>
          <div className="bar-container">
            <div
              className="bar-fill stamina"
              style={{ width: `${player.getStamina() * 100}%` }}
            />
          </div>
          <span className="value">
            {Math.ceil(player.stats.stamina)}/{player.stats.maxStamina}
          </span>
        </div>
      </div>

      {/* Enemy Stats */}
      <div className="enemy-stats">
        <h3>ENEMIES</h3>
        {enemies.map((enemy, index) => (
          <div key={index} className="enemy-entry">
            <div className="label">Enemy {index + 1}</div>
            <div className="bar-container small">
              <div
                className="bar-fill health"
                style={{ width: `${enemy.getHealth() * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="combat-status">
        <span className="status-text">
          State: {player.state.animationState.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
