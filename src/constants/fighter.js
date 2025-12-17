// Fighter States
export const FighterState = {
  IDLE: 'idle',
  RUN: 'run',
  JUMP_START: 'jumpStart',
  JUMP_UP: 'jumpUp',
  JUMP_DOWN: 'jumpDown',
  FALL: 'fall',
  ATTACK1: 'attack1',
  ATTACK2: 'attack2',
  TAKE_HIT: 'takeHit',
  DEATH: 'death',
  CHARGING: 'charging',
  DEFEND: 'defend'
}

// Fighter Direction
export const FighterDirection = {
  LEFT: -1,
  RIGHT: 1
}

// Fighter Attack Types
export const FighterAttackType = {
  MELEE: 'melee',
  RANGED: 'ranged',
  CHAKRA: 'chakra'
}

// Fighter Attack Data
export const FighterAttackData = {
  [FighterAttackType.MELEE]: {
    damage: 10, // Reduced from 20 to 10
    frames: 6,
    hitFrame: 4
  },
  [FighterAttackType.RANGED]: {
    damage: 20,
    frames: 6,
    spawnFrame: 4
  },
  [FighterAttackType.CHAKRA]: {
    damage: 80, // 4x normal damage
    frames: 6,
    spawnFrame: 4,
    requiresChakra: true
  }
}

// Fighter Properties
export const FIGHTER_DEFAULT_WIDTH = 50
export const FIGHTER_DEFAULT_HEIGHT = 150
export const FIGHTER_MAX_HEALTH = 200
export const FIGHTER_MAX_CHAKRA = 3
export const CHAKRA_CHARGE_TIME = 500 // milliseconds
export const GRAVITY = 0.7
export const FIGHTER_GROUND_Y = 330

// Fighter Movement
export const FIGHTER_RUN_SPEED = 3
export const FIGHTER_JUMP_VELOCITY = -20

