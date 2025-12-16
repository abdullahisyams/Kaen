// Fighter Class with State Machine
import { Sprite } from './Sprite.js'
import {
  FighterState,
  FighterDirection,
  FighterAttackType,
  FighterAttackData,
  FIGHTER_DEFAULT_WIDTH,
  FIGHTER_DEFAULT_HEIGHT,
  FIGHTER_MAX_HEALTH,
  FIGHTER_MAX_CHAKRA,
  GRAVITY,
  FIGHTER_GROUND_Y,
  FIGHTER_RUN_SPEED,
  FIGHTER_JUMP_VELOCITY
} from '../constants/fighter.js'
import { CANVAS_HEIGHT } from '../constants/game.js'
import { getContext } from '../utils/context.js'

export class Fighter extends Sprite {
  constructor({
    position,
    velocity = { x: 0, y: 0 },
    color = 'red',
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = { offset: {}, width: undefined, height: undefined },
    isPlayer = true
  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      offset
    })

    this.velocity = velocity
    this.width = FIGHTER_DEFAULT_WIDTH
    this.height = FIGHTER_DEFAULT_HEIGHT
    this.lastKey = ''
    this.color = color
    this.isPlayer = isPlayer
    
    // Attack box
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height
    }
    
    // Health and Chakra
    this.health = FIGHTER_MAX_HEALTH
    this.chakra = 0
    this.isCharging = false
    this.chakraChargeTimer = null
    
    // Chakra charge sound effect
    this.chakraChargeSound = new Audio('./sfx/chakra charge.wav')
    this.chakraChargeSound.volume = 0.7
    
    // State machine
    this.currentState = FighterState.IDLE
    this.previousState = null
    
    // Sprites
    this.sprites = sprites || {}
    this.dead = false
    
    // Load all sprite images if sprites are provided
    if (this.sprites && Object.keys(this.sprites).length > 0) {
      for (const sprite in this.sprites) {
        this.sprites[sprite].image = new Image()
        this.sprites[sprite].image.src = this.sprites[sprite].imageSrc
      }
    }
    
    // Direction
    this.direction = FighterDirection.RIGHT
    this.facingLeft = false
    
    // Attack state
    this.isAttacking = false
    this.attackType = null
    this.pendingProjectile = null
    
    // Initialize state handlers
    this.initializeStateHandlers()
  }

  initializeStateHandlers() {
    this.stateHandlers = {
      [FighterState.IDLE]: {
        enter: () => this.handleIdleEnter(),
        update: () => this.handleIdleUpdate(),
        exit: () => this.handleIdleExit()
      },
      [FighterState.RUN]: {
        enter: () => this.handleRunEnter(),
        update: () => this.handleRunUpdate(),
        exit: () => this.handleRunExit()
      },
      [FighterState.JUMP_START]: {
        enter: () => this.handleJumpStartEnter(),
        update: () => this.handleJumpStartUpdate(),
        exit: () => this.handleJumpStartExit()
      },
      [FighterState.JUMP_UP]: {
        enter: () => this.handleJumpUpEnter(),
        update: () => this.handleJumpUpUpdate(),
        exit: () => this.handleJumpUpExit()
      },
      [FighterState.JUMP_DOWN]: {
        enter: () => this.handleJumpDownEnter(),
        update: () => this.handleJumpDownUpdate(),
        exit: () => this.handleJumpDownExit()
      },
      [FighterState.FALL]: {
        enter: () => this.handleFallEnter(),
        update: () => this.handleFallUpdate(),
        exit: () => this.handleFallExit()
      },
      [FighterState.ATTACK1]: {
        enter: () => this.handleAttack1Enter(),
        update: () => this.handleAttack1Update(),
        exit: () => this.handleAttack1Exit()
      },
      [FighterState.ATTACK2]: {
        enter: () => this.handleAttack2Enter(),
        update: () => this.handleAttack2Update(),
        exit: () => this.handleAttack2Exit()
      },
      [FighterState.TAKE_HIT]: {
        enter: () => this.handleTakeHitEnter(),
        update: () => this.handleTakeHitUpdate(),
        exit: () => this.handleTakeHitExit()
      },
      [FighterState.DEATH]: {
        enter: () => this.handleDeathEnter(),
        update: () => this.handleDeathUpdate(),
        exit: () => this.handleDeathExit()
      },
      [FighterState.CHARGING]: {
        enter: () => this.handleChargingEnter(),
        update: () => this.handleChargingUpdate(),
        exit: () => this.handleChargingExit()
      },
      [FighterState.DEFEND]: {
        enter: () => this.handleDefendEnter(),
        update: () => this.handleDefendUpdate(),
        exit: () => this.handleDefendExit()
      }
    }
  }

  // State Machine Methods
  changeState(newState) {
    // Handle string states (legacy support)
    if (typeof newState === 'string') {
      const stateMap = {
        'idle': FighterState.IDLE,
        'run': FighterState.RUN,
        'jump': FighterState.JUMP_START,
        'fall': FighterState.FALL,
        'attack1': FighterState.ATTACK1,
        'attack2': FighterState.ATTACK2,
        'takeHit': FighterState.TAKE_HIT,
        'death': FighterState.DEATH
      }
      newState = stateMap[newState] || newState
    }
    
    if (this.currentState === newState) return
    
    // Check if state transition is valid
    if (!this.canTransitionTo(newState)) return
    
    // Exit current state
    if (this.stateHandlers[this.currentState]?.exit) {
      this.stateHandlers[this.currentState].exit()
    }
    
    // Update state
    this.previousState = this.currentState
    this.currentState = newState
    
    // Enter new state
    if (this.stateHandlers[this.currentState]?.enter) {
      this.stateHandlers[this.currentState].enter()
    }
  }

  canTransitionTo(newState) {
    // Death state can be entered from any state if health is 0 or below
    if (newState === FighterState.DEATH) {
      // Allow death if health is 0 or below, regardless of current state
      if (this.health <= 0) {
        return true
      }
      // Otherwise, only allow death from take hit
      if (this.currentState !== FighterState.TAKE_HIT) {
        return false
      }
    }
    
    // Can't change state if dead
    if (this.dead && newState !== FighterState.DEATH) {
      return false
    }
    
    // Can't defend during certain states
    if (newState === FighterState.DEFEND) {
      const uninterruptibleStates = [
        FighterState.ATTACK1,
        FighterState.ATTACK2,
        FighterState.TAKE_HIT,
        FighterState.DEATH,
        FighterState.CHARGING
      ]
      if (uninterruptibleStates.includes(this.currentState)) {
        return false
      }
    }
    
    // Can't interrupt certain states
    const uninterruptibleStates = [FighterState.DEATH, FighterState.TAKE_HIT]
    if (uninterruptibleStates.includes(this.currentState)) {
      // Allow death from take hit
      if (newState === FighterState.DEATH && this.currentState === FighterState.TAKE_HIT) {
        return true
      }
      // Check if animation is complete
      if (this.framesCurrent >= this.framesMax - 1) {
        return true
      }
      return false
    }
    
    // Don't interrupt attack animations unless forced
    if (this.currentState === FighterState.ATTACK1 || this.currentState === FighterState.ATTACK2) {
      if (this.framesCurrent < this.framesMax - 1) {
        // Allow transitions to take hit or death (death can interrupt attacks if health is 0)
        if (newState === FighterState.TAKE_HIT || newState === FighterState.DEATH) {
          return true
        }
        return false
      }
    }
    
    return true
  }

  // State Handlers - Idle
  handleIdleEnter() {
    this.switchSprite('idle')
    this.velocity.x = 0
    // Slow down idle animation
    this.framesHold = 8
  }

  handleIdleUpdate() {
    // Idle state logic
  }

  handleIdleExit() {
    // Cleanup if needed
  }

  // State Handlers - Run
  handleRunEnter() {
    this.switchSprite('run')
    // Normal speed for run animation
    this.framesHold = 5
  }

  handleRunUpdate() {
    // Run state logic handled in update()
  }

  handleRunExit() {
    // Cleanup if needed
  }

  // State Handlers - Jump Start
  handleJumpStartEnter() {
    this.switchSprite('jump')
    this.velocity.y = FIGHTER_JUMP_VELOCITY
  }

  handleJumpStartUpdate() {
    // Transition handled in handleAutoTransitions
  }

  handleJumpStartExit() {
    // Cleanup
  }

  // State Handlers - Jump Up
  handleJumpUpEnter() {
    this.switchSprite('jump')
  }

  handleJumpUpUpdate() {
    // Transition handled in handleAutoTransitions
  }

  handleJumpUpExit() {
    // Cleanup
  }

  // State Handlers - Jump Down
  handleJumpDownEnter() {
    this.switchSprite('fall')
  }

  handleJumpDownUpdate() {
    // Transition handled in handleAutoTransitions
  }

  handleJumpDownExit() {
    // Cleanup
  }

  // State Handlers - Fall
  handleFallEnter() {
    this.switchSprite('fall')
  }

  handleFallUpdate() {
    // Transition handled in handleAutoTransitions
  }

  handleFallExit() {
    // Cleanup
  }

  // State Handlers - Attack1 (Melee)
  handleAttack1Enter() {
    this.switchSprite('attack1')
    this.isAttacking = true
    this.attackType = FighterAttackType.MELEE
  }

  handleAttack1Update() {
    // Check if attack animation is complete
    if (this.framesCurrent >= this.sprites.attack1.framesMax - 1) {
      this.isAttacking = false
      this.attackType = null
      this.changeState(FighterState.IDLE)
    }
  }

  handleAttack1Exit() {
    this.isAttacking = false
    this.attackType = null
  }

  // State Handlers - Attack2 (Ranged/Chakra)
  handleAttack2Enter() {
    this.switchSprite('attack2')
    this.isAttacking = true
  }

  handleAttack2Update() {
    // Spawn projectile at frame 4
    if (this.framesCurrent === 4 && this.pendingProjectile) {
      // Projectile will be spawned by the game loop
    }
    
    // Check if attack animation is complete
    if (this.framesCurrent >= this.sprites.attack2.framesMax - 1) {
      this.isAttacking = false
      this.attackType = null
      this.pendingProjectile = null
      this.changeState(FighterState.IDLE)
    }
  }

  handleAttack2Exit() {
    this.isAttacking = false
    this.attackType = null
    this.pendingProjectile = null
  }

  // State Handlers - Take Hit
  handleTakeHitEnter() {
    this.switchSprite('takeHit')
  }

  handleTakeHitUpdate() {
    if (this.framesCurrent >= this.sprites.takeHit.framesMax - 1) {
      if (this.health <= 0) {
        this.changeState(FighterState.DEATH)
      } else {
        this.changeState(FighterState.IDLE)
      }
    }
  }

  handleTakeHitExit() {
    // Cleanup
  }

  // State Handlers - Death
  handleDeathEnter() {
    this.switchSprite('death')
    this.dead = true
  }

  handleDeathUpdate() {
    if (this.framesCurrent >= this.sprites.death.framesMax - 1) {
      // Death animation complete
    }
  }

  handleDeathExit() {
    // Cleanup
  }

  // State Handlers - Charging
  handleChargingEnter() {
    // Visual feedback could be added here
  }

  handleChargingUpdate() {
    // Charging logic handled externally
  }

  handleChargingExit() {
    // Cleanup
  }

  // State Handlers - Defend
  handleDefendEnter() {
    // Use idle sprite but lock to first frame
    if (this.sprites.idle) {
      this.image = this.sprites.idle.image
      this.framesMax = this.sprites.idle.framesMax
      this.framesCurrent = 0 // Lock to first frame
    }
    this.isDefending = true
  }

  handleDefendUpdate() {
    // Keep locked to first frame of idle sprite
    this.framesCurrent = 0
    // Don't animate
  }

  handleDefendExit() {
    this.isDefending = false
  }

  // Utility Methods
  isOnGround() {
    return this.position.y >= FIGHTER_GROUND_Y
  }
  
  isDefendingState() {
    return this.isDefending && this.currentState === FighterState.DEFEND
  }

  // Attack Methods
  attack() {
    if (this.canTransitionTo(FighterState.ATTACK1)) {
      this.changeState(FighterState.ATTACK1)
    }
  }

  rangedAttack() {
    if (this.canTransitionTo(FighterState.ATTACK2)) {
      this.attackType = FighterAttackType.RANGED
      this.pendingProjectile = FighterAttackType.RANGED
      this.changeState(FighterState.ATTACK2)
    }
  }

  chakraAttack() {
    if (this.chakra >= FIGHTER_MAX_CHAKRA && this.canTransitionTo(FighterState.ATTACK2)) {
      this.attackType = FighterAttackType.CHAKRA
      this.pendingProjectile = FighterAttackType.CHAKRA
      this.chakra = 0
      this.changeState(FighterState.ATTACK2)
    }
  }

  takeHit(damage = 10) {
    if (this.dead || this.currentState === FighterState.DEATH) return
    
    // If defending, reduce damage by 80% (only take 20% damage)
    if (this.isDefendingState()) {
      damage = Math.floor(damage * 0.2)
    }
    
    this.health -= damage
    this.health = Math.max(0, this.health)
    
    // Check if fighter died - trigger death immediately
    if (this.health <= 0) {
      // If we can transition to death, do it directly
      if (this.canTransitionTo(FighterState.DEATH)) {
        this.changeState(FighterState.DEATH)
      }
      return
    }
    
    // Only trigger take hit animation if not defending (defending blocks most damage)
    if (!this.isDefendingState() && this.canTransitionTo(FighterState.TAKE_HIT)) {
      this.changeState(FighterState.TAKE_HIT)
    }
  }

  startChargingChakra() {
    if (this.isCharging || this.chakra >= FIGHTER_MAX_CHAKRA || this.dead) return
    
    // Play chakra charge sound
    this.chakraChargeSound.currentTime = 0
    this.chakraChargeSound.play().catch(() => {})
    
    this.isCharging = true
    this.changeState(FighterState.CHARGING)
    
    this.chakraChargeTimer = setTimeout(() => {
      this.chakra = Math.min(this.chakra + 1, FIGHTER_MAX_CHAKRA)
      this.isCharging = false
      if (this.currentState === FighterState.CHARGING) {
        this.changeState(FighterState.IDLE)
      }
    }, 500) // CHAKRA_CHARGE_TIME
  }

  // Update method
  update() {
    this.draw()
    if (!this.dead) {
      this.animateFrames()
    }

    // Update attack box position
    const mirroredOffsetX = this.flipped
      ? -this.attackBox.offset.x - this.attackBox.width
      : this.attackBox.offset.x
    this.attackBox.position.x = this.position.x + mirroredOffsetX
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y

    // Update position
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    // Apply gravity
    if (this.position.y + this.height + this.velocity.y >= CANVAS_HEIGHT - 96) {
      this.velocity.y = 0
      this.position.y = FIGHTER_GROUND_Y
    } else {
      this.velocity.y += GRAVITY
    }

    // Update current state
    if (this.stateHandlers[this.currentState]?.update) {
      this.stateHandlers[this.currentState].update()
    }

    // Auto-transitions based on conditions
    this.handleAutoTransitions()
  }

  handleAutoTransitions() {
    // Handle jump states - check velocity for state transitions
    if (this.currentState === FighterState.JUMP_START) {
      if (this.velocity.y < 0) {
        this.changeState(FighterState.JUMP_UP)
      } else if (this.velocity.y >= 0) {
        this.changeState(FighterState.JUMP_DOWN)
      }
    }
    
    if (this.currentState === FighterState.JUMP_UP) {
      if (this.velocity.y >= 0) {
        this.changeState(FighterState.JUMP_DOWN)
      }
    }
    
    if (this.currentState === FighterState.JUMP_DOWN || 
        this.currentState === FighterState.FALL) {
      if (this.isOnGround()) {
        this.velocity.y = 0
        this.changeState(FighterState.IDLE)
      }
    }
    
    // Handle falling when not in jump state
    if (!this.isOnGround() && 
        this.currentState !== FighterState.JUMP_START &&
        this.currentState !== FighterState.JUMP_UP &&
        this.currentState !== FighterState.JUMP_DOWN &&
        this.currentState !== FighterState.FALL &&
        this.currentState !== FighterState.ATTACK1 &&
        this.currentState !== FighterState.ATTACK2 &&
        this.currentState !== FighterState.TAKE_HIT &&
        this.currentState !== FighterState.DEATH) {
      if (this.velocity.y > 0) {
        this.changeState(FighterState.FALL)
      } else {
        this.changeState(FighterState.JUMP_UP)
      }
    }
  }

  // Set sprites after initialization (for character selection)
  setSprites(sprites) {
    this.sprites = sprites
    // Load all sprite images
    for (const sprite in this.sprites) {
      this.sprites[sprite].image = new Image()
      this.sprites[sprite].image.src = this.sprites[sprite].imageSrc
    }
    // Switch to idle sprite
    if (this.sprites.idle) {
      this.image = this.sprites.idle.image
      this.framesMax = this.sprites.idle.framesMax
      this.framesCurrent = 0
    }
  }

  // Sprite switching (legacy support)
  switchSprite(sprite) {
    // Return early if sprites not loaded
    if (!this.sprites || Object.keys(this.sprites).length === 0) {
      return
    }
    
    // Handle state-based sprite switching
    const stateToSprite = {
      [FighterState.IDLE]: 'idle',
      [FighterState.RUN]: 'run',
      [FighterState.JUMP_START]: 'jump',
      [FighterState.JUMP_UP]: 'jump',
      [FighterState.JUMP_DOWN]: 'fall',
      [FighterState.FALL]: 'fall',
      [FighterState.ATTACK1]: 'attack1',
      [FighterState.ATTACK2]: 'attack2',
      [FighterState.TAKE_HIT]: 'takeHit',
      [FighterState.DEATH]: 'death'
    }
    
    // Use state if sprite matches
    if (stateToSprite[this.currentState] === sprite) {
      // Continue with sprite switch
    }
    
    // If already showing death sprite, don't switch
    if (this.image === this.sprites.death?.image) {
      if (this.framesCurrent === this.sprites.death.framesMax - 1) {
        this.dead = true
      }
      return
    }

    // Death sprite can interrupt any animation - allow it to be set
    if (sprite === 'death') {
      // Skip the interruption checks and go directly to setting death sprite
    } else {
      // Don't interrupt attack animations (unless switching to death)
      if (
        (this.image === this.sprites.attack1?.image &&
          this.framesCurrent < this.sprites.attack1.framesMax - 1) ||
        (this.image === this.sprites.attack2?.image &&
          this.framesCurrent < this.sprites.attack2.framesMax - 1)
      ) {
        return
      }

      // Don't interrupt take hit animation (unless switching to death)
      if (
        this.image === this.sprites.takeHit?.image &&
        this.framesCurrent < this.sprites.takeHit.framesMax - 1
      ) {
        return
      }
    }

    switch (sprite) {
      case 'idle':
        if (this.sprites.idle && this.image !== this.sprites.idle.image) {
          this.image = this.sprites.idle.image
          this.framesMax = this.sprites.idle.framesMax
          this.framesCurrent = 0
        }
        break
      case 'run':
        if (this.sprites.run && this.image !== this.sprites.run.image) {
          this.image = this.sprites.run.image
          this.framesMax = this.sprites.run.framesMax
          this.framesCurrent = 0
        }
        break
      case 'jump':
        if (this.sprites.jump && this.image !== this.sprites.jump.image) {
          this.image = this.sprites.jump.image
          this.framesMax = this.sprites.jump.framesMax
          this.framesCurrent = 0
        }
        break
      case 'fall':
        if (this.sprites.fall && this.image !== this.sprites.fall.image) {
          this.image = this.sprites.fall.image
          this.framesMax = this.sprites.fall.framesMax
          this.framesCurrent = 0
        }
        break
      case 'attack1':
        if (this.sprites.attack1 && this.image !== this.sprites.attack1.image) {
          this.image = this.sprites.attack1.image
          this.framesMax = this.sprites.attack1.framesMax
          this.framesCurrent = 0
        }
        break
      case 'attack2':
        if (this.sprites.attack2 && this.image !== this.sprites.attack2.image) {
          this.image = this.sprites.attack2.image
          this.framesMax = this.sprites.attack2.framesMax
          this.framesCurrent = 0
        }
        break
      case 'takeHit':
        if (this.sprites.takeHit && this.image !== this.sprites.takeHit.image) {
          this.image = this.sprites.takeHit.image
          this.framesMax = this.sprites.takeHit.framesMax
          this.framesCurrent = 0
        }
        break
      case 'death':
        if (this.sprites.death && this.image !== this.sprites.death.image) {
          this.image = this.sprites.death.image
          this.framesMax = this.sprites.death.framesMax
          this.framesCurrent = 0
        }
        break
    }
  }
}

