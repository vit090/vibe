import type { Entity } from './Entity'

function circlesOverlap(
  aX: number,
  aZ: number,
  aRadius: number,
  bX: number,
  bZ: number,
  bRadius: number
): boolean {
  const dx = aX - bX
  const dz = aZ - bZ
  const radiusSum = aRadius + bRadius
  return dx * dx + dz * dz <= radiusSum * radiusSum
}

/**
 * Top-down 2D (XZ plane) circle collision pass: for every pair of distinct,
 * alive entities, if the attacker's hitbox overlaps the target's hurtbox,
 * the target is notified via `onHit(attacker)`.
 */
export function resolveCollisions(entities: readonly Entity[]): void {
  for (const attacker of entities) {
    if (!attacker.alive) continue

    for (const target of entities) {
      if (target === attacker || !target.alive) continue

      const overlaps = circlesOverlap(
        attacker.object.position.x,
        attacker.object.position.z,
        attacker.hitboxRadius,
        target.object.position.x,
        target.object.position.z,
        target.hurtboxRadius
      )

      if (overlaps) target.onHit(attacker)
    }
  }
}
