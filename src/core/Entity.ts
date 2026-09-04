import * as THREE from 'three'
import { colliderConfig, combatConfig } from '../config'
import { applyWorldBend } from '../effects/WorldBend'

export interface ColliderOptions {
  /** Physical body radius, in world units (XZ plane). */
  radius?: number
  /** Radius of the area that can deal a hit to others' hurtboxes. Defaults to `radius`. */
  hitboxRadius?: number
  /** Radius of the area that can receive a hit from others' hitboxes. Defaults to `radius`. */
  hurtboxRadius?: number
}

export interface AttributeOptions {
  /** Max/starting hit points. */
  maxHp?: number
  /** Faction: entities never hit others on the same team. Defaults to 'neutral'. */
  team?: string
  /** Damage dealt per landed attack. Defaults to 0 (never actually hurts anyone). */
  attackDamage?: number
  /** Seconds between this entity's attacks. Defaults to 1. */
  attackCooldown?: number
  /** Knockback force this entity's attack applies to whoever it hits. Defaults to 0 (no knockback). */
  attackKnockback?: number
}

function createHitboxCircle(radius: number): THREE.Mesh {
  const geometry = new THREE.RingGeometry(radius * 0.9, radius, 32)
  const material = applyWorldBend(
    new THREE.MeshBasicMaterial({
      color: colliderConfig.hitboxColor,
      transparent: true,
      opacity: colliderConfig.hitboxOpacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  )
  const circle = new THREE.Mesh(geometry, material)
  circle.rotation.x = -Math.PI / 2
  circle.position.y = 0.02
  return circle
}

export abstract class Entity {
  readonly object: THREE.Object3D
  readonly radius: number
  /** Offensive reach. Mutable via setHitboxRadius so it can be permanently upgraded. */
  hitboxRadius: number
  readonly hurtboxRadius: number

  /** Mutable via increaseMaxHp so it can be permanently upgraded (also heals by the increase). */
  maxHp: number
  hp: number

  readonly team: string
  /** Damage dealt per landed attack. Mutable so it can be permanently upgraded (see UpgradeStation). */
  attackDamage: number
  readonly attackKnockback: number
  private readonly attackCooldownDuration: number
  private attackCooldownRemaining = 0

  /** Impulse applied by a landed hit; decays back to zero each frame (see update()). */
  protected readonly knockbackVelocity = new THREE.Vector3()

  /** Set to false to have the World remove this entity (and its object) after the current tick. */
  alive = true

  private readonly hitboxMarker: THREE.Mesh
  private dying = false
  private deathElapsed = 0

  constructor(
    object: THREE.Object3D = new THREE.Object3D(),
    collider: ColliderOptions = {},
    attributes: AttributeOptions = {}
  ) {
    this.object = object
    this.radius = collider.radius ?? 0.5
    this.hitboxRadius = collider.hitboxRadius ?? this.radius
    this.hurtboxRadius = collider.hurtboxRadius ?? this.radius

    this.maxHp = attributes.maxHp ?? 1
    this.hp = this.maxHp
    this.team = attributes.team ?? 'neutral'
    this.attackDamage = attributes.attackDamage ?? 0
    this.attackKnockback = attributes.attackKnockback ?? 0
    this.attackCooldownDuration = attributes.attackCooldown ?? 1

    this.hitboxMarker = createHitboxCircle(this.hitboxRadius)
    this.object.add(this.hitboxMarker)
  }

  /** True once hp has reached 0 and the death animation is playing. */
  get isDying(): boolean {
    return this.dying
  }

  /** Permanently grows the offensive hitbox and resizes its debug ring to match. */
  protected setHitboxRadius(radius: number): void {
    this.hitboxRadius = radius
    this.hitboxMarker.geometry.dispose()
    this.hitboxMarker.geometry = new THREE.RingGeometry(radius * 0.9, radius, 32)
  }

  /** Permanently raises max hp and heals by the same amount. */
  increaseMaxHp(amount: number): void {
    if (amount <= 0) return
    this.maxHp += amount
    this.hp += amount
  }

  /** Consumes this entity's attack cooldown if ready; returns whether an attack may proceed. */
  tryConsumeAttack(): boolean {
    if (this.attackCooldownRemaining > 0) return false
    this.attackCooldownRemaining = this.attackCooldownDuration
    return true
  }

  /** Applies damage and starts the death sequence once hp reaches 0. No-op once already dying/dead. */
  takeDamage(amount: number): void {
    if (this.dying || !this.alive || amount <= 0) return

    this.hp = Math.max(0, this.hp - amount)
    this.onDamaged(amount)

    if (this.hp <= 0) {
      this.dying = true
      this.deathElapsed = 0
      this.hitboxMarker.visible = false
      this.onDeath()
    }
  }

  /** Hook for subclasses to react to taking damage (hit flash, damage popup, etc). */
  protected onDamaged(_amount: number): void {}

  /** Hook for subclasses to react to dying (rewards, effects, etc). Called once, when hp reaches 0. */
  protected onDeath(): void {}

  /**
   * Reacts to taking a landed hit. Default: knocks this entity back away
   * from the attacker, scaled by the attacker's attackKnockback. Override to
   * customize or extend (call super.onHitTaken(attacker) to keep it).
   */
  protected onHitTaken(attacker: Entity): void {
    if (attacker.attackKnockback <= 0) return

    const away = this.object.position.clone().sub(attacker.object.position)
    away.y = 0
    if (away.lengthSq() < 1e-6) away.set(Math.random() - 0.5, 0, Math.random() - 0.5)
    away.normalize()
    this.knockbackVelocity.copy(away).multiplyScalar(attacker.attackKnockback)
  }

  /** Called every frame with the real (variable) delta time, in seconds. */
  update(deltaTime: number): void {
    if (this.attackCooldownRemaining > 0) {
      this.attackCooldownRemaining = Math.max(0, this.attackCooldownRemaining - deltaTime)
    }

    if (this.dying) {
      this.deathElapsed += deltaTime
      const t = THREE.MathUtils.smoothstep(this.deathElapsed, 0, combatConfig.deathFlipDuration)
      this.object.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 2, t)

      if (this.deathElapsed >= combatConfig.deathFlipDuration) this.alive = false
      return
    }

    // Knockback: a brief impulse, applied on top of whatever else moves this
    // entity this frame, that decays back to zero.
    if (this.knockbackVelocity.lengthSq() > 0.0001) {
      this.object.position.addScaledVector(this.knockbackVelocity, deltaTime)
      this.knockbackVelocity.multiplyScalar(Math.exp(-combatConfig.knockbackDamping * deltaTime))
    } else {
      this.knockbackVelocity.set(0, 0, 0)
    }
  }

  /** Called at a fixed timestep (see World.FIXED_TIMESTEP), in seconds. */
  fixedUpdate(_fixedDeltaTime: number): void {}

  /**
   * Called when `attacker`'s hitbox overlaps this entity's hurtbox. Same-team
   * hits are ignored; otherwise gated by the attacker's own cooldown.
   */
  onHit(attacker: Entity): void {
    if (this.isDying || attacker.team === this.team) return
    if (!attacker.tryConsumeAttack()) return

    this.takeDamage(attacker.attackDamage)
    this.onHitTaken(attacker)
  }
}
