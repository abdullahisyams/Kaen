// AI Difficulty Levels
export const AI_DIFFICULTY = {
  EASY: 1,
  MEDIUM: 3,
  HARD: 5
}

// AI Difficulty Settings
export function getDifficultySettings(difficulty) {
  difficulty = Math.max(1, Math.min(5, difficulty))
  
  let decisionInterval
  if (difficulty === 5) {
    decisionInterval = 10
  } else {
    decisionInterval = 90 - (difficulty - 1) * 20
  }
  
  let meleeAttackChance, rangedAttackChance, chakraAttackChance
  if (difficulty === 5) {
    meleeAttackChance = 0.98
    rangedAttackChance = 0.90 // Increased from 0.85
    chakraAttackChance = 0.75 // Increased from 0.70
  } else {
    // Increased base attack chances
    meleeAttackChance = 0.35 + (difficulty - 1) * 0.18 // Increased from 0.3 + (difficulty - 1) * 0.15
    rangedAttackChance = 0.25 + (difficulty - 1) * 0.12 // Increased from 0.2 + (difficulty - 1) * 0.1
    chakraAttackChance = 0.15 + (difficulty - 1) * 0.06 // Increased from 0.1 + (difficulty - 1) * 0.05
  }
  
  const movementSpeed = difficulty === 5 ? 9 : (3.5 + (difficulty - 1) * 1.2) // Slightly faster
  const cooldownMultiplier = difficulty === 5 ? 0.25 : (0.9 - (difficulty - 1) * 0.15) // Faster cooldowns
  const chakraChargeChance = difficulty === 5 ? 0.85 : (0.20 + (difficulty - 1) * 0.10) // More frequent charging
  const dodgeChance = difficulty === 5 ? 0.95 : (0.25 + (difficulty - 1) * 0.18) // Better dodging
  const optimalRange = difficulty === 5 ? 80 : (180 - (difficulty - 1) * 25) // More aggressive positioning
  
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

