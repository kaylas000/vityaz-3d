import React from 'react';

interface PlayPageProps {
  onPlay: (playerName: string, difficulty: string) => void;
  onBack: () => void;
}

export const PlayPage: React.FC<PlayPageProps> = ({ onPlay, onBack }) => {
  const [playerName, setPlayerName] = React.useState('Player');
  const [difficulty, setDifficulty] = React.useState('normal');

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.title}>Game Settings</h2>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Player Name:</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={styles.input}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={styles.input}
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
            <option value="impossible">Impossible</option>
          </select>
        </div>
        
        <div style={styles.buttonGroup}>
          <button style={styles.buttonPlay} onClick={() => onPlay(playerName, difficulty)}>
            PLAY
          </button>
          <button style={styles.buttonBack} onClick={onBack}>
            BACK
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    color: '#fff',
  },
  content: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '12px',
    border: '2px solid #e94560',
  },
  title: {
    fontSize: '36px',
    margin: '0 0 30px 0',
    color: '#e94560',
  },
  inputGroup: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '16px',
    color: '#b0b0ff',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    border: '1px solid #e94560',
    borderRadius: '4px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
    justifyContent: 'center',
  },
  buttonPlay: {
    padding: '12px 30px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  buttonBack: {
    padding: '12px 30px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    color: '#e94560',
    border: '2px solid #e94560',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};
