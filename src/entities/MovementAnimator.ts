import * as THREE from 'three'
import { animationConfig } from '../config'

const TWO_PI = Math.PI * 2

function lerpAngle(from: number, to: number, t: number): number {
  let delta = (to - from + Math.PI) % TWO_PI
  if (delta < 0) delta += TWO_PI
  delta -= Math.PI
  return from + delta * t
}

export interface MovementAnimatorOptions {
  /** Offsets the jog/breathe phases so multiple instances don't animate in lockstep. */
  phaseOffset?: number
}

/**
 * Shared "jog and squash/stretch while moving, breathe while idle" procedural
 * animation, driven by an entity's velocity. `root` is rotated to face the
 * movement direction; `marker` (the visible mesh, pivoted at its base) is
 * bounced and squashed/stretched.
 */
export class MovementAnimator {
  private readonly root: THREE.Object3D
  private readonly marker: THREE.Object3D

  private jogPhase: number
  private breathePhase: number
  private moveBlend = 0

  constructor(root: THREE.Object3D, marker: THREE.Object3D, options: MovementAnimatorOptions = {}) {
    this.root = root
    this.marker = marker
    this.jogPhase = options.phaseOffset ?? 0
    this.breathePhase = options.phaseOffset ?? 0
  }

  update(deltaTime: number, velocity: THREE.Vector3, maxSpeed: number): void {
    const speedRatio = maxSpeed > 0 ? THREE.MathUtils.clamp(velocity.length() / maxSpeed, 0, 1) : 0
    const blendStep = Math.min(1, animationConfig.blendSpeed * deltaTime)

    this.moveBlend += ((speedRatio > 0.05 ? 1 : 0) - this.moveBlend) * blendStep

    if (speedRatio > 0.05) {
      const targetYaw = Math.atan2(velocity.x, velocity.z)
      this.root.rotation.y = lerpAngle(this.root.rotation.y, targetYaw, blendStep)
    }

    // Jog cycle: a bounce + squash/stretch whose frequency scales with speed.
    // The phase is accumulated frame-to-frame (rather than recomputed as
    // elapsedTime * frequency) so changing the frequency mid-stride only
    // bends the wave going forward instead of snapping its whole phase.
    const jogFrequency =
      animationConfig.jogBaseFrequency + speedRatio * animationConfig.jogSpeedFrequency
    this.jogPhase = (this.jogPhase + jogFrequency * TWO_PI * deltaTime) % TWO_PI
    const jogBounce = Math.abs(Math.sin(this.jogPhase)) * animationConfig.jogBounceHeight
    const jogStretch = Math.sin(this.jogPhase * 2) * animationConfig.jogStretchAmount

    // Idle breathing: a slow, gentle scale pulse (same accumulated-phase approach).
    this.breathePhase = (this.breathePhase + animationConfig.breatheFrequency * TWO_PI * deltaTime) % TWO_PI
    const breathe = Math.sin(this.breathePhase) * animationConfig.breatheAmount

    const stretch = THREE.MathUtils.lerp(breathe, jogStretch, this.moveBlend)
    this.marker.scale.set(1 - stretch * 0.5, 1 + stretch, 1 - stretch * 0.5)
    this.marker.position.y = jogBounce * this.moveBlend
  }
}
