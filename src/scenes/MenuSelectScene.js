// Menu Select Scene
import { Sprite } from '../entities/Sprite.js'
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { getKeys, wasKeyJustPressed, updateInput } from '../engine/InputHandler.js'
import { PLAYER1_CONTROLS } from '../constants/controls.js'

// Menu options
export const MENU_OPTIONS = {
  TWO_PLAYER: 'twoPlayer',
  VS_COMPUTER: 'vsComputer'
}

const menuList = [
  MENU_OPTIONS.TWO_PLAYER,
  MENU_OPTIONS.VS_COMPUTER,
  'settings'
]

export class MenuSelectScene {
  constructor(onSelectionComplete, onBack = null, onSettings = null) {
    this.onSelectionComplete = onSelectionComplete
    this.onBack = onBack
    this.onSettings = onSettings
    this.selectedOption = MENU_OPTIONS.TWO_PLAYER
    this.confirmed = false
    this.previousOption = this.selectedOption // Track previous selection for sound
    
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
    
    // Back button - go back to title screen
    if (this.onBack && (wasKeyJustPressed('b') || wasKeyJustPressed('B') || wasKeyJustPressed('Backspace'))) {
      this.onBack()
      return
    }
    
    if (!this.confirmed) {
      // Navigate with W/S or Arrow Up/Down
      if (wasKeyJustPressed(PLAYER1_CONTROLS.JUMP) || wasKeyJustPressed('ArrowUp')) {
        const currentIndex = menuList.indexOf(this.selectedOption)
        const prevIndex = (currentIndex - 1 + menuList.length) % menuList.length
        this.selectedOption = menuList[prevIndex]
        
        // Play select sound when selection changes
        if (this.selectedOption !== this.previousOption) {
          this.selectSound.currentTime = 0
          this.selectSound.play().catch(() => {})
          this.previousOption = this.selectedOption
        }
      }
      
      if (wasKeyJustPressed('s') || wasKeyJustPressed('S') || wasKeyJustPressed('ArrowDown')) {
        const currentIndex = menuList.indexOf(this.selectedOption)
        const nextIndex = (currentIndex + 1) % menuList.length
        this.selectedOption = menuList[nextIndex]
        
        // Play select sound when selection changes
        if (this.selectedOption !== this.previousOption) {
          this.selectSound.currentTime = 0
          this.selectSound.play().catch(() => {})
          this.previousOption = this.selectedOption
        }
      }
      
      // Confirm selection with Enter or Space
      if (wasKeyJustPressed('Enter') || wasKeyJustPressed(' ')) {
        // Play selected sound when confirming
        this.selectedSound.currentTime = 0
        this.selectedSound.play().catch(() => {})
        this.confirmed = true
        
        // Check if settings was selected
        if (this.selectedOption === 'settings') {
          if (this.onSettings) {
            this.onSettings()
          }
        } else {
          this.onSelectionComplete(this.selectedOption)
        }
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
    c.fillText('SELECT MODE', CANVAS_WIDTH / 2, 100)
    
    // Draw menu options - centered and stacked
    const centerX = CANVAS_WIDTH / 2
    const startY = CANVAS_HEIGHT / 2 - 50
    const optionSpacing = 80
    
    menuList.forEach((option, index) => {
      const y = startY + (index * optionSpacing)
      const isSelected = option === this.selectedOption
      
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
      let optionText = ''
      if (option === MENU_OPTIONS.TWO_PLAYER) {
        optionText = '2 PLAYER'
      } else if (option === MENU_OPTIONS.VS_COMPUTER) {
        optionText = 'VS COMPUTER'
      } else if (option === 'settings') {
        optionText = 'SETTINGS'
      }
      
      c.fillText(optionText, centerX, y)
    })
    
    // Draw instructions
    c.fillStyle = 'white'
    c.font = '12px "Press Start 2P"'
    c.fillText('W/S or ↑/↓: Navigate | Enter or Space: Confirm', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 70)
    
    // Draw back button instruction
    if (this.onBack) {
      c.fillText('B or Backspace: Back', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40)
    }
  }
}

