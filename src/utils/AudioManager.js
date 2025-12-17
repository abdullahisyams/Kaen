// Audio Manager - Handles audio preloading and playback
export class AudioManager {
  constructor() {
    this.audioCache = {}
    this.loadingPromises = {}
    this.masterVolume = 1.0
    this.musicVolume = 0.7
    this.sfxVolume = 0.7
    this.loadSettings()
  }

  loadSettings() {
    try {
      const savedMasterVolume = localStorage.getItem('masterVolume')
      const savedMusicVolume = localStorage.getItem('musicVolume')
      const savedSfxVolume = localStorage.getItem('sfxVolume')
      
      if (savedMasterVolume !== null) {
        this.masterVolume = parseFloat(savedMasterVolume)
      }
      if (savedMusicVolume !== null) {
        this.musicVolume = parseFloat(savedMusicVolume)
      }
      if (savedSfxVolume !== null) {
        this.sfxVolume = parseFloat(savedSfxVolume)
      }
    } catch (e) {
      // If localStorage is not available, use defaults
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('masterVolume', this.masterVolume.toString())
      localStorage.setItem('musicVolume', this.musicVolume.toString())
      localStorage.setItem('sfxVolume', this.sfxVolume.toString())
    } catch (e) {
      // If localStorage is not available, ignore
    }
  }

  updateVolume(volumeType, value) {
    const volume = Math.max(0.0, Math.min(1.0, value))
    this[volumeType] = volume
    this.saveSettings()
    
    // Update all cached audio volumes
    this.updateAllVolumes()
  }

  updateAllVolumes() {
    // Update volumes for all cached audio files
    Object.values(this.audioCache).forEach(audioData => {
      if (audioData.type === 'music') {
        audioData.audio.volume = this.musicVolume * this.masterVolume
      } else if (audioData.type === 'sfx') {
        audioData.audio.volume = this.sfxVolume * this.masterVolume
      }
    })
  }

  // Preload an audio file
  async preload(path, type = 'sfx', options = {}) {
    // Return existing if already cached
    if (this.audioCache[path]) {
      return this.audioCache[path].audio
    }

    // Return existing promise if already loading
    if (this.loadingPromises[path]) {
      await this.loadingPromises[path]
      return this.audioCache[path]?.audio
    }

    // Create loading promise
    const loadingPromise = new Promise((resolve, reject) => {
      const audio = new Audio(path)
      
      // Set default options
      if (options.loop !== undefined) {
        audio.loop = options.loop
      }
      
      // Set volume based on type
      if (type === 'music') {
        audio.volume = this.musicVolume * this.masterVolume
      } else {
        audio.volume = this.sfxVolume * this.masterVolume
      }

      // Preload the audio
      audio.preload = 'auto'
      audio.load()

      // Wait for audio to be ready
      const onCanPlayThrough = () => {
        audio.removeEventListener('canplaythrough', onCanPlayThrough)
        audio.removeEventListener('error', onError)
        
        // Cache the audio
        this.audioCache[path] = {
          audio: audio,
          type: type,
          path: path
        }
        
        delete this.loadingPromises[path]
        resolve(audio)
      }

      const onError = (error) => {
        audio.removeEventListener('canplaythrough', onCanPlayThrough)
        audio.removeEventListener('error', onError)
        delete this.loadingPromises[path]
        reject(error)
      }

      audio.addEventListener('canplaythrough', onCanPlayThrough)
      audio.addEventListener('error', onError)
    })

    this.loadingPromises[path] = loadingPromise
    return loadingPromise
  }

  // Get a preloaded audio instance (creates a new Audio element from the cached one's src)
  getAudio(path, type = 'sfx', options = {}) {
    if (!this.audioCache[path]) {
      // If not preloaded, create it synchronously (will still need to load)
      const audio = new Audio(path)
      if (options.loop !== undefined) {
        audio.loop = options.loop
      }
      
      if (type === 'music') {
        audio.volume = this.musicVolume * this.masterVolume
      } else {
        audio.volume = this.sfxVolume * this.masterVolume
      }
      
      // Cache it
      this.audioCache[path] = {
        audio: audio,
        type: type,
        path: path
      }
      
      return audio
    }

    // Clone the audio element for independent playback
    const cachedAudio = this.audioCache[path].audio
    const audio = new Audio(cachedAudio.src)
    
    if (options.loop !== undefined) {
      audio.loop = options.loop
    } else if (cachedAudio.loop) {
      audio.loop = cachedAudio.loop
    }
    
    audio.volume = cachedAudio.volume
    
    return audio
  }

  // Play audio (returns promise)
  async play(path, type = 'sfx', options = {}) {
    const audio = this.getAudio(path, type, options)
    
    try {
      await audio.play()
      return audio
    } catch (error) {
      // Autoplay may be blocked, return audio anyway
      return audio
    }
  }

  // Preload multiple audio files
  async preloadAll(audioPaths) {
    const promises = audioPaths.map(({ path, type, options }) => 
      this.preload(path, type, options)
    )
    return Promise.all(promises)
  }
}

// Export singleton instance
export const audioManager = new AudioManager()

