import { useEffect, useRef } from 'react'
import './App.css'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Placeholder: GameScene3D будет инициализирован на ШАГ 1.12
    console.log('✅ App.tsx loaded (waiting for Babylon.js GameScene3D)')
  }, [])

  return (
    <div className="vityaz-container">
      <div ref={containerRef} className="game-container" id="game-container" />
    </div>
  )
}
