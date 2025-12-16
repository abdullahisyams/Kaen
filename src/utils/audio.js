// Audio Manager
let titleScreenMusic = null
let musicInitialized = false

export function initTitleScreenMusic() {
  if (!titleScreenMusic) {
    titleScreenMusic = new Audio('./sfx/title screen.mp3')
    titleScreenMusic.loop = true
    titleScreenMusic.volume = 0.5
    musicInitialized = true
  }
  return titleScreenMusic
}

export function playTitleScreenMusic() {
  const music = initTitleScreenMusic()
  // Try to play, but handle autoplay restrictions
  const playPromise = music.play()
  if (playPromise !== undefined) {
    playPromise.catch(err => {
      // Autoplay was prevented - this is normal, user interaction will start it
      console.log('Music autoplay prevented, will play on user interaction:', err)
    })
  }
}

export function stopTitleScreenMusic() {
  if (titleScreenMusic) {
    titleScreenMusic.pause()
    titleScreenMusic.currentTime = 0
  }
}

export function pauseTitleScreenMusic() {
  if (titleScreenMusic) {
    titleScreenMusic.pause()
  }
}
