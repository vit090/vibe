import { combatConfig } from '../config'

/** Shows a brief "You Died" overlay, then reloads the page for a clean restart. */
export function triggerGameOver(): void {
  const overlay = document.createElement('div')
  overlay.className = 'game-over'
  overlay.textContent = 'You Died'
  document.body.appendChild(overlay)

  requestAnimationFrame(() => overlay.classList.add('game-over--visible'))

  // Wait for the death-flip animation to finish playing before reloading.
  setTimeout(
    () => window.location.reload(),
    combatConfig.deathFlipDuration * 1000 + 500
  )
}
