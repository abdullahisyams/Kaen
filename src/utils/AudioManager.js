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

  // Preload an audio file using Fetch API with ArrayBuffer for better caching
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

    // Create loading promise using Fetch API for better performance
    const loadingPromise = (async () => {
      try {
        // Use Fetch API to load audio as ArrayBuffer (better caching)
        const response = await fetch(path)
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.statusText}`)
        }
        
        const arrayBuffer = await response.arrayBuffer()
        const blob = new Blob([arrayBuffer])
        const blobUrl = URL.createObjectURL(blob)
        
        // Create audio element from blob URL
        const audio = new Audio(blobUrl)
        
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
        await new Promise((resolve, reject) => {
          const onCanPlayThrough = () => {
            audio.removeEventListener('canplaythrough', onCanPlayThrough)
            audio.removeEventListener('error', onError)
            resolve()
          }

          const onError = (error) => {
            audio.removeEventListener('canplaythrough', onCanPlayThrough)
            audio.removeEventListener('error', onError)
            reject(error)
          }

          audio.addEventListener('canplaythrough', onCanPlayThrough)
          audio.addEventListener('error', onError)
          
          // Timeout after 10 seconds
          setTimeout(() => {
            if (!audio.readyState || audio.readyState < 2) {
              audio.removeEventListener('canplaythrough', onCanPlayThrough)
              audio.removeEventListener('error', onError)
              reject(new Error('Audio loading timeout'))
            }
          }, 10000)
        })
        
        // Cache the audio
        this.audioCache[path] = {
          audio: audio,
          type: type,
          path: path,
          blobUrl: blobUrl // Store blob URL for cleanup if needed
        }
        
        delete this.loadingPromises[path]
        return audio
      } catch (error) {
        delete this.loadingPromises[path]
        // Fallback to traditional loading method
        console.warn(`Fetch failed for ${path}, using fallback:`, error)
        return this.preloadFallback(path, type, options)
      }
    })()

    this.loadingPromises[path] = loadingPromise
    return loadingPromise
  }

  // Fallback method using traditional Audio loading
  async preloadFallback(path, type = 'sfx', options = {}) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(path)
      
      if (options.loop !== undefined) {
        audio.loop = options.loop
      }
      
      if (type === 'music') {
        audio.volume = this.musicVolume * this.masterVolume
      } else {
        audio.volume = this.sfxVolume * this.masterVolume
      }

      audio.preload = 'auto'
      audio.load()

      const onCanPlayThrough = () => {
        audio.removeEventListener('canplaythrough', onCanPlayThrough)
        audio.removeEventListener('error', onError)
        
        this.audioCache[path] = {
          audio: audio,
          type: type,
          path: path
        }
        
        resolve(audio)
      }

      const onError = (error) => {
        audio.removeEventListener('canplaythrough', onCanPlayThrough)
        audio.removeEventListener('error', onError)
        reject(error)
      }

      audio.addEventListener('canplaythrough', onCanPlayThrough)
      audio.addEventListener('error', onError)
    })
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

