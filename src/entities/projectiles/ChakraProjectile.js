// Chakra Projectile Class
import { getContext } from '../../utils/context.js'
import { CANVAS_WIDTH } from '../../constants/game.js'
import { imageManager } from '../../utils/ImageManager.js'

export class ChakraProjectile {
  constructor({ position, velocity, direction, height, chakraProjectileSprite }) {
    this.position = position
    this.velocity = velocity
    this.width = 40
    this.height = height - 70
    this.direction = direction
    this.active = true
    this.damage = 80 // 4x normal melee attack
    
    // Use character-specific chakra projectile images if provided, otherwise default
    const imagePaths = chakraProjectileSprite?.imagePaths || [
      './img/Ulimate/NPT100.png',
      './img/Ulimate/NPT101.png',
      './img/Ulimate/NPT102.png',
      './img/Ulimate/NPT103.png'
    ]
    const framesMax = chakraProjectileSprite?.framesMax || 4
    const visualScale = chakraProjectileSprite?.scale !== undefined ? chakraProjectileSprite.scale : 0.5
    this.yOffset = chakraProjectileSprite?.yOffset !== undefined ? chakraProjectileSprite.yOffset : 50 // Default Y offset
    
    // Load the ultimate attack images
    this.images = []
    this.imagePaths = imagePaths
    this.framesMax = framesMax
    this.framesCurrent = 0
    this.frameTimer = 0
    this.frameInterval = 5
    
    // Load all images (use ImageManager for cached images)
    this.imagePaths.forEach((path) => {
      const img = imageManager.getImage(path)
      this.images.push(img)
    })
    
    this.visualScale = visualScale
  }

  update() {
    this.updatePosition()
    this.draw()
  }
  
  updatePosition() {
    this.position.x += this.velocity.x
    
    // Check if hit screen edge
    if (this.position.x < 0 || this.position.x > CANVAS_WIDTH) {
      this.active = false
      return
    }
    
    // Animate through frames
    this.frameTimer++
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0
      this.framesCurrent = (this.framesCurrent + 1) % this.framesMax
    }
  }

  draw() {
    const c = getContext()
    if (!c) return
    
    if (this.images.length === 0) return
    
    const currentImage = this.images[this.framesCurrent]
    if (!currentImage || !currentImage.complete || currentImage.width === 0) {
      return
    }
    
    const visualWidth = currentImage.width * this.visualScale
    const visualHeight = currentImage.height * this.visualScale
    const drawX = this.position.x + (this.width - visualWidth) / 2
    const drawY = this.position.y + (this.height - visualHeight) / 2 + this.yOffset
    
    c.save()
    
    if (this.direction === 'left') {
      c.translate(this.position.x + this.width, this.position.y)
      c.scale(-1, 1)
      c.drawImage(
        currentImage,
        0,
        0,
        currentImage.width,
        currentImage.height,
        -(this.width - (this.width - visualWidth) / 2),
        (this.height - visualHeight) / 2 + this.yOffset,
        visualWidth,
        visualHeight
      )
    } else {
      c.drawImage(
        currentImage,
        0,
        0,
        currentImage.width,
        currentImage.height,
        drawX,
        drawY,
        visualWidth,
        visualHeight
      )
    }
    
    c.restore()
  }

  checkCollision(target) {
    const projectileRight = this.position.x + this.width
    const projectileLeft = this.position.x
    const projectileBottom = this.position.y + this.height
    const projectileTop = this.position.y

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

