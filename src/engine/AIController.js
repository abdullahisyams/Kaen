// AI Controller for Enemy Fighter
import { FighterState, FighterAttackType, FighterDirection } from '../constants/fighter.js'
import { getDifficultySettings } from '../constants/ai.js'

export class AIController {
  constructor(fighter, opponent, difficulty = 3) {
    this.fighter = fighter
    this.opponent = opponent
    this.difficulty = difficulty
    this.settings = getDifficultySettings(difficulty)
    
    // AI state
    this.decisionTimer = 0
    this.decisionInterval = this.settings.decisionInterval
    this.actionCooldown = 0
    this.facingLeft = false
  }

  update(countdownActive = false) {
    if (this.fighter.dead) return
    
    // Don't do anything during countdown
    if (countdownActive) {
      // Reset velocity and ensure idle state during countdown
      this.fighter.velocity.x = 0
      if (this.fighter.currentState === FighterState.RUN) {
        this.fighter.changeState(FighterState.IDLE)
      }
      return
    }
    
    // Update timers
    this.decisionTimer++
    this.actionCooldown = Math.max(0, this.actionCooldown - 1)
    
    // Update facing direction
    this.updateFacingDirection()
    
    // Make decisions periodically
    if (this.decisionTimer >= this.decisionInterval) {
      this.decisionTimer = 0
      this.makeDecision()
    }
    
    // Continuous movement logic
    this.updateMovement()
    
    // Update jump animations
    this.updateJumpState()
  }

  updateFacingDirection() {
    const distanceToPlayer = this.opponent.position.x - this.fighter.position.x
    
    if (Math.abs(this.fighter.velocity.x) > 0) {
      if (this.fighter.velocity.x < 0) this.facingLeft = true
      else if (this.fighter.velocity.x > 0) this.facingLeft = false
    } else {
      if (distanceToPlayer < 0) {
        this.facingLeft = true
      } else if (distanceToPlayer > 0) {
        this.facingLeft = false
      }
    }
    
    if (!this.fighter.isAttacking) {
      this.fighter.flipped = this.facingLeft
    }
  }

  makeDecision() {
    const distanceToPlayer = this.opponent.position.x - this.fighter.position.x
    const isPlayerAttacking = this.opponent.isAttacking
    const isInAttackRange = Math.abs(distanceToPlayer) < 180
    const isOnGround = this.fighter.isOnGround()
    
    // Charge chakra
    if (this.fighter.chakra < 3 && !this.fighter.isCharging && 
        Math.random() < this.settings.chakraChargeChance) {
      this.fighter.startChargingChakra()
    }
    
    // Defensive dodge
    if (isPlayerAttacking && Math.abs(distanceToPlayer) < 120 && 
        Math.random() < this.settings.dodgeChance && isOnGround) {
      this.fighter.velocity.y = -20
      this.actionCooldown = Math.floor(15 * this.settings.cooldownMultiplier)
      return
    }
    
    // Use chakra attack if full and in range
    if (this.fighter.chakra >= 3 && isInAttackRange && 
        !this.fighter.isAttacking && this.actionCooldown === 0 && isOnGround) {
      if (Math.random() < this.settings.chakraAttackChance) {
        this.fighter.chakraAttack()
        this.actionCooldown = Math.floor(60 * this.settings.cooldownMultiplier)
        return
      }
    }
    
    // Use ranged attack if in medium range
    if (Math.abs(distanceToPlayer) > 100 && Math.abs(distanceToPlayer) < 300 && 
        !this.fighter.isAttacking && this.actionCooldown === 0 && isOnGround) {
      if (Math.random() < this.settings.rangedAttackChance) {
        this.fighter.rangedAttack()
        this.actionCooldown = Math.floor(30 * this.settings.cooldownMultiplier)
        return
      }
    }
    
    // Melee attack if close enough
    if (isInAttackRange && !this.fighter.isAttacking && 
        this.actionCooldown === 0 && isOnGround) {
      if (Math.random() < this.settings.meleeAttackChance) {
        this.fighter.attack()
        this.actionCooldown = Math.floor(30 * this.settings.cooldownMultiplier)
        return
      }
    }
    
    // Jump sometimes
    const jumpChance = this.difficulty === 5 ? 0.25 : (0.05 + (this.difficulty - 1) * 0.05)
    if (isOnGround && Math.random() < jumpChance && this.actionCooldown === 0) {
      this.fighter.velocity.y = -20
      this.actionCooldown = Math.floor(20 * this.settings.cooldownMultiplier)
    }
  }

  updateMovement() {
    if (this.fighter.isAttacking || this.actionCooldown > 0) {
      this.fighter.velocity.x = 0
      if (!this.fighter.isAttacking) {
        this.fighter.changeState(FighterState.IDLE)
      }
      return
    }
    
    const distanceToPlayer = this.opponent.position.x - this.fighter.position.x
    const isPlayerAttacking = this.opponent.isAttacking
    
    // Move toward player if too far
    if (Math.abs(distanceToPlayer) > this.settings.optimalRange) {
      if (distanceToPlayer > 0) {
        this.fighter.velocity.x = this.settings.movementSpeed
        this.fighter.lastKey = 'ArrowRight'
        this.fighter.changeState(FighterState.RUN)
      } else {
        this.fighter.velocity.x = -this.settings.movementSpeed
        this.fighter.lastKey = 'ArrowLeft'
        this.fighter.changeState(FighterState.RUN)
      }
    }
    // Back away if player is attacking and too close
    else if (isPlayerAttacking) {
      const retreatRange = this.difficulty === 5 ? 180 : (100 + (this.difficulty - 1) * 20)
      if (Math.abs(distanceToPlayer) < retreatRange) {
        if (distanceToPlayer > 0) {
          this.fighter.velocity.x = -this.settings.movementSpeed
          this.fighter.lastKey = 'ArrowLeft'
          this.fighter.changeState(FighterState.RUN)
        } else {
          this.fighter.velocity.x = this.settings.movementSpeed
          this.fighter.lastKey = 'ArrowRight'
          this.fighter.changeState(FighterState.RUN)
        }
      }
    }
    // Stay idle if in good position
    else {
      this.fighter.velocity.x = 0
      this.fighter.changeState(FighterState.IDLE)
    }
  }

  updateJumpState() {
    // Jump state transitions are handled automatically in Fighter.update()
    // This method is kept for potential future AI jump logic
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty
    this.settings = getDifficultySettings(difficulty)
    this.decisionInterval = this.settings.decisionInterval
  }
}

