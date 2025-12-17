// Input Handler for managing keyboard input

const keys = {
  a: { pressed: false, justPressed: false },
  d: { pressed: false, justPressed: false },
  w: { pressed: false, justPressed: false },
  s: { pressed: false, justPressed: false },
  S: { pressed: false, justPressed: false },
  q: { pressed: false, justPressed: false },
  c: { pressed: false, justPressed: false },
  v: { pressed: false, justPressed: false },
  e: { pressed: false, justPressed: false },
  t: { pressed: false, justPressed: false },
  T: { pressed: false, justPressed: false },
  b: { pressed: false, justPressed: false },
  B: { pressed: false, justPressed: false },
  Backspace: { pressed: false, justPressed: false },
  Enter: { pressed: false, justPressed: false },
  ' ': { pressed: false, justPressed: false },
  ArrowLeft: { pressed: false, justPressed: false },
  ArrowRight: { pressed: false, justPressed: false },
  ArrowUp: { pressed: false, justPressed: false },
  ArrowDown: { pressed: false, justPressed: false },
  '/': { pressed: false, justPressed: false },
  '.': { pressed: false, justPressed: false },
  ',': { pressed: false, justPressed: false },
  ';': { pressed: false, justPressed: false },
  '9': { pressed: false, justPressed: false },
  'Digit9': { pressed: false, justPressed: false }
}

let lastKey = ''

export function getKeys() {
  return keys
}

export function getLastKey() {
  return lastKey
}

export function isKeyPressed(key) {
  return keys[key]?.pressed || false
}

export function registerKeyboardEvents(onKeyDown, onKeyUp) {
  window.addEventListener('keydown', (event) => {
    if (keys[event.key]) {
      const wasAlreadyPressed = keys[event.key].pressed
      keys[event.key].pressed = true
      if (!wasAlreadyPressed) {
        keys[event.key].justPressed = true
      }
      lastKey = event.key
    }
    
    if (onKeyDown) {
      onKeyDown(event)
    }
  }, false)

  window.addEventListener('keyup', (event) => {
    if (keys[event.key]) {
      keys[event.key].pressed = false
      keys[event.key].justPressed = false
    }
    
    if (onKeyUp) {
      onKeyUp(event)
    }
  }, false)
}

// Reset justPressed flags after they've been checked
export function updateInput() {
  Object.keys(keys).forEach(key => {
    keys[key].justPressed = false
  })
}

export function wasKeyJustPressed(key) {
  return keys[key]?.justPressed || false
}

export function resetKeys() {
  Object.keys(keys).forEach(key => {
    keys[key].pressed = false
  })
  lastKey = ''
}

