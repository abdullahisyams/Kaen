// Canvas Context Utility

let context = null

export function getContext() {
  if (!context) {
    const canvas = document.getElementById('gameCanvas') || document.querySelector('canvas')
    if (canvas) {
      context = canvas.getContext('2d')
    }
  }
  return context
}

export function setContext(ctx) {
  context = ctx
}

