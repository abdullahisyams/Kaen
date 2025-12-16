// Game Utility Functions
import { FighterState } from '../constants/fighter.js'

let postFightDialogueShown = false

export function determineWinner({ player, enemy, timerId, onWinner }) {
  if (timerId) {
    clearTimeout(timerId)
  }
  
  const displayText = document.querySelector('#displayText')
  if (displayText) {
    displayText.style.display = 'flex'
    if (player.health === enemy.health) {
      displayText.innerHTML = 'Tie'
    } else if (player.health > enemy.health) {
      displayText.innerHTML = 'Player 1 Wins'
    } else if (player.health < enemy.health) {
      displayText.innerHTML = 'Computer Wins'
    }
  }

  // Trigger post-fight dialogue
  try {
    if (!postFightDialogueShown) {
      postFightDialogueShown = true

      const postFight =
        player.health > enemy.health
          ? [
              { speaker: 'cpu', text: 'Tch... impressive.' },
              { speaker: 'p1', text: 'Good fight. You held your own.' },
              { speaker: 'cpu', text: "Next time, I won't hold back." }
            ]
          : [
              { speaker: 'p1', text: "Ngh... you're strong." },
              { speaker: 'cpu', text: 'You fought well.' },
              { speaker: 'p1', text: "Let's meet again on better terms." }
            ]

      setTimeout(() => {
        if (typeof window !== 'undefined') {
          const evt = new CustomEvent('startPostFightDialogue', { detail: { lines: postFight } })
          window.dispatchEvent(evt)
        }
      }, 700)
    }
  } catch (e) {
    // no-op
  }
  
  if (onWinner) {
    onWinner(player.health > enemy.health ? 'player' : 'enemy')
  }
}

