// Image Manager - Handles image preloading
export class ImageManager {
  constructor() {
    this.imageCache = {}
    this.loadingPromises = {}
  }

  // Preload a single image
  async preload(path) {
    // Return existing if already cached
    if (this.imageCache[path]) {
      return this.imageCache[path]
    }

    // Return existing promise if already loading
    if (this.loadingPromises[path]) {
      await this.loadingPromises[path]
      return this.imageCache[path]
    }

    // Create loading promise
    const loadingPromise = new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        this.imageCache[path] = img
        delete this.loadingPromises[path]
        resolve(img)
      }

      img.onerror = (error) => {
        delete this.loadingPromises[path]
        reject(error)
      }

      img.src = path
    })

    this.loadingPromises[path] = loadingPromise
    return loadingPromise
  }

  // Preload multiple images
  async preloadAll(imagePaths) {
    const promises = imagePaths.map(path => this.preload(path))
    return Promise.all(promises)
  }

  // Get a preloaded image (returns cached image or creates new one)
  // Synchronous - returns immediately, even if image is still loading
  getImage(path) {
    if (this.imageCache[path]) {
      return this.imageCache[path]
    }
    
    // If not preloaded, create and cache it
    const img = new Image()
    img.src = path
    this.imageCache[path] = img
    return img
  }
  
  // Wait for an image to be fully loaded (async)
  // Use this when you need to ensure the image is ready before using it
  async waitForImage(path) {
    // If already cached and complete, return immediately
    if (this.imageCache[path]) {
      const img = this.imageCache[path]
      if (img.complete && img.width > 0 && img.height > 0) {
        return img
      }
      // If cached but not complete, wait for it
      if (img.complete === false) {
        await new Promise((resolve) => {
          const onLoad = () => {
            img.removeEventListener('load', onLoad)
            img.removeEventListener('error', onError)
            resolve()
          }
          const onError = () => {
            img.removeEventListener('load', onLoad)
            img.removeEventListener('error', onError)
            resolve() // Resolve anyway to not block
          }
          img.addEventListener('load', onLoad)
          img.addEventListener('error', onError)
        })
        return img
      }
    }
    
    // If there's a loading promise, wait for it
    if (this.loadingPromises[path]) {
      await this.loadingPromises[path]
      return this.imageCache[path]
    }
    
    // If not preloaded, preload it now and wait
    await this.preload(path)
    return this.imageCache[path]
  }

  // Check if an image is loaded
  isLoaded(path) {
    const img = this.imageCache[path]
    return img && img.complete && img.width > 0 && img.height > 0
  }
}

// Export singleton instance
export const imageManager = new ImageManager()

