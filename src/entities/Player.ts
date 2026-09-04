import * as THREE from 'three'
import { Entity } from '../core/Entity'
import type { AnalogInput } from '../input/AnalogInput'
import { playerConfig, combatConfig, upgradeConfig } from '../config'
import { MovementAnimator } from './MovementAnimator'
import { applyWorldBend } from '../effects/WorldBend'
import { spawnDamagePopup } from '../effects/DamagePopup'
import { triggerGameOver } from '../ui/GameOver'
import { isInsideSafeZone } from '../core/SafeZone'

export class Player extends Entity {
  readonly velocity = new THREE.Vector3()

  /** Starts at 1; incremented once per upgrade purchase. */
  level = 1
  /** Mutable so it can grow permanently via upgrades (see applyUpgrade). */
  moveSpeed: number

  private readonly input: AnalogInput
  private readonly marker: THREE.Mesh
  private readonly material: THREE.MeshStandardMaterial
  private readonly animator: MovementAnimator
  private flashTimer = 0

  constructor(input: AnalogInput) {
    super(
      new THREE.Object3D(),
      {
        radius: playerConfig.radius,
        hitboxRadius: playerConfig.attackRange,
        hurtboxRadius: playerConfig.hurtboxRadius,
      },
      {
        maxHp: playerConfig.maxHp,
        team: 'player',
        attackDamage: playerConfig.attackDamage,
        attackCooldown: playerConfig.attackCooldown,
        attackKnockback: playerConfig.attackKnockback,
      }
    )
    this.input = input
    this.moveSpeed = playerConfig.moveSpeed

    // Shift the geometry so its local origin sits at the bottom face rather
    // than the center, so scaling (squash/stretch) grows it upward from the
    // ground instead of from its middle.
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    geometry.translate(0, 0.5, 0)
    this.material = applyWorldBend(new THREE.MeshStandardMaterial({ color: 0x00aaff }))
    this.marker = new THREE.Mesh(geometry, this.material)
    this.object.add(this.marker)

    this.animator = new MovementAnimator(this.object, this.marker)
  }

  /** Called by UpgradeStation once a purchased upgrade's coin arrives. */
  applyUpgrade(): void {
    this.level += 1
    this.attackDamage += upgradeConfig.attackDamageIncrease
    this.increaseMaxHp(upgradeConfig.maxHpIncrease)
    this.setHitboxRadius(this.hitboxRadius + upgradeConfig.attackRangeIncrease)
    this.moveSpeed += upgradeConfig.moveSpeedIncrease
  }

  protected onDamaged(amount: number): void {
    this.flashTimer = combatConfig.hitFlashDuration

    const popupPosition = this.object.position.clone()
    popupPosition.y += 1.8
    spawnDamagePopup(popupPosition, amount)
  }

  protected onDeath(): void {
    triggerGameOver()
  }

  /** Untargetable while inside the safe zone — the hit doesn't land at all. */
  onHit(attacker: Entity): void {
    if (isInsideSafeZone(this.object.position)) return
    super.onHit(attacker)
  }

  update(deltaTime: number): void {
    super.update(deltaTime)
    if (this.isDying) return

    // Movement is integrated here (every rendered frame, real delta time)
    // rather than in fixedUpdate, so the visible position advances smoothly
    // in lockstep with rendering instead of jumping by a variable number of
    // fixed steps per frame.
    const { x, y } = this.input.direction
    this.velocity.set(x * this.moveSpeed, 0, -y * this.moveSpeed)
    this.object.position.addScaledVector(this.velocity, deltaTime)

    this.animator.update(deltaTime, this.velocity, this.moveSpeed)

    if (this.flashTimer > 0) {
      this.flashTimer = Math.max(0, this.flashTimer - deltaTime)
      this.material.emissive.setScalar(this.flashTimer / combatConfig.hitFlashDuration)
    }
  }
}
