import { useEffect, useRef } from 'react'
import * as BABYLON from 'babylon.js'
import '@babylonjs/loaders'
import '@babylonjs/inspector'
import GameScene3D from './game3d/scenes/GameScene3D'
import './App.css'

let gameScene3D: GameScene3D | null = null

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Create canvas element dynamically
    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.style.margin = '0'
    canvas.style.padding = '0'
    containerRef.current.appendChild(canvas)

    // Create Babylon.js engine with options
    const engine = new BABYLON.Engine(canvas, true, {
      antialias: true,
      stencil: true,
      preserveDrawingBuffer: false,
    })

    // Create and initialize game scene
    gameScene3D = new GameScene3D(canvas, engine)

    // Handle window resize
    const onWindowResize = () => {
      engine.resize()
    }
    window.addEventListener('resize', onWindowResize)

    console.log('✅ App.tsx - Babylon.js engine initialized')

    // Cleanup on unmount
    return () => {
      gameScene3D?.dispose()
      engine.dispose()
      window.removeEventListener('resize', onWindowResize)
    }
  }, [])

  return (
    <div className="vityaz-container">
      <div ref={containerRef} className="game-container" id="game-container" />
    </div>
  )
}
