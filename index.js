const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png'
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
})

const player = new Fighter({
  position: {
    x: 100,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/samuraiMack/Idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157
  },
  sprites: {
    idle: {
      imageSrc: './img/samuraiMack/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: './img/samuraiMack/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/samuraiMack/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/samuraiMack/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/samuraiMack/Attack1.png',
      framesMax: 6
    },
    attack2: {
      imageSrc: './img/samuraiMack/Attack2.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/samuraiMack/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50
    },
    width: 160,
    height: 50
  }
})

const enemy = new Fighter({
  position: {
    x: canvas.width - 220,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: './img/kenji/Idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167
  },
  sprites: {
    idle: {
      imageSrc: './img/kenji/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: './img/kenji/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/kenji/Attack1.png',
      framesMax: 4
    },
    attack2: {
      imageSrc: './img/kenji/Attack2.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/kenji/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50
    },
    width: 170,
    height: 50
  }
})

console.log(player)

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

// AI Difficulty System (1 = easiest, 5 = hardest)
let aiDifficulty = 3 // Default to medium difficulty

// Difficulty multipliers and settings
function getDifficultySettings(difficulty) {
  // Clamp difficulty between 1 and 5
  difficulty = Math.max(1, Math.min(5, difficulty))
  
  // Reaction speed: lower interval = faster reactions
  // Level 1: 90 frames (slow), Level 4: 30 frames, Level 5: 10 frames (INSANE)
  let decisionInterval
  if (difficulty === 5) {
    decisionInterval = 10 // Lightning fast reactions
  } else {
    decisionInterval = 90 - (difficulty - 1) * 20
  }
  
  // Attack probabilities: higher = more aggressive
  // Level 1: 30% melee, Level 4: 75%, Level 5: 98% (almost always attacks)
  let meleeAttackChance, rangedAttackChance, chakraAttackChance
  if (difficulty === 5) {
    meleeAttackChance = 0.98
    rangedAttackChance = 0.85
    chakraAttackChance = 0.70 // Very aggressive with chakra
  } else {
    meleeAttackChance = 0.3 + (difficulty - 1) * 0.15
    rangedAttackChance = 0.2 + (difficulty - 1) * 0.1
    chakraAttackChance = 0.1 + (difficulty - 1) * 0.05
  }
  
  // Movement speed: higher = faster
  // Level 1: 3, Level 4: 6, Level 5: 9 (very fast)
  const movementSpeed = difficulty === 5 ? 9 : (3 + (difficulty - 1) * 1)
  
  // Cooldown reduction: lower = less downtime
  // Level 1: 1.0x (normal), Level 4: 0.5x, Level 5: 0.25x (quarter cooldown - INSANE)
  const cooldownMultiplier = difficulty === 5 ? 0.25 : (1.0 - (difficulty - 1) * 0.125)
  
  // Chakra charging frequency: higher = charges more often
  // Level 1: 15% chance, Level 4: 50%, Level 5: 80% (almost always charging)
  const chakraChargeChance = difficulty === 5 ? 0.80 : (0.15 + (difficulty - 1) * 0.0875)
  
  // Defensive behavior: higher = better at dodging
  // Level 1: 20% chance to dodge, Level 4: 80%, Level 5: 95% (almost always dodges)
  const dodgeChance = difficulty === 5 ? 0.95 : (0.2 + (difficulty - 1) * 0.15)
  
  // Attack range awareness: higher = better positioning
  // Level 1: 200px, Level 4: 120px, Level 5: 80px (gets very close - aggressive)
  const optimalRange = difficulty === 5 ? 80 : (200 - (difficulty - 1) * 20)
  
  return {
    decisionInterval,
    meleeAttackChance,
    rangedAttackChance,
    chakraAttackChance,
    movementSpeed,
    cooldownMultiplier,
    chakraChargeChance,
    dodgeChance,
    optimalRange
  }
}

// AI Control Variables
let aiDecisionTimer = 0
let aiDecisionInterval = 60 // Will be set by difficulty
let aiActionCooldown = 0

// Countdown / Game start state
let countdownActive = true
let timerStarted = false

// Persisted facing state (true = facing left / flipped)
let playerFacingLeft = false
let enemyFacingLeft = false // Player 2 does not flip

// Projectile system
let playerProjectiles = []
let pendingRangedAttack = false // Flag to spawn ranged attack at frame 4
let enemyProjectiles = [] // Enemy ranged projectiles

// === Chakra System ===
let chakra = 0
let isCharging = false
const chakraMax = 3 // 3 charges
const chargeTime = 500 // 0.5 sec per charge
let chakraProjectiles = []
let pendingChakraAttack = false // Flag to spawn chakra attack at frame 4

// === Enemy Chakra System ===
let enemyChakra = 0
let enemyIsCharging = false
let enemyChakraProjectiles = []
let enemyPendingRangedAttack = false
let enemyPendingChakraAttack = false

function drawChakraBar() {
  // Draw chakra bar under Player 1 health bar with indentation
  // Health bar is at top: 20px, left: 20px (from padding), height: 30px
  const barWidth = 250
  const barHeight = 25
  const barX = 20 
  const barY = 20 + 30 + 25
  
  // Draw background
  c.fillStyle = 'rgba(0, 0, 0, 0.4)'
  c.fillRect(barX, barY, barWidth, barHeight)
  
  // Draw border
  c.strokeStyle = 'cyan'
  c.lineWidth = 2
  c.strokeRect(barX, barY, barWidth, barHeight)
  
  // Draw fill
  const percent = (chakra / chakraMax) * 100
  c.fillStyle = 'cyan'
  c.fillRect(barX, barY, (barWidth * percent) / 100, barHeight)
}

function drawEnemyChakraBar() {
  // Draw chakra bar under Enemy health bar on the right side
  // Health bar is at top: 20px, right side, height: 30px
  const barWidth = 250
  const barHeight = 25
  const barX = canvas.width - 20 - barWidth // Right side with 20px padding
  const barY = 20 + 30 + 25 // Same vertical position as player chakra bar
  
  // Draw background
  c.fillStyle = 'rgba(0, 0, 0, 0.4)'
  c.fillRect(barX, barY, barWidth, barHeight)
  
  // Draw border
  c.strokeStyle = 'cyan'
  c.lineWidth = 2
  c.strokeRect(barX, barY, barWidth, barHeight)
  
  // Draw fill (from right to left)
  const percent = (enemyChakra / chakraMax) * 100
  c.fillStyle = 'cyan'
  const fillWidth = (barWidth * percent) / 100
  c.fillRect(barX + barWidth - fillWidth, barY, fillWidth, barHeight) // Fill from right
}

// Enemy chakra functions
function startEnemyChargingChakra() {
  if (enemyIsCharging || enemyChakra >= chakraMax || countdownActive || dialogueActive || enemy.dead) return
  enemyIsCharging = true
  setTimeout(() => {
    enemyChakra = Math.min(enemyChakra + 1, chakraMax)
    enemyIsCharging = false
  }, chargeTime)
}

function unleashEnemyChakraAttack(enemy, direction) {
  if (enemyChakra < chakraMax || countdownActive || dialogueActive || enemy.dead || enemy.isAttacking) return
  
  // Trigger attack2 animation
  enemy.switchSprite('attack2')
  enemy.isAttacking = true
  
  enemyChakra = 0
  
  // Calculate spawn position from attack box (same as ranged attack)
  const mirroredOffsetX = enemy.flipped
    ? -enemy.attackBox.offset.x - enemy.attackBox.width
    : enemy.attackBox.offset.x
  const attackBoxX = enemy.position.x + mirroredOffsetX
  const attackBoxY = enemy.position.y + enemy.attackBox.offset.y
  
  // Spawn from the front edge of the attack box (closer to character)
  const startX = enemyFacingLeft 
    ? attackBoxX - 20 // Moved closer to character
    : attackBoxX + enemy.attackBox.width - 20 // Moved closer to character
  
  // Calculate enemy's visual position (accounting for offset)
  const enemyVisualY = enemy.position.y - enemy.offset.y
  const startY = enemyVisualY // Start at top of character sprite
  
  const velocity = enemyFacingLeft ? -12 : 12
  const enemyHeight = enemy.height * enemy.scale // Full character height with scale
  
  enemyChakraProjectiles.push(
    new ChakraProjectile({
      position: {
        x: startX,
        y: startY
      },
      velocity: { x: velocity, y: 0 },
      direction: direction,
      height: enemyHeight
    })
  )
}

function startChargingChakra() {
  if (isCharging || chakra >= chakraMax || countdownActive || dialogueActive || player.dead) return
  isCharging = true
  setTimeout(() => {
    chakra = Math.min(chakra + 1, chakraMax)
    isCharging = false
  }, chargeTime)
}

function unleashChakraAttack(player, direction) {
  if (chakra < chakraMax || countdownActive || dialogueActive || player.dead || player.isAttacking) return
  
  // Trigger attack2 animation
  player.switchSprite('attack2')
  player.isAttacking = true
  
  chakra = 0
  
  // Calculate spawn position from attack box (same as ranged attack)
  const mirroredOffsetX = player.flipped
    ? -player.attackBox.offset.x - player.attackBox.width
    : player.attackBox.offset.x
  const attackBoxX = player.position.x + mirroredOffsetX
  const attackBoxY = player.position.y + player.attackBox.offset.y
  
  // Spawn from the front edge of the attack box (closer to character)
  const startX = playerFacingLeft 
    ? attackBoxX - 20 // Moved closer to character
    : attackBoxX + player.attackBox.width - 20 // Moved closer to character
  
  // Calculate player's visual position (accounting for offset)
  const playerVisualY = player.position.y - player.offset.y
  const startY = playerVisualY // Start at top of character sprite
  
  const velocity = playerFacingLeft ? -12 : 12
  const playerHeight = player.height * player.scale // Full character height with scale
  
  chakraProjectiles.push(
    new ChakraProjectile({
      position: {
        x: startX,
        y: startY
      },
      velocity: { x: velocity, y: 0 },
      direction: direction,
      height: playerHeight
    })
  )
}

// Dialogue state
let dialogueActive = false
let dialogueIndex = 0
let currentDialogue = []

// Dialogue helpers
function showDialogue(lines) {
  currentDialogue = lines || []
  dialogueIndex = 0
  dialogueActive = currentDialogue.length > 0
  hideDifficultySelector() // Hide difficulty selector when dialogue starts
  const box = document.getElementById('dialogueBox')
  if (!box) return
  if (!dialogueActive) {
    box.style.display = 'none'
    return
  }
  box.style.display = 'block'
  box.innerHTML = formatLine(currentDialogue[dialogueIndex])
}

function formatLine(line) {
  if (!line) return ''
  const speaker = line.speaker === 'cpu' ? 'Computer' : 'Player 1'
  return speaker + ': ' + line.text + "<div style='opacity:.7;margin-top:8px;font-size:12px'>(Press Space)</div>"
}

function startCountdown() {
  const overlay = document.getElementById('startCountdown')
  if (!overlay) {
    countdownActive = false
    if (!timerStarted) {
      decreaseTimer()
      timerStarted = true
    }
    return
  }

  const sequence = ['3', '2', '1', 'FIGHT!']
  let idx = 0
  overlay.style.display = 'flex'

  function tick() {
    overlay.innerHTML = sequence[idx]
    idx++
    if (idx < sequence.length) {
      setTimeout(tick, 1000)
    } else {
      setTimeout(() => {
        overlay.style.display = 'none'
        countdownActive = false
        if (!timerStarted) {
          decreaseTimer()
          timerStarted = true
        }
      }, 700)
    }
  }

  tick()
}

// Start countdown instead of timer immediately
// Pre-fight dialogue then countdown
// Difficulty selector setup
const difficultySelector = document.getElementById('difficultySelector')
const difficultyDescription = document.getElementById('difficultyDescription')

const difficultyDescriptions = {
  1: 'Easy: Slow reactions, low aggression, easy to beat',
  2: 'Easy+: Slightly faster, still forgiving',
  3: 'Medium: Balanced AI with moderate reaction speed and aggression',
  4: 'Hard: Fast reactions, high aggression, challenging',
  5: 'Very Hard: Lightning fast, extremely aggressive, prepare to rage'
}

function updateDifficultyDescription(level) {
  if (difficultyDescription) {
    difficultyDescription.textContent = difficultyDescriptions[level]
  }
}

// Set up difficulty buttons
for (let i = 1; i <= 5; i++) {
  const button = document.getElementById(`diff${i}`)
  if (button) {
    button.addEventListener('click', () => {
      aiDifficulty = i
      updateDifficultyDescription(i)
      // Highlight selected button
      document.querySelectorAll('[id^="diff"]').forEach(btn => {
        btn.style.border = '2px solid white'
        btn.style.transform = 'scale(1)'
      })
      button.style.border = '4px solid yellow'
      button.style.transform = 'scale(1.1)'
    })
  }
}

// Start game button
const startGameBtn = document.getElementById('startGameBtn')
if (startGameBtn) {
  startGameBtn.addEventListener('click', () => {
    if (difficultySelector && difficultySelector.style.display !== 'none') {
      showDialogue(preFightDialogue)
    }
  })
}

// Hide difficulty selector when dialogue starts
function hideDifficultySelector() {
  if (difficultySelector) {
    difficultySelector.style.display = 'none'
  }
}

// Show difficulty selector initially
updateDifficultyDescription(aiDifficulty)

// Ensure selector is visible on page load
if (difficultySelector) {
  difficultySelector.style.display = 'block'
}

const preFightDialogue = [
  { speaker: 'p1', text: 'You picked the wrong arena.' },
  { speaker: 'cpu', text: 'I only need one strike to end this.' },
  { speaker: 'p1', text: 'We will see about that.' },
  { speaker: 'cpu', text: 'Enough talk. Prepare yourself.' }
]

// Don't start dialogue immediately - wait for user to select difficulty or press space
// showDialogue(preFightDialogue) // Commented out - will be triggered when user is ready

function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  player.velocity.x = 0
  enemy.velocity.x = 0

  // During dialogue or countdown, freeze gameplay and show idle animations only
  if (dialogueActive || countdownActive) {
    player.switchSprite('idle')
    enemy.switchSprite('idle')
    // Clear projectiles during countdown/dialogue
    playerProjectiles = []
    chakraProjectiles = []
    enemyProjectiles = []
    enemyChakraProjectiles = []
    // draw fighters after setting sprites and flips
    player.update()
    enemy.update()
    // Draw chakra bars even during countdown/dialogue
    drawChakraBar()
    drawEnemyChakraBar()
    return
  }

  // player movement
  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  // jumping
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // update facing based on last horizontal movement and persist through idle
  if (player.velocity.x < 0) playerFacingLeft = true
  else if (player.velocity.x > 0) playerFacingLeft = false
  if (!player.isAttacking) player.flipped = playerFacingLeft

  // Reset attack2 animation when it completes (for both ranged and chakra attacks)
  if (player.isAttacking && player.image === player.sprites.attack2.image && player.framesCurrent === player.sprites.attack2.framesMax) {
    player.isAttacking = false
  }
  
  // Reset enemy attack2 animation when it completes
  if (enemy.isAttacking && enemy.image === enemy.sprites.attack2.image && enemy.framesCurrent === enemy.sprites.attack2.framesMax) {
    enemy.isAttacking = false
  }
  
  // Spawn enemy projectiles at frame 4 of attack2 animation
  if (enemy.isAttacking && enemy.image === enemy.sprites.attack2.image && enemy.framesCurrent === 4) {
    // Spawn ranged attack projectile
    if (enemyPendingRangedAttack) {
      enemyPendingRangedAttack = false
      
      const direction = enemyFacingLeft ? 'left' : 'right'
      const velocity = enemyFacingLeft ? -10 : 10
      
      // Calculate attack box position
      const mirroredOffsetX = enemy.flipped
        ? -enemy.attackBox.offset.x - enemy.attackBox.width
        : enemy.attackBox.offset.x
      const attackBoxX = enemy.position.x + mirroredOffsetX
      const attackBoxY = enemy.position.y + enemy.attackBox.offset.y
      
      // Spawn from the front edge of the attack box
      const startX = enemyFacingLeft 
        ? attackBoxX + 20
        : attackBoxX + enemy.attackBox.width + 20
      const startY = attackBoxY + (enemy.attackBox.height / 2) - 20
      
      enemyProjectiles.push(
        new SlashProjectile({
          position: {
            x: startX,
            y: startY
          },
          velocity: { x: velocity, y: 0 },
          direction: direction
        })
      )
    }
    
    // Spawn chakra attack projectile
    if (enemyPendingChakraAttack) {
      enemyPendingChakraAttack = false
      
      // Reset chakra when using the attack
      enemyChakra = 0
      
      const direction = enemyFacingLeft ? 'left' : 'right'
      const velocity = enemyFacingLeft ? -12 : 12
      
      // Calculate attack box position
      const mirroredOffsetX = enemy.flipped
        ? -enemy.attackBox.offset.x - enemy.attackBox.width
        : enemy.attackBox.offset.x
      const attackBoxX = enemy.position.x + mirroredOffsetX
      const attackBoxY = enemy.position.y + enemy.attackBox.offset.y
      
      // Spawn from the front edge of the attack box
      const startX = enemyFacingLeft 
        ? attackBoxX - 20
        : attackBoxX + enemy.attackBox.width - 20
      
      const enemyVisualY = enemy.position.y - enemy.offset.y
      const startY = enemyVisualY
      
      const enemyHeight = enemy.height * enemy.scale
      
      enemyChakraProjectiles.push(
        new ChakraProjectile({
          position: {
            x: startX,
            y: startY
          },
          velocity: { x: velocity, y: 0 },
          direction: direction,
          height: enemyHeight
        })
      )
    }
  }

  // Update and draw projectiles
  playerProjectiles = playerProjectiles.filter(projectile => {
    if (!projectile.active) return false
    
    projectile.update()
    
    // Check projectile collision with enemy head using new function
    if (!enemy.dead && projectile.checkProjectileCollision(enemy)) {
      enemy.takeHit()
      projectile.active = false
      gsap.to('#enemyHealth', {
        width: (enemy.health / 200) * 100 + '%'
      })
      return false
    }
    
    return projectile.active
  })

  // Update and draw chakra projectiles
  chakraProjectiles = chakraProjectiles.filter(projectile => {
    if (!projectile.active) return false
    
    projectile.update()
    
    // Check chakra projectile collision with enemy
    if (!enemy.dead && projectile.checkCollision(enemy)) {
      // Deal 4x damage (80 damage total)
      for (let i = 0; i < 4; i++) {
        enemy.takeHit()
      }
      projectile.active = false
      gsap.to('#enemyHealth', {
        width: (enemy.health / 200) * 100 + '%'
      })
      return false
    }
    
    return projectile.active
  })
  
  // Update and draw enemy projectiles
  enemyProjectiles = enemyProjectiles.filter(projectile => {
    if (!projectile.active) return false
    
    projectile.update()
    
    // Check projectile collision with player
    if (!player.dead && projectile.checkProjectileCollision(player)) {
      player.takeHit()
      projectile.active = false
      gsap.to('#playerHealth', {
        width: (player.health / 200) * 100 + '%'
      })
      return false
    }
    
    return projectile.active
  })
  
  // Update and draw enemy chakra projectiles
  enemyChakraProjectiles = enemyChakraProjectiles.filter(projectile => {
    if (!projectile.active) return false
    
    projectile.update()
    
    // Check chakra projectile collision with player
    if (!player.dead && projectile.checkCollision(player)) {
      // Deal 4x damage (80 damage total)
      for (let i = 0; i < 4; i++) {
        player.takeHit()
      }
      projectile.active = false
      gsap.to('#playerHealth', {
        width: (player.health / 200) * 100 + '%'
      })
      return false
    }
    
    return projectile.active
  })

  // AI Enemy movement and behavior with all Player 1 mechanics
  // Stop AI if game is over (check if winner text is displayed)
  const displayText = document.querySelector('#displayText')
  const gameOver = displayText && displayText.style.display === 'flex'
  
  // Stop enemy movement and attacks when game is over
  if (gameOver) {
    enemy.velocity.x = 0
    enemy.switchSprite('idle')
    enemy.isAttacking = false
  }
  
  if (!enemy.dead && !countdownActive && !gameOver) {
    // Get difficulty-based settings
    const difficultySettings = getDifficultySettings(aiDifficulty)
    aiDecisionInterval = difficultySettings.decisionInterval
    
    aiDecisionTimer++
    aiActionCooldown = Math.max(0, aiActionCooldown - 1)
    
    // Calculate distance to player
    const distanceToPlayer = player.position.x - enemy.position.x
    const isPlayerAttacking = player.isAttacking
    const isEnemyInAttackRange = Math.abs(distanceToPlayer) < 180
    const isOnGround = enemy.position.y >= 330
    
    // Update enemy facing direction - face the player based on position
    // Prioritize facing the player when not moving, otherwise use movement direction
    if (Math.abs(enemy.velocity.x) > 0) {
      // When moving, face the direction of movement
      if (enemy.velocity.x < 0) enemyFacingLeft = true
      else if (enemy.velocity.x > 0) enemyFacingLeft = false
    } else {
      // When idle, face the player
      if (distanceToPlayer < 0) {
        // Player is to the left, enemy should face left
        enemyFacingLeft = true
      } else if (distanceToPlayer > 0) {
        // Player is to the right, enemy should face right
        enemyFacingLeft = false
      }
    }
    if (!enemy.isAttacking) enemy.flipped = enemyFacingLeft
    
    // Make AI decisions periodically
    if (aiDecisionTimer >= aiDecisionInterval) {
      aiDecisionTimer = 0
      
      // Charge chakra based on difficulty
      if (enemyChakra < chakraMax && !enemyIsCharging && Math.random() < difficultySettings.chakraChargeChance) {
        startEnemyChargingChakra()
      }
      
      // Defensive dodge behavior (higher difficulty = better dodging)
      if (isPlayerAttacking && Math.abs(distanceToPlayer) < 120 && Math.random() < difficultySettings.dodgeChance && isOnGround) {
        // Jump to dodge
        enemy.velocity.y = -20
        aiActionCooldown = Math.floor(15 * difficultySettings.cooldownMultiplier)
      }
      // Use chakra attack if full and in range
      else if (enemyChakra >= chakraMax && isEnemyInAttackRange && !enemy.isAttacking && aiActionCooldown === 0 && isOnGround) {
        if (Math.random() < difficultySettings.chakraAttackChance) {
          const direction = enemyFacingLeft ? 'left' : 'right'
          enemy.switchSprite('attack2')
          enemy.isAttacking = true
          enemyPendingChakraAttack = true
          aiActionCooldown = Math.floor(60 * difficultySettings.cooldownMultiplier)
        }
      }
      // Use ranged attack if in medium range
      else if (Math.abs(distanceToPlayer) > 100 && Math.abs(distanceToPlayer) < 300 && !enemy.isAttacking && aiActionCooldown === 0 && isOnGround) {
        if (Math.random() < difficultySettings.rangedAttackChance) {
          enemy.switchSprite('attack2')
          enemy.isAttacking = true
          enemyPendingRangedAttack = true
          aiActionCooldown = Math.floor(30 * difficultySettings.cooldownMultiplier)
        }
      }
      // Melee attack if close enough and not on cooldown
      else if (isEnemyInAttackRange && !enemy.isAttacking && aiActionCooldown === 0 && isOnGround) {
        if (Math.random() < difficultySettings.meleeAttackChance) {
          enemy.attack()
          aiActionCooldown = Math.floor(30 * difficultySettings.cooldownMultiplier)
        }
      }
      
      // Jump sometimes to be more dynamic (more frequent on higher difficulty)
      // Level 5: jumps much more frequently for aggressive pressure
      const jumpChance = aiDifficulty === 5 ? 0.25 : (0.05 + (aiDifficulty - 1) * 0.05)
      if (isOnGround && Math.random() < jumpChance && aiActionCooldown === 0) {
        enemy.velocity.y = -20
        aiActionCooldown = Math.floor(20 * difficultySettings.cooldownMultiplier)
      }
    }
    
    // Continuous movement logic
    if (!enemy.isAttacking && aiActionCooldown === 0) {
      // Move toward player if too far (uses optimal range based on difficulty)
      if (Math.abs(distanceToPlayer) > difficultySettings.optimalRange) {
        if (distanceToPlayer > 0) {
          // Player is to the right, move right
          enemy.velocity.x = difficultySettings.movementSpeed
          enemy.lastKey = 'ArrowRight'
          enemy.switchSprite('run')
        } else {
          // Player is to the left, move left
          enemy.velocity.x = -difficultySettings.movementSpeed
          enemy.lastKey = 'ArrowLeft'
          enemy.switchSprite('run')
        }
      }
      // Back away if player is attacking and too close (better on higher difficulty)
      // Level 5: reacts to attacks from much further away
      else if (isPlayerAttacking) {
        const retreatRange = aiDifficulty === 5 ? 180 : (100 + (aiDifficulty - 1) * 20)
        if (Math.abs(distanceToPlayer) < retreatRange) {
          if (distanceToPlayer > 0) {
            enemy.velocity.x = -difficultySettings.movementSpeed
            enemy.lastKey = 'ArrowLeft'
            enemy.switchSprite('run')
          } else {
            enemy.velocity.x = difficultySettings.movementSpeed
            enemy.lastKey = 'ArrowRight'
            enemy.switchSprite('run')
          }
        }
      }
      // Stay idle if in good position
      else {
        enemy.velocity.x = 0
        enemy.switchSprite('idle')
      }
    } else {
      // Don't move while attacking or on cooldown
      enemy.velocity.x = 0
      if (!enemy.isAttacking) {
        enemy.switchSprite('idle')
      }
    }
    
    // Jumping animation
    if (enemy.velocity.y < 0) {
      enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
      enemy.switchSprite('fall')
    }
  }

// After all logic, draw fighters with correct flip applied this frame
  player.update()
  enemy.update()

  // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false

    gsap.to('#enemyHealth', {
      width: (enemy.health / 200) * 100 + '%'
    })
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  // this is where our player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false

    gsap.to('#playerHealth', {
      width: (player.health / 200) * 100 + '%'
    })
  }

  // if player misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId })
  }

  // Draw chakra bars on canvas
  drawChakraBar()
  drawEnemyChakraBar()
}

animate()

// Listen for post-fight dialogue trigger
if (typeof window !== 'undefined') {
  window.addEventListener('startPostFightDialogue', (e) => {
    const lines = e?.detail?.lines || []
    if (lines.length > 0) {
      // show dialogue and block input; do not restart countdown
      showDialogue(lines)
    }
  })
}

window.addEventListener('keydown', (event) => {
  // Start game with Space if selector is visible
  if (event.key === ' ' && !dialogueActive && !countdownActive) {
    if (difficultySelector && difficultySelector.style.display !== 'none') {
      showDialogue(preFightDialogue)
      return
    }
  }
  
  // Dialogue advance with Space
  if (event.key === ' ') {
    if (dialogueActive) {
      dialogueIndex++
      const box = document.getElementById('dialogueBox')
      if (dialogueIndex <= currentDialogue.length - 1) {
        if (box) box.innerHTML = formatLine(currentDialogue[dialogueIndex])
      } else {
        // end dialogue
        dialogueActive = false
        if (box) box.style.display = 'none'
        // start the countdown after pre-fight dialogue ends
        if (!timerStarted && countdownActive) startCountdown()
      }
    }
    if (dialogueActive) return
  }

  if (countdownActive) return
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.velocity.y = -20
        break
      case 's':
        player.attack()
        break
      case 'q':
        // Ranged slash attack - no cooldown, immediate
        if (!player.dead && !countdownActive && !dialogueActive && !player.isAttacking) {
          // Trigger attack2 animation
          player.switchSprite('attack2')
          player.isAttacking = true
          
          const direction = playerFacingLeft ? 'left' : 'right'
          const velocity = playerFacingLeft ? -10 : 10
          
          // Spawn projectile from the same position as melee attack box
          // Calculate attack box position (same logic as in Fighter.update)
          const mirroredOffsetX = player.flipped
            ? -player.attackBox.offset.x - player.attackBox.width
            : player.attackBox.offset.x
          const attackBoxX = player.position.x + mirroredOffsetX
          const attackBoxY = player.position.y + player.attackBox.offset.y
          
          // Spawn from the front edge of the attack box (closer to character)
          const startX = playerFacingLeft 
            ? attackBoxX + 20 // Spawn from left edge when facing left (moved closer)
            : attackBoxX + player.attackBox.width + 20 // Spawn from right edge when facing right (moved closer)
          const startY = attackBoxY + (player.attackBox.height / 2) - 20 // Center vertically in attack box
          
          playerProjectiles.push(
            new SlashProjectile({
              position: {
                x: startX,
                y: startY
              },
              velocity: { x: velocity, y: 0 },
              direction: direction
            })
          )
        }
        break
      case 'c':
        // Charge chakra
        if (!countdownActive && !dialogueActive) {
          startChargingChakra()
        }
        break
      case 'v':
        // Unleash chakra attack (only when chakra is full)
        if (!countdownActive && !dialogueActive && chakra >= chakraMax) {
          const direction = playerFacingLeft ? 'left' : 'right'
          unleashChakraAttack(player, direction)
        }
        break
    }
  }

  // Enemy is now AI-controlled, no keyboard input needed
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
  // Enemy is now AI-controlled, no keyboard input needed
  }
})
