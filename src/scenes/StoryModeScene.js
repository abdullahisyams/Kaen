// Story Mode Scene - Handles cutscenes and dialogue
import { Sprite } from '../entities/Sprite.js'
import { getContext } from '../utils/context.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game.js'
import { getKeys, wasKeyJustPressed, updateInput } from '../engine/InputHandler.js'

// Story cutscenes data
export const STORY_CUTSCENES = {
  CUTSCENE_01: 0,
  CUTSCENE_02: 1,
  CUTSCENE_03: 2,
  CUTSCENE_04: 3,
  CUTSCENE_05: 4,
  CUTSCENE_06: 5,
  CUTSCENE_07: 6,
  CUTSCENE_08: 7,
  CUTSCENE_09: 8,
  CUTSCENE_10: 9
}

const storyData = [
  // CUTSCENE 01 - "A Quiet Forest"
  {
    id: STORY_CUTSCENES.CUTSCENE_01,
    title: "A Quiet Forest",
    location: "Forest Shop",
    background: './img/forest.png',
    dialogue: [
      { character: 'ISABELLA', text: "You're staring at the forest again." },
      { character: 'KAEN', text: "Someone has to watch the path." },
      { character: 'ISABELLA', text: "Then promise you'll protect it by living.", emotion: 'smiles' },
      { character: 'KAEN', text: "...I promise." }
    ],
    nextAction: 'cutscene' // Next cutscene
  },
  // CUTSCENE 02 - "The Witch Arrives"
  {
    id: STORY_CUTSCENES.CUTSCENE_02,
    title: "The Witch Arrives",
    location: "Forest Shop",
    background: './img/forest.png',
    dialogue: [
      { character: 'SERENA', text: "So this is where fate hides." },
      { character: 'KAEN', text: "We don't want trouble. Leave." },
      { character: 'SERENA', text: "Trouble was born here.", emotion: 'eyes Isabella' },
      { character: 'ISABELLA', text: "You're afraid of the future.", emotion: 'calm' },
      { character: 'SERENA', text: "I don't fear children.", emotion: 'angry' },
      { character: 'KENJI', text: "Lady Serena… are you certain?", emotion: 'hesitant' },
      { character: 'SERENA', text: "Do it." },
      { character: 'ISABELLA', text: "Kaen… don't follow me into darkness…", emotion: 'falling' }
    ],
    nextAction: 'cutscene' // Next cutscene
  },
  // CUTSCENE 03 - "Ashes of Home"
  {
    id: STORY_CUTSCENES.CUTSCENE_03,
    title: "Ashes of Home",
    location: "Forest (burned shop)",
    background: './img/forest.png',
    dialogue: [
      { character: 'KAEN', text: "I swear…", emotion: 'whisper' },
      { character: 'KAEN', text: "If strength is the only language you understand…\nI'll learn it." }
    ],
    nextAction: 'cutscene' // Next cutscene
  },
  // CUTSCENE 04 - "Mountain Trial"
  {
    id: STORY_CUTSCENES.CUTSCENE_04,
    title: "Mountain Trial",
    location: "Snowy Everest",
    background: './img/snowy everest.png',
    dialogue: [
      { character: 'WAKASA', text: "You smell like revenge." },
      { character: 'KAEN', text: "I need power." },
      { character: 'WAKASA', text: "Power without control destroys everything." },
      { character: 'KAEN', text: "Then destroy me if I fail." },
      { character: 'WAKASA', text: "Show me your resolve." }
    ],
    nextAction: 'battle', // Boss fight
    battleConfig: {
      player1: 'KAEN',
      player2: 'WAKASA',
      background: 'snowy everest'
    }
  },
  // CUTSCENE 05 - "Judgment"
  {
    id: STORY_CUTSCENES.CUTSCENE_05,
    title: "Judgment",
    location: "Snowy Everest",
    background: './img/snowy everest.png',
    dialogue: [
      { character: 'WAKASA', text: "You hesitated.", emotion: 'kneels, defeated' },
      { character: 'KAEN', text: "I won't lose myself." },
      { character: 'WAKASA', text: "Good. I will walk with you.", emotion: 'stands' }
    ],
    nextAction: 'cutscene' // Next cutscene
  },
  // CUTSCENE 06 - "Gate of Red"
  {
    id: STORY_CUTSCENES.CUTSCENE_06,
    title: "Gate of Red",
    location: "Nether Portal",
    background: './img/romasna.png',
    dialogue: [
      { character: 'KENJI', text: "You shouldn't have come." },
      { character: 'KAEN', text: "You were there. You let her die." },
      { character: 'KENJI', text: "I was already dead before I met Serena." },
      { character: 'WAKASA', text: "Then die free." }
    ],
    nextAction: 'battle', // Boss fight
    battleConfig: {
      player1: 'KAEN',
      player2: 'KENJI',
      background: 'romasna'
    }
  },
  // CUTSCENE 07 - "Choice"
  {
    id: STORY_CUTSCENES.CUTSCENE_07,
    title: "Choice",
    location: "Nether Portal",
    background: './img/romasna.png',
    dialogue: [
      { character: 'KENJI', text: "Finish it.", emotion: 'kneels, wounded' },
      { character: 'KAEN', text: "No. Live with what you chose.", emotion: 'lowers blade' },
      { character: 'KENJI', text: "…Then I will.", emotion: 'looks away' }
    ],
    nextAction: 'cutscene' // Next cutscene
  },
  // CUTSCENE 08 - "The Witch's Throne"
  {
    id: STORY_CUTSCENES.CUTSCENE_08,
    title: "The Witch's Throne",
    location: "Netherland",
    background: './img/netherland.png',
    dialogue: [
      { character: 'SERENA', text: "You've grown. Just like she would have.", emotion: 'floating' },
      { character: 'KAEN', text: "You killed her because you were weak." },
      { character: 'SERENA', text: "I killed her because I survived.", emotion: 'laughs' },
      { character: 'WAKASA', text: "Enough." }
    ],
    nextAction: 'battle', // Boss fight Phase 1
    battleConfig: {
      player1: 'KAEN',
      player2: 'SERENA',
      background: 'netherland'
    }
  },
  // CUTSCENE 09 - "Broken Loyalty"
  {
    id: STORY_CUTSCENES.CUTSCENE_09,
    title: "Broken Loyalty",
    location: "Netherland",
    background: './img/netherland.png',
    dialogue: [
      { character: 'KENJI', text: "This ends now.", emotion: 'enters, wounded' },
      { character: 'SERENA', text: "Traitor.", emotion: 'stumbles' },
      { character: 'KENJI', text: "No. Survivor." }
    ],
    nextAction: 'battle', // 2v2 Boss fight
    battleConfig: {
      player1: 'KAEN',
      player2: 'SERENA',
      background: 'netherland',
      is2v2: true,
      player1Partner: 'WAKASA',
      player2Partner: 'KENJI'
    }
  },
  // CUTSCENE 10 - "After the Flame"
  {
    id: STORY_CUTSCENES.CUTSCENE_10,
    title: "After the Flame",
    location: "Netherland",
    background: './img/netherland.png',
    dialogue: [
      { character: 'SERENA', text: "The future still burns…", emotion: 'echoing' },
      { character: 'WAKASA', text: "Your path doesn't end with revenge." },
      { character: 'KENJI', text: "Neither does mine." },
      { character: 'KAEN', text: "I'll protect what's left.", emotion: 'looks forward' }
    ],
    nextAction: 'end' // Story complete
  }
]

export class StoryModeScene {
  constructor(onCutsceneComplete, onBattleComplete) {
    this.onCutsceneComplete = onCutsceneComplete
    this.onBattleComplete = onBattleComplete
    this.currentCutsceneIndex = 0
    this.currentDialogueIndex = 0
    this.currentCutscene = storyData[this.currentCutsceneIndex]
    
    // Background
    this.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: this.currentCutscene.background
    })
    
    // Dialogue state
    this.dialogueComplete = false
    this.fadeAlpha = 0
    this.fadeDirection = 0 // 0 = no fade, 1 = fading out, -1 = fading in
    this.fadeSpeed = 0.05
  }

  update() {
    // Check input BEFORE updateInput() resets the flags
    let shouldAdvanceDialogue = false
    if (!this.dialogueComplete && this.fadeDirection === 0) {
      // Advance dialogue with Enter or Space
      if (wasKeyJustPressed('Enter') || wasKeyJustPressed(' ')) {
        shouldAdvanceDialogue = true
      }
    }
    
    // Now update input (resets justPressed flags)
    updateInput()
    
    // Advance dialogue if key was pressed
    if (shouldAdvanceDialogue) {
      this.advanceDialogue()
    }
    
    // Update background animation
    if (this.background) {
      this.background.update()
    }
    
    // Handle fade transitions
    if (this.fadeDirection !== 0) {
      this.fadeAlpha += this.fadeDirection * this.fadeSpeed
      if (this.fadeAlpha >= 1) {
        this.fadeAlpha = 1
        this.fadeDirection = 0
        // Fade complete - transition
        this.transitionToNext()
      } else if (this.fadeAlpha <= 0) {
        this.fadeAlpha = 0
        this.fadeDirection = 0
      }
    }
  }
  
  advanceDialogue() {
    this.currentDialogueIndex++
    
    if (this.currentDialogueIndex >= this.currentCutscene.dialogue.length) {
      // Dialogue complete
      this.dialogueComplete = true
      
      // Start fade out
      this.fadeDirection = 1
    }
  }
  
  transitionToNext() {
    if (this.currentCutscene.nextAction === 'battle') {
      // Transition to battle
      this.onBattleComplete(this.currentCutscene.battleConfig)
    } else if (this.currentCutscene.nextAction === 'cutscene') {
      // Move to next cutscene
      this.currentCutsceneIndex++
      if (this.currentCutsceneIndex < storyData.length) {
        this.currentCutscene = storyData[this.currentCutsceneIndex]
        this.currentDialogueIndex = 0
        this.dialogueComplete = false
        
        // Update background
        this.background = new Sprite({
          position: { x: 0, y: 0 },
          imageSrc: this.currentCutscene.background
        })
        
        // Fade in
        this.fadeAlpha = 1
        this.fadeDirection = -1
      } else {
        // Story complete
        this.onCutsceneComplete('end')
      }
    } else if (this.currentCutscene.nextAction === 'end') {
      // Story complete
      this.onCutsceneComplete('end')
    }
  }
  
  onBattleWin() {
    // After winning a battle, continue to next cutscene
    // Move to the cutscene that comes after the battle
    // Battles are at indices 3, 5, 7, 8, so next cutscenes are 4, 6, 8, 9
    this.currentCutsceneIndex++
    if (this.currentCutsceneIndex < storyData.length) {
      this.currentCutscene = storyData[this.currentCutsceneIndex]
      this.currentDialogueIndex = 0
      this.dialogueComplete = false
      
      // Update background
      this.background = new Sprite({
        position: { x: 0, y: 0 },
        imageSrc: this.currentCutscene.background
      })
      
      // Fade in
      this.fadeAlpha = 1
      this.fadeDirection = -1
    } else {
      // Story complete
      this.onCutsceneComplete('end')
    }
  }

  draw() {
    const c = getContext()
    if (!c) return
    
    // Draw background
    if (this.background) {
      this.background.draw()
    }
    
    // Draw overlay
    c.fillStyle = 'rgba(0, 0, 0, 0.5)'
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw dialogue if not complete
    if (!this.dialogueComplete && this.currentDialogueIndex < this.currentCutscene.dialogue.length) {
      const dialogue = this.currentCutscene.dialogue[this.currentDialogueIndex]
      
      // Dialogue box background
      const boxHeight = 150
      const boxY = CANVAS_HEIGHT - boxHeight - 20
      c.fillStyle = 'rgba(0, 0, 0, 0.8)'
      c.fillRect(20, boxY, CANVAS_WIDTH - 40, boxHeight)
      
      // Dialogue box border
      c.strokeStyle = 'white'
      c.lineWidth = 3
      c.strokeRect(20, boxY, CANVAS_WIDTH - 40, boxHeight)
      
      // Character name
      c.fillStyle = '#ffff00'
      c.font = '14px "Press Start 2P"'
      c.textAlign = 'left'
      c.fillText(dialogue.character, 40, boxY + 30)
      
      // Dialogue text
      c.fillStyle = 'white'
      c.font = '10px "Press Start 2P"'
      c.textAlign = 'left'
      
      // Handle multi-line text
      const lines = dialogue.text.split('\n')
      lines.forEach((line, index) => {
        c.fillText(line, 40, boxY + 60 + (index * 25))
      })
      
      // Emotion/action text (if present)
      if (dialogue.emotion) {
        c.fillStyle = '#888888'
        c.font = '8px "Press Start 2P"'
        c.fillText(`[${dialogue.emotion}]`, 40, boxY + 60 + (lines.length * 25) + 10)
      }
      
      // Continue prompt
      c.fillStyle = '#888888'
      c.font = '8px "Press Start 2P"'
      c.textAlign = 'right'
      c.fillText('Press Enter or Space to continue...', CANVAS_WIDTH - 40, boxY + boxHeight - 15)
    }
    
    // Draw fade overlay
    if (this.fadeAlpha > 0) {
      c.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`
      c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    }
  }
}
