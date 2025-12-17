// Cutscene Scene - Handles story mode cutscenes
import { Fighter } from '../entities/Fighter.js'
import { Fighter2 } from '../entities/Fighter2.js'
import { Sprite } from '../entities/Sprite.js'
import { SlashProjectile } from '../entities/projectiles/SlashProjectile.js'
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { FighterState, FIGHTER_GROUND_Y } from '../constants/fighter.js'
import {
  getKeys,
  wasKeyJustPressed,
  updateInput
} from '../engine/InputHandler.js'
import { characterData, CHARACTERS } from '../config/characters.js'

export class CutsceneScene {
  constructor(cutsceneNumber, onCutsceneComplete) {
    this.cutsceneNumber = cutsceneNumber
    this.onCutsceneComplete = onCutsceneComplete
    this.dialogueIndex = 0
    this.isWaitingForInput = false

    // Initialize based on cutscene number
    this.initializeCutscene()
  }

  initializeCutscene() {
    if (this.cutsceneNumber === 1) {
      this.initializeCutscene01()
    } else if (this.cutsceneNumber === 2) {
      this.initializeCutscene02()
    } else if (this.cutsceneNumber === 3) {
      this.initializeCutscene03()
    } else if (this.cutsceneNumber === 4) {
      this.initializeCutscene04()
    } else if (this.cutsceneNumber === 5) {
      this.initializeCutscene05()
    } else if (this.cutsceneNumber === 6) {
      this.initializeCutscene06()
    } else if (this.cutsceneNumber === 7) {
      this.initializeCutscene07()
    } else if (this.cutsceneNumber === 8) {
      this.initializeCutscene08()
    } else if (this.cutsceneNumber === 9) {
      this.initializeCutscene09()
    } else if (this.cutsceneNumber === 10) {
      this.initializeCutscene10()
    }
  }

  initializeCutscene01() {
    // Background - Forest with shop
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: './img/forest.png'
    })

    // Shop sprite - positioned more to the right
    this.shop = new Sprite({
      position: { x: 600, y: 128 },
      imageSrc: './img/shop.png',
      scale: 2.75,
      framesMax: 6
    })
    
    // Cutscene 1 sound effect
    this.cutscene1Music = new Audio('./sfx/cutscene 1.mp3')
    this.cutscene1Music.loop = true
    this.cutscene1Music.volume = 0.7
    this.cutscene1MusicPlaying = false
    
    // Try to play music (may be blocked by autoplay policy)
    const playPromise = this.cutscene1Music.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.cutscene1MusicPlaying = true
        })
        .catch(() => {
          // Autoplay was prevented, will try again on user interaction
          this.cutscene1MusicPlaying = false
        })
    }

    // Kaen - positioned at right of view, facing right (towards shop)
    const kaenData = characterData[CHARACTERS.KAEN]
    this.kaen = new Fighter({
      position: { x: 800, y: FIGHTER_GROUND_Y },
      velocity: { x: 0, y: 0 },
      offset: kaenData.offset,
      attackBox: kaenData.attackBox,
      isPlayer: true
    })
    this.kaen.setSprites(kaenData.sprites)
    this.kaen.scale = kaenData.scale
    this.kaen.facingLeft = false // Face right (towards shop)
    this.kaen.flipped = false
    this.kaen.changeState(FighterState.IDLE)

    // Isabella - starts off-screen left, will run in
    const isabellaData = characterData[CHARACTERS.ISABELLA]
    this.isabella = new Fighter({
      position: { x: -200, y: FIGHTER_GROUND_Y }, // Start off-screen left
      velocity: { x: 0, y: 0 },
      offset: isabellaData.offset,
      attackBox: isabellaData.attackBox,
      isPlayer: false
    })
    this.isabella.setSprites(isabellaData.sprites)
    this.isabella.scale = isabellaData.scale
    this.isabella.facingLeft = false // Face right
    this.isabella.flipped = false

    // Cutscene state
    this.cutsceneState = 'isabellaEntering' // 'isabellaEntering', 'dialogue', 'kaenWalking', 'complete'
    this.isabellaTargetX = 200 // Where Isabella stops (near shop, left side)
    this.isabellaSpeed = 3.5
    this.kaenSpeed = 3.5
    this.kaenTargetX = 400 // Where Kaen stops (near Isabella, but not too close)

    // Dialogue sequence
    this.dialogue = [
      { speaker: 'ISABELLA', text: "You're staring at the forest again." },
      { speaker: 'KAEN', text: 'Someone has to watch the path.' },
      {
        speaker: 'ISABELLA',
        text: "Then promise you'll protect it by living.",
        emotion: 'smiles'
      },
      { speaker: 'KAEN', text: '...I promise.' }
    ]
  }

  initializeCutscene02() {
    // Background - Forest with shop (same as cutscene 1)
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: './img/forest.png'
    })

    // Shop sprite
    this.shop = new Sprite({
      position: { x: 600, y: 128 },
      imageSrc: './img/shop.png',
      scale: 2.75,
      framesMax: 6
    })
    
    // Cutscene 2 sound effect
    this.cutscene2Music = new Audio('./sfx/cutscene 2.mp3')
    this.cutscene2Music.loop = true
    this.cutscene2Music.volume = 0.7
    this.cutscene2MusicPlaying = false
    
    // Try to play music (may be blocked by autoplay policy)
    const playPromise = this.cutscene2Music.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.cutscene2MusicPlaying = true
        })
        .catch(() => {
          // Autoplay was prevented, will try again on user interaction
          this.cutscene2MusicPlaying = false
        })
    }

    // Kaen - respawn facing right (towards door/shop)
    const kaenData = characterData[CHARACTERS.KAEN]
    this.kaen = new Fighter({
      position: { x: 400, y: FIGHTER_GROUND_Y },
      velocity: { x: 0, y: 0 },
      offset: kaenData.offset,
      attackBox: kaenData.attackBox,
      isPlayer: true
    })
    this.kaen.setSprites(kaenData.sprites)
    this.kaen.scale = kaenData.scale
    this.kaen.facingLeft = false // Face right
    this.kaen.flipped = false
    this.kaen.changeState(FighterState.IDLE)

    // Isabella - positioned near shop, facing right
    const isabellaData = characterData[CHARACTERS.ISABELLA]
    this.isabella = new Fighter({
      position: { x: 200, y: FIGHTER_GROUND_Y },
      velocity: { x: 0, y: 0 },
      offset: isabellaData.offset,
      attackBox: isabellaData.attackBox,
      isPlayer: false
    })
    this.isabella.setSprites(isabellaData.sprites)
    this.isabella.scale = isabellaData.scale
    this.isabella.facingLeft = false // Face right
    this.isabella.flipped = false
    this.isabella.changeState(FighterState.IDLE)

    // Serena - starts off-screen right (door area), will enter
    const serenaData = characterData[CHARACTERS.SERENA]
    this.serena = new Fighter({
      position: { x: CANVAS_WIDTH + 200, y: FIGHTER_GROUND_Y }, // Start off-screen right
      velocity: { x: 0, y: 0 },
      offset: serenaData.offset,
      attackBox: serenaData.attackBox,
      isPlayer: false
    })
    this.serena.setSprites(serenaData.sprites)
    this.serena.scale = serenaData.scale
    this.serena.facingLeft = true // Face left (towards Kaen/Isabella)
    this.serena.flipped = true
    this.serena.changeState(FighterState.IDLE)

    // Kenji - starts behind Serena, will follow
    const kenjiData = characterData[CHARACTERS.KENJI]
    // Kenji uses Fighter2 class (needsInvertedFlip: true)
    this.kenji = new Fighter2({
      position: { x: CANVAS_WIDTH + 300, y: FIGHTER_GROUND_Y }, // Behind Serena
      velocity: { x: 0, y: 0 },
      offset: kenjiData.offset,
      attackBox: kenjiData.attackBox,
      isPlayer: false
    })
    this.kenji.setSprites(kenjiData.sprites)
    this.kenji.scale = kenjiData.scale
    this.kenji.facingLeft = true // Face left
    this.kenji.flipped = true
    this.kenji.changeState(FighterState.IDLE)

    // Cutscene state
    this.cutsceneState = 'serenaKenjiEntering' // 'serenaKenjiEntering', 'dialogue', 'serenaAttacking', 'isabellaFalling', 'complete'
    this.serenaTargetX = 700 // Where Serena stops
    this.kenjiTargetX = 800 // Where Kenji stops (behind Serena)
    this.serenaSpeed = 3
    this.kenjiSpeed = 3
    this.serenaAttackTimer = 0
    this.isabellaFalling = false

    // Projectiles for cutscene
    this.projectiles = []

    // Dialogue sequence
    this.dialogue = [
      { speaker: 'SERENA', text: 'So this is where fate hides.' },
      { speaker: 'KAEN', text: "We don't want trouble. Leave." },
      {
        speaker: 'SERENA',
        text: 'Trouble was born here.',
        emotion: 'eyes Isabella'
      },
      {
        speaker: 'ISABELLA',
        text: "You're afraid of the future.",
        emotion: 'calm'
      },
      { speaker: 'SERENA', text: "I don't fear children.", emotion: 'angry' },
      {
        speaker: 'KENJI',
        text: 'Lady Serena… are you certain?',
        emotion: 'hesitant'
      },
      { speaker: 'SERENA', text: "I'll do it." }
    ]
  }

  initializeCutscene03() {
    // Background - Forest with shop (same as previous cutscenes)
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: './img/forest.png'
    })

    // Shop sprite (could be burned version, but using same for now)
    this.shop = new Sprite({
      position: { x: 600, y: 128 },
      imageSrc: './img/shop.png',
      scale: 2.75,
      framesMax: 6
    })
    
    // Cutscene 3 sound effect
    this.cutscene3Music = new Audio('./sfx/cutscene 3.mp3')
    this.cutscene3Music.loop = true
    this.cutscene3Music.volume = 0.7
    this.cutscene3MusicPlaying = false
    
    // Try to play music (may be blocked by autoplay policy)
    const playPromise = this.cutscene3Music.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.cutscene3MusicPlaying = true
        })
        .catch(() => {
          // Autoplay was prevented, will try again on user interaction
          this.cutscene3MusicPlaying = false
        })
    }

    // Start with characters from cutscene 2 positions
    // Serena and Kenji - respawn facing right to walk out
    const serenaData = characterData[CHARACTERS.SERENA]
    this.serena = new Fighter({
      position: { x: 700, y: FIGHTER_GROUND_Y }, // Same position as cutscene 2
      velocity: { x: 0, y: 0 },
      offset: serenaData.offset,
      attackBox: serenaData.attackBox,
      isPlayer: false
    })
    this.serena.setSprites(serenaData.sprites)
    this.serena.scale = serenaData.scale
    this.serena.facingLeft = false // Face right (to walk out)
    this.serena.flipped = false
    this.serena.changeState(FighterState.IDLE)

    const kenjiData = characterData[CHARACTERS.KENJI]
    this.kenji = new Fighter2({
      position: { x: 800, y: FIGHTER_GROUND_Y }, // Same position as cutscene 2
      velocity: { x: 0, y: 0 },
      offset: kenjiData.offset,
      attackBox: kenjiData.attackBox,
      isPlayer: false
    })
    this.kenji.setSprites(kenjiData.sprites)
    this.kenji.scale = kenjiData.scale
    this.kenji.facingLeft = false // Face right (to walk out)
    this.kenji.flipped = false
    this.kenji.changeState(FighterState.IDLE)

    // Kaen and Isabella - spawn immediately with death sprite last frame (kneeling scene)
    const kaenData = characterData[CHARACTERS.KAEN]
    this.kaen = new Fighter({
      position: { x: 400, y: FIGHTER_GROUND_Y }, // Position near Isabella, facing left
      velocity: { x: 0, y: 0 },
      offset: kaenData.offset,
      attackBox: kaenData.attackBox,
      isPlayer: true
    })
    this.kaen.setSprites(kaenData.sprites)
    this.kaen.scale = kaenData.scale
    this.kaen.facingLeft = true // Face left (towards Isabella)
    this.kaen.flipped = true
    // Set to death sprite, last frame only (no animation)
    // Use switchSprite to properly set up the death sprite
    if (this.kaen.sprites.death) {
      this.kaen.switchSprite('death')
      // Immediately set to last frame (no animation)
      this.kaen.framesCurrent = this.kaen.sprites.death.framesMax - 1
      this.kaen.framesElapsed = 0 // Reset animation timer
    }
    this.kaen.currentState = FighterState.DEATH
    this.kaen.dead = true

    // Respawn Isabella - same position as cutscene 2, death sprite last frame
    const isabellaData = characterData[CHARACTERS.ISABELLA]
    this.isabella = new Fighter({
      position: { x: 200, y: FIGHTER_GROUND_Y }, // Same position as cutscene 2
      velocity: { x: 0, y: 0 },
      offset: isabellaData.offset,
      attackBox: isabellaData.attackBox,
      isPlayer: false
    })
    this.isabella.setSprites(isabellaData.sprites)
    this.isabella.scale = isabellaData.scale
    this.isabella.facingLeft = false // Keep original facing
    this.isabella.flipped = false
    // Set to death sprite, last frame only (no animation)
    // Use switchSprite to properly set up the death sprite
    if (this.isabella.sprites.death) {
      this.isabella.switchSprite('death')
      // Immediately set to last frame (no animation)
      this.isabella.framesCurrent = this.isabella.sprites.death.framesMax - 1
      this.isabella.framesElapsed = 0 // Reset animation timer
    }
    this.isabella.currentState = FighterState.DEATH
    this.isabella.dead = true

    // Cutscene state
    this.cutsceneState = 'serenaKenjiLeaving' // 'serenaKenjiLeaving', 'kaenKneeling', 'dialogue', 'complete'
    this.serenaSpeed = 3
    this.kenjiSpeed = 3
    this.dialogueTimer = 0

    // Dialogue sequence
    this.dialogue = [
      { speaker: 'KAEN', text: 'I swear…', emotion: 'whisper' },
      {
        speaker: 'KAEN',
        text: "If strength is the only language you understand… I'll learn it."
      }
    ]
  }

  initializeCutscene04() {
    // Start with black screen
    this.blackScreenTimer = 0
    this.blackScreenDuration = 120 // 2 seconds at 60fps

    // Background - will be set later (first flipped, then normal)
    this.background = null
    this.backgroundFlipped = false

    // Kaen - will spawn when needed
    this.kaen = null
    this.wakasa = null

    // Cutscene state
    this.cutsceneState = 'blackScreen' // 'blackScreen', 'kaenRunningFlipped', 'kaenRunningNormal', 'wakasaEnters', 'dialogue', 'complete'
    this.kaenSpeed = 5
    this.wakasaSpeed = 5
    this.dialogueIndex = 0
    this.isWaitingForInput = false

    // Dialogue sequence
    this.dialogue = [
      { speaker: 'WAKASA', text: 'You smell like revenge.' },
      { speaker: 'KAEN', text: 'I need power.' },
      { speaker: 'WAKASA', text: 'Power without control destroys everything.' },
      { speaker: 'KAEN', text: 'Then destroy me if I fail.' },
      { speaker: 'WAKASA', text: 'Show me your resolve.' }
    ]
    
    // Cutscene 4 sound effect
    this.cutscene4Music = new Audio('./sfx/cutscene 4.mp3')
    this.cutscene4Music.loop = true
    this.cutscene4Music.volume = 0.7
    this.cutscene4MusicPlaying = false
    
    // Try to play music (may be blocked by autoplay policy)
    const playPromise = this.cutscene4Music.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.cutscene4MusicPlaying = true
        })
        .catch(() => {
          // Autoplay was prevented, will try again on user interaction
          this.cutscene4MusicPlaying = false
        })
    }
  }

  update() {
    // Check input BEFORE updateInput() resets the flags
    const keys = getKeys()
    const enterPressed = keys['Enter']?.justPressed || false
    const spacePressed = keys[' ']?.justPressed || false
    const zPressed = keys['z']?.justPressed || keys['Z']?.justPressed || false

    updateInput()

    // Update background and shop
    if (this.background) {
      this.background.update()
    }
    if (this.shop) {
      this.shop.update()
    }

    // Update Wakasa for cutscene 4
    if (this.wakasa && this.cutsceneNumber === 4) {
      this.wakasa.update()
    }

    // Update Wakasa for cutscene 5
    if (this.wakasa && this.cutsceneNumber === 5) {
      // For cutscene 5, if Wakasa is in death state (kneeling), don't animate
      if (
        this.cutsceneState === 'dialogue' &&
        this.wakasa.currentState === FighterState.DEATH
      ) {
        // Lock to last frame of death sprite (kneeling pose)
        if (this.wakasa.sprites.death) {
          this.wakasa.framesCurrent = this.wakasa.sprites.death.framesMax - 1
        }
        // Don't call update() - just draw in draw() method
      } else {
        // Wakasa is standing, animate normally
        this.wakasa.update()
      }
    }

    // Update Kenji for cutscene 6
    if (this.kenji && this.cutsceneNumber === 6) {
      this.kenji.update()
    }

    // Update Serena for cutscene 8
    if (this.serena && this.cutsceneNumber === 8) {
      this.serena.update()
    }

    // Update Serena for cutscene 9 (animate death sprite once, then lock to last frame)
    if (this.serena && this.cutsceneNumber === 9) {
      // Check if death animation has reached the last frame
      if (
        this.serena.sprites.death &&
        this.serena.currentState === FighterState.DEATH
      ) {
        if (
          this.serena.framesCurrent >=
          this.serena.sprites.death.framesMax - 1
        ) {
          // Lock to last frame - stop animation
          this.serena.framesCurrent = this.serena.sprites.death.framesMax - 1
          this.serena.framesElapsed = 0 // Stop animation
          this.serena.dead = true // Lock state
          this.serena.draw() // Just draw, don't update
        } else {
          // Still animating - update normally
          this.serena.update()
        }
      } else {
        this.serena.update()
      }
    }

    // Update Kenji for cutscene 9
    if (this.kenji && this.cutsceneNumber === 9) {
      this.kenji.update()
    }

    // Update Kenji for cutscene 10 (animate death sprite)
    if (this.kenji && this.cutsceneNumber === 10) {
      // Check if death animation has reached the last frame
      if (
        this.kenji.sprites.death &&
        this.kenji.currentState === FighterState.DEATH
      ) {
        if (
          this.kenji.framesCurrent >=
          this.kenji.sprites.death.framesMax - 1
        ) {
          // Lock to last frame - stop animation
          this.kenji.framesCurrent = this.kenji.sprites.death.framesMax - 1
          this.kenji.framesElapsed = 0
          this.kenji.dead = true
          this.kenji.draw() // Just draw, don't update
        } else {
          // Still animating - update normally
          this.kenji.update()
        }
      } else {
        this.kenji.update()
      }
    }

    // Update Serena for cutscene 10 (animate death sprite, then dissolve)
    if (this.serena && this.cutsceneNumber === 10) {
      if (
        this.cutsceneState === 'serenaDissolving' ||
        this.cutsceneState === 'runningLeft' ||
        this.cutsceneState === 'runningNetherPortal' ||
        this.cutsceneState === 'runningRomasna' ||
        this.cutsceneState === 'runningSnowyEverest' ||
        this.cutsceneState === 'finalDialogue'
      ) {
        // After dissolving starts, don't update (just draw with opacity)
        if (
          this.serena.sprites.death &&
          this.serena.currentState === FighterState.DEATH
        ) {
          // Lock to last frame during dissolving
          if (
            this.serena.framesCurrent >=
            this.serena.sprites.death.framesMax - 1
          ) {
            this.serena.framesCurrent = this.serena.sprites.death.framesMax - 1
            this.serena.framesElapsed = 0
          }
        }
        this.serena.draw() // Draw with opacity in draw method
      } else {
        // Before dissolving, animate normally
        if (
          this.serena.sprites.death &&
          this.serena.currentState === FighterState.DEATH
        ) {
          if (
            this.serena.framesCurrent >=
            this.serena.sprites.death.framesMax - 1
          ) {
            // Lock to last frame
            this.serena.framesCurrent = this.serena.sprites.death.framesMax - 1
            this.serena.framesElapsed = 0
            this.serena.dead = true
            this.serena.draw()
          } else {
            this.serena.update()
          }
        } else {
          this.serena.update()
        }
      }
    }

    // Update Kenji for cutscene 7
    if (this.kenji && this.cutsceneNumber === 7) {
      if (
        this.cutsceneState === 'dialogue' &&
        this.kenji.currentState === FighterState.DEATH
      ) {
        // Lock to 4th frame during dialogue - don't update, just draw in draw()
        if (this.kenji.sprites.death) {
          this.kenji.framesCurrent = 3 // 4th frame (0-indexed)
        }
        // Don't call update() - will be drawn in draw() method
      } else if (this.cutsceneState === 'kenjiAnimates') {
        // Animate during kenjiAnimates state
        this.kenji.update()
      } else {
        // Other states (walkingToPortal, atPortal), update normally
        this.kenji.update()
      }
    }

    // Update characters
    if (this.kaen) {
      // For cutscene 3, don't animate (just draw last frame of death sprite)
      if (this.cutsceneNumber === 3) {
        // Lock to last frame and just draw (no animation)
        if (this.kaen.sprites.death) {
          this.kaen.framesCurrent = this.kaen.sprites.death.framesMax - 1
        }
        this.kaen.draw()
      } else {
        this.kaen.update()
      }
    }
    if (this.isabella) {
      // For cutscene 3, don't animate (just draw last frame of death sprite)
      if (this.cutsceneNumber === 3) {
        // Lock to last frame and just draw (no animation)
        if (this.isabella.sprites.death) {
          this.isabella.framesCurrent =
            this.isabella.sprites.death.framesMax - 1
        }
        this.isabella.draw()
      } else {
        this.isabella.update()
      }
    }
    if (this.serena) {
      this.serena.update()
    }
    if (this.kenji) {
      this.kenji.update()
    }
    if (this.wakasa) {
      this.wakasa.update()
    }

    // Update projectiles (for cutscene 2)
    if (this.cutsceneNumber === 2 && this.projectiles) {
      this.projectiles = this.projectiles.filter((projectile) => {
        if (projectile.active) {
          projectile.update()
          return true
        }
        return false
      })
    }

    // Try to play cutscene 1 music if not playing (for autoplay policy)
    if (this.cutsceneNumber === 1 && !this.cutscene1MusicPlaying) {
      const anyKeyPressed = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (anyKeyPressed) {
        const playPromise = this.cutscene1Music.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.cutscene1MusicPlaying = true
            })
            .catch(() => {
              // Still blocked, will try again later
            })
        }
      }
    }
    
    // Try to play cutscene 3 music if not playing (for autoplay policy)
    if (this.cutsceneNumber === 3 && !this.cutscene3MusicPlaying) {
      const anyKeyPressed = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (anyKeyPressed) {
        const playPromise = this.cutscene3Music.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.cutscene3MusicPlaying = true
            })
            .catch(() => {
              // Still blocked, will try again later
            })
        }
      }
    }
    
    // Try to play cutscene 2 music if not playing (for autoplay policy)
    if (this.cutsceneNumber === 2 && !this.cutscene2MusicPlaying) {
      const anyKeyPressed = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (anyKeyPressed) {
        const playPromise = this.cutscene2Music.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.cutscene2MusicPlaying = true
            })
            .catch(() => {
              // Still blocked, will try again later
            })
        }
      }
    }
    
    // Try to play cutscene 4 music if not playing (for autoplay policy)
    if (this.cutsceneNumber === 4 && !this.cutscene4MusicPlaying) {
      const anyKeyPressed = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (anyKeyPressed) {
        const playPromise = this.cutscene4Music.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.cutscene4MusicPlaying = true
            })
            .catch(() => {
              // Still blocked, will try again later
            })
        }
      }
    }
    
    // Try to play cutscene 8 music if not playing (for autoplay policy)
    if (this.cutsceneNumber === 8 && !this.cutscene8MusicPlaying) {
      const anyKeyPressed = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (anyKeyPressed) {
        const playPromise = this.cutscene8Music.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.cutscene8MusicPlaying = true
            })
            .catch(() => {
              // Still blocked, will try again later
            })
        }
      }
    }
    
    // Try to play cutscene 5 music if not playing (for autoplay policy)
    if (this.cutsceneNumber === 5 && !this.cutscene5MusicPlaying) {
      const anyKeyPressed = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (anyKeyPressed) {
        const playPromise = this.cutscene5Music.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.cutscene5MusicPlaying = true
            })
            .catch(() => {
              // Still blocked, will try again later
            })
        }
      }
    }
    
    // Try to play cutscene 6 music if not playing (for autoplay policy)
    if (this.cutsceneNumber === 6 && !this.cutscene6MusicPlaying) {
      const anyKeyPressed = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (anyKeyPressed) {
        const playPromise = this.cutscene6Music.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.cutscene6MusicPlaying = true
            })
            .catch(() => {
              // Still blocked, will try again later
            })
        }
      }
    }
    
    // Try to play cutscene 7 music if not playing (for autoplay policy)
    if (this.cutsceneNumber === 7 && !this.cutscene7MusicPlaying) {
      const anyKeyPressed = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (anyKeyPressed) {
        const playPromise = this.cutscene7Music.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.cutscene7MusicPlaying = true
            })
            .catch(() => {
              // Still blocked, will try again later
            })
        }
      }
    }
    
    // Try to play cutscene 9 music if not playing (for autoplay policy)
    if (this.cutsceneNumber === 9 && !this.cutscene9MusicPlaying) {
      const anyKeyPressed = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (anyKeyPressed) {
        const playPromise = this.cutscene9Music.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.cutscene9MusicPlaying = true
            })
            .catch(() => {
              // Still blocked, will try again later
            })
        }
      }
    }
    
    // Try to play cutscene 10 music if not playing (for autoplay policy)
    if (this.cutsceneNumber === 10 && !this.cutscene10MusicPlaying) {
      const anyKeyPressed = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (anyKeyPressed) {
        const playPromise = this.cutscene10Music.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.cutscene10MusicPlaying = true
            })
            .catch(() => {
              // Still blocked, will try again later
            })
        }
      }
    }
    
    // Handle cutscene state
    if (this.cutsceneNumber === 1) {
      this.updateCutscene01(enterPressed, spacePressed, zPressed)
    } else if (this.cutsceneNumber === 2) {
      this.updateCutscene02(enterPressed, spacePressed, zPressed)
    } else if (this.cutsceneNumber === 3) {
      this.updateCutscene03(enterPressed, spacePressed, zPressed)
    } else if (this.cutsceneNumber === 4) {
      this.updateCutscene04(enterPressed, spacePressed, zPressed)
    } else if (this.cutsceneNumber === 5) {
      this.updateCutscene05(enterPressed, spacePressed, zPressed)
    } else if (this.cutsceneNumber === 6) {
      this.updateCutscene06(enterPressed, spacePressed, zPressed)
    } else if (this.cutsceneNumber === 7) {
      this.updateCutscene07(enterPressed, spacePressed, zPressed)
    } else if (this.cutsceneNumber === 8) {
      this.updateCutscene08(enterPressed, spacePressed, zPressed)
    } else if (this.cutsceneNumber === 9) {
      this.updateCutscene09(enterPressed, spacePressed, zPressed)
    } else if (this.cutsceneNumber === 10) {
      this.updateCutscene10(enterPressed, spacePressed, zPressed)
    }
  }

  initializeCutscene10() {
    // Cutscene 10 - "After the Flame" - Final cutscene
    // Background - Nether Throne
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: './img/nether throne.png'
    })
    
    // Cutscene 10 sound effect
    this.cutscene10Music = new Audio('./sfx/cutscene 10.mp3')
    this.cutscene10Music.loop = true
    this.cutscene10Music.volume = 0.7
    this.cutscene10MusicPlaying = false
    
    // Try to play music (may be blocked by autoplay policy)
    const playPromise = this.cutscene10Music.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.cutscene10MusicPlaying = true
        })
        .catch(() => {
          // Autoplay was prevented, will try again on user interaction
          this.cutscene10MusicPlaying = false
        })
    }

    // Serena - same position as cutscene 8/9, animate death sprite
    const serenaData = characterData[CHARACTERS.SERENA]
    this.serena = new Fighter({
      position: { x: 700, y: FIGHTER_GROUND_Y }, // Floating, same position
      velocity: { x: 0, y: 0 },
      offset: serenaData.offset,
      attackBox: serenaData.attackBox,
      isPlayer: false
    })
    this.serena.setSprites(serenaData.sprites)
    this.serena.scale = serenaData.scale
    this.serena.facingLeft = true // Face left
    this.serena.flipped = true
    // Set to death sprite, start from beginning to animate
    if (this.serena.sprites.death) {
      this.serena.switchSprite('death')
      this.serena.framesCurrent = 0
      this.serena.framesElapsed = 0
    }
    this.serena.currentState = FighterState.DEATH
    this.serena.dead = false // Allow animation
    this.serenaOpacity = 1.0 // For dissolving effect

    // Kenji - to the right of Serena, animate death sprite
    const kenjiData = characterData[CHARACTERS.KENJI]
    this.kenji = new Fighter2({
      position: { x: 850, y: FIGHTER_GROUND_Y }, // To the right of Serena
      velocity: { x: 0, y: 0 },
      offset: kenjiData.offset,
      attackBox: kenjiData.attackBox,
      isPlayer: false
    })
    this.kenji.setSprites(kenjiData.sprites)
    this.kenji.scale = kenjiData.scale
    this.kenji.facingLeft = true // Face left
    this.kenji.flipped = true
    // Set to death sprite, start from beginning to animate
    if (this.kenji.sprites.death) {
      this.kenji.switchSprite('death')
      this.kenji.framesCurrent = 0
      this.kenji.framesElapsed = 0
    }
    this.kenji.currentState = FighterState.DEATH
    this.kenji.dead = false // Allow animation

    // Wakasa - at x: 300, idle
    const wakasaData = characterData[CHARACTERS.WAKASA]
    this.wakasa = new Fighter({
      position: { x: 300, y: FIGHTER_GROUND_Y },
      velocity: { x: 0, y: 0 },
      offset: wakasaData.offset,
      attackBox: wakasaData.attackBox,
      isPlayer: false
    })
    this.wakasa.setSprites(wakasaData.sprites)
    this.wakasa.scale = wakasaData.scale
    this.wakasa.facingLeft = false // Face right (towards Serena)
    this.wakasa.flipped = false
    this.wakasa.changeState(FighterState.IDLE)

    // Kaen - to the right of Wakasa, idle
    const kaenData = characterData[CHARACTERS.KAEN]
    this.kaen = new Fighter({
      position: { x: 450, y: FIGHTER_GROUND_Y }, // To the right of Wakasa
      velocity: { x: 0, y: 0 },
      offset: kaenData.offset,
      attackBox: kaenData.attackBox,
      isPlayer: true
    })
    this.kaen.setSprites(kaenData.sprites)
    this.kaen.scale = kaenData.scale
    this.kaen.facingLeft = false // Face right (towards Serena)
    this.kaen.flipped = false
    this.kaen.changeState(FighterState.IDLE)

    // Cutscene state
    this.cutsceneState = 'serenaDialogue' // 'serenaDialogue', 'serenaDissolving', 'runningLeft', 'runningNetherPortal', 'runningRomasna', 'runningSnowyEverest', 'atSnowyEverest', 'finalDialogue', 'blackScreen', 'complete'
    this.dialogueIndex = 0
    this.isWaitingForInput = true // Start with dialogue waiting for input
    this.serenaDissolveTimer = 0
    this.kaenSpeed = 5
    this.wakasaSpeed = 5
    this.currentBackgroundIndex = 0
    this.backgrounds = ['nether portal', 'romasna', 'snowy everest']
    this.atSnowyEverestTimer = 0
    this.blackScreenTimer = 0

    // Dialogue sequence
    this.dialogue = [
      { speaker: 'SERENA', text: 'The future still burns…' },
      { speaker: 'WAKASA', text: "Your path doesn't end with revenge." },
      { speaker: 'KENJI', text: 'Neither does mine.' },
      { speaker: 'KAEN', text: "I'll protect what's left." }
    ]
  }

  updateCutscene10(enterPressed, spacePressed, zPressed) {
    // Handle cutscene 10 states
    if (this.cutsceneState === 'serenaDialogue') {
      // Wait for input to advance dialogue (Serena's line)
      if (enterPressed || spacePressed || zPressed) {
        // After Serena's line (index 0), start dissolving
        this.cutsceneState = 'serenaDissolving'
        this.serenaDissolveTimer = 0
        // Lock Serena to last frame when dissolving starts
        if (this.serena && this.serena.sprites.death) {
          this.serena.framesCurrent = this.serena.sprites.death.framesMax - 1
          this.serena.dead = true
        }
      }
    } else if (this.cutsceneState === 'serenaDissolving') {
      // Reduce Serena's opacity gradually
      this.serenaDissolveTimer++
      this.serenaOpacity = Math.max(0, 1.0 - this.serenaDissolveTimer / 60) // Fade over 1 second

      if (this.serenaOpacity <= 0) {
        // Serena fully dissolved, Kaen and Wakasa run left
        this.cutsceneState = 'runningLeft'
        if (this.kaen) {
          this.kaen.changeState(FighterState.RUN)
        }
        if (this.wakasa) {
          this.wakasa.changeState(FighterState.RUN)
        }
      }
    } else if (this.cutsceneState === 'runningLeft') {
      // Kaen and Wakasa run to the left, out of frame
      if (this.kaen && this.kaen.position.x > -200) {
        this.kaen.velocity.x = -this.kaenSpeed
        this.kaen.facingLeft = true
        this.kaen.flipped = true
        this.kaen.changeState(FighterState.RUN)
      }

      if (this.wakasa && this.wakasa.position.x > -200) {
        this.wakasa.velocity.x = -this.wakasaSpeed
        this.wakasa.facingLeft = true
        this.wakasa.flipped = true
        this.wakasa.changeState(FighterState.RUN)
      }

      // When both have left, erase Serena and Kenji, then change to nether portal and respawn from right
      if (
        this.kaen &&
        this.kaen.position.x <= -200 &&
        this.wakasa &&
        this.wakasa.position.x <= -200
      ) {
        // Erase Serena and Kenji
        this.serena = null
        this.kenji = null
        this.currentBackgroundIndex = 0
        this.changeBackgroundAndRespawn('nether portal')
        this.cutsceneState = 'runningNetherPortal'
      }
    } else if (this.cutsceneState === 'runningNetherPortal') {
      // Run from right to left through nether portal
      if (this.kaen && this.kaen.position.x > -200) {
        this.kaen.velocity.x = -this.kaenSpeed
        this.kaen.changeState(FighterState.RUN)
      }

      if (this.wakasa && this.wakasa.position.x > -200) {
        this.wakasa.velocity.x = -this.wakasaSpeed
        this.wakasa.changeState(FighterState.RUN)
      }

      // When both have left, change to romasna and respawn from right
      if (
        this.kaen &&
        this.kaen.position.x <= -200 &&
        this.wakasa &&
        this.wakasa.position.x <= -200
      ) {
        this.currentBackgroundIndex = 1
        this.changeBackgroundAndRespawn('romasna')
        this.cutsceneState = 'runningRomasna'
      }
    } else if (this.cutsceneState === 'runningRomasna') {
      // Run from right to left through romasna
      if (this.kaen && this.kaen.position.x > -200) {
        this.kaen.velocity.x = -this.kaenSpeed
        this.kaen.changeState(FighterState.RUN)
      }

      if (this.wakasa && this.wakasa.position.x > -200) {
        this.wakasa.velocity.x = -this.wakasaSpeed
        this.wakasa.changeState(FighterState.RUN)
      }

      // When both have left, change to snowy everest and respawn from right
      if (
        this.kaen &&
        this.kaen.position.x <= -200 &&
        this.wakasa &&
        this.wakasa.position.x <= -200
      ) {
        this.currentBackgroundIndex = 2
        this.changeBackgroundAndRespawn('snowy everest')
        this.cutsceneState = 'runningSnowyEverest'
      }
    } else if (this.cutsceneState === 'runningSnowyEverest') {
      // Run from right to left through snowy everest
      if (this.kaen && this.kaen.position.x > 300) {
        // Middle is around 400
        this.kaen.velocity.x = -this.kaenSpeed
        this.kaen.changeState(FighterState.RUN)
      } else {
        // Kaen has reached middle, stop
        if (this.kaen) {
          this.kaen.velocity.x = 0
          this.kaen.position.x = 300 // Middle position
          this.kaen.changeState(FighterState.IDLE)
          // Face Wakasa (face left)
          this.kaen.facingLeft = false
          this.kaen.flipped = false
        }

        // Wakasa continues to middle
        if (this.wakasa && this.wakasa.position.x > 700) {
          this.wakasa.velocity.x = -this.wakasaSpeed
          this.wakasa.changeState(FighterState.RUN)
        } else {
          // Wakasa has reached position, stop
          if (this.wakasa) {
            this.wakasa.velocity.x = 0
            this.wakasa.position.x = 700 // To the left of Kaen
            this.wakasa.changeState(FighterState.IDLE)
            // Face Kaen (face right)
            this.wakasa.facingLeft = true
            this.wakasa.flipped = true
          }

          // Wait a moment, then start final dialogue
          this.atSnowyEverestTimer++
          if (this.atSnowyEverestTimer > 30) {
            this.cutsceneState = 'finalDialogue'
            this.dialogueIndex = 1 // Start from Wakasa's line (Serena's was already shown)
            this.isWaitingForInput = true
          }
        }
      }
    } else if (this.cutsceneState === 'finalDialogue') {
      // Wait for input to advance dialogue
      if (enterPressed || spacePressed || zPressed) {
        this.dialogueIndex++
        if (this.dialogueIndex >= this.dialogue.length) {
          // All dialogue complete, fade to black
          this.cutsceneState = 'blackScreen'
          this.blackScreenTimer = 0
        } else {
          this.isWaitingForInput = true
        }
      }
    } else if (this.cutsceneState === 'blackScreen') {
      // Black screen for 1 second
      this.blackScreenTimer++
      if (this.blackScreenTimer >= 60) {
        // 1 second at 60fps
        // Stop cutscene 10 music
        if (this.cutscene10MusicPlaying) {
          this.cutscene10Music.pause()
          this.cutscene10Music.currentTime = 0
          this.cutscene10MusicPlaying = false
        }
        this.cutsceneState = 'complete'
        if (this.onCutsceneComplete) {
          this.onCutsceneComplete()
        }
      }
    }
  }

  changeBackgroundAndRespawn(backgroundName) {
    // Change background
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: `./img/${backgroundName}.png`
    })

    // Respawn Kaen and Wakasa from right
    const kaenData = characterData[CHARACTERS.KAEN]
    this.kaen = new Fighter({
      position: { x: CANVAS_WIDTH + 200, y: FIGHTER_GROUND_Y },
      velocity: { x: 0, y: 0 },
      offset: kaenData.offset,
      attackBox: kaenData.attackBox,
      isPlayer: true
    })
    this.kaen.setSprites(kaenData.sprites)
    this.kaen.scale = kaenData.scale
    this.kaen.facingLeft = true // Face left (running left)
    this.kaen.flipped = true
    this.kaen.changeState(FighterState.RUN)

    const wakasaData = characterData[CHARACTERS.WAKASA]
    this.wakasa = new Fighter({
      position: { x: CANVAS_WIDTH + 100, y: FIGHTER_GROUND_Y }, // Slightly ahead of Kaen
      velocity: { x: 0, y: 0 },
      offset: wakasaData.offset,
      attackBox: wakasaData.attackBox,
      isPlayer: false
    })
    this.wakasa.setSprites(wakasaData.sprites)
    this.wakasa.scale = wakasaData.scale
    this.wakasa.facingLeft = true // Face left (running left)
    this.wakasa.flipped = true
    this.wakasa.changeState(FighterState.RUN)
  }

  initializeCutscene09() {
    // Cutscene 9 - "Broken Loyalty" - Serena wounded, Kenji returns
    // Background - Nether Throne
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: './img/nether throne.png'
    })
    
    // Cutscene 9 sound effect
    this.cutscene9Music = new Audio('./sfx/cutscene 9.mp3')
    this.cutscene9Music.loop = true
    this.cutscene9Music.volume = 0.7
    this.cutscene9MusicPlaying = false
    
    // Try to play music (may be blocked by autoplay policy)
    const playPromise = this.cutscene9Music.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.cutscene9MusicPlaying = true
        })
        .catch(() => {
          // Autoplay was prevented, will try again on user interaction
          this.cutscene9MusicPlaying = false
        })
    }

    // Serena - same position as cutscene 8, but animate death sprite
    const serenaData = characterData[CHARACTERS.SERENA]
    this.serena = new Fighter({
      position: { x: 700, y: FIGHTER_GROUND_Y }, // Floating, same as cutscene 8
      velocity: { x: 0, y: 0 },
      offset: serenaData.offset,
      attackBox: serenaData.attackBox,
      isPlayer: false
    })
    this.serena.setSprites(serenaData.sprites)
    this.serena.scale = serenaData.scale
    this.serena.facingLeft = true // Face left (towards others)
    this.serena.flipped = true
    // Set to death sprite, start from beginning to animate
    if (this.serena.sprites.death) {
      this.serena.switchSprite('death')
      this.serena.framesCurrent = 0 // Start from first frame
      this.serena.framesElapsed = 0
    }
    this.serena.currentState = FighterState.DEATH
    this.serena.dead = false // Allow animation

    // Kaen - closer to Serena (middle of view)
    const kaenData = characterData[CHARACTERS.KAEN]
    this.kaen = new Fighter({
      position: { x: 400, y: FIGHTER_GROUND_Y }, // Middle-left
      velocity: { x: 0, y: 0 },
      offset: kaenData.offset,
      attackBox: kaenData.attackBox,
      isPlayer: true
    })
    this.kaen.setSprites(kaenData.sprites)
    this.kaen.scale = kaenData.scale
    this.kaen.facingLeft = false // Face right (towards Serena)
    this.kaen.flipped = false
    this.kaen.changeState(FighterState.IDLE)

    // Wakasa - behind Kaen, closer to Serena
    const wakasaData = characterData[CHARACTERS.WAKASA]
    this.wakasa = new Fighter({
      position: { x: 300, y: FIGHTER_GROUND_Y }, // Behind Kaen, middle-left
      velocity: { x: 0, y: 0 },
      offset: wakasaData.offset,
      attackBox: wakasaData.attackBox,
      isPlayer: false
    })
    this.wakasa.setSprites(wakasaData.sprites)
    this.wakasa.scale = wakasaData.scale
    this.wakasa.facingLeft = false // Face right (towards Serena)
    this.wakasa.flipped = false
    this.wakasa.changeState(FighterState.IDLE)

    // Kenji - will run in from left
    this.kenji = null

    // Cutscene state
    this.cutsceneState = 'kenjiEnters' // 'kenjiEnters', 'dialogue', 'complete'
    this.kenjiSpeed = 5
    this.dialogueIndex = 0
    this.isWaitingForInput = false

    // Dialogue sequence
    this.dialogue = [
      { speaker: 'KENJI', text: 'This ends now.' },
      { speaker: 'SERENA', text: 'Traitor.' },
      { speaker: 'KENJI', text: 'No. Survivor.' }
    ]
  }

  updateCutscene09(enterPressed, spacePressed, zPressed) {
    // Handle cutscene 9 states
    if (this.cutsceneState === 'kenjiEnters') {
      // Spawn Kenji from left if not already spawned
      if (!this.kenji) {
        const kenjiData = characterData[CHARACTERS.KENJI]
        this.kenji = new Fighter2({
          position: { x: -200, y: FIGHTER_GROUND_Y },
          velocity: { x: 0, y: 0 },
          offset: kenjiData.offset,
          attackBox: kenjiData.attackBox,
          isPlayer: false
        })
        this.kenji.setSprites(kenjiData.sprites)
        this.kenji.scale = kenjiData.scale
        this.kenji.facingLeft = false // Face right (towards Serena)
        this.kenji.flipped = false
        this.kenji.changeState(FighterState.RUN)
      }

      // Move Kenji from left to x: 150
      if (this.kenji && this.kenji.position.x < 150) {
        this.kenji.velocity.x = this.kenjiSpeed
        this.kenji.changeState(FighterState.RUN)
      } else {
        // Kenji has reached position, stop
        if (this.kenji) {
          this.kenji.velocity.x = 0
          this.kenji.position.x = 150
          this.kenji.changeState(FighterState.IDLE)
        }

        // Start dialogue immediately when Kenji is in position
        this.cutsceneState = 'dialogue'
        this.isWaitingForInput = true
        this.dialogueIndex = 0
      }
    } else if (this.cutsceneState === 'dialogue') {
      // Wait for input to advance dialogue
      if (enterPressed || spacePressed || zPressed) {
        this.dialogueIndex++
        if (this.dialogueIndex >= this.dialogue.length) {
          // Dialogue complete, transition to next cutscene (no fight yet)
          // Don't stop music - let it continue into the fight
          this.cutsceneState = 'complete'
          if (this.onCutsceneComplete) {
            this.onCutsceneComplete()
          }
        } else {
          this.isWaitingForInput = true
        }
      }
    }
  }

  initializeCutscene08() {
    // Cutscene 8 - "The Witch's Throne" - Kaen and Wakasa run, then meet floating Serena
    // Start with netherland background (flipped)
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: './img/netherland.png',
      imageFlippedSrc: './img/flipped netherland.png' // Use pre-flipped image
    })
    this.background.flipped = true
    
    // Cutscene 8 sound effect
    this.cutscene8Music = new Audio('./sfx/cutscene 8.mp3')
    this.cutscene8Music.loop = true
    this.cutscene8Music.volume = 0.7
    this.cutscene8MusicPlaying = false
    
    // Try to play music (may be blocked by autoplay policy)
    const playPromise = this.cutscene8Music.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.cutscene8MusicPlaying = true
        })
        .catch(() => {
          // Autoplay was prevented, will try again on user interaction
          this.cutscene8MusicPlaying = false
        })
    }

    // Kaen - starts from left, runs right
    const kaenData = characterData[CHARACTERS.KAEN]
    this.kaen = new Fighter({
      position: { x: -200, y: FIGHTER_GROUND_Y },
      velocity: { x: 0, y: 0 },
      offset: kaenData.offset,
      attackBox: kaenData.attackBox,
      isPlayer: true
    })
    this.kaen.setSprites(kaenData.sprites)
    this.kaen.scale = kaenData.scale
    this.kaen.facingLeft = false // Face right
    this.kaen.flipped = false
    this.kaen.changeState(FighterState.RUN)

    // Wakasa - starts behind Kaen, runs right (same speed)
    const wakasaData = characterData[CHARACTERS.WAKASA]
    this.wakasa = new Fighter({
      position: { x: -300, y: FIGHTER_GROUND_Y }, // Behind Kaen
      velocity: { x: 0, y: 0 },
      offset: wakasaData.offset,
      attackBox: wakasaData.attackBox,
      isPlayer: false
    })
    this.wakasa.setSprites(wakasaData.sprites)
    this.wakasa.scale = wakasaData.scale
    this.wakasa.facingLeft = false // Face right
    this.wakasa.flipped = false
    this.wakasa.changeState(FighterState.RUN)

    // Serena - will spawn later (floating)
    this.serena = null

    // Cutscene state
    this.cutsceneState = 'runningNetherland' // 'runningNetherland', 'atThrone', 'serenaAppears', 'dialogue', 'complete'
    this.kaenSpeed = 5
    this.wakasaSpeed = 5 // Same speed as Kaen
    this.dialogueIndex = 0
    this.isWaitingForInput = false
    this.serenaAppearTimer = 0

    // Dialogue sequence
    this.dialogue = [
      { speaker: 'SERENA', text: "You've grown. Just like she would have." },
      { speaker: 'KAEN', text: 'You killed her because you were weak.' },
      { speaker: 'SERENA', text: 'I killed her because I survived.' },
      { speaker: 'WAKASA', text: 'Enough.' }
    ]
  }

  updateCutscene08(enterPressed, spacePressed, zPressed) {
    // Handle cutscene 8 states
    if (this.cutsceneState === 'runningNetherland') {
      // Move both Kaen and Wakasa to the right (same speed)
      if (this.kaen && this.kaen.position.x < CANVAS_WIDTH + 200) {
        this.kaen.velocity.x = this.kaenSpeed
        this.kaen.changeState(FighterState.RUN)
      }

      if (this.wakasa && this.wakasa.position.x < CANVAS_WIDTH + 200) {
        this.wakasa.velocity.x = this.wakasaSpeed // Same speed as Kaen
        this.wakasa.changeState(FighterState.RUN)
      }

      // When both have left the screen, change background and respawn them
      if (
        this.kaen &&
        this.kaen.position.x >= CANVAS_WIDTH + 200 &&
        this.wakasa &&
        this.wakasa.position.x >= CANVAS_WIDTH + 200
      ) {
        // Change background to nether throne
        this.background = new Sprite({
          position: { x: 0, y: 0 },
          imageSrc: './img/nether throne.png'
        })
        this.background.flipped = false // Normal (not flipped)

        // Respawn Kaen and Wakasa from left (at throne)
        const kaenData = characterData[CHARACTERS.KAEN]
        this.kaen = new Fighter({
          position: { x: 200, y: FIGHTER_GROUND_Y }, // Left side
          velocity: { x: 0, y: 0 },
          offset: kaenData.offset,
          attackBox: kaenData.attackBox,
          isPlayer: true
        })
        this.kaen.setSprites(kaenData.sprites)
        this.kaen.scale = kaenData.scale
        this.kaen.facingLeft = false // Face right (towards Serena)
        this.kaen.flipped = false
        this.kaen.changeState(FighterState.IDLE)

        const wakasaData = characterData[CHARACTERS.WAKASA]
        this.wakasa = new Fighter({
          position: { x: 100, y: FIGHTER_GROUND_Y }, // Behind Kaen, left side
          velocity: { x: 0, y: 0 },
          offset: wakasaData.offset,
          attackBox: wakasaData.attackBox,
          isPlayer: false
        })
        this.wakasa.setSprites(wakasaData.sprites)
        this.wakasa.scale = wakasaData.scale
        this.wakasa.facingLeft = false // Face right (towards Serena)
        this.wakasa.flipped = false
        this.wakasa.changeState(FighterState.IDLE)

        this.cutsceneState = 'atThrone'
        this.serenaAppearTimer = 0
      }
    } else if (this.cutsceneState === 'atThrone') {
      // Wait a moment, then Serena appears
      this.serenaAppearTimer++
      if (this.serenaAppearTimer > 30) {
        // Spawn Serena floating (not on ground)
        if (!this.serena) {
          const serenaData = characterData[CHARACTERS.SERENA]
          // Floating position - higher Y (above ground)
          const floatingY = FIGHTER_GROUND_Y // Float 100 pixels above ground
          this.serena = new Fighter({
            position: { x: 700, y: floatingY }, // Center-right, floating
            velocity: { x: 0, y: 0 },
            offset: serenaData.offset,
            attackBox: serenaData.attackBox,
            isPlayer: false
          })
          this.serena.setSprites(serenaData.sprites)
          this.serena.scale = serenaData.scale
          this.serena.facingLeft = true // Face left (towards Kaen and Wakasa)
          this.serena.flipped = true
          this.serena.changeState(FighterState.IDLE)
        }

        this.cutsceneState = 'serenaAppears'
        this.serenaAppearTimer = 0
      }
    } else if (this.cutsceneState === 'serenaAppears') {
      // Wait a moment before dialogue
      this.serenaAppearTimer++
      if (this.serenaAppearTimer > 30) {
        // Start dialogue
        this.cutsceneState = 'dialogue'
        this.isWaitingForInput = true
        this.dialogueIndex = 0
      }
    } else if (this.cutsceneState === 'dialogue') {
      // Wait for input to advance dialogue
      if (enterPressed || spacePressed || zPressed) {
        this.dialogueIndex++
        if (this.dialogueIndex >= this.dialogue.length) {
          // Dialogue complete, transition to next cutscene (no fight yet)
          // Don't stop music - let it continue into the fight
          this.cutsceneState = 'complete'
          if (this.onCutsceneComplete) {
            this.onCutsceneComplete()
          }
        } else {
          this.isWaitingForInput = true
        }
      }
    }
  }

  initializeCutscene07() {
    // Cutscene 7 - "Choice" - Kenji defeated, Kaen shows mercy, then walk to portal
    // Background - Nether Portal
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: './img/nether portal.png'
    })
    
    // Cutscene 7 sound effect
    this.cutscene7Music = new Audio('./sfx/cutscene 7.mp3')
    this.cutscene7Music.loop = true
    this.cutscene7Music.volume = 0.7
    this.cutscene7MusicPlaying = false
    
    // Try to play music (may be blocked by autoplay policy)
    const playPromise = this.cutscene7Music.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.cutscene7MusicPlaying = true
        })
        .catch(() => {
          // Autoplay was prevented, will try again on user interaction
          this.cutscene7MusicPlaying = false
        })
    }

    // Kenji - start in kneeling pose (death sprite 4th frame, index 3)
    const kenjiData = characterData[CHARACTERS.KENJI]
    this.kenji = new Fighter2({
      position: { x: 700, y: FIGHTER_GROUND_Y }, // Center position
      velocity: { x: 0, y: 0 },
      offset: kenjiData.offset,
      attackBox: kenjiData.attackBox,
      isPlayer: false
    })
    this.kenji.setSprites(kenjiData.sprites)
    this.kenji.scale = kenjiData.scale
    this.kenji.facingLeft = true // Face left (towards Kaen)
    this.kenji.flipped = true
    // Set to death sprite, 4th frame (index 3)
    if (this.kenji.sprites.death) {
      this.kenji.switchSprite('death')
      this.kenji.framesCurrent = 3 // 4th frame (0-indexed)
      this.kenji.framesElapsed = 0
    }
    this.kenji.currentState = FighterState.DEATH
    this.kenji.dead = true

    // Kaen - standing, facing Kenji
    const kaenData = characterData[CHARACTERS.KAEN]
    this.kaen = new Fighter({
      position: { x: 400, y: FIGHTER_GROUND_Y }, // Left of Kenji
      velocity: { x: 0, y: 0 },
      offset: kaenData.offset,
      attackBox: kaenData.attackBox,
      isPlayer: true
    })
    this.kaen.setSprites(kaenData.sprites)
    this.kaen.scale = kaenData.scale
    this.kaen.facingLeft = false // Face right (towards Kenji)
    this.kaen.flipped = false
    this.kaen.changeState(FighterState.IDLE)

    // Wakasa - standing, behind Kaen
    const wakasaData = characterData[CHARACTERS.WAKASA]
    this.wakasa = new Fighter({
      position: { x: 200, y: FIGHTER_GROUND_Y }, // Behind Kaen
      velocity: { x: 0, y: 0 },
      offset: wakasaData.offset,
      attackBox: wakasaData.attackBox,
      isPlayer: false
    })
    this.wakasa.setSprites(wakasaData.sprites)
    this.wakasa.scale = wakasaData.scale
    this.wakasa.facingLeft = false // Face right (towards Kenji)
    this.wakasa.flipped = false
    this.wakasa.changeState(FighterState.IDLE)

    // Cutscene state
    this.cutsceneState = 'dialogue' // 'dialogue', 'kenjiAnimates', 'walkingToPortal', 'atPortal', 'blackScreen', 'complete'
    this.dialogueIndex = 0
    this.isWaitingForInput = false
    this.kenjiAnimationTimer = 0
    this.walkingTimer = 0
    this.atPortalTimer = 0
    this.kaenSpeed = 3
    this.wakasaSpeed = 3

    // Dialogue sequence
    this.dialogue = [
      { speaker: 'KENJI', text: 'Finish it.' },
      { speaker: 'KAEN', text: 'No. Live with what you chose.' },
      { speaker: 'KENJI', text: '...Then I will.' }
    ]
  }

  updateCutscene07(enterPressed, spacePressed, zPressed) {
    // Handle cutscene 7 states
    if (this.cutsceneState === 'dialogue') {
      // Wait for input to advance dialogue
      if (enterPressed || spacePressed || zPressed) {
        this.dialogueIndex++
        if (this.dialogueIndex >= this.dialogue.length) {
          // All dialogue complete, Kenji animates to end frame
          this.cutsceneState = 'kenjiAnimates'
          this.kenjiAnimationTimer = 0
          // Allow Kenji to animate from frame 3 to end frame
          if (this.kenji && this.kenji.sprites.death) {
            this.kenji.dead = false // Allow animation
            this.kenji.framesCurrent = 3 // Start from 4th frame
            this.kenji.framesElapsed = 0
          }
        } else {
          this.isWaitingForInput = true
        }
      }
    } else if (this.cutsceneState === 'kenjiAnimates') {
      // Animate Kenji from 4th frame to end frame
      if (this.kenji && this.kenji.sprites.death) {
        this.kenji.update() // Animate death sprite

        // Check if reached end frame
        if (
          this.kenji.framesCurrent >=
          this.kenji.sprites.death.framesMax - 1
        ) {
          // Lock to end frame and stop
          this.kenji.framesCurrent = this.kenji.sprites.death.framesMax - 1
          this.kenji.framesElapsed = 0 // Stop animation
          this.kenji.dead = true // Lock state

          // Wait a moment, then start walking
          this.kenjiAnimationTimer++
          if (this.kenjiAnimationTimer > 30) {
            this.cutsceneState = 'walkingToPortal'
            this.walkingTimer = 0
          }
        }
      }
    } else if (this.cutsceneState === 'walkingToPortal') {
      // Kaen and Wakasa walk to portal (x=700)
      let kaenReached = false
      let wakasaReached = false

      // Move Kaen
      if (this.kaen && this.kaen.position.x < 700) {
        this.kaen.velocity.x = this.kaenSpeed
        this.kaen.changeState(FighterState.RUN)
      } else {
        if (this.kaen) {
          this.kaen.velocity.x = 0
          this.kaen.position.x = 700
          this.kaen.changeState(FighterState.IDLE)
        }
        kaenReached = true
      }

      // Move Wakasa
      if (this.wakasa && this.wakasa.position.x < 600) {
        // Slightly behind Kaen
        this.wakasa.velocity.x = this.wakasaSpeed
        this.wakasa.changeState(FighterState.RUN)
      } else {
        if (this.wakasa) {
          this.wakasa.velocity.x = 0
          this.wakasa.position.x = 600
          this.wakasa.changeState(FighterState.IDLE)
        }
        wakasaReached = true
      }

      // When both reach portal, wait 0.5 seconds
      if (kaenReached && wakasaReached) {
        this.cutsceneState = 'atPortal'
        this.atPortalTimer = 0
      }
    } else if (this.cutsceneState === 'atPortal') {
      // Wait 0.5 seconds at portal
      this.atPortalTimer++
      if (this.atPortalTimer >= 30) {
        // 0.5 seconds at 60fps
        this.cutsceneState = 'blackScreen'
        this.blackScreenTimer = 0
      }
    } else if (this.cutsceneState === 'blackScreen') {
      // Black screen
      this.blackScreenTimer++
      if (this.blackScreenTimer >= 30) {
        // 0.5 seconds at 60fps
        // Stop cutscene 7 music
        if (this.cutscene7MusicPlaying) {
          this.cutscene7Music.pause()
          this.cutscene7Music.currentTime = 0
          this.cutscene7MusicPlaying = false
        }
        this.cutsceneState = 'complete'
        if (this.onCutsceneComplete) {
          this.onCutsceneComplete()
        }
      }
    }
  }

  initializeCutscene06() {
    // Cutscene 6 - "Gate of Red" - Kaen and Wakasa run, then meet Kenji at Nether Portal
    // Start with romasna background
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: './img/romasna.png'
    })
    
    // Cutscene 6 sound effect
    this.cutscene6Music = new Audio('./sfx/cutscene 6.mp3')
    this.cutscene6Music.loop = true
    this.cutscene6Music.volume = 0.7
    this.cutscene6MusicPlaying = false
    
    // Try to play music (may be blocked by autoplay policy)
    const playPromise = this.cutscene6Music.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.cutscene6MusicPlaying = true
        })
        .catch(() => {
          // Autoplay was prevented, will try again on user interaction
          this.cutscene6MusicPlaying = false
        })
    }

    // Kaen - starts from left, runs right
    const kaenData = characterData[CHARACTERS.KAEN]
    this.kaen = new Fighter({
      position: { x: -200, y: FIGHTER_GROUND_Y },
      velocity: { x: 0, y: 0 },
      offset: kaenData.offset,
      attackBox: kaenData.attackBox,
      isPlayer: true
    })
    this.kaen.setSprites(kaenData.sprites)
    this.kaen.scale = kaenData.scale
    this.kaen.facingLeft = false // Face right
    this.kaen.flipped = false
    this.kaen.changeState(FighterState.RUN)

    // Wakasa - starts behind Kaen, runs right
    const wakasaData = characterData[CHARACTERS.WAKASA]
    this.wakasa = new Fighter({
      position: { x: -300, y: FIGHTER_GROUND_Y }, // Behind Kaen
      velocity: { x: 0, y: 0 },
      offset: wakasaData.offset,
      attackBox: wakasaData.attackBox,
      isPlayer: false
    })
    this.wakasa.setSprites(wakasaData.sprites)
    this.wakasa.scale = wakasaData.scale
    this.wakasa.facingLeft = false // Face right
    this.wakasa.flipped = false
    this.wakasa.changeState(FighterState.RUN)

    // Kenji - will spawn later
    this.kenji = null

    // Cutscene state
    this.cutsceneState = 'runningRomasna' // 'runningRomasna', 'atPortal', 'kenjiEnters', 'dialogue', 'complete'
    this.kaenSpeed = 5
    this.wakasaSpeed = 5
    this.kenjiSpeed = 5
    this.dialogueIndex = 0
    this.isWaitingForInput = false
    this.kenjiEnterTimer = 0

    // Dialogue sequence
    this.dialogue = [
      { speaker: 'KENJI', text: "You shouldn't have come." },
      { speaker: 'KAEN', text: 'You were there. You let her die.' },
      { speaker: 'KENJI', text: 'I was already dead before I met Serena.' },
      { speaker: 'WAKASA', text: 'Then die free.' }
    ]
  }

  updateCutscene06(enterPressed, spacePressed, zPressed) {
    // Handle cutscene 6 states
    if (this.cutsceneState === 'runningRomasna') {
      // Move both Kaen and Wakasa to the right
      if (this.kaen && this.kaen.position.x < CANVAS_WIDTH + 200) {
        this.kaen.velocity.x = this.kaenSpeed
        this.kaen.changeState(FighterState.RUN)
      }

      if (this.wakasa && this.wakasa.position.x < CANVAS_WIDTH + 200) {
        this.wakasa.velocity.x = this.wakasaSpeed
        this.wakasa.changeState(FighterState.RUN)
      }

      // When both have left the screen, change background and respawn them
      if (
        this.kaen &&
        this.kaen.position.x >= CANVAS_WIDTH + 200 &&
        this.wakasa &&
        this.wakasa.position.x >= CANVAS_WIDTH + 200
      ) {
        // Change background to nether portal
        this.background = new Sprite({
          position: { x: 0, y: 0 },
          imageSrc: './img/nether portal.png'
        })

        // Respawn Kaen and Wakasa from left (at portal)
        const kaenData = characterData[CHARACTERS.KAEN]
        this.kaen = new Fighter({
          position: { x: 200, y: FIGHTER_GROUND_Y }, // Left side of portal
          velocity: { x: 0, y: 0 },
          offset: kaenData.offset,
          attackBox: kaenData.attackBox,
          isPlayer: true
        })
        this.kaen.setSprites(kaenData.sprites)
        this.kaen.scale = kaenData.scale
        this.kaen.facingLeft = false // Face right (towards Kenji)
        this.kaen.flipped = false
        this.kaen.changeState(FighterState.IDLE)

        const wakasaData = characterData[CHARACTERS.WAKASA]
        this.wakasa = new Fighter({
          position: { x: 100, y: FIGHTER_GROUND_Y }, // Behind Kaen, left side
          velocity: { x: 0, y: 0 },
          offset: wakasaData.offset,
          attackBox: wakasaData.attackBox,
          isPlayer: false
        })
        this.wakasa.setSprites(wakasaData.sprites)
        this.wakasa.scale = wakasaData.scale
        this.wakasa.facingLeft = false // Face right (towards Kenji)
        this.wakasa.flipped = false
        this.wakasa.changeState(FighterState.IDLE)

        this.cutsceneState = 'atPortal'
        this.kenjiEnterTimer = 0
      }
    } else if (this.cutsceneState === 'atPortal') {
      // Wait a moment, then Kenji enters
      this.kenjiEnterTimer++
      if (this.kenjiEnterTimer > 30) {
        // Spawn Kenji from right
        if (!this.kenji) {
          const kenjiData = characterData[CHARACTERS.KENJI]
          this.kenji = new Fighter2({
            position: { x: CANVAS_WIDTH + 200, y: FIGHTER_GROUND_Y },
            velocity: { x: 0, y: 0 },
            offset: kenjiData.offset,
            attackBox: kenjiData.attackBox,
            isPlayer: false
          })
          this.kenji.setSprites(kenjiData.sprites)
          this.kenji.scale = kenjiData.scale
          this.kenji.facingLeft = true // Face left (towards Kaen and Wakasa)
          this.kenji.flipped = true
          this.kenji.changeState(FighterState.RUN)
        }

        this.cutsceneState = 'kenjiEnters'
      }
    } else if (this.cutsceneState === 'kenjiEnters') {
      // Move Kenji from right to center
      if (this.kenji && this.kenji.position.x > 700) {
        this.kenji.velocity.x = -this.kenjiSpeed // Move left
        this.kenji.changeState(FighterState.RUN)
      } else {
        // Kenji has reached position, stop
        if (this.kenji) {
          this.kenji.velocity.x = 0
          this.kenji.position.x = 700 // Center-right position
          this.kenji.changeState(FighterState.IDLE)
        }

        // Start dialogue immediately when Kenji is in position
        this.cutsceneState = 'dialogue'
        this.isWaitingForInput = true
        this.dialogueIndex = 0
      }
    } else if (this.cutsceneState === 'dialogue') {
      // Wait for input to advance dialogue
      if (enterPressed || spacePressed || zPressed) {
        this.dialogueIndex++
        if (this.dialogueIndex >= this.dialogue.length) {
          // Dialogue complete, transition to cutscene 7
          // Don't stop music - let it continue into the fight
          this.cutsceneState = 'complete'
          if (this.onCutsceneComplete) {
            this.onCutsceneComplete()
          }
        } else {
          this.isWaitingForInput = true
        }
      }
    }
  }

  updateCutscene05(enterPressed, spacePressed, zPressed) {
    // Handle cutscene 5 states
    if (this.cutsceneState === 'blackScreen') {
      // Show black screen for 0.5 seconds
      this.blackScreenTimer++
      if (this.blackScreenTimer >= this.blackScreenDuration) {
        // Black screen complete, initialize scene
        this.cutsceneState = 'sceneSetup'

        // Background - Snowy Everest
        this.background = new Sprite({
          position: { x: 0, y: 0 },
          imageSrc: './img/snowy everest.png'
        })

        // Kaen - standing, victorious (idle pose)
        const kaenData = characterData[CHARACTERS.KAEN]
        this.kaen = new Fighter({
          position: { x: 400, y: FIGHTER_GROUND_Y }, // Center-left position
          velocity: { x: 0, y: 0 },
          offset: kaenData.offset,
          attackBox: kaenData.attackBox,
          isPlayer: true
        })
        this.kaen.setSprites(kaenData.sprites)
        this.kaen.scale = kaenData.scale
        this.kaen.facingLeft = false // Face right (towards Wakasa)
        this.kaen.flipped = false
        this.kaen.changeState(FighterState.IDLE)

        // Wakasa - start in defeated/kneeling pose (death sprite last frame)
        const wakasaData = characterData[CHARACTERS.WAKASA]
        this.wakasa = new Fighter({
          position: { x: 700, y: FIGHTER_GROUND_Y }, // Center-right position
          velocity: { x: 0, y: 0 },
          offset: wakasaData.offset,
          attackBox: wakasaData.attackBox,
          isPlayer: false
        })
        this.wakasa.setSprites(wakasaData.sprites)
        this.wakasa.scale = wakasaData.scale
        this.wakasa.facingLeft = true // Face left (towards Kaen)
        this.wakasa.flipped = true
        // Set to death sprite, last frame only (kneeling/defeated pose)
        if (this.wakasa.sprites.death) {
          this.wakasa.switchSprite('death')
          this.wakasa.framesCurrent = this.wakasa.sprites.death.framesMax - 1
          this.wakasa.framesElapsed = 0
        }
        this.wakasa.currentState = FighterState.DEATH
        this.wakasa.dead = true

        // Start dialogue
        this.cutsceneState = 'dialogue'
        this.isWaitingForInput = true
        this.dialogueIndex = 0
      }
    } else if (this.cutsceneState === 'dialogue') {
      // Wait for input to advance dialogue
      if (enterPressed || spacePressed || zPressed) {
        this.dialogueIndex++
        if (this.dialogueIndex >= this.dialogue.length) {
          // All dialogue complete, Wakasa stands up
          this.cutsceneState = 'wakasaStands'
          this.wakasaStandingTimer = 0

          // Transition Wakasa from death sprite to idle (standing up)
          if (this.wakasa && this.wakasa.sprites.death) {
            // Animate from death last frame to idle
            this.wakasa.dead = false
            this.wakasa.currentState = FighterState.IDLE
            this.wakasa.switchSprite('idle')
            this.wakasa.framesCurrent = 0
            this.wakasa.framesElapsed = 0
          }
        } else {
          this.isWaitingForInput = true
        }
      }
    } else if (this.cutsceneState === 'wakasaStands') {
      // Wakasa stands up animation - ensure he stays in idle
      if (this.wakasa) {
        // Make sure Wakasa is in idle state
        if (this.wakasa.currentState !== FighterState.IDLE) {
          this.wakasa.changeState(FighterState.IDLE)
        }
        this.wakasa.update() // Update to animate idle sprite
      }

      this.wakasaStandingTimer++

      // After a moment, transition to next cutscene
      if (this.wakasaStandingTimer > 60) {
        // 1 second
        // Stop cutscene 5 music
        if (this.cutscene5MusicPlaying) {
          this.cutscene5Music.pause()
          this.cutscene5Music.currentTime = 0
          this.cutscene5MusicPlaying = false
        }
        this.cutsceneState = 'complete'
        if (this.onCutsceneComplete) {
          this.onCutsceneComplete()
        }
      }
    }
  }

  updateCutscene01(enterPressed, spacePressed, zPressed) {
    // Handle cutscene state
    if (this.cutsceneState === 'isabellaEntering') {
      // Move Isabella from left to target position
      if (this.isabella.position.x < this.isabellaTargetX) {
        this.isabella.velocity.x = this.isabellaSpeed
        this.isabella.changeState(FighterState.RUN)
      } else {
        // Isabella has reached target, stop and switch to idle
        this.isabella.velocity.x = 0
        this.isabella.position.x = this.isabellaTargetX
        this.isabella.changeState(FighterState.IDLE)
        this.cutsceneState = 'dialogue'
        this.isWaitingForInput = true
      }
    } else if (this.cutsceneState === 'dialogue') {
      // Wait for input to advance dialogue
      if (enterPressed || spacePressed || zPressed) {
        // After first dialogue (Isabella's first line), make Kaen walk
        if (this.dialogueIndex === 0) {
          // Isabella said first line, now Kaen walks towards her
          this.cutsceneState = 'kaenWalking'
          this.dialogueIndex++ // Move to next dialogue but don't show it yet
        } else {
          this.dialogueIndex++
          if (this.dialogueIndex >= this.dialogue.length) {
            // Dialogue complete, move to next cutscene or battle
            // Stop cutscene 1 music
            if (this.cutscene1MusicPlaying) {
              this.cutscene1Music.pause()
              this.cutscene1Music.currentTime = 0
              this.cutscene1MusicPlaying = false
            }
            this.cutsceneState = 'complete'
            if (this.onCutsceneComplete) {
              this.onCutsceneComplete()
            }
          } else {
            this.isWaitingForInput = true
          }
        }
      }
    } else if (this.cutsceneState === 'kaenWalking') {
      // Kaen walks towards Isabella
      if (this.kaen.position.x > this.kaenTargetX) {
        this.kaen.velocity.x = -this.kaenSpeed // Move left (towards Isabella)
        this.kaen.facingLeft = true // Face left while walking
        this.kaen.flipped = true
        this.kaen.changeState(FighterState.RUN)
      } else {
        // Kaen has reached target, stop and face Isabella
        this.kaen.velocity.x = 0
        this.kaen.position.x = this.kaenTargetX
        this.kaen.facingLeft = true // Face left (towards Isabella)
        this.kaen.flipped = true
        this.kaen.changeState(FighterState.IDLE)
        // Continue with dialogue
        this.cutsceneState = 'dialogue'
        this.isWaitingForInput = true
      }
    }
  }

  updateCutscene02(enterPressed, spacePressed, zPressed) {
    // Handle cutscene 2 states
    if (this.cutsceneState === 'serenaKenjiEntering') {
      // Move both Serena and Kenji together from right to target positions
      let serenaReached = false
      let kenjiReached = false

      // Move Serena
      if (this.serena.position.x > this.serenaTargetX) {
        this.serena.velocity.x = -this.serenaSpeed // Move left
        this.serena.changeState(FighterState.RUN)
      } else {
        // Serena has reached target, stop
        this.serena.velocity.x = 0
        this.serena.position.x = this.serenaTargetX
        this.serena.changeState(FighterState.IDLE)
        serenaReached = true
      }

      // Move Kenji
      if (this.kenji.position.x > this.kenjiTargetX) {
        this.kenji.velocity.x = -this.kenjiSpeed // Move left
        this.kenji.changeState(FighterState.RUN)
      } else {
        // Kenji has reached target, stop
        this.kenji.velocity.x = 0
        this.kenji.position.x = this.kenjiTargetX
        this.kenji.changeState(FighterState.IDLE)
        kenjiReached = true
      }

      // When both have reached their targets, start dialogue
      if (serenaReached && kenjiReached) {
        this.cutsceneState = 'dialogue'
        this.isWaitingForInput = true
      }
    } else if (this.cutsceneState === 'dialogue') {
      // Wait for input to advance dialogue
      if (enterPressed || spacePressed || zPressed) {
        this.dialogueIndex++
        if (this.dialogueIndex >= this.dialogue.length) {
          // All dialogue complete, Serena attacks
          this.cutsceneState = 'serenaAttacking'
          this.serenaAttackTimer = 0
        } else {
          this.isWaitingForInput = true
        }
      }
    } else if (this.cutsceneState === 'serenaAttacking') {
      // Serena performs attack animation
      this.serenaAttackTimer++
      if (this.serenaAttackTimer === 1) {
        // Start attack animation
        this.serena.changeState(FighterState.ATTACK2) // Use attack2 for magic attack
      } else if (this.serenaAttackTimer === 15) {
        // Spawn projectile when attack animation is at the right frame
        const serenaData = characterData[CHARACTERS.SERENA]
        if (serenaData.projectile) {
          const projectile = new SlashProjectile({
            position: {
              x: this.serena.position.x,
              y: this.serena.position.y
            },
            velocity: { x: -8, y: 0 }, // Moving left towards Isabella
            direction: 'left',
            projectileSprite: serenaData.projectile
          })
          this.projectiles.push(projectile)
        }
      } else if (this.serenaAttackTimer > 30) {
        // Check if projectile hit Isabella
        this.projectiles.forEach((projectile) => {
          if (
            projectile.active &&
            projectile.checkProjectileCollision(this.isabella)
          ) {
            // Attack hits Isabella
            this.cutsceneState = 'isabellaFalling'
            this.isabella.changeState(FighterState.TAKE_HIT)
            this.isabella.health = 0 // Set health to 0 to trigger death
            projectile.active = false
          }
        })

        // If projectile passed Isabella or went off screen, trigger hit anyway after delay
        if (
          this.serenaAttackTimer > 60 &&
          this.cutsceneState === 'serenaAttacking'
        ) {
          this.cutsceneState = 'isabellaFalling'
          this.isabella.changeState(FighterState.TAKE_HIT)
          this.isabella.health = 0
        }
      }
    } else if (this.cutsceneState === 'isabellaFalling') {
      // Isabella falls/dies
      if (this.isabella.currentState !== FighterState.DEATH) {
        // Trigger death state
        if (this.isabella.canTransitionTo(FighterState.DEATH)) {
          this.isabella.changeState(FighterState.DEATH)
          // Immediately set to last frame of death animation (no animation, just show final frame)
          if (this.isabella.sprites.death) {
            this.isabella.framesCurrent =
              this.isabella.sprites.death.framesMax - 1
            this.isabella.framesMax = this.isabella.sprites.death.framesMax
          }
        }
      } else {
        // Keep locked to last frame (prevent animation)
        if (this.isabella.sprites.death) {
          this.isabella.framesCurrent =
            this.isabella.sprites.death.framesMax - 1
        }
      }

      // Wait a bit, then show Isabella's last words
      this.serenaAttackTimer++
      if (this.serenaAttackTimer > 60) {
        // Show Isabella's last dialogue
        this.dialogue = [
          { speaker: 'ISABELLA', text: "Kaen… don't follow me into darkness…" }
        ]
        this.dialogueIndex = 0
        this.cutsceneState = 'isabellaLastWords'
        this.isWaitingForInput = true
      }
    } else if (this.cutsceneState === 'isabellaLastWords') {
      // Wait for input to continue after Isabella's last words
      if (enterPressed || spacePressed || zPressed) {
        // Stop cutscene 2 music
        if (this.cutscene2MusicPlaying) {
          this.cutscene2Music.pause()
          this.cutscene2Music.currentTime = 0
          this.cutscene2MusicPlaying = false
        }
        this.cutsceneState = 'complete'
        if (this.onCutsceneComplete) {
          this.onCutsceneComplete()
        }
      }
    }
  }

  updateCutscene03(enterPressed, spacePressed, zPressed) {
    // Handle cutscene 3 states
    if (this.cutsceneState === 'serenaKenjiLeaving') {
      // Move both Serena and Kenji to the right (out of view)
      let serenaGone = false
      let kenjiGone = false

      // Move Serena
      if (this.serena && this.serena.position.x < CANVAS_WIDTH + 200) {
        this.serena.velocity.x = this.serenaSpeed // Move right
        this.serena.changeState(FighterState.RUN)
      } else {
        // Serena has left the view, remove her
        if (this.serena) {
          this.serena = null
        }
        serenaGone = true
      }

      // Move Kenji
      if (this.kenji && this.kenji.position.x < CANVAS_WIDTH + 200) {
        this.kenji.velocity.x = this.kenjiSpeed // Move right
        this.kenji.changeState(FighterState.RUN)
      } else {
        // Kenji has left the view, remove him
        if (this.kenji) {
          this.kenji = null
        }
        kenjiGone = true
      }

      // When both have left, transition to kneeling scene
      if (serenaGone && kenjiGone) {
        // Kaen and Isabella are already spawned, just transition state
        this.cutsceneState = 'kaenKneeling'
        this.dialogueTimer = 0
      }
    } else if (this.cutsceneState === 'kaenKneeling') {
      // Keep Kaen and Isabella locked to last frame of death sprite
      if (this.kaen && this.kaen.sprites.death) {
        this.kaen.framesCurrent = this.kaen.sprites.death.framesMax - 1
      }
      if (this.isabella && this.isabella.sprites.death) {
        this.isabella.framesCurrent = this.isabella.sprites.death.framesMax - 1
      }

      // Wait a moment before showing dialogue
      this.dialogueTimer++
      if (this.dialogueTimer > 30) {
        this.cutsceneState = 'dialogue'
        this.isWaitingForInput = true
      }
    } else if (this.cutsceneState === 'dialogue') {
      // Wait for input to advance dialogue
      if (enterPressed || spacePressed || zPressed) {
        this.dialogueIndex++
        if (this.dialogueIndex >= this.dialogue.length) {
          // Dialogue complete, fade to black and end
          // Stop cutscene 3 music
          if (this.cutscene3MusicPlaying) {
            this.cutscene3Music.pause()
            this.cutscene3Music.currentTime = 0
            this.cutscene3MusicPlaying = false
          }
          this.cutsceneState = 'complete'
          if (this.onCutsceneComplete) {
            this.onCutsceneComplete()
          }
        } else {
          this.isWaitingForInput = true
        }
      }
    }
  }

  updateCutscene04(enterPressed, spacePressed, zPressed) {
    // Handle cutscene 4 states
    if (this.cutsceneState === 'blackScreen') {
      // Show black screen for 2 seconds
      this.blackScreenTimer++
      if (this.blackScreenTimer >= this.blackScreenDuration) {
        // Transition to Kaen running with flipped background
        this.cutsceneState = 'kaenRunningFlipped'
        this.background = new Sprite({
          position: { x: 0, y: 0 },
          imageSrc: './img/snowy everest.png',
          imageFlippedSrc: './img/flipped snowy everest.png' // Use pre-flipped image
        })
        this.background.flipped = true

        // Spawn Kaen from left
        const kaenData = characterData[CHARACTERS.KAEN]
        this.kaen = new Fighter({
          position: { x: -200, y: FIGHTER_GROUND_Y },
          velocity: { x: 0, y: 0 },
          offset: kaenData.offset,
          attackBox: kaenData.attackBox,
          isPlayer: true
        })
        this.kaen.setSprites(kaenData.sprites)
        this.kaen.scale = kaenData.scale
        this.kaen.facingLeft = false // Face right
        this.kaen.flipped = false
        this.kaen.changeState(FighterState.RUN)
      }
    } else if (this.cutsceneState === 'kaenRunningFlipped') {
      // Move Kaen to the right
      if (this.kaen && this.kaen.position.x < CANVAS_WIDTH + 200) {
        this.kaen.velocity.x = this.kaenSpeed
        this.kaen.changeState(FighterState.RUN)
      } else {
        // Kaen has left the frame, change background to normal and respawn Kaen
        this.cutsceneState = 'kaenRunningNormal'
        this.background = new Sprite({
          position: { x: 0, y: 0 },
          imageSrc: './img/snowy everest.png'
        })
        this.background.flipped = false // Normal (not flipped)

        // Respawn Kaen from left
        const kaenData = characterData[CHARACTERS.KAEN]
        this.kaen = new Fighter({
          position: { x: -200, y: FIGHTER_GROUND_Y },
          velocity: { x: 0, y: 0 },
          offset: kaenData.offset,
          attackBox: kaenData.attackBox,
          isPlayer: true
        })
        this.kaen.setSprites(kaenData.sprites)
        this.kaen.scale = kaenData.scale
        this.kaen.facingLeft = false // Face right
        this.kaen.flipped = false
        this.kaen.changeState(FighterState.RUN)
      }
    } else if (this.cutsceneState === 'kaenRunningNormal') {
      // Move Kaen to center, then stop
      if (this.kaen && this.kaen.position.x < 200) {
        this.kaen.velocity.x = this.kaenSpeed
        this.kaen.changeState(FighterState.RUN)
      } else {
        // Kaen has reached center, stop him
        if (this.kaen) {
          this.kaen.velocity.x = 0
          this.kaen.position.x = 200 // Center position
          this.kaen.changeState(FighterState.IDLE)
        }

        // Spawn Wakasa from right
        if (!this.wakasa) {
          const wakasaData = characterData[CHARACTERS.WAKASA]
          this.wakasa = new Fighter({
            position: { x: CANVAS_WIDTH + 200, y: FIGHTER_GROUND_Y },
            velocity: { x: 0, y: 0 },
            offset: wakasaData.offset,
            attackBox: wakasaData.attackBox,
            isPlayer: false
          })
          this.wakasa.setSprites(wakasaData.sprites)
          this.wakasa.scale = wakasaData.scale
          this.wakasa.facingLeft = true // Face left (towards Kaen)
          this.wakasa.flipped = true
          this.wakasa.changeState(FighterState.RUN)
        }

        this.cutsceneState = 'wakasaEnters'
      }
    } else if (this.cutsceneState === 'wakasaEnters') {
      // Move Wakasa from right to center
      if (this.wakasa && this.wakasa.position.x > 800) {
        this.wakasa.velocity.x = -this.wakasaSpeed // Move left
        this.wakasa.changeState(FighterState.RUN)
      } else {
        // Wakasa has reached position, stop
        if (this.wakasa) {
          this.wakasa.velocity.x = 0
          this.wakasa.position.x = 800 // Position to the right of Kaen
          this.wakasa.changeState(FighterState.IDLE)
        }

        // Start dialogue immediately when both are in position
        this.cutsceneState = 'dialogue'
        this.isWaitingForInput = true
        this.dialogueIndex = 0
      }
    } else if (this.cutsceneState === 'dialogue') {
      // Wait for input to advance dialogue
      if (enterPressed || spacePressed || zPressed) {
        this.dialogueIndex++
        if (this.dialogueIndex >= this.dialogue.length) {
          // Dialogue complete, transition to boss fight
          // Don't stop music - let it continue into the fight
          this.cutsceneState = 'complete'
          if (this.onCutsceneComplete) {
            this.onCutsceneComplete()
          }
        } else {
          this.isWaitingForInput = true
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

    // Draw shop
    if (this.shop) {
      this.shop.draw()
    }

    // Draw characters
    if (this.kaen) {
      this.kaen.draw()
    }
    if (this.isabella) {
      this.isabella.draw()
    }
    if (this.serena) {
      this.serena.draw()
    }
    if (this.kenji) {
      this.kenji.draw()
    }

    // Draw projectiles (for cutscene 2)
    if (this.cutsceneNumber === 2 && this.projectiles) {
      this.projectiles.forEach((projectile) => {
        if (projectile.active) {
          // Projectile draw is called in update, but we can call it here too if needed
        }
      })
    }

    // Draw black screen for cutscene 4, 5, 6, or 7
    if (
      (this.cutsceneNumber === 4 && this.cutsceneState === 'blackScreen') ||
      (this.cutsceneNumber === 5 && this.cutsceneState === 'blackScreen') ||
      (this.cutsceneNumber === 6 && this.cutsceneState === 'blackScreen') ||
      (this.cutsceneNumber === 7 && this.cutsceneState === 'blackScreen')
    ) {
      c.fillStyle = 'black'
      c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    }

    // Draw Wakasa for cutscene 4
    if (this.wakasa && this.cutsceneNumber === 4) {
      this.wakasa.draw()
    }

    // Draw Kaen and Wakasa for cutscene 5 (only if not in black screen state)
    if (this.cutsceneNumber === 5 && this.cutsceneState !== 'blackScreen') {
      if (this.kaen) {
        this.kaen.draw()
      }
      if (this.wakasa) {
        // Draw Wakasa - if in death state (kneeling), draw without animation
        if (
          this.cutsceneState === 'dialogue' &&
          this.wakasa.currentState === FighterState.DEATH
        ) {
          // Lock to last frame and draw
          if (this.wakasa.sprites.death) {
            this.wakasa.framesCurrent = this.wakasa.sprites.death.framesMax - 1
          }
        }
        this.wakasa.draw()
      }
    }

    // Draw Kaen, Wakasa, and Kenji for cutscene 6
    if (this.cutsceneNumber === 6) {
      if (this.kaen) {
        this.kaen.draw()
      }
      if (this.wakasa) {
        this.wakasa.draw()
      }
      if (this.kenji) {
        this.kenji.draw()
      }
    }

    // Draw Kaen, Wakasa, and Kenji for cutscene 7
    if (this.cutsceneNumber === 7 && this.cutsceneState !== 'blackScreen') {
      if (this.kaen) {
        this.kaen.draw()
      }
      if (this.wakasa) {
        this.wakasa.draw()
      }
      if (this.kenji) {
        // Kenji is drawn in update() for cutscene 7, but also draw here if needed
        if (
          this.cutsceneState !== 'dialogue' ||
          this.kenji.currentState !== FighterState.DEATH
        ) {
          this.kenji.draw()
        }
      }
    }

    // Draw Kaen, Wakasa, and Serena for cutscene 8
    if (this.cutsceneNumber === 8) {
      if (this.kaen) {
        this.kaen.draw()
      }
      if (this.wakasa) {
        this.wakasa.draw()
      }
      if (this.serena) {
        this.serena.draw()
      }
    }

    // Draw Kaen, Wakasa, Serena, and Kenji for cutscene 9
    if (this.cutsceneNumber === 9) {
      if (this.kaen) {
        this.kaen.draw()
      }
      if (this.wakasa) {
        this.wakasa.draw()
      }
      if (this.serena) {
        // Serena is drawn in update() when locked to last frame, but also draw here if needed
        if (
          this.serena.dead &&
          this.serena.currentState === FighterState.DEATH
        ) {
          // Lock to last frame and draw
          if (this.serena.sprites.death) {
            this.serena.framesCurrent = this.serena.sprites.death.framesMax - 1
          }
        }
        this.serena.draw()
      }
      if (this.kenji) {
        this.kenji.draw()
      }
    }

    // Draw Kaen, Wakasa, Serena, and Kenji for cutscene 10
    if (this.cutsceneNumber === 10) {
      if (this.kaen) {
        this.kaen.draw()
      }
      if (this.wakasa) {
        this.wakasa.draw()
      }
      if (this.serena) {
        // Draw Serena with opacity for dissolving effect
        c.save()
        c.globalAlpha = this.serenaOpacity || 1.0
        this.serena.draw()
        c.restore()
      }
      if (this.kenji) {
        // Kenji is drawn in update() when locked, but also draw here if needed
        if (this.kenji.dead && this.kenji.currentState === FighterState.DEATH) {
          if (this.kenji.sprites.death) {
            this.kenji.framesCurrent = this.kenji.sprites.death.framesMax - 1
          }
        }
        this.kenji.draw()
      }
    }

    // Draw black screen for cutscene 10
    if (this.cutsceneNumber === 10 && this.cutsceneState === 'blackScreen') {
      c.fillStyle = 'black'
      c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    }

    // Draw dialogue box if in dialogue state
    if (
      (this.cutsceneState === 'dialogue' ||
        this.cutsceneState === 'isabellaLastWords' ||
        this.cutsceneState === 'serenaDialogue' ||
        this.cutsceneState === 'finalDialogue') &&
      this.dialogueIndex < this.dialogue.length
    ) {
      this.drawDialogueBox(c)
    }

    // Draw Kenji for cutscene 7 during dialogue (locked to 4th frame)
    if (
      this.cutsceneNumber === 7 &&
      this.cutsceneState === 'dialogue' &&
      this.kenji &&
      this.kenji.currentState === FighterState.DEATH
    ) {
      if (this.kenji.sprites.death) {
        this.kenji.framesCurrent = 3 // 4th frame (0-indexed)
      }
      this.kenji.draw()
    }
  }

  initializeCutscene05() {
    // Cutscene 5 - "Judgment" - Start with black screen for 0.5 seconds
    this.background = null
    this.cutsceneState = 'blackScreen'
    this.blackScreenTimer = 0
    this.blackScreenDuration = 30 // 0.5 seconds at 60fps

    // Characters will be initialized after black screen
    this.kaen = null
    this.wakasa = null
    this.dialogueIndex = 0
    this.isWaitingForInput = false
    this.wakasaStandingTimer = 0

    // Dialogue sequence
    this.dialogue = [
      { speaker: 'WAKASA', text: 'You hesitated.' },
      { speaker: 'KAEN', text: "I won't lose myself." },
      { speaker: 'WAKASA', text: 'Good. I will walk with you.' }
    ]
    
    // Cutscene 5 sound effect
    this.cutscene5Music = new Audio('./sfx/cutscene 5.mp3')
    this.cutscene5Music.loop = true
    this.cutscene5Music.volume = 0.7
    this.cutscene5MusicPlaying = false
    
    // Try to play music (may be blocked by autoplay policy)
    const playPromise = this.cutscene5Music.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.cutscene5MusicPlaying = true
        })
        .catch(() => {
          // Autoplay was prevented, will try again on user interaction
          this.cutscene5MusicPlaying = false
        })
    }
  }

  drawDialogueBox(c) {
    const currentDialogue = this.dialogue[this.dialogueIndex]
    if (!currentDialogue) return

    // Dialogue box dimensions - positioned at top
    const boxWidth = CANVAS_WIDTH - 100
    const boxHeight = 150
    const boxX = 50
    const boxY = 50 // Top of screen

    // Draw dialogue box background
    c.fillStyle = 'rgba(0, 0, 0, 0.8)'
    c.fillRect(boxX, boxY, boxWidth, boxHeight)

    // Draw dialogue box border
    c.strokeStyle = 'white'
    c.lineWidth = 3
    c.strokeRect(boxX, boxY, boxWidth, boxHeight)

    // Draw speaker name
    c.fillStyle = 'yellow'
    c.font = '14px "Press Start 2P"'
    c.textAlign = 'left'
    c.fillText(currentDialogue.speaker, boxX + 20, boxY + 30)

    // Draw dialogue text
    c.fillStyle = 'white'
    c.font = '10px "Press Start 2P"'
    c.textAlign = 'left'

    // Word wrap for long text
    const maxWidth = boxWidth - 40
    const words = currentDialogue.text.split(' ')
    let line = ''
    let y = boxY + 60

    words.forEach((word) => {
      const testLine = line + word + ' '
      const metrics = c.measureText(testLine)
      if (metrics.width > maxWidth && line !== '') {
        c.fillText(line, boxX + 20, y)
        line = word + ' '
        y += 20
      } else {
        line = testLine
      }
    })
    c.fillText(line, boxX + 20, y)

    // Draw continue indicator
    c.fillStyle = 'white'
    c.font = '8px "Press Start 2P"'
    c.textAlign = 'right'
    c.fillText(
      'Press Enter or Space to continue',
      boxX + boxWidth - 20,
      boxY + boxHeight - 15
    )
  }
}
