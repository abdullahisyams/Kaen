// Loading Scene - Preloads all assets before game starts
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { audioManager } from '../utils/AudioManager.js'
import { imageManager } from '../utils/ImageManager.js'
import { characterData } from '../config/characters.js'

export class LoadingScene {
  constructor(onComplete) {
    this.onComplete = onComplete
    this.loaded = 0
    this.total = 0
    this.status = 'Initializing...'
    
    // Start loading process
    this.startLoading()
  }

  async startLoading() {
    try {
      // Collect all assets to load
      const allImages = this.collectAllImages()
      const audioGroups = this.collectAllAudio()
      
      // Calculate total
      this.total = allImages.length + audioGroups.all.length
      this.loaded = 0
      
      // Start loading images in parallel batches
      const imageLoadingPromise = this.loadImagesInBatches(allImages, 10) // Load 10 images at a time
      
      // Load audio in priority order with parallel batches
      const audioLoadingPromise = this.loadAudioInPriorityBatches(audioGroups)
      
      // Wait for both to complete
      await Promise.all([
        imageLoadingPromise,
        audioLoadingPromise
      ])
      
      // Loading complete
      this.status = 'Complete!'
      this.loaded = this.total
      
      // Wait a moment then proceed
      setTimeout(() => {
        if (this.onComplete) {
          this.onComplete()
        }
      }, 500)
    } catch (error) {
      console.error('Loading error:', error)
      this.status = 'Error loading assets'
    }
  }

  collectAllImages() {
    const images = []
    
    // Background images - credit title is highest priority
    images.push(
      './img/credit title.png', // Load first - critical for credits scene
      './img/title.png',
      './img/forest.png',
      './img/shop.png',
      './img/netherland.png',
      './img/flipped netherland.png',
      './img/snowy everest.png',
      './img/flipped snowy everest.png',
      './img/nether throne.png',
      './img/nether portal.png',
      './img/romasna.png'
    )
    
    // Collect all character sprites
    Object.values(characterData).forEach(character => {
      // All animation sprites
      Object.values(character.sprites).forEach(sprite => {
        if (sprite.imageSrc && !images.includes(sprite.imageSrc)) {
          images.push(sprite.imageSrc)
        }
      })
      
      // Projectile images
      if (character.projectile?.imageSrc) {
        if (!images.includes(character.projectile.imageSrc)) {
          images.push(character.projectile.imageSrc)
        }
      }
      
      // Chakra projectile images
      if (character.chakraProjectile?.imagePaths) {
        character.chakraProjectile.imagePaths.forEach(path => {
          if (!images.includes(path)) {
            images.push(path)
          }
        })
      }
    })
    
    // Default projectile images
    images.push('./img/longrange.png')
    images.push('./img/arrow.png')
    images.push('./img/serenaprojectile.png')
    
    // Ultimate images (default set)
    images.push(
      './img/Ulimate/NPT100.png',
      './img/Ulimate/NPT101.png',
      './img/Ulimate/NPT102.png',
      './img/Ulimate/NPT103.png'
    )
    
    return images
  }

  collectAllAudio() {
    // Priority-based audio collection
    // Critical audio (loaded first)
    const criticalAudio = [
      { path: './sfx/title screen.mp3', type: 'music', options: { loop: true }, priority: 1 },
      { path: './sfx/select.wav', type: 'sfx', priority: 1 },
      { path: './sfx/selected.wav', type: 'sfx', priority: 1 },
      { path: './sfx/basic.wav', type: 'sfx', priority: 1 },
      { path: './sfx/chakra charge.wav', type: 'sfx', priority: 1 }
    ]
    
    // High priority audio (loaded second)
    const highPriorityAudio = [
      { path: './sfx/stage&character select.mp3', type: 'music', options: { loop: true }, priority: 2 },
      { path: './sfx/battles.mp3', type: 'music', options: { loop: true }, priority: 2 },
      { path: './sfx/proj kkw.wav', type: 'sfx', priority: 2 },
      { path: './sfx/proj isabella.wav', type: 'sfx', priority: 2 },
      { path: './sfx/proj serena.wav', type: 'sfx', priority: 2 },
      { path: './sfx/ult kaen.wav', type: 'sfx', priority: 2 },
      { path: './sfx/ult wakasa.wav', type: 'sfx', priority: 2 },
      { path: './sfx/ult kenji.wav', type: 'sfx', priority: 2 },
      { path: './sfx/ult isabella.wav', type: 'sfx', priority: 2 },
      { path: './sfx/ult serena.wav', type: 'sfx', priority: 2 },
      { path: './sfx/yoo.wav', type: 'sfx', priority: 2 }
    ]
    
    // Lower priority audio (loaded last)
    const lowerPriorityAudio = [
      { path: './sfx/credit scene.mp3', type: 'music', options: { loop: true }, priority: 3 },
      { path: './sfx/prologue.mp3', type: 'music', options: { loop: true }, priority: 3 },
      { path: './sfx/cutscene 1.mp3', type: 'music', options: { loop: true }, priority: 3 },
      { path: './sfx/cutscene 2.mp3', type: 'music', options: { loop: true }, priority: 3 },
      { path: './sfx/cutscene 3.mp3', type: 'music', options: { loop: true }, priority: 3 },
      { path: './sfx/cutscene 4.mp3', type: 'music', options: { loop: true }, priority: 3 },
      { path: './sfx/cutscene 5.mp3', type: 'music', options: { loop: true }, priority: 3 },
      { path: './sfx/cutscene 6.mp3', type: 'music', options: { loop: true }, priority: 3 },
      { path: './sfx/cutscene 7.mp3', type: 'music', options: { loop: true }, priority: 3 },
      { path: './sfx/cutscene 8.mp3', type: 'music', options: { loop: true }, priority: 3 },
      { path: './sfx/cutscene 9.mp3', type: 'music', options: { loop: true }, priority: 3 },
      { path: './sfx/cutscene 10.mp3', type: 'music', options: { loop: true }, priority: 3 },
      { path: './sfx/pvp fin.mp3', type: 'music', options: { loop: true }, priority: 3 }
    ]
    
    // Return organized by priority
    return {
      critical: criticalAudio,
      high: highPriorityAudio,
      low: lowerPriorityAudio,
      all: [...criticalAudio, ...highPriorityAudio, ...lowerPriorityAudio]
    }
  }

  // Load images in parallel batches for better performance
  async loadImagesInBatches(imagePaths, batchSize = 10) {
    for (let i = 0; i < imagePaths.length; i += batchSize) {
      const batch = imagePaths.slice(i, i + batchSize)
      const promises = batch.map(async (path) => {
        try {
          await imageManager.preload(path)
          this.loaded++
          this.status = `Loading images... (${this.loaded}/${this.total})`
        } catch (error) {
          console.warn(`Failed to load image: ${path}`, error)
          this.loaded++
        }
      })
      await Promise.all(promises)
    }
  }

  // Load audio in priority batches (critical first, then high, then low)
  async loadAudioInPriorityBatches(audioGroups) {
    const batchSize = 8 // Load 8 audio files in parallel
    
    // Load critical audio first
    this.status = 'Loading critical audio...'
    await this.loadAudioBatch(audioGroups.critical, batchSize)
    
    // Load high priority audio
    this.status = 'Loading high priority audio...'
    await this.loadAudioBatch(audioGroups.high, batchSize)
    
    // Load lower priority audio
    this.status = 'Loading background audio...'
    await this.loadAudioBatch(audioGroups.low, batchSize)
  }

  // Load a batch of audio files in parallel
  async loadAudioBatch(audioFiles, batchSize = 8) {
    for (let i = 0; i < audioFiles.length; i += batchSize) {
      const batch = audioFiles.slice(i, i + batchSize)
      const promises = batch.map(async (audioFile) => {
        try {
          await audioManager.preload(audioFile.path, audioFile.type, audioFile.options || {})
          this.loaded++
          this.status = `Loading audio... (${this.loaded}/${this.total})`
        } catch (error) {
          console.warn(`Failed to load audio: ${audioFile.path}`, error)
          this.loaded++
        }
      })
      await Promise.all(promises)
    }
  }

  draw() {
    const c = getContext()
    if (!c) return
    
    // Draw black background
    c.fillStyle = 'black'
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw loading text
    c.fillStyle = 'white'
    c.font = '24px "Press Start 2P"'
    c.textAlign = 'center'
    c.fillText('LOADING...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60)
    
    // Draw status
    c.font = '12px "Press Start 2P"'
    c.fillStyle = 'rgba(255, 255, 255, 0.7)'
    c.fillText(this.status, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20)
    
    // Draw progress bar background
    const barWidth = 400
    const barHeight = 30
    const barX = (CANVAS_WIDTH - barWidth) / 2
    const barY = CANVAS_HEIGHT / 2 + 20
    
    c.fillStyle = 'rgba(255, 255, 255, 0.2)'
    c.fillRect(barX, barY, barWidth, barHeight)
    
    // Draw progress bar fill
    const progress = this.total > 0 ? this.loaded / this.total : 0
    const fillWidth = barWidth * progress
    
    c.fillStyle = '#FFD700' // Gold color
    c.fillRect(barX, barY, fillWidth, barHeight)
    
    // Draw progress bar border
    c.strokeStyle = 'white'
    c.lineWidth = 2
    c.strokeRect(barX, barY, barWidth, barHeight)
    
    // Draw percentage
    c.fillStyle = 'white'
    c.font = '14px "Press Start 2P"'
    const percentage = Math.round(progress * 100)
    c.fillText(`${percentage}%`, CANVAS_WIDTH / 2, barY + barHeight + 30)
  }

  update() {
    // Loading happens asynchronously, just need to draw
  }
}

