// Scene Selector Scene
import { Sprite } from '../entities/Sprite.js'
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { getKeys, wasKeyJustPressed, updateInput } from '../engine/InputHandler.js'
import { PLAYER1_CONTROLS } from '../constants/controls.js'

// Available scenes
export const SCENES = {
  PROLOGUE: { name: 'Prologue', startCutscene: 0, endCutscene: 0, isPrologue: true },
  QUIET_FOREST: { name: 'A Quiet Forest', startCutscene: 1, endCutscene: 3 },
  MOUNTAIN_TRIAL: { name: 'Mountain Trial', startCutscene: 4, endCutscene: 5 },
  GATE_OF_RED: { name: 'Gate of Red', startCutscene: 6, endCutscene: 7 },
  LAST_ACT: { name: 'Last Act', startCutscene: 8, endCutscene: 10 }
}

const sceneList = [
  SCENES.PROLOGUE,
  SCENES.QUIET_FOREST,
  SCENES.MOUNTAIN_TRIAL,
  SCENES.GATE_OF_RED,
  SCENES.LAST_ACT
]

export class SceneSelectorScene {
  constructor(onSelectionComplete, onBack = null) {
    this.onSelectionComplete = onSelectionComplete
    this.onBack = onBack
    this.selectedSceneIndex = 0
    this.selectedScene = sceneList[this.selectedSceneIndex]
    this.confirmed = false
    this.previousSceneIndex = this.selectedSceneIndex // Track previous selection for sound
    
    // Use forest background as default
    this.backgroundPreview = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: './img/forest.png'
    })
    
    // Sound effects
    this.selectSound = new Audio('./sfx/select.wav')
    this.selectSound.volume = 0.8
    this.selectedSound = new Audio('./sfx/selected.wav')
    this.selectedSound.volume = 0.7
  }

  update() {
    const keys = getKeys()
    
    // Back button - go back to title screen
    if (wasKeyJustPressed('b') || wasKeyJustPressed('B') || wasKeyJustPressed('Backspace')) {
      if (this.onBack) {
        this.onBack()
      }
      updateInput()
      return
    }
    
    if (!this.confirmed) {
      // Cycle through scenes with A/D keys or Arrow keys
      if (wasKeyJustPressed(PLAYER1_CONTROLS.LEFT) || wasKeyJustPressed('ArrowLeft')) {
        this.selectedSceneIndex = (this.selectedSceneIndex - 1 + sceneList.length) % sceneList.length
        this.selectedScene = sceneList[this.selectedSceneIndex]
        
        // Play select sound when selection changes
        if (this.selectedSceneIndex !== this.previousSceneIndex) {
          this.selectSound.currentTime = 0
          this.selectSound.play().catch(() => {})
          this.previousSceneIndex = this.selectedSceneIndex
        }
      } else if (wasKeyJustPressed(PLAYER1_CONTROLS.RIGHT) || wasKeyJustPressed('ArrowRight')) {
        this.selectedSceneIndex = (this.selectedSceneIndex + 1) % sceneList.length
        this.selectedScene = sceneList[this.selectedSceneIndex]
        
        // Play select sound when selection changes
        if (this.selectedSceneIndex !== this.previousSceneIndex) {
          this.selectSound.currentTime = 0
          this.selectSound.play().catch(() => {})
          this.previousSceneIndex = this.selectedSceneIndex
        }
      }
      
      // Confirm selection with S key, Enter, or Space
      if (wasKeyJustPressed(PLAYER1_CONTROLS.ATTACK) || 
          wasKeyJustPressed('Enter') || 
          wasKeyJustPressed(' ')) {
        // Play selected sound when confirming
        this.selectedSound.currentTime = 0
        this.selectedSound.play().catch(() => {})
        this.confirmed = true
        this.onSelectionComplete(this.selectedScene.startCutscene)
      }
    }
    
    updateInput()
    
    // Update background preview animation
    if (this.backgroundPreview) {
      this.backgroundPreview.update()
    }
  }

  draw() {
    const c = getContext()
    if (!c) return
    
    // Draw background preview
    if (this.backgroundPreview) {
      this.backgroundPreview.draw()
    }
    
    // Draw overlay
    c.fillStyle = 'rgba(0, 0, 0, 0.5)'
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw scene title in the middle of the screen with big font
    c.fillStyle = 'white'
    c.font = '48px "Press Start 2P"'
    c.textAlign = 'center'
    c.fillText(this.selectedScene.name, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
    
    // Draw scene range below title (skip for prologue)
    if (!this.selectedScene.isPrologue) {
      c.font = '16px "Press Start 2P"'
      c.fillStyle = 'rgba(255, 255, 255, 0.7)'
      c.fillText(
        `Scenes ${this.selectedScene.startCutscene}-${this.selectedScene.endCutscene}`,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 + 50
      )
    }
    
    // Draw instructions at the top
    c.font = '16px "Press Start 2P"'
    c.fillStyle = 'white'
    c.textAlign = 'center'
    if (this.confirmed) {
      c.fillText('READY!', CANVAS_WIDTH / 2, 80)
    } else {
      c.fillText('A/D or Arrow Keys: Select | S/Enter/Space: Confirm', CANVAS_WIDTH / 2, 80)
    }
    
    // Draw back button instruction
    c.font = '12px "Press Start 2P"'
    c.textAlign = 'left'
    c.fillText('B: Back to Title', 50, CANVAS_HEIGHT - 30)
  }
}
