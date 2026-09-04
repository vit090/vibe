import { getCoins, onCoinsChanged } from '../core/Economy'
import { COIN_ICON_SVG } from './coinIcon'

/** Mounts the top-of-screen coin HUD and wires it to the Economy service. Returns the icon element (used as the landing target for flying coins). */
export function initCoinHud(): HTMLElement {
  const hud = document.createElement('div')
  hud.className = 'coin-hud'

  const icon = document.createElement('div')
  icon.className = 'coin-hud__icon'
  icon.innerHTML = COIN_ICON_SVG

  const count = document.createElement('span')
  count.className = 'coin-hud__count'
  count.textContent = String(getCoins())

  hud.appendChild(icon)
  hud.appendChild(count)
  document.body.appendChild(hud)

  onCoinsChanged((coins) => {
    count.textContent = String(coins)

    // Restart the pop animation even if it's still playing from a previous
    // (rapid) kill: remove the class, force a reflow, then re-add it.
    icon.classList.remove('coin-hud__icon--pop')
    void icon.offsetWidth
    icon.classList.add('coin-hud__icon--pop')
  })

  return icon
}
