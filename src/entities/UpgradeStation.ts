import * as THREE from 'three'
import { upgradeConfig } from '../config'
import { applyWorldBend } from '../effects/WorldBend'
import { getCoins, addCoins } from '../core/Economy'
import { flyCoinToUpgrade } from '../effects/CoinFly'
import type { Player } from './Player'

/**
 * A stationary upgrade pad at the map center. Not part of the combat
 * hitbox/hurtbox system (it doesn't fight anyone) — just a simple proximity
 * trigger: while the player stands within `upgradeConfig.radius` and it
 * isn't on cooldown, it drains one coin at a time from the player's wallet
 * into this upgrade's progress, pausing whenever the player leaves or runs
 * out of coins, and resuming (from wherever it left off) when they return —
 * until progress reaches the full cost, at which point it applies the
 * upgrade and starts the cooldown.
 */
export class UpgradeStation {
  readonly object: THREE.Group

  private readonly player: Player
  private readonly ringMaterial: THREE.MeshBasicMaterial
  private readonly priceLabel: HTMLDivElement
  private readonly camera: THREE.Camera
  private readonly renderer: THREE.WebGLRenderer
  private cooldownRemaining = 0
  private progress = 0
  private depositTimer = 0
  private pulseTime = 0

  constructor(player: Player, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.player = player
    this.camera = camera
    this.renderer = renderer
    this.object = new THREE.Group()

    const padGeometry = new THREE.CylinderGeometry(2.5, 2.5, 0.3, 32)
    const padMaterial = applyWorldBend(
      new THREE.MeshStandardMaterial({ color: 0xffd54a, emissive: 0x553d00 })
    )
    const pad = new THREE.Mesh(padGeometry, padMaterial)
    pad.position.y = 0.15
    this.object.add(pad)

    const ringGeometry = new THREE.RingGeometry(
      upgradeConfig.radius * 0.95,
      upgradeConfig.radius,
      48
    )
    this.ringMaterial = applyWorldBend(
      new THREE.MeshBasicMaterial({
        color: 0xffd54a,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    )
    const ring = new THREE.Mesh(ringGeometry, this.ringMaterial)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.03
    this.object.add(ring)

    this.priceLabel = document.createElement('div')
    this.priceLabel.className = 'upgrade-price'
    document.body.appendChild(this.priceLabel)
  }

  update(deltaTime: number): void {
    this.pulseTime += deltaTime

    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining = Math.max(0, this.cooldownRemaining - deltaTime)
      this.ringMaterial.opacity = 0.15
    } else {
      this.ringMaterial.opacity = 0.5 + Math.sin(this.pulseTime * 3) * 0.15
    }

    this.updatePriceLabel()

    if (this.cooldownRemaining > 0) return

    const distance = this.player.object.position.distanceTo(this.object.position)
    const inZone = distance <= upgradeConfig.radius
    const remaining = upgradeConfig.cost - this.progress

    if (!inZone || remaining <= 0 || getCoins() <= 0) return

    this.depositTimer -= deltaTime
    if (this.depositTimer > 0) return
    this.depositTimer = upgradeConfig.depositInterval

    addCoins(-1)
    this.progress += 1

    const targetPosition = this.object.position.clone()
    targetPosition.y += 1.5
    flyCoinToUpgrade(targetPosition)

    if (this.progress >= upgradeConfig.cost) {
      this.progress = 0
      this.cooldownRemaining = upgradeConfig.cooldownSeconds
      this.player.applyUpgrade()
      this.showCompletionFlourish()
    }
  }

  private showCompletionFlourish(): void {
    if (!this.camera || !this.renderer) return

    const worldPosition = this.object.position.clone()
    worldPosition.y += 2.5
    const ndc = worldPosition.project(this.camera)
    const rect = this.renderer.domElement.getBoundingClientRect()

    const label = document.createElement('div')
    label.className = 'coin-spend-popup'
    label.textContent = 'Upgraded!'
    label.style.left = `${rect.left + ((ndc.x + 1) / 2) * rect.width}px`
    label.style.top = `${rect.top + ((1 - ndc.y) / 2) * rect.height}px`
    label.style.transition = 'transform 1s ease-out, opacity 1s ease-out'
    document.body.appendChild(label)

    requestAnimationFrame(() => {
      label.style.transform = 'translate(-50%, -60px)'
      label.style.opacity = '0'
    })
    setTimeout(() => label.remove(), 1000)
  }

  private updatePriceLabel(): void {
    const worldPosition = this.object.position.clone()
    worldPosition.y += 3
    const ndc = worldPosition.project(this.camera)

    if (ndc.z > 1) {
      this.priceLabel.style.display = 'none'
      return
    }

    const rect = this.renderer.domElement.getBoundingClientRect()
    this.priceLabel.style.left = `${rect.left + ((ndc.x + 1) / 2) * rect.width}px`
    this.priceLabel.style.top = `${rect.top + ((1 - ndc.y) / 2) * rect.height}px`
    this.priceLabel.style.display = 'block'

    if (this.cooldownRemaining > 0) {
      this.priceLabel.textContent = `Recharging: ${Math.ceil(this.cooldownRemaining)}s`
    } else if (this.progress > 0) {
      this.priceLabel.textContent = `Upgrade: ${this.progress} / ${upgradeConfig.cost} coins`
    } else {
      this.priceLabel.textContent = `Upgrade: ${upgradeConfig.cost} coins`
    }
  }
}
