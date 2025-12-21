import React, { useState, useEffect } from 'react';
import { leaderboard, LeaderboardEntry } from './LeaderboardSystem';

export const LeaderboardUI: React.FC = () => {
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'top10' | 'top100' | 'rewards'>('top10');

  useEffect(() => {
    // Обновить лидербор
    const updateLeaderboard = () => {
      if (activeTab === 'top10') {
        setTopPlayers(leaderboard.getTopTen());
      } else {
        setTopPlayers(leaderboard.getTopPlayers(100));
      }
    };

    updateLeaderboard();
    const interval = setInterval(updateLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const getMedalEmoji = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>🏆 Глобальная Таблица Лидеров</h2>
        <p className="subtitle">Топ игроки получают ежедневные крипто-награды</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'top10' ? 'active' : ''}`}
          onClick={() => setActiveTab('top10')}
        >
          ⭐ Топ 10
        </button>
        <button 
          className={`tab ${activeTab === 'top100' ? 'active' : ''}`}
          onClick={() => setActiveTab('top100')}
        >
          📊 Топ 100
        </button>
        <button 
          className={`tab ${activeTab === 'rewards' ? 'active' : ''}`}
          onClick={() => setActiveTab('rewards')}
        >
          💰 Награды
        </button>
      </div>

      {activeTab === 'rewards' ? (
        <div className="rewards-info">
          <div className="reward-tier">
            <span className="rank">🥇 1-3 место</span>
            <span className="reward">1000 TON/день</span>
          </div>
          <div className="reward-tier">
            <span className="rank">🥈 4-10 место</span>
            <span className="reward">500 TON/день</span>
          </div>
          <div className="reward-tier">
            <span className="rank">🥉 11-100 место</span>
            <span className="reward">50 TON/день</span>
          </div>
        </div>
      ) : (
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="col rank">Ранг</div>
            <div className="col name">Игрок</div>
            <div className="col level">Уровень</div>
            <div className="col wins">Победы</div>
            <div className="col tokens">Токены</div>
          </div>
          {topPlayers.map((entry) => (
            <div key={entry.playerId} className="table-row">
              <div className="col rank">{getMedalEmoji(entry.rank)}</div>
              <div className="col name">{entry.playerName}</div>
              <div className="col level">
                <span className="level-badge">Lv {entry.level}</span>
              </div>
              <div className="col wins">{entry.totalWins}</div>
              <div className="col tokens">
                <span className="token-badge">{entry.tokenRewards}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .leaderboard-container {
          background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
          border-radius: 16px;
          padding: 24px;
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .leaderboard-header h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          background: linear-gradient(135deg, #00d4ff, #0099ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          margin: 0;
          font-size: 13px;
          opacity: 0.7;
        }

        .tabs {
          display: flex;
          gap: 12px;
          margin: 20px 0;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .tab {
          background: none;
          border: none;
          color: white;
          padding: 12px 16px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
          opacity: 0.6;
        }

        .tab.active {
          opacity: 1;
          border-bottom-color: #00d4ff;
          color: #00d4ff;
        }

        .tab:hover {
          opacity: 0.8;
        }

        .leaderboard-table {
          margin-top: 20px;
        }

        .table-header {
          display: grid;
          grid-template-columns: 60px 1fr 100px 100px 100px;
          gap: 12px;
          padding: 12px;
          background: rgba(0, 212, 255, 0.1);
          border-radius: 8px;
          border-left: 4px solid #00d4ff;
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          opacity: 0.8;
        }

        .table-row {
          display: grid;
          grid-template-columns: 60px 1fr 100px 100px 100px;
          gap: 12px;
          padding: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          align-items: center;
          transition: background 0.2s;
        }

        .table-row:hover {
          background: rgba(0, 212, 255, 0.05);
        }

        .col {
          font-size: 14px;
        }

        .col.rank {
          font-size: 20px;
          text-align: center;
        }

        .col.name {
          font-weight: 600;
        }

        .level-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .token-badge {
          color: #00ff00;
          font-weight: 700;
          text-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
        }

        .rewards-info {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .reward-tier {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 212, 255, 0.1);
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #00d4ff;
        }

        .reward-tier .rank {
          font-weight: 600;
          font-size: 16px;
        }

        .reward-tier .reward {
          color: #00ff00;
          font-size: 18px;
          font-weight: 700;
          text-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default LeaderboardUI;
