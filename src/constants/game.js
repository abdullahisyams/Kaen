// Game Constants
export const CANVAS_WIDTH = 1024
export const CANVAS_HEIGHT = 576
export const FRAME_TIME = 16.67 // ~60 FPS

// Game States
export const GameState = {
  MENU: 'menu',
  DIALOGUE: 'dialogue',
  COUNTDOWN: 'countdown',
  BATTLE: 'battle',
  GAME_OVER: 'gameOver'
}

// Timer
export const BATTLE_TIMER_START = 60 // seconds

// Countdown
export const COUNTDOWN_SEQUENCE = ['3', '2', '1', 'FIGHT!']
export const COUNTDOWN_INTERVAL = 1000 // milliseconds

