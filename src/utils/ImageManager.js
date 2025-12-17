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

  // Check if an image is loaded
  isLoaded(path) {
    const img = this.imageCache[path]
    return img && img.complete && img.width > 0 && img.height > 0
  }
}

// Export singleton instance
export const imageManager = new ImageManager()

