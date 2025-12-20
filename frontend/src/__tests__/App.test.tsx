import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('renders the main heading', () => {
    render(<App />);
    expect(screen.getByText(/VITYAZ: Special Operations/i)).toBeInTheDocument();
  });

  it('displays the tagline', () => {
    render(<App />);
    expect(screen.getByText(/Crypto-powered Gaming Ecosystem/i)).toBeInTheDocument();
  });

  it('renders the footer', () => {
    render(<App />);
    expect(screen.getByText(/VITYAZ Project/i)).toBeInTheDocument();
  });

  it('renders the GameScene component', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Start Game/i })).toBeInTheDocument();
  });

  it('applies app-container class', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.app-container')).toBeInTheDocument();
  });
});
