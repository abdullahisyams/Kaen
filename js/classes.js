class Sprite {
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
    const sx = this.framesCurrent * (this.image.width / this.framesMax)
    const sWidth = this.image.width / this.framesMax
    const sHeight = this.image.height
    const dx = this.position.x - this.offset.x
    const dy = this.position.y - this.offset.y
    const dWidth = (this.image.width / this.framesMax) * this.scale
    const dHeight = this.image.height * this.scale

    c.save()
    if (this.flipped) {
      // flip around the sprite's center to avoid positional snapping
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

class Fighter extends Sprite {
  constructor({
    position,
    velocity,
    color = 'red',
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = { offset: {}, width: undefined, height: undefined }
  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      offset
    })

    this.velocity = velocity
    this.width = 50
    this.height = 150
    this.lastKey
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height
    }
    this.color = color
    this.isAttacking
    this.health = 200
    this.framesCurrent = 0
    this.framesElapsed = 0
    this.framesHold = 5
    this.sprites = sprites
    this.dead = false

    for (const sprite in this.sprites) {
      sprites[sprite].image = new Image()
      sprites[sprite].image.src = sprites[sprite].imageSrc
    }
  }

  update() {
    this.draw()
    if (!this.dead) this.animateFrames()

    // attack boxes
    const mirroredOffsetX = this.flipped
      ? -this.attackBox.offset.x - this.attackBox.width
      : this.attackBox.offset.x
    this.attackBox.position.x = this.position.x + mirroredOffsetX
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y

    // draw the attack box
    // c.fillRect(
    //   this.attackBox.position.x,
    //   this.attackBox.position.y,
    //   this.attackBox.width,
    //   this.attackBox.height
    // )

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    // gravity function
    if (this.position.y + this.height + this.velocity.y >= canvas.height - 96) {
      this.velocity.y = 0
      this.position.y = 330
    } else this.velocity.y += gravity
  }

  attack() {
    this.switchSprite('attack1')
    this.isAttacking = true
  }

  takeHit() {
    this.health -= 20

    if (this.health <= 0) {
      this.switchSprite('death')
    } else this.switchSprite('takeHit')
  }

  switchSprite(sprite) {
    if (this.image === this.sprites.death.image) {
      if (this.framesCurrent === this.sprites.death.framesMax - 1)
        this.dead = true
      return
    }

    // overriding all other animations with the attack animations
    if (
      (this.image === this.sprites.attack1.image &&
        this.framesCurrent < this.sprites.attack1.framesMax - 1) ||
      (this.image === this.sprites.attack2.image &&
        this.framesCurrent < this.sprites.attack2.framesMax - 1)
    )
      return

    // override when fighter gets hit
    if (
      this.image === this.sprites.takeHit.image &&
      this.framesCurrent < this.sprites.takeHit.framesMax - 1
    )
      return

    switch (sprite) {
      case 'idle':
        if (this.image !== this.sprites.idle.image) {
          this.image = this.sprites.idle.image
          this.framesMax = this.sprites.idle.framesMax
          this.framesCurrent = 0
        }
        break
      case 'run':
        if (this.image !== this.sprites.run.image) {
          this.image = this.sprites.run.image
          this.framesMax = this.sprites.run.framesMax
          this.framesCurrent = 0
        }
        break
      case 'jump':
        if (this.image !== this.sprites.jump.image) {
          this.image = this.sprites.jump.image
          this.framesMax = this.sprites.jump.framesMax
          this.framesCurrent = 0
        }
        break

      case 'fall':
        if (this.image !== this.sprites.fall.image) {
          this.image = this.sprites.fall.image
          this.framesMax = this.sprites.fall.framesMax
          this.framesCurrent = 0
        }
        break

      case 'attack1':
        if (this.image !== this.sprites.attack1.image) {
          this.image = this.sprites.attack1.image
          this.framesMax = this.sprites.attack1.framesMax
          this.framesCurrent = 0
        }
        break

      case 'attack2':
        if (this.image !== this.sprites.attack2.image) {
          this.image = this.sprites.attack2.image
          this.framesMax = this.sprites.attack2.framesMax
          this.framesCurrent = 0
        }
        break

      case 'takeHit':
        if (this.image !== this.sprites.takeHit.image) {
          this.image = this.sprites.takeHit.image
          this.framesMax = this.sprites.takeHit.framesMax
          this.framesCurrent = 0
        }
        break

      case 'death':
        if (this.image !== this.sprites.death.image) {
          this.image = this.sprites.death.image
          this.framesMax = this.sprites.death.framesMax
          this.framesCurrent = 0
        }
        break
    }
  }
}

class SlashProjectile {
  constructor({ position, velocity, direction }) {
    this.position = position 
    this.velocity = velocity
    this.direction = direction// 'left' or 'right'
    this.active = true
    
    // Load longrange.png sprite sheet (5 frames)
    this.image = new Image()
    this.image.src = './img/longrange.png'
    this.framesMax = 5
    this.framesCurrent = 0 // Use first frame (index 0)
    this.scale = 4
    this.width = 80 // Will be set in draw() based on image
    this.height = 40 // Will be set in draw() based on image
  }

  update() {
    this.position.x += this.velocity.x
    
    // Check if hit screen edge
    if (this.position.x < 0 || this.position.x > canvas.width) {
      this.active = false
      return
    }
    
    // Draw the projectile
    this.draw()
  }

  draw() {
    if (!this.image.complete) return // Wait for image to load
    
    const frameWidth = this.image.width / this.framesMax
    const frameHeight = this.image.height
    const drawWidth = frameWidth * this.scale
    const drawHeight = frameHeight * this.scale
    
    // Draw first frame (index 0) of the sprite sheet
    c.save()
    
    // Flip horizontally if facing left
    if (this.direction === 'left') {
      c.translate(this.position.x + drawWidth, this.position.y - 120)
      c.scale(-1, 1)
      c.drawImage(
        this.image,
        0, // First frame (x position in sprite sheet)
        0, // Top of sprite sheet
        frameWidth,
        frameHeight,
        0, // Draw at origin after transform
        0,
        drawWidth,
        drawHeight
      )
    } else {
      c.drawImage(
        this.image,
        0, // First frame
        0,
        frameWidth,
        frameHeight,
        this.position.x - 230,
        this.position.y - 120,
        drawWidth,
        drawHeight
      )
    }
    
    c.restore()
    
    // Update width/height for collision detection
    this.width = drawWidth
    this.height = drawHeight
  }

  checkProjectileCollision(enemy) {
    const projectileRight = this.position.x + this.width
    const projectileLeft = this.position.x
    const projectileBottom = this.position.y + this.height
    const projectileTop = this.position.y

    const enemyRight = enemy.position.x + enemy.width
    const enemyLeft = enemy.position.x
    const enemyBottom = enemy.position.y + enemy.height
    const enemyTop = enemy.position.y

    return (
      projectileRight >= enemyLeft &&
      projectileLeft <= enemyRight &&
      projectileBottom >= enemyTop &&
      projectileTop <= enemyBottom
    )
  }
}

class ChakraProjectile {
  constructor({ position, velocity, direction, height }) {
    this.position = position
    this.velocity = velocity  
    this.width = 40
    this.height = height - 70// As tall as the character
    this.direction = direction
    this.active = true
    this.damage = 80 // 4x normal melee attack (20 * 4)
    
    // Load the 4 ultimate attack images
    this.images = []
    this.imagePaths = [
      './img/Ulimate/NPT100.png',
      './img/Ulimate/NPT101.png',
      './img/Ulimate/NPT102.png',
      './img/Ulimate/NPT103.png'
    ]
    this.framesMax = 4
    this.framesCurrent = 0
    this.frameTimer = 0
    this.frameInterval = 5 // Change frame every 5 game frames
    
    // Load all images
    this.imagePaths.forEach((path, index) => {
      const img = new Image()
      img.src = path
      this.images.push(img)
    })
    
    // Visual scale (images will be drawn smaller, but collision box stays the same)
    this.visualScale = 0.5 // Scale down images to 60% of original size
  }

  update() {
    this.position.x += this.velocity.x
    
    // Check if hit screen edge
    if (this.position.x < 0 || this.position.x > canvas.width) {
      this.active = false
      return
    }
    
    // Animate through frames
    this.frameTimer++
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0
      this.framesCurrent = (this.framesCurrent + 1) % this.framesMax
    }
    
    // Draw the chakra projectile
    this.draw()
  }

  draw() {
    // Wait for images to load
    if (this.images.length === 0 || !this.images[this.framesCurrent]?.complete) return
    
    const currentImage = this.images[this.framesCurrent]
    
    // Calculate visual dimensions (scaled down)
    const visualWidth = currentImage.width * this.visualScale
    const visualHeight = currentImage.height * this.visualScale
    
    // Center the scaled image within the collision box
    const drawX = this.position.x + (this.width - visualWidth) / 2
    const drawY = this.position.y + (this.height - visualHeight) / 2 + 50
    
    c.save()
    
    // Flip horizontally if facing left
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
        (this.height - visualHeight) / 2 + 50,
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

    const enemyRight = target.position.x + target.width
    const enemyLeft = target.position.x
    const enemyBottom = target.position.y + target.height
    const enemyTop = target.position.y

    return (
      projectileRight >= enemyLeft &&
      projectileLeft <= enemyRight &&
      projectileBottom >= enemyTop &&
      projectileTop <= enemyBottom
    )
  }
}
