// Settings Scene
import { Sprite } from '../entities/Sprite.js'
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { getKeys, wasKeyJustPressed, updateInput } from '../engine/InputHandler.js'
import { PLAYER1_CONTROLS, PLAYER2_CONTROLS } from '../constants/controls.js'
import { audioManager } from '../utils/AudioManager.js'

export class SettingsScene {
  constructor(onBack = null) {
    this.onBack = onBack
    this.currentSection = 'volume' // 'volume' or 'controls'
    this.previousSection = this.currentSection
    this.selectedVolumeSlider = 'master' // 'master', 'music', or 'sfx'
    
    // Volume settings (0.0 to 1.0) - sync with AudioManager
    this.masterVolume = audioManager.masterVolume
    this.musicVolume = audioManager.musicVolume
    this.sfxVolume = audioManager.sfxVolume
    
    // Background
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: './img/forest.png'
    })
    
    // Sound effects will be loaded from AudioManager when needed
    
    // Load saved settings from AudioManager
    this.loadSettings()
  }
  
  loadSettings() {
    // Settings are loaded from AudioManager, just sync local values
    this.masterVolume = audioManager.masterVolume
    this.musicVolume = audioManager.musicVolume
    this.sfxVolume = audioManager.sfxVolume
  }
  
  saveSettings() {
    // Settings are saved by AudioManager, no need to do it here
  }
  
  updateVolume(volumeType, delta) {
    let volume = this[volumeType]
    volume = Math.max(0.0, Math.min(1.0, volume + delta))
    this[volumeType] = volume
    
    // Update AudioManager
    audioManager.updateVolume(volumeType, volume)
    
    // Play test sound for SFX volume
    if (volumeType === 'sfxVolume') {
      const sound = audioManager.getAudio('./sfx/select.wav', 'sfx')
      sound.currentTime = 0
      sound.play().catch(() => {})
    }
  }

  update() {
    const keys = getKeys()
    
    // Back button - go back to menu selector
    if (this.onBack && (wasKeyJustPressed('b') || wasKeyJustPressed('B') || wasKeyJustPressed('Backspace'))) {
      this.onBack()
      return
    }
    
    // Switch between sections with T key
    if (wasKeyJustPressed('t') || wasKeyJustPressed('T')) {
      if (this.currentSection === 'volume') {
        this.currentSection = 'controls'
      } else {
        this.currentSection = 'volume'
      }
      const sound = audioManager.getAudio('./sfx/select.wav', 'sfx')
      sound.currentTime = 0
      sound.play().catch(() => {})
    }
    
    // Volume controls
    if (this.currentSection === 'volume') {
      // Navigate volume sliders with W/S or Arrow Up/Down
      if (wasKeyJustPressed(PLAYER1_CONTROLS.JUMP) || wasKeyJustPressed('ArrowUp')) {
        // Move to previous volume slider
        const sliders = ['master', 'music', 'sfx']
        const currentIndex = sliders.indexOf(this.selectedVolumeSlider)
        const prevIndex = (currentIndex - 1 + sliders.length) % sliders.length
        this.selectedVolumeSlider = sliders[prevIndex]
      const sound = audioManager.getAudio('./sfx/select.wav', 'sfx')
      sound.currentTime = 0
      sound.play().catch(() => {})
      }
      
      if (wasKeyJustPressed('s') || wasKeyJustPressed('S') || wasKeyJustPressed('ArrowDown')) {
        // Move to next volume slider
        const sliders = ['master', 'music', 'sfx']
        const currentIndex = sliders.indexOf(this.selectedVolumeSlider)
        const nextIndex = (currentIndex + 1) % sliders.length
        this.selectedVolumeSlider = sliders[nextIndex]
      const sound = audioManager.getAudio('./sfx/select.wav', 'sfx')
      sound.currentTime = 0
      sound.play().catch(() => {})
      }
      
      // Adjust volume with A/D or Arrow Left/Right
      if (wasKeyJustPressed(PLAYER1_CONTROLS.LEFT) || wasKeyJustPressed('ArrowLeft')) {
        const volumeType = this.selectedVolumeSlider === 'master' ? 'masterVolume' : 
                          this.selectedVolumeSlider === 'music' ? 'musicVolume' : 'sfxVolume'
        this.updateVolume(volumeType, -0.05)
      }
      
      if (wasKeyJustPressed(PLAYER1_CONTROLS.RIGHT) || wasKeyJustPressed('ArrowRight')) {
        const volumeType = this.selectedVolumeSlider === 'master' ? 'masterVolume' : 
                          this.selectedVolumeSlider === 'music' ? 'musicVolume' : 'sfxVolume'
        this.updateVolume(volumeType, 0.05)
      }
    }
    
    updateInput()
    
    // Update background animation
    if (this.background) {
      this.background.update()
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
    c.fillText('SETTINGS', CANVAS_WIDTH / 2, 80)
    
    // Draw section tabs
    c.font = '16px "Press Start 2P"'
    const tabY = 120
    const tabSpacing = 200
    
    // Volume tab
    c.fillStyle = this.currentSection === 'volume' ? 'yellow' : 'white'
    c.fillText('VOLUME', CANVAS_WIDTH / 2 - tabSpacing / 2, tabY)
    
    // Controls tab
    c.fillStyle = this.currentSection === 'controls' ? 'yellow' : 'white'
    c.fillText('CONTROLS', CANVAS_WIDTH / 2 + tabSpacing / 2, tabY)
    
    // Draw section content
    if (this.currentSection === 'volume') {
      this.drawVolumeSection(c)
    } else if (this.currentSection === 'controls') {
      this.drawControlsSection(c)
    }
    
    // Draw instructions
    c.fillStyle = 'white'
    c.font = '12px "Press Start 2P"'
    c.textAlign = 'center'
    if (this.currentSection === 'volume') {
      c.fillText('W/S: Select Slider | ←/→: Adjust | T: Switch Section | B: Back', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30)
    } else {
      c.fillText('T: Switch Section | B: Back', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30)
    }
  }
  
  drawVolumeSection(c) {
    const startY = 180
    const lineHeight = 70
    const sliderWidth = 300
    const sliderHeight = 20
    const sliderX = CANVAS_WIDTH / 2 - sliderWidth / 2
    
    const volumeSliders = [
      { name: 'MASTER VOLUME', value: this.masterVolume, key: 'master' },
      { name: 'MUSIC VOLUME', value: this.musicVolume, key: 'music' },
      { name: 'SFX VOLUME', value: this.sfxVolume, key: 'sfx' }
    ]
    
    volumeSliders.forEach((slider, index) => {
      const y = startY + index * lineHeight
      const isSelected = this.selectedVolumeSlider === slider.key
      
      // Draw label
      c.fillStyle = isSelected ? 'yellow' : 'white'
      c.font = '14px "Press Start 2P"'
      c.textAlign = 'left'
      c.fillText(slider.name, sliderX, y)
      
      // Draw selection indicator
      if (isSelected) {
        c.fillStyle = 'yellow'
        c.font = '16px "Press Start 2P"'
        c.fillText('>', sliderX - 30, y)
      }
      
      // Volume bar background
      c.fillStyle = 'rgba(255, 255, 255, 0.3)'
      c.fillRect(sliderX, y + 15, sliderWidth, sliderHeight)
      
      // Volume bar fill
      c.fillStyle = isSelected ? 'yellow' : 'rgba(255, 255, 0, 0.7)'
      c.fillRect(sliderX, y + 15, sliderWidth * slider.value, sliderHeight)
      
      // Volume percentage
      c.fillStyle = isSelected ? 'yellow' : 'white'
      c.textAlign = 'right'
      c.font = '14px "Press Start 2P"'
      c.fillText(`${Math.round(slider.value * 100)}%`, sliderX + sliderWidth, y)
    })
  }
  
  drawControlsSection(c) {
    const startY = 180
    const lineHeight = 30
    const player1X = CANVAS_WIDTH / 2 - 250
    const player2X = CANVAS_WIDTH / 2 + 50
    const labelX = 100
    const keyX = 250
    
    c.font = '14px "Press Start 2P"'
    c.textAlign = 'center'
    
    // Player 1 Title
    c.fillStyle = 'white'
    c.fillText('PLAYER 1 CONTROLS', player1X + 75, startY)
    
    // Player 2 Title
    c.fillText('PLAYER 2 CONTROLS', player2X + 75, startY)
    
    c.font = '10px "Press Start 2P"'
    c.textAlign = 'left'
    
    // Player 1 Controls
    let y = startY + 40
    c.fillText('Move Left:', player1X, y)
    c.fillText(PLAYER1_CONTROLS.LEFT.toUpperCase(), player1X + keyX, y)
    y += lineHeight
    
    c.fillText('Move Right:', player1X, y)
    c.fillText(PLAYER1_CONTROLS.RIGHT.toUpperCase(), player1X + keyX, y)
    y += lineHeight
    
    c.fillText('Jump:', player1X, y)
    c.fillText(PLAYER1_CONTROLS.JUMP.toUpperCase(), player1X + keyX, y)
    y += lineHeight
    
    c.fillText('Attack:', player1X, y)
    c.fillText(PLAYER1_CONTROLS.ATTACK.toUpperCase(), player1X + keyX, y)
    y += lineHeight
    
    c.fillText('Ranged Attack:', player1X, y)
    c.fillText(PLAYER1_CONTROLS.RANGED_ATTACK.toUpperCase(), player1X + keyX, y)
    y += lineHeight
    
    c.fillText('Charge Chakra:', player1X, y)
    c.fillText(PLAYER1_CONTROLS.CHARGE_CHAKRA.toUpperCase(), player1X + keyX, y)
    y += lineHeight
    
    c.fillText('Unleash Chakra:', player1X, y)
    c.fillText(PLAYER1_CONTROLS.UNLEASH_CHAKRA.toUpperCase(), player1X + keyX, y)
    y += lineHeight
    
    c.fillText('Defend:', player1X, y)
    c.fillText(PLAYER1_CONTROLS.DEFEND.toUpperCase(), player1X + keyX, y)
    
    // Player 2 Controls (side by side)
    y = startY + 40
    c.fillText('Move Left:', player2X, y)
    c.fillText('←', player2X + keyX, y)
    y += lineHeight
    
    c.fillText('Move Right:', player2X, y)
    c.fillText('→', player2X + keyX, y)
    y += lineHeight
    
    c.fillText('Jump:', player2X, y)
    c.fillText('↑', player2X + keyX, y)
    y += lineHeight
    
    c.fillText('Attack:', player2X, y)
    c.fillText('↓', player2X + keyX, y)
    y += lineHeight
    
    c.fillText('Ranged Attack:', player2X, y)
    c.fillText(PLAYER2_CONTROLS.RANGED_ATTACK, player2X + keyX, y)
    y += lineHeight
    
    c.fillText('Charge Chakra:', player2X, y)
    c.fillText(PLAYER2_CONTROLS.CHARGE_CHAKRA, player2X + keyX, y)
    y += lineHeight
    
    c.fillText('Unleash Chakra:', player2X, y)
    c.fillText(PLAYER2_CONTROLS.UNLEASH_CHAKRA, player2X + keyX, y)
    y += lineHeight
    
    c.fillText('Defend:', player2X, y)
    c.fillText(PLAYER2_CONTROLS.DEFEND, player2X + keyX, y)
  }
}
