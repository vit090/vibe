import * as THREE from 'three'
import { combatConfig } from '../config'

let camera: THREE.Camera | null = null
let renderer: THREE.WebGLRenderer | null = null

/** Must be called once before spawnDamagePopup can project world positions to screen space. */
export function initDamagePopups(activeCamera: THREE.Camera, activeRenderer: THREE.WebGLRenderer): void {
  camera = activeCamera
  renderer = activeRenderer
}

/** Spawns a floating "-N" damage number over the given world position. */
export function spawnDamagePopup(worldPosition: THREE.Vector3, amount: number): void {
  if (!camera || !renderer) return

  const ndc = worldPosition.clone().project(camera)
  const rect = renderer.domElement.getBoundingClientRect()
  const x = rect.left + ((ndc.x + 1) / 2) * rect.width
  const y = rect.top + ((1 - ndc.y) / 2) * rect.height

  const el = document.createElement('div')
  el.className = 'damage-popup'
  el.textContent = `-${Math.round(amount)}`
  el.style.left = `${x}px`
  el.style.top = `${y}px`
  el.style.transition = `transform ${combatConfig.damagePopupDuration}s ease-out, opacity ${combatConfig.damagePopupDuration}s ease-out`
  document.body.appendChild(el)

  requestAnimationFrame(() => {
    el.style.transform = `translate(-50%, -${combatConfig.damagePopupRise}px)`
    el.style.opacity = '0'
  })

  setTimeout(() => el.remove(), combatConfig.damagePopupDuration * 1000)
}
