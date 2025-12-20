import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameScene from '../GameScene';

describe('GameScene Component', () => {
  it('renders without crashing', () => {
    render(<GameScene />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays start game button', () => {
    render(<GameScene />);
    const button = screen.getByText(/Start Game/i);
    expect(button).toBeInTheDocument();
  });

  it('calls onGameStart callback when button is clicked', () => {
    const mockOnGameStart = jest.fn();
    render(<GameScene onGameStart={mockOnGameStart} />);
    
    const button = screen.getByText(/Start Game/i);
    fireEvent.click(button);
    
    expect(mockOnGameStart).toHaveBeenCalledTimes(1);
  });

  it('renders canvas with correct dimensions', () => {
    const { container } = render(<GameScene width={800} height={600} />);
    const canvas = container.querySelector('canvas');
    
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '600');
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<GameScene />);
    
    expect(container.querySelector('.game-scene-container')).toBeInTheDocument();
    expect(container.querySelector('.game-canvas')).toBeInTheDocument();
    expect(container.querySelector('.game-controls')).toBeInTheDocument();
  });
});
