// Title Scene
import { Sprite } from '../entities/Sprite.js'
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { getKeys, wasKeyJustPressed, updateInput } from '../engine/InputHandler.js'
import { PLAYER1_CONTROLS } from '../constants/controls.js'

// Title screen modes
export const TITLE_MODES = {
  STORY_MODE: 'storyMode',
  PVP_MODE: 'pvpMode'
}

const modeList = [
  TITLE_MODES.STORY_MODE,
  TITLE_MODES.PVP_MODE
]

export class TitleScene {
  constructor(onSelectionComplete) {
    this.onSelectionComplete = onSelectionComplete
    this.selectedMode = TITLE_MODES.PVP_MODE
    this.confirmed = false
    this.previousMode = this.selectedMode // Track previous selection for sound
    
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
    
    // Title image - will be positioned at top center
    // Offset will be set after image loads to center it
    this.titleImage = new Sprite({
      position: { x: CANVAS_WIDTH / 2, y: 50 },
      imageSrc: './img/title.png',
      offset: { x: 0, y: 0 }
    })
    
    // Set offset once image loads to center it
    this.titleImage.image.onload = () => {
      if (this.titleImage.image.width > 0) {
        this.titleImage.offset.x = this.titleImage.image.width / 2
      }
    }
  }

  update() {
    const keys = getKeys()
    
    if (!this.confirmed) {
      // Navigate with A/D or Arrow Left/Right (side by side navigation)
      if (wasKeyJustPressed(PLAYER1_CONTROLS.LEFT) || wasKeyJustPressed('ArrowLeft')) {
        const currentIndex = modeList.indexOf(this.selectedMode)
        const prevIndex = (currentIndex - 1 + modeList.length) % modeList.length
        this.selectedMode = modeList[prevIndex]
        
        // Play select sound when selection changes
        if (this.selectedMode !== this.previousMode) {
          this.selectSound.currentTime = 0
          this.selectSound.play().catch(() => {})
          this.previousMode = this.selectedMode
        }
      }
      
      if (wasKeyJustPressed(PLAYER1_CONTROLS.RIGHT) || wasKeyJustPressed('ArrowRight')) {
        const currentIndex = modeList.indexOf(this.selectedMode)
        const nextIndex = (currentIndex + 1) % modeList.length
        this.selectedMode = modeList[nextIndex]
        
        // Play select sound when selection changes
        if (this.selectedMode !== this.previousMode) {
          this.selectSound.currentTime = 0
          this.selectSound.play().catch(() => {})
          this.previousMode = this.selectedMode
        }
      }
      
      // Confirm selection with Enter or Space
      if (wasKeyJustPressed('Enter') || wasKeyJustPressed(' ')) {
        // Play selected sound when confirming
        this.selectedSound.currentTime = 0
        this.selectedSound.play().catch(() => {})
        this.confirmed = true
        this.onSelectionComplete(this.selectedMode)
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
    
    // Draw title image at top center
    if (this.titleImage && this.titleImage.image && this.titleImage.image.complete && this.titleImage.image.width > 0) {
      // Ensure offset is set for centering
      if (this.titleImage.offset.x === 0) {
        this.titleImage.offset.x = this.titleImage.image.width / 2
      }
      this.titleImage.position.x = CANVAS_WIDTH / 2
      this.titleImage.position.y = 50
      this.titleImage.draw()
    }
    
    // Draw mode selectors - side by side at the bottom
    const centerX = CANVAS_WIDTH / 2
    const bottomY = CANVAS_HEIGHT - 150
    const buttonSpacing = 200
    
    modeList.forEach((mode, index) => {
      const x = centerX + (index - 0.5) * buttonSpacing // Center the two buttons
      const isSelected = mode === this.selectedMode
      
      // Draw selection indicator
      if (isSelected) {
        c.fillStyle = 'yellow'
        c.font = '16px "Press Start 2P"'
        c.fillText('>', x - 80, bottomY)
        c.fillText('<', x + 80, bottomY)
      } else {
        c.fillStyle = 'white'
      }
      
      // Draw mode text
      c.font = '14px "Press Start 2P"'
      let modeText = ''
      if (mode === TITLE_MODES.STORY_MODE) {
        modeText = 'STORY MODE'
      } else if (mode === TITLE_MODES.PVP_MODE) {
        modeText = 'PVP MODE'
      }
      
      c.textAlign = 'center'
      c.fillText(modeText, x, bottomY)
    })
    
    // Draw instructions
    c.fillStyle = 'white'
    c.font = '12px "Press Start 2P"'
    c.textAlign = 'center'
    c.fillText('←/→: Navigate | Enter or Space: Select', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50)
  }
}

