// Battle Scene - Main game scene
import { Fighter } from '../entities/Fighter.js'
import { Fighter2 } from '../entities/Fighter2.js'
import { SlashProjectile } from '../entities/projectiles/SlashProjectile.js'
import { ChakraProjectile } from '../entities/projectiles/ChakraProjectile.js'
import { Sprite } from '../entities/Sprite.js'
import { getContext } from '../utils/context.js'
import { rectangularCollision } from '../utils/collisions.js'
import { FighterState, FighterAttackType, FIGHTER_RUN_SPEED } from '../constants/fighter.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { PLAYER1_CONTROLS, PLAYER2_CONTROLS } from '../constants/controls.js'
import { getKeys, wasKeyJustPressed, updateInput } from '../engine/InputHandler.js'
import { characterData, CHARACTERS } from '../config/characters.js'
import { AIController } from '../engine/AIController.js'
import { AI_DIFFICULTY } from '../constants/ai.js'

export class BattleScene {
  constructor(player1Character, player2Character, background = 'background', gameMode = null, difficulty = null, isBossFight = false) {
    this.player1 = null
    this.player2 = null
    this.player1Character = player1Character
    this.player2Character = player2Character
    this.backgroundName = background
    this.gameMode = gameMode
    this.difficulty = difficulty
    this.isBossFight = isBossFight
    this.aiController = null
    this.projectiles = {
      player1: [],
      player2: []
    }
    this.chakraProjectiles = {
      player1: [],
      player2: []
    }
    
    // Track previous states to detect state changes
    this.player1PreviousState = null
    this.player2PreviousState = null
    
    // Background sprites
    this.background = null
    this.shop = null
    
    // Projectile sound effects for Kaen, Kenji, and Wakasa
    this.projKkwSound = new Audio('./sfx/proj kkw.wav')
    this.projKkwSound.volume = 0.7
    
    // Basic attack sound effect for Kaen, Kenji, and Wakasa
    this.basicAttackSound = new Audio('./sfx/basic.wav')
    this.basicAttackSound.volume = 0.7
    
    // Ultimate sound effects for chakra projectiles
    this.ultKaenSound = new Audio('./sfx/ult kaen.wav')
    this.ultKaenSound.volume = 0.7
    this.ultWakasaSound = new Audio('./sfx/ult wakasa.wav')
    this.ultWakasaSound.volume = 0.7
    this.ultKenjiSound = new Audio('./sfx/ult kenji.wav')
    this.ultKenjiSound.volume = 0.7
    this.ultIsabellaSound = new Audio('./sfx/ult isabella.wav')
    this.ultIsabellaSound.volume = 0.7
    this.ultSerenaSound = new Audio('./sfx/ult serena.wav')
    this.ultSerenaSound.volume = 0.7
    
    // Projectile sound effects for Isabella and Serena
    this.projIsabellaSound = new Audio('./sfx/proj isabella.wav')
    this.projIsabellaSound.volume = 0.7
    this.projSerenaSound = new Audio('./sfx/proj serena.wav')
    this.projSerenaSound.volume = 0.7
    
    // Battles music - only for VS Computer mode (vsComputer), NOT for boss fights
    if ((this.gameMode === 'vsComputer' || this.gameMode === 'twoPlayer') && !this.isBossFight) {
      this.battlesMusic = new Audio('./sfx/battles.mp3')
      this.battlesMusic.loop = true
      this.battlesMusic.volume = 0.3
      this.battlesMusicPlaying = false
      
      // Try to play music on initialization
      this.battlesMusic.play().then(() => {
        this.battlesMusicPlaying = true
      }).catch(() => {
        this.battlesMusicPlaying = false
      })
    } else {
      this.battlesMusic = null
      this.battlesMusicPlaying = false
    }
    
    // Initialize fighters
    this.initializeFighters()
    this.initializeBackground()
  }

  initializeFighters() {
    const player1Data = characterData[this.player1Character]
    const player2Data = characterData[this.player2Character]
    
    // Create player 1 - use Fighter2 if character needs inverted flip, else Fighter
    const Player1Class = player1Data.needsInvertedFlip ? Fighter2 : Fighter
    this.player1 = new Player1Class({
      position: { x: 100, y: 0 },
      velocity: { x: 0, y: 0 },
      offset: player1Data.offset,
      attackBox: player1Data.attackBox,
      isPlayer: true
    })
    
    // Set sprites after creation
    this.player1.setSprites(player1Data.sprites)
    this.player1.scale = player1Data.scale
    
    // Create player 2 - use Fighter2 if character needs inverted flip, else Fighter
    const Player2Class = player2Data.needsInvertedFlip ? Fighter2 : Fighter
    this.player2 = new Player2Class({
      position: { x: 804, y: 0 },
      velocity: { x: 0, y: 0 },
      offset: player2Data.offset,
      attackBox: player2Data.attackBox,
      isPlayer: false
    })
    
    // Set sprites after creation
    this.player2.setSprites(player2Data.sprites)
    this.player2.scale = player2Data.scale
    
    // Set player 2 to face left initially (towards player 1)
    this.player2.facingLeft = true
    this.player2.flipped = true
    
    // Initialize AI controller if VS Computer mode
    if (this.gameMode === 'vsComputer' && this.difficulty) {
      // Map difficulty string to AI difficulty number
      let aiDifficultyNumber = AI_DIFFICULTY.MEDIUM // Default
      if (this.difficulty === 'easy') {
        aiDifficultyNumber = AI_DIFFICULTY.EASY
      } else if (this.difficulty === 'medium') {
        aiDifficultyNumber = AI_DIFFICULTY.MEDIUM
      } else if (this.difficulty === 'hard') {
        aiDifficultyNumber = AI_DIFFICULTY.HARD
      }
      
      this.aiController = new AIController(this.player2, this.player1, aiDifficultyNumber)
    }
  }

  initializeBackground() {
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: `./img/${this.backgroundName}.png`
    })
    
    // Shop sprite only appears when background.png is selected
    if (this.backgroundName === 'forest') {
    this.shop = new Sprite({
      position: { x: 600, y: 128 },
      imageSrc: './img/shop.png',
      scale: 2.75,
      framesMax: 6
    })
    } else {
      this.shop = null
    }
  }

  update(countdownActive = false) {
    const keys = getKeys()
    
    // Try to play battles music on user interaction if it wasn't playing (PVP mode only)
    if (this.battlesMusic && !this.battlesMusicPlaying) {
      const hasUserInteraction = Object.values(keys).some(key => key.justPressed || key.pressed)
      if (hasUserInteraction) {
        this.battlesMusic.play().then(() => {
          this.battlesMusicPlaying = true
        }).catch(() => {})
      }
    }
    
    // Update background
    this.background.update()
    if (this.shop) {
    this.shop.update()
    }
    
    // Ensure fighters exist before updating
    if (!this.player1 || !this.player2) {
      return
    }
    
    // During countdown, only update visuals, no input or collisions
    if (countdownActive) {
      // Ensure bot doesn't move during countdown - explicitly stop AI and reset state
      if (this.aiController) {
        // Don't call AI update during countdown
        this.player2.velocity.x = 0
        if (this.player2.currentState === FighterState.RUN || this.player2.currentState === FighterState.JUMP_START) {
          this.player2.changeState(FighterState.IDLE)
        }
        // Ensure player2 is in idle state during countdown
        if (this.player2.currentState !== FighterState.IDLE && 
            this.player2.currentState !== FighterState.DEATH &&
            this.player2.currentState !== FighterState.TAKE_HIT) {
          this.player2.changeState(FighterState.IDLE)
        }
      }
      // Update fighters for animation only (idle state)
      this.player1.update()
      this.player2.update()
      // Ensure fighters face each other during countdown
      this.updateFacingDirections()
      return
    }
    
    // Update player 1 input
    this.updatePlayer1Input(keys)
    
    // Update player 2 - either AI or human input
    // AI only moves after countdown finishes
    if (this.aiController) {
      // AI controls player 2 - only update if countdown is not active
      if (!countdownActive) {
        this.aiController.update(countdownActive)
      }
    } else {
      // Human controls player 2
      this.updatePlayer2Input(keys)
    }
    
    // Reset input flags
    updateInput()
    
    // Update fighters (this handles state machine updates)
    this.player1.update()
    this.player2.update()
    
    // Check for state changes to play basic attack sound
    // Player 1 just entered ATTACK1 state
    if (this.player1.currentState === FighterState.ATTACK1 && 
        this.player1PreviousState !== FighterState.ATTACK1) {
      // Play basic attack sound for Kaen, Kenji, or Wakasa
      if (this.player1Character === CHARACTERS.KAEN || 
          this.player1Character === CHARACTERS.KENJI || 
          this.player1Character === CHARACTERS.WAKASA) {
        this.basicAttackSound.currentTime = 0
        this.basicAttackSound.play().catch(() => {})
      }
    }
    
    // Player 2 just entered ATTACK1 state
    if (this.player2.currentState === FighterState.ATTACK1 && 
        this.player2PreviousState !== FighterState.ATTACK1) {
      // Play basic attack sound for Kaen, Kenji, or Wakasa
      if (this.player2Character === CHARACTERS.KAEN || 
          this.player2Character === CHARACTERS.KENJI || 
          this.player2Character === CHARACTERS.WAKASA) {
        this.basicAttackSound.currentTime = 0
        this.basicAttackSound.play().catch(() => {})
      }
    }
    
    // Update previous states for next frame
    this.player1PreviousState = this.player1.currentState
    this.player2PreviousState = this.player2.currentState
    
    // Handle projectile spawning
    this.handleProjectileSpawning()
    
    // Update projectiles
    this.updateProjectiles()
    
    // Handle collisions
    this.handleCollisions()
    
    // Update facing directions
    this.updateFacingDirections()
  }

  updatePlayer1Input(keys) {
    if (this.player1.dead) return
    
    // Don't update input during uninterruptible states (but allow defend to be held)
    const uninterruptibleStates = [
      FighterState.ATTACK1, 
      FighterState.ATTACK2, 
      FighterState.TAKE_HIT, 
      FighterState.DEATH,
      FighterState.CHARGING
    ]
    if (uninterruptibleStates.includes(this.player1.currentState)) {
      // Still allow releasing defend
      if (!keys[PLAYER1_CONTROLS.DEFEND]?.pressed && this.player1.currentState === FighterState.DEFEND) {
        this.player1.changeState(FighterState.IDLE)
      }
      return
    }
    
    // Reset velocity
    this.player1.velocity.x = 0
    
    // Can't move while defending
    if (this.player1.currentState === FighterState.DEFEND) {
      // Movement blocked while defending
    } else {
    // Movement - Left
    if (keys[PLAYER1_CONTROLS.LEFT]?.pressed) {
        this.player1.lastKey = PLAYER1_CONTROLS.LEFT
        if (this.player1.isOnGround()) {
          this.player1.velocity.x = -FIGHTER_RUN_SPEED
          if (this.player1.currentState === FighterState.IDLE) {
            this.player1.changeState(FighterState.RUN)
        }
      }
    }
    // Movement - Right
    else if (keys[PLAYER1_CONTROLS.RIGHT]?.pressed) {
        this.player1.lastKey = PLAYER1_CONTROLS.RIGHT
        if (this.player1.isOnGround()) {
          this.player1.velocity.x = FIGHTER_RUN_SPEED
          if (this.player1.currentState === FighterState.IDLE) {
            this.player1.changeState(FighterState.RUN)
        }
      }
    }
    // No horizontal movement
    else {
        if (this.player1.isOnGround() && this.player1.currentState === FighterState.RUN) {
          this.player1.changeState(FighterState.IDLE)
        }
      }
    }
    
    // Jump (only on key press, not hold)
    if (wasKeyJustPressed(PLAYER1_CONTROLS.JUMP) && this.player1.isOnGround() && 
        (this.player1.currentState === FighterState.IDLE || this.player1.currentState === FighterState.RUN)) {
      this.player1.changeState(FighterState.JUMP_START)
    }
    
    // Attack (Melee) - only on key press
    const player1Data = characterData[this.player1Character]
    if (wasKeyJustPressed(PLAYER1_CONTROLS.ATTACK) && 
        (this.player1.currentState === FighterState.IDLE || this.player1.currentState === FighterState.RUN) &&
        player1Data.hasMeleeAttack !== false) { // Check if character has melee attack enabled
      this.player1.attack()
    }
    
    // Ranged Attack - only on key press
    if (wasKeyJustPressed(PLAYER1_CONTROLS.RANGED_ATTACK) && 
        (this.player1.currentState === FighterState.IDLE || this.player1.currentState === FighterState.RUN)) {
      this.player1.rangedAttack()
    }
    
    // Charge Chakra - only on key press
    if (wasKeyJustPressed(PLAYER1_CONTROLS.CHARGE_CHAKRA) && !this.player1.isCharging) {
      this.player1.startChargingChakra()
    }
    
    // Unleash Chakra Attack - only on key press
    if (wasKeyJustPressed(PLAYER1_CONTROLS.UNLEASH_CHAKRA) && this.player1.chakra >= 3 &&
        (this.player1.currentState === FighterState.IDLE || this.player1.currentState === FighterState.RUN)) {
      this.player1.chakraAttack()
    }
    
    // Defend - hold to defend
    if (keys[PLAYER1_CONTROLS.DEFEND]?.pressed) {
      if (this.player1.canTransitionTo(FighterState.DEFEND) && 
          this.player1.currentState !== FighterState.DEFEND) {
        this.player1.changeState(FighterState.DEFEND)
      }
    } else {
      // Release defend - return to idle if defending
      if (this.player1.currentState === FighterState.DEFEND) {
        this.player1.changeState(FighterState.IDLE)
      }
    }
  }

  updatePlayer2Input(keys) {
    if (this.player2.dead) return
    
    // Don't update input during uninterruptible states (but allow defend to be held)
    const uninterruptibleStates = [
      FighterState.ATTACK1, 
      FighterState.ATTACK2, 
      FighterState.TAKE_HIT, 
      FighterState.DEATH,
      FighterState.CHARGING
    ]
    if (uninterruptibleStates.includes(this.player2.currentState)) {
      // Still allow releasing defend
      if (!keys[PLAYER2_CONTROLS.DEFEND]?.pressed && this.player2.currentState === FighterState.DEFEND) {
        this.player2.changeState(FighterState.IDLE)
      }
      return
    }
    
    // Reset velocity
    this.player2.velocity.x = 0
    
    // Can't move while defending
    if (this.player2.currentState === FighterState.DEFEND) {
      // Movement blocked while defending
    } else {
      // Movement - Left
      if (keys[PLAYER2_CONTROLS.LEFT]?.pressed) {
        this.player2.lastKey = PLAYER2_CONTROLS.LEFT
        if (this.player2.isOnGround()) {
          this.player2.velocity.x = -FIGHTER_RUN_SPEED
          if (this.player2.currentState === FighterState.IDLE) {
            this.player2.changeState(FighterState.RUN)
          }
        }
      }
      // Movement - Right
      else if (keys[PLAYER2_CONTROLS.RIGHT]?.pressed) {
        this.player2.lastKey = PLAYER2_CONTROLS.RIGHT
        if (this.player2.isOnGround()) {
          this.player2.velocity.x = FIGHTER_RUN_SPEED
          if (this.player2.currentState === FighterState.IDLE) {
            this.player2.changeState(FighterState.RUN)
          }
        }
      }
      // No horizontal movement
      else {
        if (this.player2.isOnGround() && this.player2.currentState === FighterState.RUN) {
          this.player2.changeState(FighterState.IDLE)
        }
      }
    }
    
    // Jump (only on key press, not hold)
    if (wasKeyJustPressed(PLAYER2_CONTROLS.JUMP) && this.player2.isOnGround() && 
        (this.player2.currentState === FighterState.IDLE || this.player2.currentState === FighterState.RUN)) {
      this.player2.changeState(FighterState.JUMP_START)
    }
    
    // Attack (Melee) - only on key press
    const player2Data = characterData[this.player2Character]
    if (wasKeyJustPressed(PLAYER2_CONTROLS.ATTACK) && 
        (this.player2.currentState === FighterState.IDLE || this.player2.currentState === FighterState.RUN) &&
        player2Data.hasMeleeAttack !== false) { // Check if character has melee attack enabled
      this.player2.attack()
    }
    
    // Ranged Attack - only on key press
    if (wasKeyJustPressed(PLAYER2_CONTROLS.RANGED_ATTACK) && 
        (this.player2.currentState === FighterState.IDLE || this.player2.currentState === FighterState.RUN)) {
      this.player2.rangedAttack()
    }
    
    // Charge Chakra - only on key press
    if (wasKeyJustPressed(PLAYER2_CONTROLS.CHARGE_CHAKRA) && !this.player2.isCharging) {
      this.player2.startChargingChakra()
    }
    
    // Unleash Chakra Attack - only on key press
    if (wasKeyJustPressed(PLAYER2_CONTROLS.UNLEASH_CHAKRA) && this.player2.chakra >= 3 &&
        (this.player2.currentState === FighterState.IDLE || this.player2.currentState === FighterState.RUN)) {
      this.player2.chakraAttack()
    }
    
    // Defend - hold to defend
    if (keys[PLAYER2_CONTROLS.DEFEND]?.pressed) {
      if (this.player2.canTransitionTo(FighterState.DEFEND) && 
          this.player2.currentState !== FighterState.DEFEND) {
        this.player2.changeState(FighterState.DEFEND)
      }
    } else {
      // Release defend - return to idle if defending
      if (this.player2.currentState === FighterState.DEFEND) {
        this.player2.changeState(FighterState.IDLE)
      }
    }
  }

  handleProjectileSpawning() {
    // Player 1 projectiles
    if (this.player1.isAttacking && 
        this.player1.currentState === FighterState.ATTACK2 && 
        this.player1.framesCurrent === 4 && 
        this.player1.pendingProjectile) {
      
      const direction = this.player1.flipped ? 'left' : 'right'
      const velocity = this.player1.flipped ? -10 : 10
      
      const mirroredOffsetX = this.player1.flipped
        ? -this.player1.attackBox.offset.x - this.player1.attackBox.width
        : this.player1.attackBox.offset.x
      const attackBoxX = this.player1.position.x + mirroredOffsetX
      const attackBoxY = this.player1.position.y + this.player1.attackBox.offset.y
      
      const startX = this.player1.flipped
        ? attackBoxX + 20
        : attackBoxX + this.player1.attackBox.width + 20
      const startY = attackBoxY + (this.player1.attackBox.height / 2) - 20
      
      if (this.player1.pendingProjectile === FighterAttackType.RANGED) {
        const player1Data = characterData[this.player1Character]
        // Play projectile sound based on character
        if (this.player1Character === CHARACTERS.KAEN || 
            this.player1Character === CHARACTERS.KENJI || 
            this.player1Character === CHARACTERS.WAKASA) {
          this.projKkwSound.currentTime = 0
          this.projKkwSound.play().catch(() => {})
        } else if (this.player1Character === CHARACTERS.ISABELLA) {
          this.projIsabellaSound.currentTime = 0
          this.projIsabellaSound.play().catch(() => {})
        } else if (this.player1Character === CHARACTERS.SERENA) {
          this.projSerenaSound.currentTime = 0
          this.projSerenaSound.play().catch(() => {})
        }
        this.projectiles.player1.push(
          new SlashProjectile({
            position: { x: startX, y: startY },
            velocity: { x: velocity, y: 0 },
            direction: direction,
            projectileSprite: player1Data.projectile
          })
        )
      } else if (this.player1.pendingProjectile === FighterAttackType.CHAKRA) {
        const playerVisualY = this.player1.position.y - this.player1.offset.y
        const playerHeight = this.player1.height * this.player1.scale
        const player1Data = characterData[this.player1Character]
        
        // Play ultimate sound for chakra projectiles based on character
        if (this.player1Character === CHARACTERS.KAEN) {
          this.ultKaenSound.currentTime = 0
          this.ultKaenSound.play().catch(() => {})
        } else if (this.player1Character === CHARACTERS.WAKASA) {
          this.ultWakasaSound.currentTime = 0
          this.ultWakasaSound.play().catch(() => {})
        } else if (this.player1Character === CHARACTERS.KENJI) {
          this.ultKenjiSound.currentTime = 0
          this.ultKenjiSound.play().catch(() => {})
        } else if (this.player1Character === CHARACTERS.ISABELLA) {
          this.ultIsabellaSound.currentTime = 0
          this.ultIsabellaSound.play().catch(() => {})
        } else if (this.player1Character === CHARACTERS.SERENA) {
          this.ultSerenaSound.currentTime = 0
          this.ultSerenaSound.play().catch(() => {})
        }
        
        this.chakraProjectiles.player1.push(
          new ChakraProjectile({
            position: { x: startX - 20, y: playerVisualY },
            velocity: { x: velocity * 1.2, y: 0 },
            direction: direction,
            height: playerHeight,
            chakraProjectileSprite: player1Data.chakraProjectile
          })
        )
      }
      
      this.player1.pendingProjectile = null
    }
    
    // Player 2 projectiles
    if (this.player2.isAttacking && 
        this.player2.currentState === FighterState.ATTACK2 && 
        this.player2.framesCurrent === 4 && 
        this.player2.pendingProjectile) {
      
      const direction = this.player2.flipped ? 'left' : 'right'
      const velocity = this.player2.flipped ? -10 : 10
      
      const mirroredOffsetX = this.player2.flipped
        ? -this.player2.attackBox.offset.x - this.player2.attackBox.width
        : this.player2.attackBox.offset.x
      const attackBoxX = this.player2.position.x + mirroredOffsetX
      const attackBoxY = this.player2.position.y + this.player2.attackBox.offset.y
      
      const startX = this.player2.flipped
        ? attackBoxX + 20
        : attackBoxX + this.player2.attackBox.width + 20
      const startY = attackBoxY + (this.player2.attackBox.height / 2) - 20
      
      if (this.player2.pendingProjectile === FighterAttackType.RANGED) {
        const player2Data = characterData[this.player2Character]
        // Play projectile sound based on character
        if (this.player2Character === CHARACTERS.KAEN || 
            this.player2Character === CHARACTERS.KENJI || 
            this.player2Character === CHARACTERS.WAKASA) {
          this.projKkwSound.currentTime = 0
          this.projKkwSound.play().catch(() => {})
        } else if (this.player2Character === CHARACTERS.ISABELLA) {
          this.projIsabellaSound.currentTime = 0
          this.projIsabellaSound.play().catch(() => {})
        } else if (this.player2Character === CHARACTERS.SERENA) {
          this.projSerenaSound.currentTime = 0
          this.projSerenaSound.play().catch(() => {})
        }
        this.projectiles.player2.push(
          new SlashProjectile({
            position: { x: startX, y: startY },
            velocity: { x: velocity, y: 0 },
            direction: direction,
            projectileSprite: player2Data.projectile
          })
        )
      } else if (this.player2.pendingProjectile === FighterAttackType.CHAKRA) {
        const playerVisualY = this.player2.position.y - this.player2.offset.y
        const playerHeight = this.player2.height * this.player2.scale
        const player2Data = characterData[this.player2Character]
        
        // Play ultimate sound for chakra projectiles based on character
        if (this.player2Character === CHARACTERS.KAEN) {
          this.ultKaenSound.currentTime = 0
          this.ultKaenSound.play().catch(() => {})
        } else if (this.player2Character === CHARACTERS.WAKASA) {
          this.ultWakasaSound.currentTime = 0
          this.ultWakasaSound.play().catch(() => {})
        } else if (this.player2Character === CHARACTERS.KENJI) {
          this.ultKenjiSound.currentTime = 0
          this.ultKenjiSound.play().catch(() => {})
        } else if (this.player2Character === CHARACTERS.ISABELLA) {
          this.ultIsabellaSound.currentTime = 0
          this.ultIsabellaSound.play().catch(() => {})
        } else if (this.player2Character === CHARACTERS.SERENA) {
          this.ultSerenaSound.currentTime = 0
          this.ultSerenaSound.play().catch(() => {})
        }
        
        this.chakraProjectiles.player2.push(
          new ChakraProjectile({
            position: { x: startX - 20, y: playerVisualY },
            velocity: { x: velocity * 1.2, y: 0 },
            direction: direction,
            height: playerHeight,
            chakraProjectileSprite: player2Data.chakraProjectile
          })
        )
      }
      
      this.player2.pendingProjectile = null
    }
  }

  updateProjectiles() {
    // Update player1 projectiles (without drawing - draw happens in draw method)
    this.projectiles.player1 = this.projectiles.player1.filter(projectile => {
      if (!projectile.active) return false
      projectile.updatePosition()
      projectile.animateFrames()
      
      if (!this.player2.dead && projectile.checkProjectileCollision(this.player2)) {
        this.player2.takeHit(10) // Reduced damage to match melee
        projectile.active = false
        this.updateHealthBar('player2')
        return false
      }
      
      return projectile.active
    })
    
    // Update player1 chakra projectiles
    this.chakraProjectiles.player1 = this.chakraProjectiles.player1.filter(projectile => {
      if (!projectile.active) return false
      projectile.updatePosition()
      
      if (!this.player2.dead && projectile.checkCollision(this.player2)) {
        // Chakra attack deals 80 damage total (4x normal)
        this.player2.takeHit(80)
        projectile.active = false
        this.updateHealthBar('player2')
        return false
      }
      
      return projectile.active
    })
    
    // Update player2 projectiles
    this.projectiles.player2 = this.projectiles.player2.filter(projectile => {
      if (!projectile.active) return false
      projectile.updatePosition()
      projectile.animateFrames()
      
      if (!this.player1.dead && projectile.checkProjectileCollision(this.player1)) {
        this.player1.takeHit(10) // Reduced damage to match melee
        projectile.active = false
        this.updateHealthBar('player1')
        return false
      }
      
      return projectile.active
    })
    
    // Update player2 chakra projectiles
    this.chakraProjectiles.player2 = this.chakraProjectiles.player2.filter(projectile => {
      if (!projectile.active) return false
      projectile.updatePosition()
      
      if (!this.player1.dead && projectile.checkCollision(this.player1)) {
        // Chakra attack deals 80 damage total (4x normal)
        this.player1.takeHit(80)
        projectile.active = false
        this.updateHealthBar('player1')
        return false
      }
      
      return projectile.active
    })
  }
  
  drawProjectiles() {
    // Draw player1 projectiles
    this.projectiles.player1.forEach(projectile => {
      if (projectile.active) {
        projectile.draw()
      }
    })
    
    // Draw player1 chakra projectiles
    this.chakraProjectiles.player1.forEach(projectile => {
      if (projectile.active) {
        projectile.draw()
      }
    })
    
    // Draw player2 projectiles
    this.projectiles.player2.forEach(projectile => {
      if (projectile.active) {
        projectile.draw()
      }
    })
    
    // Draw player2 chakra projectiles
    this.chakraProjectiles.player2.forEach(projectile => {
      if (projectile.active) {
        projectile.draw()
      }
    })
  }

  handleCollisions() {
    // Player1 melee attack
    if (
      rectangularCollision({
        rectangle1: this.player1,
        rectangle2: this.player2
      }) &&
      this.player1.isAttacking &&
      this.player1.currentState === FighterState.ATTACK1
    ) {
      // Get hit frame from character's attack1 sprite config
      const hitFrame = this.player1.sprites.attack1.hitFrame || 4
      if (this.player1.framesCurrent === hitFrame) {
        this.player2.takeHit(10) // Reduced damage
        this.updateHealthBar('player2')
      }
    }
    
    // Player2 melee attack
    if (
      rectangularCollision({
        rectangle1: this.player2,
        rectangle2: this.player1
      }) &&
      this.player2.isAttacking &&
      this.player2.currentState === FighterState.ATTACK1
    ) {
      // Get hit frame from character's attack1 sprite config
      const hitFrame = this.player2.sprites.attack1.hitFrame || 2
      if (this.player2.framesCurrent === hitFrame) {
        this.player1.takeHit(10) // Reduced damage
        this.updateHealthBar('player1')
      }
    }
  }

  updateFacingDirections() {
    // Calculate distance between players
    const distance = this.player2.position.x - this.player1.position.x
    
    // Player1 facing - face opponent when idle, otherwise face movement direction
    if (this.player1.velocity.x < 0) {
      this.player1.facingLeft = true
    } else if (this.player1.velocity.x > 0) {
      this.player1.facingLeft = false
    } else if (this.player1.currentState === FighterState.IDLE) {
      // When idle, face the opponent
      this.player1.facingLeft = distance < 0
    }
    
    if (!this.player1.isAttacking && 
        this.player1.currentState !== FighterState.ATTACK1 && 
        this.player1.currentState !== FighterState.ATTACK2 &&
        this.player1.currentState !== FighterState.DEFEND) {
      this.player1.flipped = this.player1.facingLeft
    }
    
    // Player2 facing - face opponent when idle, otherwise face movement direction
    if (this.player2.velocity.x < 0) {
      this.player2.facingLeft = true
    } else if (this.player2.velocity.x > 0) {
      this.player2.facingLeft = false
    } else if (this.player2.currentState === FighterState.IDLE) {
      // When idle, face the opponent
      this.player2.facingLeft = distance > 0
    }
    
    if (!this.player2.isAttacking && 
        this.player2.currentState !== FighterState.ATTACK1 && 
        this.player2.currentState !== FighterState.ATTACK2 &&
        this.player2.currentState !== FighterState.DEFEND) {
      this.player2.flipped = this.player2.facingLeft
    }
  }

  updateHealthBar(target) {
    const healthBarId = target === 'player1' ? 'playerHealth' : 'player2Health'
    const healthBar = document.getElementById(healthBarId)
    if (!healthBar) return
    
    const fighter = target === 'player1' ? this.player1 : this.player2
    const healthPercent = (fighter.health / 200) * 100
    
    if (typeof gsap !== 'undefined') {
      gsap.to(`#${healthBarId}`, {
        width: healthPercent + '%'
      })
    } else {
      healthBar.style.width = healthPercent + '%'
    }
  }

  draw() {
    const c = getContext()
    if (!c) return
    
    // Clear canvas
    c.fillStyle = 'black'
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw background
    this.background.update()
    if (this.shop) {
    this.shop.update()
    }
    
    // Draw overlay
    c.fillStyle = 'rgba(255, 255, 255, 0.15)'
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw fighters
    this.player1.update()
    this.player2.update()
    
    // Draw projectiles (after fighters so they appear on top)
    this.drawProjectiles()
    
    // Draw chakra bars
    this.drawChakraBars()
  }

  drawChakraBars() {
    const c = getContext()
    if (!c) return
    
    // Player1 chakra bar
    const barWidth = 250
    const barHeight = 25
    const barX = 20
    const barY = 20 + 30 + 25
    
    c.fillStyle = 'rgba(0, 0, 0, 0.4)'
    c.fillRect(barX, barY, barWidth, barHeight)
    
    c.strokeStyle = 'cyan'
    c.lineWidth = 2
    c.strokeRect(barX, barY, barWidth, barHeight)
    
    const player1Percent = (this.player1.chakra / 3) * 100
    c.fillStyle = 'cyan'
    c.fillRect(barX, barY, (barWidth * player1Percent) / 100, barHeight)
    
    // Player2 chakra bar
    const player2BarX = CANVAS_WIDTH - 20 - barWidth
    const player2BarY = barY
    
    c.fillStyle = 'rgba(0, 0, 0, 0.4)'
    c.fillRect(player2BarX, player2BarY, barWidth, barHeight)
    
    c.strokeStyle = 'cyan'
    c.lineWidth = 2
    c.strokeRect(player2BarX, player2BarY, barWidth, barHeight)
    
    const player2Percent = (this.player2.chakra / 3) * 100
    c.fillStyle = 'cyan'
    const fillWidth = (barWidth * player2Percent) / 100
    c.fillRect(player2BarX + barWidth - fillWidth, player2BarY, fillWidth, barHeight)
  }

  clearProjectiles() {
    this.projectiles.player1 = []
    this.projectiles.player2 = []
    this.chakraProjectiles.player1 = []
    this.chakraProjectiles.player2 = []
  }

  getWinner() {
    if (this.player1.health <= 0) return 'player2'
    if (this.player2.health <= 0) return 'player1'
    if (this.player1.health === this.player2.health) return 'tie'
    return this.player1.health > this.player2.health ? 'player1' : 'player2'
  }
}

