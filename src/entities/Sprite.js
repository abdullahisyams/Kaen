// Base Sprite Class
import { getContext } from '../utils/context.js'

export class Sprite {
  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 }
  }) {
    this.position = position
    this.width = 50
    this.height = 150
    this.image = new Image()
    this.image.src = imageSrc
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

    // Don't draw if image hasn't loaded yet
    if (!this.image.complete || this.image.width === 0 || this.image.height === 0) {
      return
    }

    const sx = this.framesCurrent * (this.image.width / this.framesMax)
    const sWidth = this.image.width / this.framesMax
    const sHeight = this.image.height
    const dx = this.position.x - this.offset.x
    const dy = this.position.y - this.offset.y
    const dWidth = (this.image.width / this.framesMax) * this.scale
    const dHeight = this.image.height * this.scale

    c.save()
    if (this.flipped) {
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

