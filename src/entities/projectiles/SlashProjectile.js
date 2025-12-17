// Slash Projectile Class
import { getContext } from '../../utils/context.js'
import { CANVAS_WIDTH } from '../../constants/game.js'
import { imageManager } from '../../utils/ImageManager.js'

export class SlashProjectile {
  constructor({ position, velocity, direction, projectileSprite }) {
    this.position = position
    this.velocity = velocity
    this.direction = direction // 'left' or 'right'
    this.active = true
    
    // Use character-specific projectile sprite if provided, otherwise default to longrange.png
    const imageSrc = projectileSprite?.imageSrc || './img/longrange.png'
    const framesMax = projectileSprite?.framesMax || 5
    this.yOffset = projectileSprite?.yOffset !== undefined ? projectileSprite.yOffset : -120 // Default Y offset
    
    // Load projectile sprite sheet
    // Use ImageManager for cached images
    this.image = imageManager.getImage(imageSrc)
    this.framesMax = framesMax
    this.framesCurrent = 0
    this.framesElapsed = 0
    this.framesHold = 3 // Animation speed
    this.scale = 4
    this.width = 80
    this.height = 40
  }

  update() {
    this.updatePosition()
    this.animateFrames()
    this.draw()
  }
  
  updatePosition() {
    this.position.x += this.velocity.x
    
    // Check if hit screen edge
    if (this.position.x < 0 || this.position.x > CANVAS_WIDTH) {
      this.active = false
    }
    }
    
  animateFrames() {
    this.framesElapsed++
    if (this.framesElapsed % this.framesHold === 0) {
      this.framesCurrent = (this.framesCurrent + 1) % this.framesMax
    }
  }

  draw() {
    const c = getContext()
    if (!c) return
    
    // Wait for image to load
    if (!this.image.complete || this.image.width === 0) {
      return
    }
    
    const frameWidth = this.image.width / this.framesMax
    const frameHeight = this.image.height
    const drawWidth = frameWidth * this.scale
    const drawHeight = frameHeight * this.scale
    
    // Calculate source X position for current frame
    const sourceX = this.framesCurrent * frameWidth
    
    c.save()
    
    if (this.direction === 'left') {
      c.translate(this.position.x + drawWidth, this.position.y + this.yOffset)
      c.scale(-1, 1)
      c.drawImage(
        this.image,
        sourceX,
        0,
        frameWidth,
        frameHeight,
        0,
        0,
        drawWidth,
        drawHeight
      )
    } else {
      c.drawImage(
        this.image,
        sourceX,
        0,
        frameWidth,
        frameHeight,
        this.position.x - 230,
        this.position.y + this.yOffset,
        drawWidth,
        drawHeight
      )
    }
    
    c.restore()
    
    this.width = drawWidth
    this.height = drawHeight
  }

  checkProjectileCollision(target) {
    // Calculate the actual visual position (matching the draw method)
    // The draw method uses position.y + yOffset for Y coordinate
    const visualY = this.position.y + this.yOffset
    
    // Calculate visual dimensions (same as in draw method)
    let drawWidth = this.width // Use cached width if available
    let drawHeight = this.height // Use cached height if available
    
    if (this.image.complete && this.image.width > 0) {
      const frameWidth = this.image.width / this.framesMax
      const frameHeight = this.image.height
      drawWidth = frameWidth * this.scale
      drawHeight = frameHeight * this.scale
    }
    
    // Calculate visual X position based on direction
    // For 'right' direction: drawn at position.x - 230
    // For 'left' direction: drawn at position.x + drawWidth then flipped, so left edge is at position.x
    let projectileLeft
    if (this.direction === 'right') {
      projectileLeft = this.position.x - 230
    } else {
      // For left direction, after translate and flip, the visual left edge is at position.x
      projectileLeft = this.position.x
    }
    
    const projectileRight = projectileLeft + drawWidth
    const projectileTop = visualY
    const projectileBottom = projectileTop + drawHeight

    // Target collision box uses position directly (no offset adjustments needed)
    const targetRight = target.position.x + target.width
    const targetLeft = target.position.x
    const targetBottom = target.position.y + target.height
    const targetTop = target.position.y

    return (
      projectileRight >= targetLeft &&
      projectileLeft <= targetRight &&
      projectileBottom >= targetTop &&
      projectileTop <= targetBottom
    )
  }
}

