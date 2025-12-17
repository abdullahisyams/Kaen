// Main entry point for the Fight game
import { Game } from './Game.js'
import { LoadingScene } from './scenes/LoadingScene.js'
import { getContext } from './utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants/game.js'

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas')
  if (!canvas) {
    console.error('Canvas element not found!')
    return
  }
  
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  
  // Show loading screen first
  const loadingScene = new LoadingScene(() => {
    // Loading complete, start the game
    const game = new Game()
    game.start()
  })
  
  // Render loading screen
  function animate() {
    window.requestAnimationFrame(animate)
    
    loadingScene.update()
    loadingScene.draw()
  }
  
  animate()
})

