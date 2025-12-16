// Credits Scene
import { Sprite } from '../entities/Sprite.js'
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { getKeys, wasKeyJustPressed, updateInput } from '../engine/InputHandler.js'

export class CreditsScene {
  constructor(onComplete = null) {
    this.onComplete = onComplete
    this.scrollY = CANVAS_HEIGHT // Start from bottom
    this.scrollSpeed = 1.5 // Pixels per frame
    this.paused = false
    
    // Load title image
    this.titleImage = new Image()
    this.titleImage.src = './img/title.png'
    this.titleImageLoaded = false
    this.titleImage.onload = () => {
      this.titleImageLoaded = true
    }
    
    // Credit scene music
    this.creditMusic = new Audio('./sfx/credit scene.mp3')
    this.creditMusic.loop = true
    this.creditMusic.volume = 0.7
    this.creditMusicPlaying = false
    
    // Try to play music (may be blocked by autoplay policy)
    const playPromise = this.creditMusic.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.creditMusicPlaying = true
        })
        .catch(() => {
          // Autoplay was prevented, will try again on user interaction
          this.creditMusicPlaying = false
        })
    }
    
    // Credits content structure
    this.credits = [
      { type: 'title', text: null, image: true}, // Title image
      { type: 'spacer', height: 120 },
      { type: 'section', text: 'A Game by', size: 24 },
      { type: 'spacer', height: 20 },
      { type: 'name', text: 'Wolforiz', size: 32 },
      { type: 'spacer', height: 80 },
      { type: 'section', text: 'Story & World', size: 24 },
      { type: 'spacer', height: 20 },
      { type: 'name', text: 'Wolforiz', size: 28 },
      { type: 'spacer', height: 10 },
      { type: 'credit', text: 'AI Writing Support: ChatGPT', size: 16 },
      { type: 'spacer', height: 80 },
      { type: 'section', text: 'Animation & Visual Motion', size: 24 },
      { type: 'spacer', height: 20 },
      { type: 'name', text: 'Cursor', size: 28 },
      { type: 'spacer', height: 80 },
      { type: 'section', text: 'Sound & Music', size: 24 },
      { type: 'spacer', height: 20 },
      { type: 'name', text: 'Wolforiz', size: 28 },
      { type: 'spacer', height: 80 },
      { type: 'section', text: 'Characters', size: 24 },
      { type: 'spacer', height: 20 },
      { type: 'credit', text: 'Kaen — The Wanderer', size: 18 },
      { type: 'spacer', height: 15 },
      { type: 'credit', text: 'Isabella — The Sister', size: 18 },
      { type: 'spacer', height: 15 },
      { type: 'credit', text: 'Kenji — The Fallen Follower', size: 18 },
      { type: 'spacer', height: 15 },
      { type: 'credit', text: 'Serena — The Witch', size: 18 },
      { type: 'spacer', height: 15 },
      { type: 'credit', text: 'Wakasa — The Mountain Keeper', size: 18 },
      { type: 'spacer', height: 80 },
      { type: 'section', text: 'Special Thanks', size: 24 },
      { type: 'spacer', height: 20 },
      { type: 'name', text: 'You, the player', size: 28 },
      { type: 'spacer', height: 80 },
      { type: 'section', text: 'Thank you for playing', size: 32 },
      { type: 'spacer', height: 100 }
    ]
    
    // Calculate total height
    this.totalHeight = 0
    this.credits.forEach(item => {
      if (item.type === 'title' && item.image) {
        this.totalHeight += 200 // Space for title image
      } else if (item.type === 'spacer') {
        this.totalHeight += item.height
      } else {
        this.totalHeight += 40 // Default line height
      }
    })
  }

  update() {
    const keys = getKeys()
    
    // Try to play music if not playing (for autoplay policy)
    if (!this.creditMusicPlaying) {
      const anyKeyPressed = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (anyKeyPressed) {
        const playPromise = this.creditMusic.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.creditMusicPlaying = true
            })
            .catch(() => {
              // Still blocked, will try again later
            })
        }
      }
    }
    
    // Allow skipping with Enter or Space
    if (wasKeyJustPressed('Enter') || wasKeyJustPressed(' ')) {
      // Stop music when skipping
      if (this.creditMusicPlaying) {
        this.creditMusic.pause()
        this.creditMusic.currentTime = 0
        this.creditMusicPlaying = false
      }
      if (this.onComplete) {
        this.onComplete()
      }
      return
    }
    
    // Pause/resume with P key (optional)
    if (wasKeyJustPressed('p') || wasKeyJustPressed('P')) {
      this.paused = !this.paused
    }
    
    updateInput()
    
    // Scroll credits upward
    if (!this.paused) {
      this.scrollY -= this.scrollSpeed
      
      // Check if credits have finished scrolling
      if (this.scrollY + this.totalHeight < 0) {
        // Credits finished, wait a moment then complete
        // Stop music when credits finish
        if (this.creditMusicPlaying) {
          this.creditMusic.pause()
          this.creditMusic.currentTime = 0
          this.creditMusicPlaying = false
        }
        setTimeout(() => {
          if (this.onComplete) {
            this.onComplete()
          }
        }, 1000)
      }
    }
  }

  draw() {
    const c = getContext()
    if (!c) return
    
    // Draw black background
    c.fillStyle = 'black'
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw credits
    let currentY = this.scrollY
    const centerX = CANVAS_WIDTH / 2
    
    this.credits.forEach(item => {
      // Adjust threshold for title image (300px tall)
      const topThreshold = item.type === 'title' && item.image ? -350 : -50
      if (currentY > CANVAS_HEIGHT + 50 || currentY < topThreshold) {
        // Skip drawing if outside viewport
        if (item.type === 'spacer') {
          currentY += item.height
        } else if (item.type === 'title' && item.image) {
          currentY += 200
        } else {
          currentY += 40
        }
        return
      }
      
      if (item.type === 'title' && item.image) {
        // Draw title image
        if (this.titleImageLoaded) {
          const imageWidth = 600
          const imageHeight = 300
          const imageX = centerX - imageWidth / 2
          const imageY = currentY
          c.drawImage(this.titleImage, imageX, imageY, imageWidth, imageHeight)
        }
        currentY += 200
      } else if (item.type === 'spacer') {
        currentY += item.height
      } else if (item.type === 'section') {
        c.fillStyle = 'white'
        c.font = `${item.size}px "Press Start 2P"`
        c.textAlign = 'center'
        c.fillText(item.text, centerX, currentY)
        currentY += 40
      } else if (item.type === 'name') {
        c.fillStyle = '#FFD700' // Gold color for names
        c.font = `${item.size}px "Press Start 2P"`
        c.textAlign = 'center'
        c.fillText(item.text, centerX, currentY)
        currentY += 40
      } else if (item.type === 'credit') {
        c.fillStyle = 'white'
        c.font = `${item.size}px "Press Start 2P"`
        c.textAlign = 'center'
        c.fillText(item.text, centerX, currentY)
        currentY += 40
      }
    })
    
    // Draw skip instruction at bottom
    c.fillStyle = 'rgba(255, 255, 255, 0.5)'
    c.font = '12px "Press Start 2P"'
    c.textAlign = 'center'
    c.fillText('Press Enter or Space to skip', centerX, CANVAS_HEIGHT - 30)
  }
}
