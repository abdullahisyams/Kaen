// Fighter2 Class - For Player 2 with inverted sprite flipping
import { Fighter } from './Fighter.js'
import { getContext } from '../utils/context.js'

export class Fighter2 extends Fighter {
  constructor(config) {
    super(config)
    // Fighter2 sprites are mirrored - when facing left, sprite is NOT flipped
    // when facing right, sprite IS flipped (opposite of Fighter)
  }
  
  // setSprites is inherited from Fighter, no need to override
  // Fighter2 will use the inherited setSprites method from Fighter

  // Override the draw method to invert flip logic
  draw() {
    const c = getContext()
    if (!c || !this.image) return

    // Ensure image is loaded
    if (!this.image.complete || this.image.width === 0) {
      return
    }

    const sx = this.framesCurrent * (this.image.width / this.framesMax)
    const sWidth = this.image.width / this.framesMax
    const sHeight = this.image.height
    const dx = this.position.x - this.offset.x
    const dy = this.position.y - this.offset.y
    const dWidth = (this.image.width / this.framesMax) * this.scale
    const dHeight = this.image.height * this.scale

    // INVERT flip logic for Fighter2
    // When this.flipped is true (facing left), we DON'T flip the sprite
    // When this.flipped is false (facing right), we DO flip the sprite
    const shouldFlip = !this.flipped
    
    c.save()
    if (shouldFlip) {
      c.translate(dx + dWidth / 2, dy + dHeight / 2)
      c.scale(-1, 1)
      c.translate(-(dx + dWidth / 2), -(dy + dHeight / 2))
    }
    c.drawImage(
      this.image,
      sx,
      0,
      sWidth,
      sHeight,
      dx,
      dy,
      dWidth,
      dHeight
    )
    c.restore()
  }
}

