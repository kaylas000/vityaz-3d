import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// FORCE CLEAR ROOT IMMEDIATELY
const root = document.getElementById('root');
if (root) {
  root.innerHTML = '';
  console.log('🔥 Root cleared!');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

console.log('✓ React mounted!');
