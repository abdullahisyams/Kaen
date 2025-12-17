// Prologue Scene
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { getKeys, wasKeyJustPressed, updateInput } from '../engine/InputHandler.js'

export class PrologueScene {
  constructor(onComplete = null) {
    this.onComplete = onComplete
    
    // Prologue text lines with timing
    this.textLines = [
      { text: 'The future is not written.', fadeIn: 60, hold: 130, fadeOut: 60 },
      { text: 'But some fear it more than death.', fadeIn: 60, hold: 130, fadeOut: 60 },
      { text: 'A witch once glimpsed a path where she would fall…', fadeIn: 60, hold: 130, fadeOut: 60 },
      { text: '…and in that vision, a quiet girl stood above her.', fadeIn: 60, hold: 130, fadeOut: 60 },
      { text: 'To survive, the witch chose to act first.', fadeIn: 60, hold: 130, fadeOut: 60 },
      { text: 'She erased the threat before it could grow.', fadeIn: 60, hold: 130, fadeOut: 60 },
      { text: 'Unaware, two siblings lived peacefully at the edge of a forest.', fadeIn: 60, hold: 130, fadeOut: 60 },
      { text: 'They believed danger would never find them.', fadeIn: 60, hold: 130, fadeOut: 60 },
      { text: 'They were wrong.', fadeIn: 60, hold: 160, fadeOut: 90 } // Final line holds longer
    ]
    
    this.currentLineIndex = 0
    this.currentLineTimer = 0
    this.currentPhase = 'fadeIn' // 'fadeIn', 'hold', 'fadeOut', 'waiting'
    this.textAlpha = 0
    this.canSkip = true
    
    // Prologue sound effect
    this.prologueMusic = new Audio('./sfx/prologue.mp3')
    this.prologueMusic.loop = true
    this.prologueMusic.volume = 0.7
    this.prologueMusicPlaying = false
    
    // Try to play music (may be blocked by autoplay policy)
    const playPromise = this.prologueMusic.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.prologueMusicPlaying = true
        })
        .catch(() => {
          // Autoplay was prevented, will try again on user interaction
          this.prologueMusicPlaying = false
        })
    }
  }

  update() {
    const keys = getKeys()
    
    // Try to play prologue music if not playing (for autoplay policy)
    if (!this.prologueMusicPlaying) {
      const anyKeyPressed = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (anyKeyPressed) {
        const playPromise = this.prologueMusic.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.prologueMusicPlaying = true
            })
            .catch(() => {
              // Still blocked, will try again later
            })
        }
      }
    }
    
    // Allow skipping with Enter or Space
    if (this.canSkip && (wasKeyJustPressed('Enter') || wasKeyJustPressed(' '))) {
      // Stop prologue music when skipping
      if (this.prologueMusicPlaying) {
        this.prologueMusic.pause()
        this.prologueMusic.currentTime = 0
        this.prologueMusicPlaying = false
      }
      if (this.onComplete) {
        this.onComplete()
      }
      return
    }
    
    updateInput()
    
    if (this.currentLineIndex >= this.textLines.length) {
      // All lines complete, wait a moment then transition
      this.currentLineTimer++
      if (this.currentLineTimer > 60) { // 1 second fade to black
        // Stop prologue music when completing
        if (this.prologueMusicPlaying) {
          this.prologueMusic.pause()
          this.prologueMusic.currentTime = 0
          this.prologueMusicPlaying = false
        }
        if (this.onComplete) {
          this.onComplete()
        }
      }
      return
    }
    
    const currentLine = this.textLines[this.currentLineIndex]
    
    if (this.currentPhase === 'fadeIn') {
      this.currentLineTimer++
      this.textAlpha = Math.min(1, this.currentLineTimer / currentLine.fadeIn)
      
      if (this.currentLineTimer >= currentLine.fadeIn) {
        this.currentPhase = 'hold'
        this.currentLineTimer = 0
      }
    } else if (this.currentPhase === 'hold') {
      this.currentLineTimer++
      this.textAlpha = 1
      
      if (this.currentLineTimer >= currentLine.hold) {
        this.currentPhase = 'fadeOut'
        this.currentLineTimer = 0
      }
    } else if (this.currentPhase === 'fadeOut') {
      this.currentLineTimer++
      this.textAlpha = Math.max(0, 1 - (this.currentLineTimer / currentLine.fadeOut))
      
      if (this.currentLineTimer >= currentLine.fadeOut) {
        // Move to next line
        this.currentLineIndex++
        this.currentPhase = 'fadeIn'
        this.currentLineTimer = 0
        this.textAlpha = 0
      }
    }
  }

  draw() {
    const c = getContext()
    if (!c) return
    
    // Draw black background
    c.fillStyle = 'black'
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw current text line if we have one
    if (this.currentLineIndex < this.textLines.length) {
      const currentLineData = this.textLines[this.currentLineIndex]
      
      c.fillStyle = `rgba(255, 255, 255, ${this.textAlpha})`
      c.font = '24px "Press Start 2P"'
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      
      // Word wrap for long lines
      const maxWidth = CANVAS_WIDTH - 100
      const words = currentLineData.text.split(' ')
      const wrappedLines = []
      let currentWrappedLine = ''
      
      words.forEach(word => {
        const testLine = currentWrappedLine + (currentWrappedLine ? ' ' : '') + word
        const metrics = c.measureText(testLine)
        if (metrics.width > maxWidth && currentWrappedLine) {
          wrappedLines.push(currentWrappedLine)
          currentWrappedLine = word
        } else {
          currentWrappedLine = testLine
        }
      })
      if (currentWrappedLine) {
        wrappedLines.push(currentWrappedLine)
      }
      
      // Draw each line
      const lineHeight = 35
      const startY = CANVAS_HEIGHT / 2 - ((wrappedLines.length - 1) * lineHeight / 2)
      wrappedLines.forEach((line, index) => {
        c.fillText(line, CANVAS_WIDTH / 2, startY + (index * lineHeight))
      })
    }
    
    // Draw skip instruction (only during fade in or hold phases)
    if (this.canSkip && this.currentLineIndex < this.textLines.length && this.textAlpha > 0.5) {
      c.fillStyle = 'rgba(255, 255, 255, 0.5)'
      c.font = '12px "Press Start 2P"'
      c.textAlign = 'center'
      c.fillText('Press Enter or Space to skip', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30)
    }
  }
}
