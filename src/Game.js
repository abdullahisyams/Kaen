// Main Game Class
import { BattleScene } from './scenes/BattleScene.js'
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js'
import { BackgroundSelectScene } from './scenes/BackgroundSelectScene.js'
import { MenuSelectScene, MENU_OPTIONS } from './scenes/MenuSelectScene.js'
import { DifficultySelectScene } from './scenes/DifficultySelectScene.js'
import { TitleScene, TITLE_MODES } from './scenes/TitleScene.js'
import { PostFightMenuScene, POST_FIGHT_OPTIONS } from './scenes/PostFightMenuScene.js'
import { CutsceneScene } from './scenes/CutsceneScene.js'
import { BossFightRetryScene } from './scenes/BossFightRetryScene.js'
import { SceneSelectorScene } from './scenes/SceneSelectorScene.js'
import { CreditsScene } from './scenes/CreditsScene.js'
import { PrologueScene } from './scenes/PrologueScene.js'
import { SettingsScene } from './scenes/SettingsScene.js'
import { CHARACTERS } from './config/characters.js'
import { registerKeyboardEvents, getKeys } from './engine/InputHandler.js'
import { getContext } from './utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT, BATTLE_TIMER_START } from './constants/game.js'

// Initialize input handler on module load
registerKeyboardEvents()

export class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas')
    if (!this.canvas) {
      console.error('Canvas element not found!')
      return
    }
    
    this.canvas.width = CANVAS_WIDTH
    this.canvas.height = CANVAS_HEIGHT
    
    const context = this.canvas.getContext('2d')
    // Context is automatically retrieved in getContext() from canvas element
    
    this.scene = null
    this.timer = BATTLE_TIMER_START
    this.timerId = null
    this.gameOver = false
    this.countdownActive = false
    this.selectedCharacters = null
    this.selectedBackground = null
    this.gameMode = null
    this.selectedDifficulty = null
    this.isBossFight = false // Track if current fight is a boss fight
    this.isCutscene9FightSequence = false // Track if we're in the cutscene 9 double fight sequence
    this.cutscene9FightNumber = 0 // Track if current fight is a boss fight
    this.currentCutsceneMusic = null // Store reference to current cutscene music (for cutscenes 4, 6, 8, 9)
    this.currentCutsceneMusicPlaying = false // Track if cutscene music is playing
    
    // Title screen music
    this.titleMusic = new Audio('./sfx/title screen.mp3')
    this.titleMusic.loop = true
    this.titleMusic.volume = 0.7
    this.titleMusicPlaying = false
    this.titleMusicLoaded = false
    
    // Preload the music
    this.titleMusic.addEventListener('canplaythrough', () => {
      this.titleMusicLoaded = true
    })
    this.titleMusic.load()
    
    // Stage & Character select music
    this.stageSelectMusic = new Audio('./sfx/stage&character select.mp3')
    this.stageSelectMusic.loop = true
    this.stageSelectMusic.volume = 0.7
    this.stageSelectMusicPlaying = false
    
    // Preload the music
    this.stageSelectMusic.addEventListener('canplaythrough', () => {
      // Music loaded
    })
    this.stageSelectMusic.load()
    
    // Initialize game with menu select
    this.initialize()
  }

  initialize() {
    // Hide health bars and countdown during selection
    this.hideHealthBars()
    this.hideCountdown()
    
    // Start with title screen
    this.showTitleScreen()
  }
  
  showTitleScreen() {
    // Reset all game state when returning to title screen
    this.resetGameState()
    this.isBossFight = false
    this.isCutscene9FightSequence = false
    this.cutscene9FightNumber = 0
    this.selectedCharacters = null
    this.selectedBackground = null
    this.gameMode = null
    this.selectedDifficulty = null
    this.currentCutscene = null
    
    // Try to start title screen music (may be blocked by browser autoplay policy)
    // If blocked, it will start on first user interaction in update()
    if (!this.titleMusicPlaying) {
      const playPromise = this.titleMusic.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.titleMusicPlaying = true
          })
          .catch(() => {
            // Autoplay was prevented - music will start on first user interaction
            // Don't set titleMusicPlaying to false, keep it as false so update() can try again
          })
      }
    }
    
    this.scene = new TitleScene((titleMode) => {
      // PVP Mode goes to menu selector (2 Player / VS Computer)
      // Story Mode could go to a story mode scene (for now, also go to menu)
      if (titleMode === TITLE_MODES.PVP_MODE) {
        this.showMenuSelect()
      } else if (titleMode === TITLE_MODES.STORY_MODE) {
        // Start story mode with first cutscene
        this.startStoryMode()
      }
    })
  }
  
  showMenuSelect() {
    // Keep title music playing (don't stop it)
    this.scene = new MenuSelectScene((gameMode) => {
      this.gameMode = gameMode
      // If VS Computer, show difficulty selector, otherwise go to background select
      if (gameMode === MENU_OPTIONS.VS_COMPUTER) {
        this.showDifficultySelect()
      } else {
        this.showBackgroundSelect()
      }
    }, () => {
      // Back button - return to title screen
      this.showTitleScreen()
    }, () => {
      // Settings button - show settings
      this.showSettings()
    })
  }
  
  showSettings() {
    this.scene = new SettingsScene(() => {
      // Back button - return to menu selector
      this.showMenuSelect()
    })
  }
  
  showDifficultySelect() {
    // Keep title music playing (don't stop it)
    this.scene = new DifficultySelectScene((difficulty) => {
      this.selectedDifficulty = difficulty
      // Move to background select after difficulty is selected
      this.showBackgroundSelect()
    }, () => {
      // Back button callback - return to menu select
      this.showMenuSelect()
    })
  }
  
  showBackgroundSelect() {
    // Stop title music and start stage select music
    if (this.titleMusicPlaying) {
      this.titleMusic.pause()
      this.titleMusic.currentTime = 0
      this.titleMusicPlaying = false
    }
    
    // Set volume to match character select (0.4) for consistency
    if (this.stageSelectMusicPlaying) {
      this.stageSelectMusic.volume = 0.4 // Match character select volume
    }
    
    // Start stage select music if not already playing
    if (!this.stageSelectMusicPlaying) {
      this.stageSelectMusic.volume = 0.4 // Match character select volume
      const playPromise = this.stageSelectMusic.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.stageSelectMusicPlaying = true
          })
          .catch(() => {
            // Autoplay blocked, will try on user interaction
          })
      }
    }
    
    this.scene = new BackgroundSelectScene((background) => {
      this.selectedBackground = background
      // Keep stage select music playing - it continues to character select
      // Move to character select after background is selected, passing the selected background
      this.showCharacterSelect()
    }, () => {
      // Back button callback - stop stage select music, resume title music
      if (this.stageSelectMusicPlaying) {
        this.stageSelectMusic.pause()
        this.stageSelectMusic.currentTime = 0
        this.stageSelectMusicPlaying = false
      }
      
      // Resume title music
      if (!this.titleMusicPlaying) {
        const playPromise = this.titleMusic.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.titleMusicPlaying = true
            })
            .catch(() => {
              // Will try on user interaction
            })
        }
      }
      
      // Return to difficulty select if VS Computer, otherwise menu select
      if (this.gameMode === MENU_OPTIONS.VS_COMPUTER) {
        this.showDifficultySelect()
      } else {
        this.showMenuSelect()
      }
    })
  }
  
  showCharacterSelect() {
    // Lower volume for character select
    if (this.stageSelectMusicPlaying) {
      this.stageSelectMusic.volume = 0.4 // Lower volume (from 0.7 to 0.4)
    }
    
    // Keep stage select music playing (don't stop it)
    // If music isn't playing, try to start it (in case we came from a different path)
    if (!this.stageSelectMusicPlaying) {
      this.stageSelectMusic.volume = 0.4 // Set lower volume before starting
      const playPromise = this.stageSelectMusic.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.stageSelectMusicPlaying = true
          })
          .catch(() => {
            // Autoplay blocked, will try on user interaction
          })
      }
    }
    
    this.scene = new CharacterSelectScene((selections) => {
      this.selectedCharacters = selections
      // Stop stage select music before starting battle
      if (this.stageSelectMusicPlaying) {
        this.stageSelectMusic.pause()
        this.stageSelectMusic.currentTime = 0
        this.stageSelectMusicPlaying = false
      }
      this.startCountdown()
    }, this.selectedBackground, () => {
      // Back button callback - return to background select (volume already matches)
      this.showBackgroundSelect()
    }, this.gameMode)
  }
  
  startStoryMode() {
    // Show scene selector first
    this.showSceneSelector()
  }
  
  showSceneSelector() {
    // Keep title music playing (don't stop it)
    const sceneSelector = new SceneSelectorScene(
      (startCutscene) => {
        // When scene is selected, stop music and check if it's prologue (0) or a cutscene
        if (this.titleMusicPlaying) {
          this.titleMusic.pause()
          this.titleMusic.currentTime = 0
          this.titleMusicPlaying = false
        }
        
        if (startCutscene === 0) {
          // Prologue selected
          this.showPrologue()
        } else {
          // Cutscene selected
          this.currentCutscene = startCutscene
          this.showCutscene(startCutscene)
        }
      },
      () => {
        // Back button - return to title screen (music continues)
        this.showTitleScreen()
      }
    )
    this.scene = sceneSelector
  }
  
  showPrologue() {
    // Music already stopped in showSceneSelector when scene was selected
    const prologueScene = new PrologueScene(() => {
      // After prologue completes, go to cutscene 1
      this.currentCutscene = 1
      this.showCutscene(1)
    })
    this.scene = prologueScene
  }
  
  showCredits() {
    const creditsScene = new CreditsScene(() => {
      // After credits complete, return to title screen
      this.showTitleScreen()
    })
    this.scene = creditsScene
  }
  
  showCutscene(cutsceneNumber) {
    // Stop title music when entering cutscene
    if (this.titleMusicPlaying) {
      this.titleMusic.pause()
      this.titleMusic.currentTime = 0
      this.titleMusicPlaying = false
    }
    
    // Reset fight-related state when showing a cutscene
    this.resetGameState()
    this.isBossFight = false
    this.isCutscene9FightSequence = false
    this.cutscene9FightNumber = 0
    
    // Clear previous cutscene music reference
    this.currentCutsceneMusic = null
    this.currentCutsceneMusicPlaying = false
    
    const cutsceneScene = new CutsceneScene(cutsceneNumber, () => {
      // Store music reference for cutscenes that lead to fights (4, 6, 8, 9)
      // Store BEFORE handleCutsceneComplete to ensure reference is saved
      if (cutsceneNumber === 4 && cutsceneScene.cutscene4Music) {
        this.currentCutsceneMusic = cutsceneScene.cutscene4Music
        this.currentCutsceneMusicPlaying = cutsceneScene.cutscene4MusicPlaying
      } else if (cutsceneNumber === 6 && cutsceneScene.cutscene6Music) {
        this.currentCutsceneMusic = cutsceneScene.cutscene6Music
        this.currentCutsceneMusicPlaying = cutsceneScene.cutscene6MusicPlaying
      } else if (cutsceneNumber === 8 && cutsceneScene.cutscene8Music) {
        this.currentCutsceneMusic = cutsceneScene.cutscene8Music
        this.currentCutsceneMusicPlaying = cutsceneScene.cutscene8MusicPlaying
      } else if (cutsceneNumber === 9 && cutsceneScene.cutscene9Music) {
        this.currentCutsceneMusic = cutsceneScene.cutscene9Music
        this.currentCutsceneMusicPlaying = cutsceneScene.cutscene9MusicPlaying
      }
      
      // Cutscene complete, move to next cutscene or battle
      this.handleCutsceneComplete(cutsceneNumber)
    })
    this.scene = cutsceneScene
  }
  
  handleCutsceneComplete(cutsceneNumber) {
    // After cutscene 1, move to cutscene 2
    if (cutsceneNumber === 1) {
      // After cutscene 1, go to cutscene 2
      this.currentCutscene = 2
      this.showCutscene(2)
    } else if (cutsceneNumber === 2) {
      // After cutscene 2, go to cutscene 3
      this.currentCutscene = 3
      this.showCutscene(3)
    } else if (cutsceneNumber === 3) {
      // After cutscene 3, go to cutscene 4
      this.currentCutscene = 4
      this.showCutscene(4)
    } else if (cutsceneNumber === 4) {
      // After cutscene 4, start boss fight with Wakasa
      this.startBossFight()
    } else if (cutsceneNumber === 5) {
      // After cutscene 5, go to cutscene 6
      this.currentCutscene = 6
      this.showCutscene(6)
    } else if (cutsceneNumber === 6) {
      // After cutscene 6, start boss fight with Kenji (medium difficulty)
      // Music reference should already be stored in the callback above
      // Ensure music continues playing during the fight
      if (this.currentCutsceneMusic && !this.currentCutsceneMusicPlaying) {
        // If music stopped, try to resume it
        const playPromise = this.currentCutsceneMusic.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.currentCutsceneMusicPlaying = true
            })
            .catch(() => {
              // Couldn't resume, but that's okay
            })
        }
      }
      this.startKenjiBossFightMedium()
    } else if (cutsceneNumber === 7) {
      // After cutscene 7, go to cutscene 8
      this.currentCutscene = 8
      this.showCutscene(8)
    } else if (cutsceneNumber === 8) {
      // After cutscene 8, start boss fight with Serena (medium difficulty)
      this.startSerenaBossFightMedium()
    } else if (cutsceneNumber === 9) {
      // After cutscene 9, start double boss fight sequence
      this.startCutscene9FightSequence()
    } else if (cutsceneNumber === 10) {
      // After cutscene 10, show credits scene
      this.showCredits()
    }
  }
  
  hideCountdown() {
    const countdownOverlay = document.getElementById('startCountdown')
    if (countdownOverlay) {
      countdownOverlay.style.display = 'none'
    }
  }

  startCountdown() {
    // Ensure countdown is not active before starting
    this.countdownActive = false
    
    // First, start the battle scene (characters appear on battlefield)
    this.startBattle()
    
    // Wait a moment for scene to render, then start countdown
    setTimeout(() => {
      this.countdownActive = true
    const overlay = document.getElementById('startCountdown')
    if (!overlay) {
      this.countdownActive = false
      this.startTimer()
      return
    }

    const sequence = ['3', '2', '1', 'FIGHT!']
    let idx = 0
    overlay.style.display = 'flex'

    const tick = () => {
      overlay.innerHTML = sequence[idx]
      idx++
      if (idx < sequence.length) {
        setTimeout(tick, 1000)
      } else {
        setTimeout(() => {
          overlay.style.display = 'none'
          this.countdownActive = false
          this.startTimer()
        }, 700)
      }
    }

    tick()
    }, 300) // Small delay to ensure battle scene is rendered with characters visible
  }

  startBossFight() {
    // Reset game state before starting new boss fight
    this.resetGameState()
    this.isCutscene9FightSequence = false
    this.cutscene9FightNumber = 0
    
    // Start boss fight: Kaen vs Wakasa (easy difficulty bot)
    this.isBossFight = true
    this.selectedCharacters = {
      player1: CHARACTERS.KAEN,
      player2: CHARACTERS.WAKASA
    }
    this.selectedBackground = 'snowy everest'
    this.gameMode = 'vsComputer'
    this.selectedDifficulty = 'easy'
    
    this.startCountdown()
  }
  
  startKenjiBossFight() {
    // Reset game state before starting new boss fight
    this.resetGameState()
    this.isCutscene9FightSequence = false
    this.cutscene9FightNumber = 0
    
    // Start boss fight: Kaen vs Kenji (easy difficulty bot)
    this.isBossFight = true
    this.selectedCharacters = {
      player1: CHARACTERS.KAEN,
      player2: CHARACTERS.KENJI
    }
    this.selectedBackground = 'nether portal'
    this.gameMode = 'vsComputer'
    this.selectedDifficulty = 'easy'
    
    this.startCountdown()
  }
  
  startKenjiBossFightMedium() {
    // Reset game state before starting new boss fight
    // NOTE: Don't clear currentCutsceneMusic here - it should continue playing during the fight
    this.resetGameState()
    this.isCutscene9FightSequence = false
    this.cutscene9FightNumber = 0
    
    // Ensure cutscene 6 music continues playing during the fight
    if (this.currentCutsceneMusic && this.currentCutsceneMusicPlaying) {
      // Music should already be playing, but ensure it continues
      if (this.currentCutsceneMusic.paused) {
        this.currentCutsceneMusic.play().catch(() => {})
      }
    }
    
    // Start boss fight: Kaen vs Kenji (medium difficulty bot) - for cutscene 6
    this.isBossFight = true
    this.selectedCharacters = {
      player1: CHARACTERS.KAEN,
      player2: CHARACTERS.KENJI
    }
    this.selectedBackground = 'nether portal'
    this.gameMode = 'vsComputer'
    this.selectedDifficulty = 'medium'
    
    this.startCountdown()
  }
  
  startSerenaBossFightMedium() {
    // Reset game state before starting new boss fight
    this.resetGameState()
    this.isCutscene9FightSequence = false
    this.cutscene9FightNumber = 0
    
    // Start boss fight: Kaen vs Serena (medium difficulty bot) - for cutscene 8
    this.isBossFight = true
    this.selectedCharacters = {
      player1: CHARACTERS.KAEN,
      player2: CHARACTERS.SERENA
    }
    this.selectedBackground = 'nether throne'
    this.gameMode = 'vsComputer'
    this.selectedDifficulty = 'medium'
    
    this.startCountdown()
  }
  
  startCutscene9FightSequence() {
    // Start the double boss fight sequence for cutscene 9
    // First fight: Wakasa vs Kenji
    this.isCutscene9FightSequence = true
    this.cutscene9FightNumber = 1
    this.startCutscene9FirstFight()
  }
  
  startCutscene9FirstFight() {
    // First fight: Wakasa vs Kenji (medium difficulty bot)
    this.isBossFight = true
    this.selectedCharacters = {
      player1: CHARACTERS.WAKASA,
      player2: CHARACTERS.KENJI
    }
    this.selectedBackground = 'nether throne'
    this.gameMode = 'vsComputer'
    this.selectedDifficulty = 'medium'
    
    this.startCountdown()
  }
  
  startCutscene9SecondFight() {
    // Second fight: Kaen vs Serena (medium difficulty bot)
    this.isBossFight = true
    this.selectedCharacters = {
      player1: CHARACTERS.KAEN,
      player2: CHARACTERS.SERENA
    }
    this.selectedBackground = 'nether throne'
    this.gameMode = 'vsComputer'
    this.selectedDifficulty = 'medium'
    
    this.startCountdown()
  }
  
  startBattle() {
    // Ensure countdown is not active when starting battle
    this.countdownActive = false
    this.gameOver = false
    
    // Create battle scene with selected characters, background, game mode, difficulty, and boss fight flag
    this.scene = new BattleScene(
      this.selectedCharacters.player1,
      this.selectedCharacters.player2,
      this.selectedBackground,
      this.gameMode,
      this.selectedDifficulty,
      this.isBossFight
    )
    
    // Reset and show health bars
    this.resetHealthBars()
    this.showHealthBars()
    
    // Update health bars to sync with fighter health (in case fighters were created with different health)
    // Use a small delay to ensure the scene is fully initialized
    setTimeout(() => {
      if (this.scene && this.scene.updateHealthBar) {
        this.scene.updateHealthBar('player1')
        this.scene.updateHealthBar('player2')
      }
    }, 100)
  }
  
  resetHealthBars() {
    // Reset both health bars to 100% immediately (no animation)
    const player1Health = document.getElementById('playerHealth')
    const player2Health = document.getElementById('player2Health')
    
    if (player1Health) {
      // Kill any ongoing gsap animations and set to 100% immediately
      if (typeof gsap !== 'undefined') {
        gsap.killTweensOf('#playerHealth')
      }
      player1Health.style.width = '100%'
    }
    
    if (player2Health) {
      // Kill any ongoing gsap animations and set to 100% immediately
      if (typeof gsap !== 'undefined') {
        gsap.killTweensOf('#player2Health')
      }
      player2Health.style.width = '100%'
    }
  }
  
  showHealthBars() {
    const healthBarsContainer = document.getElementById('healthBarsContainer')
    if (healthBarsContainer) {
      healthBarsContainer.style.display = 'flex'
    }
  }
  
  hideHealthBars() {
    const healthBarsContainer = document.getElementById('healthBarsContainer')
    if (healthBarsContainer) {
      healthBarsContainer.style.display = 'none'
    }
  }

  startTimer() {
    this.decreaseTimer()
  }

  decreaseTimer() {
    if (this.timer <= 0 || this.gameOver) {
      this.endGame()
      return
    }

    const timerElement = document.getElementById('timer')
    if (timerElement) {
      timerElement.innerHTML = this.timer
    }

    this.timer--
    this.timerId = setTimeout(() => this.decreaseTimer(), 1000)
  }

  endGame() {
    if (this.gameOver) return
    
    this.gameOver = true
    if (this.timerId) {
      clearTimeout(this.timerId)
    }

    // Hide the display text overlay (we'll show it in the post-fight menu)
    const displayText = document.getElementById('displayText')
    if (displayText) {
      displayText.style.display = 'none'
    }

    // Get winner text
    const winner = this.scene.getWinner()
    let winnerText = 'Tie'
    
    if (winner === 'player1') {
      winnerText = 'Player 1 Wins'
    } else if (winner === 'player2') {
      winnerText = 'Player 2 Wins'
    }

    // Handle boss fight differently
    if (this.isBossFight) {
      // Hide health bars immediately when boss fight ends
      this.hideHealthBars()
      this.hideCountdown()
      
      setTimeout(() => {
        if (this.isCutscene9FightSequence) {
          // Handle cutscene 9 double fight sequence
          if (this.cutscene9FightNumber === 1) {
            // First fight (Wakasa vs Kenji) completed
            // Don't stop music yet - wait for second fight
            if (winner === 'player1') {
              // Wakasa wins - proceed to second fight
              this.resetGameState()
              this.cutscene9FightNumber = 2
              this.isCutscene9FightSequence = true
              this.startCutscene9SecondFight()
            } else {
              // Wakasa loses - show retry scene
              // Stop music on loss/retry
              if (this.currentCutsceneMusic && this.currentCutsceneMusicPlaying) {
                this.currentCutsceneMusic.pause()
                this.currentCutsceneMusic.currentTime = 0
                this.currentCutsceneMusicPlaying = false
                this.currentCutsceneMusic = null
              }
              this.showBossFightRetry()
            }
          } else if (this.cutscene9FightNumber === 2) {
            // Second fight (Kaen vs Serena) completed
            // Stop cutscene 9 music after second fight completes
            if (this.currentCutsceneMusic && this.currentCutsceneMusicPlaying) {
              this.currentCutsceneMusic.pause()
              this.currentCutsceneMusic.currentTime = 0
              this.currentCutsceneMusicPlaying = false
              this.currentCutsceneMusic = null
            }
            if (winner === 'player1') {
              // Kaen wins - go to cutscene 10
              this.isBossFight = false
              this.isCutscene9FightSequence = false
              this.cutscene9FightNumber = 0
              this.currentCutscene = 10
              this.showCutscene(10)
            } else {
              // Kaen loses - show retry scene
              this.showBossFightRetry()
            }
          }
        } else if (winner === 'player1') {
          // Stop cutscene music if it's playing (for cutscenes 4, 6, 8)
          // Note: Cutscene 9 is handled separately above
          if (this.currentCutsceneMusic && this.currentCutsceneMusicPlaying) {
            this.currentCutsceneMusic.pause()
            this.currentCutsceneMusic.currentTime = 0
            this.currentCutsceneMusicPlaying = false
            this.currentCutsceneMusic = null
          }
          
          // Kaen wins - check which boss fight
          // If fighting Serena, go to cutscene 9
          // If fighting Kenji, go to cutscene 7
          // Otherwise cutscene 5 (Wakasa fight)
          if (this.selectedCharacters && this.selectedCharacters.player2 === CHARACTERS.SERENA) {
            this.isBossFight = false
            this.currentCutscene = 9
            this.showCutscene(9)
          } else if (this.selectedCharacters && this.selectedCharacters.player2 === CHARACTERS.KENJI) {
            this.isBossFight = false
            this.currentCutscene = 7
            this.showCutscene(7)
          } else {
            this.isBossFight = false
            this.currentCutscene = 5
            this.showCutscene(5)
          }
        } else {
          // Kaen loses - show retry scene (works for both Wakasa and Kenji fights)
          // Stop music on loss/retry
          if (this.currentCutsceneMusic && this.currentCutsceneMusicPlaying) {
            this.currentCutsceneMusic.pause()
            this.currentCutsceneMusic.currentTime = 0
            this.currentCutsceneMusicPlaying = false
            this.currentCutsceneMusic = null
          }
          this.showBossFightRetry()
        }
      }, 1500)
    } else {
      // Show post-fight menu after a short delay
      setTimeout(() => {
        // Stop battles music if playing (PVP mode only)
        if (this.scene && this.scene.battlesMusic && this.scene.battlesMusicPlaying) {
          this.scene.battlesMusic.pause()
          this.scene.battlesMusic.currentTime = 0
          this.scene.battlesMusicPlaying = false
        }
        this.showPostFightMenu(winnerText)
      }, 1500) // Wait 1.5 seconds before showing menu
    }
  }
  
  showBossFightRetry() {
    // Hide health bars and countdown
    this.hideHealthBars()
    this.hideCountdown()
    
    // Determine which boss fight to retry
    const isKenjiFight = this.selectedCharacters && this.selectedCharacters.player2 === CHARACTERS.KENJI
    const isSerenaFight = this.selectedCharacters && this.selectedCharacters.player2 === CHARACTERS.SERENA
    const isWakasaFight = this.selectedCharacters && this.selectedCharacters.player1 === CHARACTERS.WAKASA
    
    // Show retry scene
    this.scene = new BossFightRetryScene(() => {
      // Retry - restart the boss fight
      this.resetGameState()
      if (this.isCutscene9FightSequence) {
        // Cutscene 9 fight sequence
        if (this.cutscene9FightNumber === 1) {
          // Retry first fight (Wakasa vs Kenji)
          this.startCutscene9FirstFight()
        } else if (this.cutscene9FightNumber === 2) {
          // Retry second fight (Kaen vs Serena)
          this.startCutscene9SecondFight()
        }
      } else if (isSerenaFight) {
        // Serena fight (medium difficulty from cutscene 8)
        this.startSerenaBossFightMedium()
      } else if (isKenjiFight) {
        // Check if it's the medium difficulty Kenji fight (from cutscene 6)
        if (this.selectedDifficulty === 'medium') {
          this.startKenjiBossFightMedium()
        } else {
          this.startKenjiBossFight()
        }
      } else {
        this.startBossFight()
      }
    }, () => {
      // Quit - go back to title screen
      this.resetGameState()
      this.isBossFight = false
      this.showTitleScreen()
    })
  }
  
  showPostFightMenu(winnerText) {
    // Hide health bars and countdown
    this.hideHealthBars()
    this.hideCountdown()
    
    // Show post-fight menu
    this.scene = new PostFightMenuScene((option) => {
      if (option === POST_FIGHT_OPTIONS.TITLE_SCREEN) {
        this.resetGameState()
        this.showTitleScreen()
      } else if (option === POST_FIGHT_OPTIONS.REMATCH) {
        // Rematch: restart the same battle with same settings
        this.resetGameState()
        // Ensure we have the necessary data for rematch
        if (this.selectedCharacters && this.selectedBackground) {
          this.startCountdown()
        } else {
          // If data is missing, go to mode selector
          this.showMenuSelect()
        }
      } else if (option === POST_FIGHT_OPTIONS.MODE_SELECTOR) {
        this.resetGameState()
        this.showMenuSelect()
      }
    }, winnerText)
  }
  
  resetGameState() {
    // Reset game state for new battle
    this.gameOver = false
    this.countdownActive = false
    this.timer = BATTLE_TIMER_START
    if (this.timerId) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
    
    // Hide display text
    const displayText = document.getElementById('displayText')
    if (displayText) {
      displayText.style.display = 'none'
    }
  }

  update() {
    // Try to start music on first user interaction (if autoplay was blocked)
    const sceneType = this.scene?.constructor?.name
    const keys = getKeys()
    const hasUserInteraction = Object.values(keys).some(key => key.justPressed || key.pressed)
    
    // Try to start title music if on title/menu/scene selector screens
    if (!this.titleMusicPlaying) {
      if (sceneType === 'TitleScene' || sceneType === 'MenuSelectScene' || sceneType === 'SceneSelectorScene') {
        if (hasUserInteraction) {
          const playPromise = this.titleMusic.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                this.titleMusicPlaying = true
              })
              .catch(() => {
                // Still blocked, will try again on next interaction
              })
          }
        }
      }
    }
    
    // Try to start stage select music if on background/character select screens
    if (!this.stageSelectMusicPlaying) {
      if (sceneType === 'BackgroundSelectScene' || sceneType === 'CharacterSelectScene') {
        if (hasUserInteraction) {
          const playPromise = this.stageSelectMusic.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                this.stageSelectMusicPlaying = true
              })
              .catch(() => {
                // Still blocked, will try again on next interaction
              })
          }
        }
      }
    }
    
    // Always update the scene (allows post-fight menu to work)
    if (this.scene) {
      // Only update battle scene if game is not over
      if (!this.gameOver) {
        // Pass countdownActive flag to battle scene
        if (this.scene.update) {
          this.scene.update(this.countdownActive)
        }
      
        // Check for game over condition (only in battle scene, not during countdown)
        if (!this.countdownActive && this.scene.player1 && this.scene.player2) {
          if (this.scene.player1.health <= 0 || this.scene.player2.health <= 0) {
        if (!this.gameOver) {
          this.endGame()
            }
          }
        }
      } else {
        // Game is over, but still update scene (for post-fight menu)
        if (this.scene.update) {
          this.scene.update()
        }
      }
    }
  }

  draw() {
    if (this.scene) {
      this.scene.draw()
    }
  }

  animate() {
    window.requestAnimationFrame(() => this.animate())
    
    this.update()
    this.draw()
  }

  start() {
    this.animate()
  }
}
