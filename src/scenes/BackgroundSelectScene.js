// Background Select Scene
import { Sprite } from '../entities/Sprite.js'
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { getKeys, wasKeyJustPressed, updateInput } from '../engine/InputHandler.js'
import { PLAYER1_CONTROLS } from '../constants/controls.js'

// Available backgrounds
export const BACKGROUNDS = {
  BACKGROUND1: 'forest',
  BACKGROUND2: 'snowy everest',
  BACKGROUND3: 'netherland',
  BACKGROUND4: 'romasna'
}

const backgroundList = [
  BACKGROUNDS.BACKGROUND1,
  BACKGROUNDS.BACKGROUND2,
  BACKGROUNDS.BACKGROUND3,
  BACKGROUNDS.BACKGROUND4
]

export class BackgroundSelectScene {
  constructor(onSelectionComplete, onBack = null) {
    this.onSelectionComplete = onSelectionComplete
    this.onBack = onBack
    this.selectedBackground = BACKGROUNDS.BACKGROUND1
    this.confirmed = false
    this.previousBackground = this.selectedBackground // Track previous selection for sound
    
    // Preview background
    this.backgroundPreview = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: `./img/${this.selectedBackground}.png`
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
      // Cycle through backgrounds with A/D keys
      if (wasKeyJustPressed(PLAYER1_CONTROLS.LEFT) || wasKeyJustPressed(PLAYER1_CONTROLS.RIGHT)) {
        const currentIndex = backgroundList.indexOf(this.selectedBackground)
        const nextIndex = (currentIndex + 1) % backgroundList.length
        this.selectedBackground = backgroundList[nextIndex]
        
        // Play select sound when selection changes
        if (this.selectedBackground !== this.previousBackground) {
          this.selectSound.currentTime = 0
          this.selectSound.play().catch(() => {})
          this.previousBackground = this.selectedBackground
        }
        
        // Update preview
        this.backgroundPreview = new Sprite({
          position: { x: 0, y: 0 },
          imageSrc: `./img/${this.selectedBackground}.png`
        })
      }
      
      // Confirm selection with S key
      if (wasKeyJustPressed(PLAYER1_CONTROLS.ATTACK)) {
        // Play selected sound when confirming
        this.selectedSound.currentTime = 0
        this.selectedSound.play().catch(() => {})
        this.confirmed = true
        this.onSelectionComplete(this.selectedBackground)
      }
    }
    
    updateInput()
    
    // Update background preview animation
    if (this.backgroundPreview) {
      this.backgroundPreview.update()
    }
  }

  draw() {
    const c = getContext()
    if (!c) return
    
    // Draw background preview
    if (this.backgroundPreview) {
      this.backgroundPreview.draw()
    }
    
    // Draw overlay
    c.fillStyle = 'rgba(0, 0, 0, 0.5)'
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw title
    c.fillStyle = 'white'
    c.font = '24px "Press Start 2P"'
    c.textAlign = 'center'
    c.fillText('SELECT BACKGROUND', CANVAS_WIDTH / 2, 80)
    
    // Draw instructions
    c.font = '16px "Press Start 2P"'
    c.textAlign = 'center'
    if (this.confirmed) {
      c.fillText('READY!', CANVAS_WIDTH / 2, 120)
    } else {
      c.fillText('A/D: Select | S: Confirm', CANVAS_WIDTH / 2, 120)
    }
    
    // Draw background name
    c.font = '12px "Press Start 2P"'
    const backgroundName = this.selectedBackground.charAt(0).toUpperCase() + this.selectedBackground.slice(1)
    c.fillText(backgroundName, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50)
    
    // Draw back button instruction
    c.font = '12px "Press Start 2P"'
    c.textAlign = 'left'
    c.fillText('B: Back to Menu', 50, CANVAS_HEIGHT - 30)
  }
}

