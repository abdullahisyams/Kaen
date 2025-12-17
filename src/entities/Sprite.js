// Base Sprite Class
import { getContext } from '../utils/context.js'
import { imageManager } from '../utils/ImageManager.js'

export class Sprite {
  constructor({
    position,
    imageSrc,
    imageFlippedSrc = null, // Optional pre-flipped image path
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 }
  }) {
    this.position = position
    this.width = 50
    this.height = 150
    // Use ImageManager to get cached image or create new one
    this.image = imageManager.getImage(imageSrc)
    this.imageFlipped = null
    if (imageFlippedSrc) {
      this.imageFlipped = imageManager.getImage(imageFlippedSrc)
    }
    this.scale = scale
    this.framesMax = framesMax
    this.framesCurrent = 0
    this.framesElapsed = 0
    this.framesHold = 5
    this.offset = offset
    this.flipped = false
  }

  draw() {
    const c = getContext()
    if (!c) return

    // Determine which image to use (pre-flipped if available and needed, otherwise use transform)
    const useFlippedImage = this.flipped && this.imageFlipped && 
                           this.imageFlipped.complete && 
                           this.imageFlipped.width > 0 && 
                           this.imageFlipped.height > 0
    const imageToUse = useFlippedImage ? this.imageFlipped : this.image

    // Don't draw if image hasn't loaded yet
    if (!imageToUse.complete || imageToUse.width === 0 || imageToUse.height === 0) {
      return
    }

    const sx = this.framesCurrent * (imageToUse.width / this.framesMax)
    const sWidth = imageToUse.width / this.framesMax
    const sHeight = imageToUse.height
    const dx = this.position.x - this.offset.x
    const dy = this.position.y - this.offset.y
    const dWidth = (imageToUse.width / this.framesMax) * this.scale
    const dHeight = imageToUse.height * this.scale

    // If we have a pre-flipped image, use it directly (no transforms needed = better performance)
    if (useFlippedImage) {
      c.drawImage(
        imageToUse,
        sx,
        0,
        sWidth,
        sHeight,
        dx,
        dy,
        dWidth,
        dHeight
      )
    } else {
      // Fallback to canvas transforms for sprites that don't have pre-flipped versions (like fighters)
      c.save()
      if (this.flipped) {
        c.translate(dx + dWidth / 2, dy + dHeight / 2)
        c.scale(-1, 1)
        c.translate(-(dx + dWidth / 2), -(dy + dHeight / 2))
      }
      c.drawImage(
        imageToUse,
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

  animateFrames() {
    this.framesElapsed++

    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++
      } else {
        this.framesCurrent = 0
      }
    }
  }

  update() {
    this.draw()
    this.animateFrames()
  }
}

