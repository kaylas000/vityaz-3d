import React from 'react';

interface StartPageProps {
  onStart: () => void;
}

export const StartPage: React.FC<StartPageProps> = ({ onStart }) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>🥊 VITYAZ</h1>
        <p style={styles.subtitle}>Special Operations</p>
        <button style={styles.button} onClick={onStart}>
          START GAME
        </button>
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
  },
  title: {
    fontSize: '72px',
    margin: '0 0 10px 0',
    color: '#e94560',
    textShadow: '0 2px 4px rgba(233, 69, 96, 0.3)',
  },
  subtitle: {
    fontSize: '28px',
    margin: '0 0 40px 0',
    color: '#b0b0ff',
  },
  button: {
    padding: '15px 40px',
    fontSize: '20px',
    fontWeight: 'bold',
    backgroundColor: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};
