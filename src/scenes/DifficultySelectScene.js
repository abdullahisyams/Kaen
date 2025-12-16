// Difficulty Select Scene
import { Sprite } from '../entities/Sprite.js'
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { getKeys, wasKeyJustPressed, updateInput } from '../engine/InputHandler.js'
import { PLAYER1_CONTROLS } from '../constants/controls.js'

// Difficulty options
export const DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
}

const difficultyList = [
  DIFFICULTIES.EASY,
  DIFFICULTIES.MEDIUM,
  DIFFICULTIES.HARD
]

export class DifficultySelectScene {
  constructor(onSelectionComplete, onBack = null) {
    this.onSelectionComplete = onSelectionComplete
    this.onBack = onBack
    this.selectedDifficulty = DIFFICULTIES.MEDIUM
    this.confirmed = false
    this.previousDifficulty = this.selectedDifficulty // Track previous selection for sound
    
    // Background - use default background
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: './img/forest.png'
    })
    
    // Sound effects
    this.selectSound = new Audio('./sfx/select.wav')
    this.selectSound.volume = 0.8
    this.selectedSound = new Audio('./sfx/selected.wav')
    this.selectedSound.volume = 0.7
  }

  update() {
    const keys = getKeys()
    
    // Back button - go back to menu selector
    if (wasKeyJustPressed('b') || wasKeyJustPressed('B') || wasKeyJustPressed('Backspace')) {
      if (this.onBack) {
        this.onBack()
      }
      return
    }
    
    if (!this.confirmed) {
      // Navigate with W/S or Arrow Up/Down
      if (wasKeyJustPressed(PLAYER1_CONTROLS.JUMP) || wasKeyJustPressed('ArrowUp')) {
        const currentIndex = difficultyList.indexOf(this.selectedDifficulty)
        const prevIndex = (currentIndex - 1 + difficultyList.length) % difficultyList.length
        this.selectedDifficulty = difficultyList[prevIndex]
        
        // Play select sound when selection changes
        if (this.selectedDifficulty !== this.previousDifficulty) {
          this.selectSound.currentTime = 0
          this.selectSound.play().catch(() => {})
          this.previousDifficulty = this.selectedDifficulty
        }
      }
      
      if (wasKeyJustPressed('s') || wasKeyJustPressed('S') || wasKeyJustPressed('ArrowDown')) {
        const currentIndex = difficultyList.indexOf(this.selectedDifficulty)
        const nextIndex = (currentIndex + 1) % difficultyList.length
        this.selectedDifficulty = difficultyList[nextIndex]
        
        // Play select sound when selection changes
        if (this.selectedDifficulty !== this.previousDifficulty) {
          this.selectSound.currentTime = 0
          this.selectSound.play().catch(() => {})
          this.previousDifficulty = this.selectedDifficulty
        }
      }
      
      // Confirm selection with Enter or Space
      if (wasKeyJustPressed('Enter') || wasKeyJustPressed(' ')) {
        // Play selected sound when confirming
        this.selectedSound.currentTime = 0
        this.selectedSound.play().catch(() => {})
        this.confirmed = true
        this.onSelectionComplete(this.selectedDifficulty)
      }
    }
    
    updateInput()
    
    // Update background animation
    if (this.background) {
      this.background.update()
    }
  }

  draw() {
    const c = getContext()
    if (!c) return
    
    // Draw background
    if (this.background) {
      this.background.draw()
    }
    
    // Draw overlay
    c.fillStyle = 'rgba(0, 0, 0, 0.5)'
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw title
    c.fillStyle = 'white'
    c.font = '24px "Press Start 2P"'
    c.textAlign = 'center'
    c.fillText('SELECT DIFFICULTY', CANVAS_WIDTH / 2, 100)
    
    // Draw difficulty options - centered and stacked
    const centerX = CANVAS_WIDTH / 2
    const startY = CANVAS_HEIGHT / 2 - 50
    const optionSpacing = 80
    
    difficultyList.forEach((difficulty, index) => {
      const y = startY + (index * optionSpacing)
      const isSelected = difficulty === this.selectedDifficulty
      
      // Draw selection indicator
      if (isSelected) {
        c.fillStyle = 'yellow'
        c.font = '20px "Press Start 2P"'
        c.fillText('>', centerX - 120, y)
        c.fillText('<', centerX + 120, y)
      } else {
        c.fillStyle = 'white'
      }
      
      // Draw option text
      c.font = '16px "Press Start 2P"'
      let difficultyText = ''
      if (difficulty === DIFFICULTIES.EASY) {
        difficultyText = 'EASY'
      } else if (difficulty === DIFFICULTIES.MEDIUM) {
        difficultyText = 'MEDIUM'
      } else if (difficulty === DIFFICULTIES.HARD) {
        difficultyText = 'HARD'
      }
      
      c.fillText(difficultyText, centerX, y)
    })
    
    // Draw instructions
    c.fillStyle = 'white'
    c.font = '12px "Press Start 2P"'
    c.textAlign = 'center'
    c.fillText('W/S or ↑/↓: Navigate | Enter or Space: Confirm', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80)
    c.textAlign = 'left'
    c.fillText('B: Back to Menu', 50, CANVAS_HEIGHT - 30)
  }
}

