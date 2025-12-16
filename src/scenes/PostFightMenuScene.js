// Post Fight Menu Scene
import { Sprite } from '../entities/Sprite.js'
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { getKeys, wasKeyJustPressed, updateInput } from '../engine/InputHandler.js'
import { PLAYER1_CONTROLS } from '../constants/controls.js'

// Post fight menu options
export const POST_FIGHT_OPTIONS = {
  TITLE_SCREEN: 'titleScreen',
  REMATCH: 'rematch',
  MODE_SELECTOR: 'modeSelector'
}

const menuList = [
  POST_FIGHT_OPTIONS.REMATCH,
  POST_FIGHT_OPTIONS.MODE_SELECTOR,
  POST_FIGHT_OPTIONS.TITLE_SCREEN
]

export class PostFightMenuScene {
  constructor(onSelectionComplete, winnerText = '') {
    this.onSelectionComplete = onSelectionComplete
    this.winnerText = winnerText
    this.selectedOption = POST_FIGHT_OPTIONS.REMATCH
    this.confirmed = false
    this.previousOption = this.selectedOption // Track previous selection for sound
    
    // Background - use default background
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: './img/forest.png'
    })
    
    // Music - PVP finish music
    this.pvpFinMusic = new Audio('./sfx/pvp fin.mp3')
    this.pvpFinMusic.loop = true
    this.pvpFinMusic.volume = 0.7
    this.pvpFinMusicPlaying = false
    
    // Try to play music on initialization
    this.pvpFinMusic.play().then(() => {
      this.pvpFinMusicPlaying = true
    }).catch(() => {
      this.pvpFinMusicPlaying = false
    })
    
    // Sound effects
    this.selectSound = new Audio('./sfx/select.wav')
    this.selectSound.volume = 0.8
    this.selectedSound = new Audio('./sfx/selected.wav')
    this.selectedSound.volume = 0.7
  }

  update() {
    const keys = getKeys()
    
    // Try to play music on user interaction if it wasn't playing
    if (!this.pvpFinMusicPlaying) {
      const hasUserInteraction = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (hasUserInteraction) {
        this.pvpFinMusic.play().then(() => {
          this.pvpFinMusicPlaying = true
        }).catch(() => {})
      }
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
        // Stop music when leaving
        if (this.pvpFinMusic && this.pvpFinMusicPlaying) {
          this.pvpFinMusic.pause()
          this.pvpFinMusic.currentTime = 0
          this.pvpFinMusicPlaying = false
        }
        this.confirmed = true
        this.onSelectionComplete(this.selectedOption)
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
    c.fillStyle = 'rgba(0, 0, 0, 0.7)'
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw winner text
    c.fillStyle = 'yellow'
    c.font = '24px "Press Start 2P"'
    c.textAlign = 'center'
    c.fillText(this.winnerText, CANVAS_WIDTH / 2, 150)
    
    // Draw title
    c.fillStyle = 'white'
    c.font = '20px "Press Start 2P"'
    c.fillText('SELECT OPTION', CANVAS_WIDTH / 2, 220)
    
    // Draw menu options - centered and stacked
    const centerX = CANVAS_WIDTH / 2
    const startY = CANVAS_HEIGHT / 2
    const optionSpacing = 60
    
    menuList.forEach((option, index) => {
      const y = startY + (index * optionSpacing)
      const isSelected = option === this.selectedOption
      
      // Draw selection indicator
      if (isSelected) {
        c.fillStyle = 'yellow'
        c.font = '18px "Press Start 2P"'
        c.fillText('>', centerX - 120, y)
        c.fillText('<', centerX + 120, y)
      } else {
        c.fillStyle = 'white'
      }
      
      // Draw option text
      c.font = '14px "Press Start 2P"'
      let optionText = ''
      if (option === POST_FIGHT_OPTIONS.REMATCH) {
        optionText = 'REMATCH'
      } else if (option === POST_FIGHT_OPTIONS.MODE_SELECTOR) {
        optionText = 'MODE SELECTOR'
      } else if (option === POST_FIGHT_OPTIONS.TITLE_SCREEN) {
        optionText = 'TITLE SCREEN'
      }
      
      c.fillText(optionText, centerX, y)
    })
    
    // Draw instructions
    c.fillStyle = 'white'
    c.font = '12px "Press Start 2P"'
    c.fillText('W/S or ↑/↓: Navigate | Enter or Space: Select', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50)
  }
}

