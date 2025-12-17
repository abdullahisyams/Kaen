// Character Select Scene
import { Sprite } from '../entities/Sprite.js'
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { characterData, CHARACTERS } from '../config/characters.js'
import { getKeys, wasKeyJustPressed, updateInput } from '../engine/InputHandler.js'
import { PLAYER1_CONTROLS, PLAYER2_CONTROLS } from '../constants/controls.js'

export class CharacterSelectScene {
  constructor(onSelectionComplete, selectedBackground = 'forest', onBack = null, gameMode = null) {
    this.onSelectionComplete = onSelectionComplete
    this.onBack = onBack
    this.selectedBackground = selectedBackground
    this.gameMode = gameMode
    this.player1Selection = CHARACTERS.KAEN
    this.player2Selection = CHARACTERS.KENJI
    this.player1Confirmed = false
    this.player2Confirmed = false
    this.selectingBotCharacter = false // Track if selecting bot character in VS Computer mode
    this.transitionDelay = false // Track if we're waiting for transition delay
    this.transitionTimer = 0 // Timer for transition delay (in frames, ~60 frames = 1 second)
    
    // Background - use the selected background
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: `./img/${this.selectedBackground}.png`
    })
    
    // Shop sprite only appears when background.png is selected
    if (this.selectedBackground === 'forest') {
      this.shop = new Sprite({
        position: { x: 600, y: 128 },
        imageSrc: './img/shop.png',
        scale: 2.75,
        framesMax: 6
      })
    } else {
      this.shop = null
    }
    
    // Character previews
    this.player1Preview = null
    this.player2Preview = null
    this.updatePreviews()
    
    // Sound effects
    this.selectSound = new Audio('./sfx/select.wav')
    this.selectSound.volume = 0.8
    this.yooSound = new Audio('./sfx/yoo.wav')
    this.yooSound.volume = 0.7
  }

  updatePreviews() {
    const player1Data = characterData[this.player1Selection]
    const player2Data = characterData[this.player2Selection]
    
    // Create new preview sprites
    this.player1Preview = new Sprite({
      position: { x: 200, y: 200 },
      imageSrc: player1Data.sprites.idle.imageSrc,
      framesMax: player1Data.sprites.idle.framesMax,
      scale: player1Data.scale,
      offset: player1Data.offset
    })
    
    this.player2Preview = new Sprite({
      position: { x: 700, y: 200 },
      imageSrc: player2Data.sprites.idle.imageSrc,
      framesMax: player2Data.sprites.idle.framesMax,
      scale: player2Data.scale,
      offset: player2Data.offset
    })
    
    // Player 2 preview should face left (towards player 1)
    this.player2Preview.flipped = true
  }

  update() {
    const keys = getKeys()
    
    // Back button - go back to background selector
    if (wasKeyJustPressed('b') || wasKeyJustPressed('B') || wasKeyJustPressed('Backspace')) {
      if (this.onBack) {
        this.onBack()
      }
      return
    }
    
    // In VS Computer mode, allow selecting bot character after player 1 is confirmed
    if (this.gameMode === 'vsComputer') {
      // Player 1 selection
    if (!this.player1Confirmed) {
        if (wasKeyJustPressed(PLAYER1_CONTROLS.LEFT) || wasKeyJustPressed(PLAYER1_CONTROLS.RIGHT)) {
          // Play select sound when scrolling
          this.selectSound.currentTime = 0
          this.selectSound.play().catch(() => {})
          
          // Cycle through characters
          const characterList = [CHARACTERS.KAEN, CHARACTERS.KENJI, CHARACTERS.WAKASA, CHARACTERS.SERENA, CHARACTERS.ISABELLA]
          const currentIndex = characterList.indexOf(this.player1Selection)
          const nextIndex = (currentIndex + 1) % characterList.length
          this.player1Selection = characterList[nextIndex]
          this.updatePreviews()
        }
        
        if (wasKeyJustPressed(PLAYER1_CONTROLS.ATTACK)) {
          // Play yoo sound when confirming
          this.yooSound.currentTime = 0
          this.yooSound.play().catch(() => {})
          
          this.player1Confirmed = true
          this.selectingBotCharacter = true // Now select bot character
        }
      }
      // Bot character selection (after player 1 is confirmed)
      else if (this.selectingBotCharacter) {
        if (wasKeyJustPressed(PLAYER1_CONTROLS.LEFT) || wasKeyJustPressed(PLAYER1_CONTROLS.RIGHT)) {
          // Play select sound when scrolling
          this.selectSound.currentTime = 0
          this.selectSound.play().catch(() => {})
          
          // Cycle through characters for bot
          const characterList = [CHARACTERS.KAEN, CHARACTERS.KENJI, CHARACTERS.WAKASA, CHARACTERS.SERENA, CHARACTERS.ISABELLA]
          const currentIndex = characterList.indexOf(this.player2Selection)
          const nextIndex = (currentIndex + 1) % characterList.length
          this.player2Selection = characterList[nextIndex]
          this.updatePreviews()
        }
        
        if (wasKeyJustPressed(PLAYER1_CONTROLS.ATTACK)) {
          // Play yoo sound when confirming
          this.yooSound.currentTime = 0
          this.yooSound.play().catch(() => {})
          
          this.selectingBotCharacter = false
          this.player2Confirmed = true
          // Both selections complete
          this.onSelectionComplete({
            player1: this.player1Selection,
            player2: this.player2Selection
          })
        }
      }
    } else {
      // 2 Player mode - normal selection
      // Player 1 selection
      if (!this.player1Confirmed) {
        if (wasKeyJustPressed(PLAYER1_CONTROLS.LEFT) || wasKeyJustPressed(PLAYER1_CONTROLS.RIGHT)) {
          // Play select sound when scrolling
          this.selectSound.currentTime = 0
          this.selectSound.play().catch(() => {})
          
          // Cycle through characters
          const characterList = [CHARACTERS.KAEN, CHARACTERS.KENJI, CHARACTERS.WAKASA, CHARACTERS.SERENA, CHARACTERS.ISABELLA]
          const currentIndex = characterList.indexOf(this.player1Selection)
          const nextIndex = (currentIndex + 1) % characterList.length
          this.player1Selection = characterList[nextIndex]
          this.updatePreviews()
      }
        
      if (wasKeyJustPressed(PLAYER1_CONTROLS.ATTACK)) {
        // Play yoo sound when confirming
        this.yooSound.currentTime = 0
        this.yooSound.play().catch(() => {})
        
        this.player1Confirmed = true
      }
    }
    
      // Player 2 selection
    if (!this.player2Confirmed) {
        if (wasKeyJustPressed(PLAYER2_CONTROLS.LEFT) || wasKeyJustPressed(PLAYER2_CONTROLS.RIGHT)) {
          // Play select sound when scrolling
          this.selectSound.currentTime = 0
          this.selectSound.play().catch(() => {})
          
          // Cycle through characters
          const characterList = [CHARACTERS.KAEN, CHARACTERS.KENJI, CHARACTERS.WAKASA, CHARACTERS.SERENA, CHARACTERS.ISABELLA]
          const currentIndex = characterList.indexOf(this.player2Selection)
          const nextIndex = (currentIndex + 1) % characterList.length
          this.player2Selection = characterList[nextIndex]
          this.updatePreviews()
        }
        
      if (wasKeyJustPressed(PLAYER2_CONTROLS.ATTACK)) {
        // Play yoo sound when confirming
        this.yooSound.currentTime = 0
        this.yooSound.play().catch(() => {})
        
        this.player2Confirmed = true
      }
    }
    
      // Check if both players confirmed
    if (this.player1Confirmed && this.player2Confirmed && !this.transitionDelay) {
        // Start transition delay
        this.transitionDelay = true
        this.transitionTimer = 60 // 1 second delay at 60 FPS
      }
    }
    
    // Handle transition delay
    if (this.transitionDelay) {
      this.transitionTimer--
      if (this.transitionTimer <= 0) {
        // Delay complete, transition to fight
        this.onSelectionComplete({
          player1: this.player1Selection,
          player2: this.player2Selection
        })
      }
    }
    
    updateInput()
    
    // Update preview animations
    if (this.player1Preview) {
      this.player1Preview.animateFrames()
    }
    if (this.player2Preview) {
      this.player2Preview.animateFrames()
    }
  }

  draw() {
    const c = getContext()
    if (!c) return
    
    // Clear canvas
    c.fillStyle = 'black'
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw background
    this.background.update()
    if (this.shop) {
      this.shop.update()
    }
    
    // Draw overlay
    c.fillStyle = 'rgba(0, 0, 0, 0.5)'
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw title
    c.fillStyle = 'white'
    c.font = '24px "Press Start 2P"'
    c.textAlign = 'center'
    c.fillText('SELECT CHARACTERS', CANVAS_WIDTH / 2, 80)
    
    // Draw back button instruction
    c.font = '12px "Press Start 2P"'
    c.textAlign = 'left'
    c.fillText('B: Back to Background', 50, CANVAS_HEIGHT - 30)
    
    // Draw player labels
    c.font = '16px "Press Start 2P"'
    c.textAlign = 'left'
    c.fillText('PLAYER 1', 50, 150)
    if (this.gameMode === 'vsComputer' && this.selectingBotCharacter) {
      c.fillText('READY!', 50, 180)
    } else if (this.player1Confirmed) {
      c.fillText('READY!', 50, 180)
    } else {
      c.fillText('A/D: Select | S: Confirm', 50, 180)
    }
    
    c.textAlign = 'right'
    if (this.gameMode === 'vsComputer') {
      c.fillText('BOT CHARACTER', CANVAS_WIDTH - 50, 150)
      if (this.selectingBotCharacter) {
        c.fillText('A/D: Select | S: Confirm', CANVAS_WIDTH - 50, 180)
      } else if (this.player2Confirmed) {
        c.fillText('READY!', CANVAS_WIDTH - 50, 180)
      } else {
        c.fillText('Waiting...', CANVAS_WIDTH - 50, 180)
    }
    } else {
      c.fillText('PLAYER 2', CANVAS_WIDTH - 50, 150)
      if (this.player2Confirmed) {
        c.fillText('READY!', CANVAS_WIDTH - 50, 180)
      } else {
        c.fillText('←/→: Select | ↓: Confirm', CANVAS_WIDTH - 50, 180)
      }
    }
    
    // Draw character names
    c.textAlign = 'center'
    c.font = '12px "Press Start 2P"'
    c.fillText(characterData[this.player1Selection].name, 200, 480)
    c.fillText(characterData[this.player2Selection].name, 700, 480)
    
    // Draw previews
    if (this.player1Preview) {
      this.player1Preview.draw()
    }
    if (this.player2Preview) {
      this.player2Preview.draw()
    }
  }
}
