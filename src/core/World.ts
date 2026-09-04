import type { Entity } from './Entity'
import { resolveCollisions } from './Collision'

export class World {
  static readonly FIXED_TIMESTEP = 1 / 30

  /** Called for each entity removed because it went `alive = false`. */
  onEntityRemoved: ((entity: Entity) => void) | null = null

  private readonly entities: Entity[] = []
  private accumulator = 0

  add(entity: Entity): void {
    this.entities.push(entity)
  }

  remove(entity: Entity): void {
    const index = this.entities.indexOf(entity)
    if (index !== -1) this.entities.splice(index, 1)
  }

  /**
   * Advances every entity: fixedUpdate, collision resolution, and dead-entity
   * removal all run at a fixed 30fps timestep (via an accumulator, so they
   * stay independent of the render frame rate), then update runs once with
   * the real delta time.
   */
  update(deltaTime: number): void {
    this.accumulator += deltaTime
    while (this.accumulator >= World.FIXED_TIMESTEP) {
      for (const entity of this.entities) entity.fixedUpdate(World.FIXED_TIMESTEP)
      resolveCollisions(this.entities)
      this.removeDead()
      this.accumulator -= World.FIXED_TIMESTEP
    }

    for (const entity of this.entities) entity.update(deltaTime)
  }

  private removeDead(): void {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i]
      if (!entity.alive) {
        this.entities.splice(i, 1)
        this.onEntityRemoved?.(entity)
      }
    }
  }
}
