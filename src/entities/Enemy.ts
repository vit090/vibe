import * as THREE from 'three'
import { Entity } from '../core/Entity'
import { enemyConfig, combatConfig } from '../config'
import { spawnDamagePopup } from '../effects/DamagePopup'
import { MovementAnimator } from './MovementAnimator'
import { applyWorldBend } from '../effects/WorldBend'
import { spawnCoinFly } from '../effects/CoinFly'
import { isInsideSafeZone } from '../core/SafeZone'
import type { EnemyTypeDef } from './EnemyTypes'

export class Enemy extends Entity {
  /** Which cluster spawned this enemy — used to schedule its replacement on death. */
  readonly clusterId: number

  readonly velocity = new THREE.Vector3()
  private readonly type: EnemyTypeDef
  private readonly material: THREE.MeshStandardMaterial
  private readonly animator: MovementAnimator
  private flashTimer = 0

  /** The entity this enemy chases once it comes within aggro range (the player). */
  private readonly chaseTarget: Entity
  private isChasing = false

  private readonly home: THREE.Vector3
  private wanderTarget: THREE.Vector3
  private wanderTimer = 0

  constructor(position: THREE.Vector3, chaseTarget: Entity, type: EnemyTypeDef, clusterId: number) {
    super(
      new THREE.Object3D(),
      { radius: type.radius, hitboxRadius: type.attackRange },
      {
        maxHp: type.maxHp,
        team: 'enemy',
        attackDamage: type.attackDamage,
        attackCooldown: type.attackCooldown,
        attackKnockback: type.attackKnockback,
      }
    )
    this.type = type
    this.clusterId = clusterId
    this.object.position.copy(position)
    this.home = position.clone()
    this.wanderTarget = position.clone()
    this.chaseTarget = chaseTarget

    // Shift the geometry so its local origin sits at the base rather than the
    // center, matching Player's marker so squash/stretch grows from the ground.
    const geometry = new THREE.ConeGeometry(type.radius, 1, 12)
    geometry.translate(0, 0.5, 0)
    this.material = applyWorldBend(new THREE.MeshStandardMaterial({ color: type.color }))
    const marker = new THREE.Mesh(geometry, this.material)
    this.object.add(marker)

    this.animator = new MovementAnimator(this.object, marker, {
      phaseOffset: Math.random() * Math.PI * 2,
    })

    this.pickNewWanderTarget()
  }

  private pickNewWanderTarget(): void {
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * enemyConfig.wanderRadius
    this.wanderTarget = this.home
      .clone()
      .add(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance))
    this.wanderTimer = THREE.MathUtils.lerp(
      enemyConfig.wanderIntervalMin,
      enemyConfig.wanderIntervalMax,
      Math.random()
    )
  }

  protected onDamaged(amount: number): void {
    this.flashTimer = combatConfig.hitFlashDuration

    const popupPosition = this.object.position.clone()
    popupPosition.y += this.type.radius + 0.6
    spawnDamagePopup(popupPosition, amount)
  }

  protected onDeath(): void {
    const flyPosition = this.object.position.clone()
    flyPosition.y += 1
    spawnCoinFly(flyPosition, this.type.coinReward)
  }

  update(deltaTime: number): void {
    super.update(deltaTime)
    if (this.isDying) return

    // Movement is integrated here (every rendered frame, real delta time)
    // rather than in fixedUpdate, so the visible position advances smoothly
    // in lockstep with rendering instead of jumping by a variable number of
    // fixed steps per frame.
    const toChaseTarget = this.chaseTarget.object.position.clone().sub(this.object.position)
    toChaseTarget.y = 0
    const chaseTargetDistance = toChaseTarget.length()
    // A target hiding in the safe zone can't be chased or attacked — it's not
    // that enemies are blocked from entering, they just lose interest in it.
    const canChase =
      this.chaseTarget.alive &&
      !this.chaseTarget.isDying &&
      !isInsideSafeZone(this.chaseTarget.object.position)

    if (canChase && chaseTargetDistance <= this.type.aggroRange) {
      this.isChasing = true
    } else if (
      !canChase ||
      chaseTargetDistance > this.type.aggroRange * enemyConfig.aggroLeashMultiplier
    ) {
      this.isChasing = false
    }

    let moveTarget: THREE.Vector3
    let moveSpeed: number

    if (this.isChasing) {
      moveTarget = this.chaseTarget.object.position
      moveSpeed = this.type.chaseSpeed
    } else {
      this.wanderTimer -= deltaTime
      if (this.wanderTimer <= 0) this.pickNewWanderTarget()
      moveTarget = this.wanderTarget
      moveSpeed = this.type.wanderSpeed
    }

    const toMoveTarget = moveTarget.clone().sub(this.object.position)
    toMoveTarget.y = 0
    const moveDistance = toMoveTarget.length()

    if (moveDistance > 0.1) {
      toMoveTarget.normalize()
      this.velocity.copy(toMoveTarget).multiplyScalar(moveSpeed)
      this.object.position.addScaledVector(this.velocity, deltaTime)
    } else {
      this.velocity.set(0, 0, 0)
    }

    this.animator.update(deltaTime, this.velocity, moveSpeed)

    if (this.flashTimer > 0) {
      this.flashTimer = Math.max(0, this.flashTimer - deltaTime)
      this.material.emissive.setScalar(this.flashTimer / combatConfig.hitFlashDuration)
    }
  }
}
