import * as THREE from 'three'
import { upgradeConfig } from '../config'

/** True if `position` is inside the safe zone around the map center (the upgrade area). */
export function isInsideSafeZone(position: THREE.Vector3): boolean {
  return Math.hypot(position.x, position.z) < upgradeConfig.radius
}
