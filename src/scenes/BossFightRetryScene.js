// Boss Fight Retry Scene - Shown when player loses boss fight
import { Sprite } from '../entities/Sprite.js'
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { getKeys, wasKeyJustPressed, updateInput } from '../engine/InputHandler.js'

export class BossFightRetryScene {
  constructor(onRetry, onQuit) {
    this.onRetry = onRetry
    this.onQuit = onQuit
    this.selectedOption = 'retry' // 'retry' or 'quit'
    this.confirmed = false
    this.background = new Sprite({ position: { x: 0, y: 0 }, imageSrc: './img/snowy everest.png' })
  }

  update() {
    const keys = getKeys()
    const enterPressed = keys['Enter']?.justPressed || false
    const spacePressed = keys[' ']?.justPressed || false
    const wPressed = keys['w']?.justPressed || keys['W']?.justPressed || false
    const sPressed = keys['s']?.justPressed || keys['S']?.justPressed || false
    const arrowUpPressed = keys['ArrowUp']?.justPressed || false
    const arrowDownPressed = keys['ArrowDown']?.justPressed || false

    updateInput()
    this.background.update()

    // Navigate options
    if (wPressed || arrowUpPressed) {
      this.selectedOption = 'retry'
    } else if (sPressed || arrowDownPressed) {
      this.selectedOption = 'quit'
    }

    // Confirm selection
      if (enterPressed || spacePressed) {
      if (this.selectedOption === 'retry') {
        if (this.onRetry) {
          this.onRetry()
        }
      } else if (this.selectedOption === 'quit') {
        if (this.onQuit) {
          this.onQuit()
        }
      }
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
    
    // Draw title
    c.fillStyle = 'white'
    c.font = '24px "Press Start 2P"'
    c.textAlign = 'center'
    c.fillText('DEFEATED', CANVAS_WIDTH / 2, 150)
    
    // Draw options
    c.font = '16px "Press Start 2P"'
    const retryY = CANVAS_HEIGHT / 2
    const quitY = CANVAS_HEIGHT / 2 + 60

    // Retry option
    if (this.selectedOption === 'retry') {
      c.fillStyle = 'yellow'
      c.fillText('> RETRY FIGHT', CANVAS_WIDTH / 2, retryY)
      c.fillStyle = 'white'
      c.fillText('QUIT', CANVAS_WIDTH / 2, quitY)
    } else {
      c.fillStyle = 'white'
      c.fillText('RETRY FIGHT', CANVAS_WIDTH / 2, retryY)
      c.fillStyle = 'yellow'
      c.fillText('> QUIT', CANVAS_WIDTH / 2, quitY)
    }
    
    // Draw instructions
    c.font = '10px "Press Start 2P"'
    c.fillStyle = 'white'
    c.fillText('W/S or Arrow Keys: Navigate', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80)
    c.fillText('Enter or Space: Select', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50)
  }
}
