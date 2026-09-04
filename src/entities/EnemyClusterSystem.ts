import * as THREE from 'three'
import type { Entity } from '../core/Entity'
import { clusterConfig } from '../config'
import { Enemy } from './Enemy'
import { pickRandomEnemyType, type EnemyTypeDef } from './EnemyTypes'

interface Cluster {
  id: number
  center: THREE.Vector3
  type: EnemyTypeDef
  aliveCount: number
  /** Seconds remaining before each pending replacement spawns. */
  pendingRespawns: number[]
}

/**
 * Spawns enemies in clusters (a home area + an assigned type, shared by all
 * its members) rather than scattering them independently, and keeps each
 * cluster's population topped up over time: when a member dies, a
 * replacement of the same type spawns near the cluster's center after
 * `clusterConfig.respawnDelay` seconds.
 */
export class EnemyClusterSystem {
  private readonly clusters: Cluster[] = []
  private readonly chaseTarget: Entity
  private readonly onSpawn: (enemy: Enemy) => void

  constructor(chaseTarget: Entity, onSpawn: (enemy: Enemy) => void) {
    this.chaseTarget = chaseTarget
    this.onSpawn = onSpawn

    for (let i = 0; i < clusterConfig.clusterCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = THREE.MathUtils.lerp(
        clusterConfig.minSpawnDistance,
        clusterConfig.maxSpawnDistance,
        Math.random()
      )
      const center = new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance)

      const cluster: Cluster = {
        id: i,
        center,
        type: pickRandomEnemyType(),
        aliveCount: 0,
        pendingRespawns: [],
      }
      this.clusters.push(cluster)

      for (let j = 0; j < clusterConfig.enemiesPerCluster; j++) {
        this.spawnEnemyInCluster(cluster)
      }
    }
  }

  private spawnEnemyInCluster(cluster: Cluster): void {
    const offset = new THREE.Vector3(
      (Math.random() * 2 - 1) * clusterConfig.clusterRadius,
      0,
      (Math.random() * 2 - 1) * clusterConfig.clusterRadius
    )
    const position = cluster.center.clone().add(offset)

    const enemy = new Enemy(position, this.chaseTarget, cluster.type, cluster.id)
    cluster.aliveCount += 1
    this.onSpawn(enemy)
  }

  /** Call when an enemy belonging to a cluster is removed, to schedule its replacement. */
  notifyEnemyRemoved(clusterId: number): void {
    const cluster = this.clusters[clusterId]
    if (!cluster) return

    cluster.aliveCount = Math.max(0, cluster.aliveCount - 1)
    cluster.pendingRespawns.push(clusterConfig.respawnDelay)
  }

  /** Call once per frame to tick down respawn timers and spawn replacements. */
  update(deltaTime: number): void {
    for (const cluster of this.clusters) {
      for (let i = cluster.pendingRespawns.length - 1; i >= 0; i--) {
        cluster.pendingRespawns[i] -= deltaTime
        if (cluster.pendingRespawns[i] <= 0) {
          cluster.pendingRespawns.splice(i, 1)
          this.spawnEnemyInCluster(cluster)
        }
      }
    }
  }
}
