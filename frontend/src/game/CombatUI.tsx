import React, { useEffect, useState } from 'react';
import { SpecNavyFighter } from './SpecNavyFighter';
import './CombatUI.css';

interface CombatUIProps {
  player: SpecNavyFighter | null;
  enemies: SpecNavyFighter[];
}

export const CombatUI: React.FC<CombatUIProps> = ({ player, enemies }) => {
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    // keep log length bounded
    if (log.length > 200) setLog(l => l.slice(0, 200));
  }, [log]);

  if (!player) return null;

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLog(prev => [`[${time}] ${msg}`, ...prev]);
  };

  const findNearestEnemy = () => {
    let nearest: SpecNavyFighter | null = null;
    let nearestDist = Infinity;
    enemies.forEach(e => {
      if (!e.state.isAlive) return;
      const d = e.mesh.position.subtract(player.mesh.position).length();
      if (d < nearestDist) {
        nearestDist = d;
        nearest = e;
      }
    });
    return nearest;
  };

  const handleAttack = () => {
    const target = findNearestEnemy();
    if (!target) {
      addLog('No alive enemies to attack.');
      return;
    }

    const t = target as SpecNavyFighter;
    const damage = player.attack(t.mesh.position);
    if (damage <= 0) {
      addLog(`Attack missed or out of range (${t.mesh.name}).`);
      return;
    }

    t.takeDamage(damage);
    player.stats.stamina = Math.max(0, player.stats.stamina - 10);
    addLog(`Player attacked ${t.mesh.name} for ${Math.round(damage)} damage.`);

    if (!t.state.isAlive) addLog(`${t.mesh.name} has been defeated.`);
  };

  const handleDefend = () => {
    const boost = 20;
    const prevArmor = player.stats.armor;
    player.stats.armor = Math.min(player.stats.maxArmor, player.stats.armor + boost);
    addLog(`Player braces for impact (+${boost} armor).`);

    // revert after 5s
    setTimeout(() => {
      // only remove the temporary portion of armor (don't drop below previous)
      player.stats.armor = Math.max(prevArmor, player.stats.armor - boost);
      addLog('Defense buff expired.');
    }, 5000);
  };

  const handleSpecial = () => {
    if (player.stats.stamina < 30) {
      addLog('Not enough stamina for Special Attack.');
      return;
    }

    const target = findNearestEnemy();
    if (!target) {
      addLog('No alive enemies to special attack.');
      return;
    }

    const t = target as SpecNavyFighter;
    const prevWeapon = player.state.currentWeapon;
    player.state.currentWeapon = 'special';

    const damage = player.attack(t.mesh.position);
    if (damage > 0) {
      t.takeDamage(damage);
      addLog(`Player used SPECIAL on ${t.mesh.name} for ${Math.round(damage)} damage.`);
    } else {
      addLog('Special Attack failed (out of range or on cooldown).');
    }

    player.state.currentWeapon = prevWeapon;
    player.stats.stamina = Math.max(0, player.stats.stamina - 30);

    if (!t.state.isAlive) addLog(`${t.mesh.name} has been defeated by SPECIAL.`);
  };

  const clearLog = () => setLog([]);

  return (
    <div className="combat-ui" role="region" aria-label="Combat UI">
      <div className="combat-grid">
        {/* Left column: player and enemies */}
        <div className="combat-stats">
          <div className="player-stats">
            <h3>PLAYER</h3>

            <div className="stat-bar">
              <div className="label">HP</div>
              <div className="bar-container">
                <div className="bar-fill health" style={{ width: `${player.getHealth() * 100}%` }} />
              </div>
              <span className="value">{Math.ceil(player.stats.health)}/{player.stats.maxHealth}</span>
            </div>

            <div className="stat-bar">
              <div className="label">Defense</div>
              <div className="bar-container">
                <div className="bar-fill armor" style={{ width: `${player.getArmor() * 100}%` }} />
              </div>
              <span className="value">{Math.ceil(player.stats.armor)}/{player.stats.maxArmor}</span>
            </div>

            <div className="stat-bar">
              <div className="label">Stamina</div>
              <div className="bar-container">
                <div className="bar-fill stamina" style={{ width: `${player.getStamina() * 100}%` }} />
              </div>
              <span className="value">{Math.ceil(player.stats.stamina)}/{player.stats.maxStamina}</span>
            </div>
          </div>

          <div className="enemy-stats">
            <h3>ENEMIES</h3>
            {enemies.map((enemy, index) => (
              <div key={index} className="enemy-entry">
                <div className="label">{enemy.mesh.name}</div>
                <div className="bar-container small">
                  <div className="bar-fill health" style={{ width: `${enemy.getHealth() * 100}%` }} />
                </div>
                <div className="enemy-values">{Math.ceil(enemy.stats.health)}/{enemy.stats.maxHealth} • DEF {Math.ceil(enemy.stats.armor)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: actions + log */}
        <div className="combat-actions-log">
          <div className="actions">
            <button className="btn attack" onClick={handleAttack} disabled={!player.state.isAlive || player.stats.stamina < 5}>
              Attack
            </button>
            <button className="btn defend" onClick={handleDefend} disabled={!player.state.isAlive}>
              Defend
            </button>
            <button className="btn special" onClick={handleSpecial} disabled={!player.state.isAlive || player.stats.stamina < 30}>
              Special
            </button>
          </div>

          <div className="combat-log">
            <div className="log-header">
              <strong>Combat Log</strong>
              <button className="btn clear" onClick={clearLog} aria-label="Clear combat log">Clear</button>
            </div>
            <ul>
              {log.length === 0 && <li className="empty">No actions yet.</li>}
              {log.map((entry, i) => (
                <li key={i}>{entry}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="combat-status">
        <span className="status-text">State: {player.state.animationState.toUpperCase()}</span>
      </div>
    </div>
  );
};
