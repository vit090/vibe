import * as THREE from 'three'
import { coinFlyConfig } from '../config'
import { addCoins } from '../core/Economy'
import { COIN_ICON_SVG } from '../ui/coinIcon'

let camera: THREE.Camera | null = null
let renderer: THREE.WebGLRenderer | null = null
let hudTarget: HTMLElement | null = null

/** Must be called once before spawnCoinFly can animate coins to the HUD. */
export function initCoinFly(
  activeCamera: THREE.Camera,
  activeRenderer: THREE.WebGLRenderer,
  hudIcon: HTMLElement
): void {
  camera = activeCamera
  renderer = activeRenderer
  hudTarget = hudIcon
}

/**
 * Spawns a coin icon at the given world position and flies it to the HUD's
 * coin icon. `amount` is only credited (via Economy.addCoins, which also
 * triggers the HUD's pop) once the coin actually arrives.
 */
export function spawnCoinFly(worldPosition: THREE.Vector3, amount: number): void {
  if (!camera || !renderer || !hudTarget) return

  const ndc = worldPosition.clone().project(camera)
  const rect = renderer.domElement.getBoundingClientRect()
  const startX = rect.left + ((ndc.x + 1) / 2) * rect.width
  const startY = rect.top + ((1 - ndc.y) / 2) * rect.height

  const targetRect = hudTarget.getBoundingClientRect()
  const endX = targetRect.left + targetRect.width / 2
  const endY = targetRect.top + targetRect.height / 2

  const el = document.createElement('div')
  el.className = 'coin-fly'
  el.innerHTML = COIN_ICON_SVG
  el.style.left = `${startX}px`
  el.style.top = `${startY}px`
  el.style.transition = `transform ${coinFlyConfig.duration}s ease-in, opacity ${coinFlyConfig.duration}s ease-in`
  document.body.appendChild(el)

  requestAnimationFrame(() => {
    el.style.transform = `translate(calc(-50% + ${endX - startX}px), calc(-50% + ${endY - startY}px)) scale(0.4)`
    el.style.opacity = '0.5'
  })

  setTimeout(() => {
    el.remove()
    addCoins(amount)
  }, coinFlyConfig.duration * 1000)
}

/**
 * Flies one coin icon from the HUD to the given world position — the
 * reverse of spawnCoinFly, for spending rather than earning. Purely visual
 * (no callback): UpgradeStation deducts coins instantly, one at a time,
 * calling this once per deposit so a steady stream of coins flies out while
 * the player stands in the upgrade zone.
 */
export function flyCoinToUpgrade(worldPosition: THREE.Vector3): void {
  if (!camera || !renderer || !hudTarget) return

  const hudRect = hudTarget.getBoundingClientRect()
  const startX = hudRect.left + hudRect.width / 2 + (Math.random() * 2 - 1) * 6
  const startY = hudRect.top + hudRect.height / 2 + (Math.random() * 2 - 1) * 6

  const jitteredTarget = worldPosition
    .clone()
    .add(new THREE.Vector3((Math.random() * 2 - 1) * 0.6, Math.random() * 0.6, (Math.random() * 2 - 1) * 0.6))
  const ndc = jitteredTarget.project(camera)
  const rect = renderer.domElement.getBoundingClientRect()
  const endX = rect.left + ((ndc.x + 1) / 2) * rect.width
  const endY = rect.top + ((1 - ndc.y) / 2) * rect.height

  const el = document.createElement('div')
  el.className = 'coin-fly'
  el.innerHTML = COIN_ICON_SVG
  el.style.left = `${startX}px`
  el.style.top = `${startY}px`
  el.style.transition = `transform ${coinFlyConfig.duration}s ease-in, opacity ${coinFlyConfig.duration}s ease-in`
  document.body.appendChild(el)

  requestAnimationFrame(() => {
    el.style.transform = `translate(calc(-50% + ${endX - startX}px), calc(-50% + ${endY - startY}px)) scale(1.2)`
    el.style.opacity = '0.7'
  })

  setTimeout(() => el.remove(), coinFlyConfig.duration * 1000)
}
