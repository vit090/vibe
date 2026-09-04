export const cameraConfig = {
  /** Distance from the camera to the player, in world units. */
  distance: 27,
  /** Horizontal rotation around the player, in degrees. 0 = looking down +Z. */
  yaw: 35,
  /** Vertical angle above the horizon, in degrees. */
  pitch: 45,
  /** How quickly the camera closes the gap to its target position. Higher = snappier, lower = smoother/laggier. */
  followSpeed: 8,
}

export const groundConfig = {
  /** Width/height of the ground plane, in world units. */
  size: 200,
  /** Number of grid segments per axis (finer subdivision = smoother world-bend curvature). */
  divisions: 50,
  /** World units covered by one tile of the grass texture (controls how zoomed-in it looks). */
  textureTileSize: 4,
}

export const skyConfig = {
  /** Sky color, used for both the scene background and the fog (so the horizon blends seamlessly). */
  color: 0x87ceeb,
  /** Distance at which fog starts, in world units. */
  fogNear: 40,
  /** Distance at which fog is fully opaque, in world units. */
  fogFar: 140,
}

export const playerConfig = {
  /** Movement speed, in world units per second. Starts modest — grows via upgrades. */
  moveSpeed: 3.5,
  /** Body/physical radius, in world units (drives the debug circle drawn under the player). */
  radius: 1.5,
  /** How close an enemy must get to hit the player, in world units (defensive hurtbox radius). */
  hurtboxRadius: 0.5,
  /** Max/starting hit points. */
  maxHp: 20,
  /** Damage dealt per attack. */
  attackDamage: 5,
  /** How far the player can reach to attack, in world units (its offensive hitbox radius). */
  attackRange: 3,
  /** Seconds between attacks. */
  attackCooldown: 0.6,
  /** Knockback force applied to enemies the player hits. */
  attackKnockback: 6,
}

// Shared enemy AI tuning — feel/pacing values that apply to every enemy type.
// Per-type combat stats (hp, damage, knockback, speed, color, ...) live in
// entities/EnemyTypes.ts instead, since they vary per archetype.
export const enemyConfig = {
  /** Max distance an enemy wanders from its home (its cluster spawn point), in world units. */
  wanderRadius: 6,
  /** Enemies idle at their target, then pick a new one after this many seconds (randomized in range). */
  wanderIntervalMin: 2,
  wanderIntervalMax: 5,
  /** A chasing enemy gives up once the player is farther than aggroRange * this multiplier (hysteresis, avoids flickering at the boundary). */
  aggroLeashMultiplier: 1.6,
}

export const clusterConfig = {
  /** How many enemy clusters exist on the map. */
  clusterCount: 5,
  /** How many enemies each cluster tries to keep alive at once. */
  enemiesPerCluster: 4,
  /** How far enemies scatter from their cluster's center when (re)spawned, in world units. */
  clusterRadius: 5,
  /** Clusters are placed between this and maxSpawnDistance from the world origin. */
  minSpawnDistance: 25,
  maxSpawnDistance: 65,
  /** Seconds after a cluster member dies before a replacement spawns. */
  respawnDelay: 8,
}

export const combatConfig = {
  /** How long a hit's white flash takes to fade out, in seconds. */
  hitFlashDuration: 0.15,
  /** How long the death "flip to the ground" animation takes, in seconds, before removal. */
  deathFlipDuration: 0.6,
  /** How long a damage number stays on screen, in seconds. */
  damagePopupDuration: 0.8,
  /** How far a damage number rises over its lifetime, in pixels. */
  damagePopupRise: 40,
  /** How quickly any knockback velocity decays back to zero, in 1/seconds (higher = snappier). Force/magnitude is per-attacker (see attackKnockback). */
  knockbackDamping: 8,
}

export const coinFlyConfig = {
  /** How long a coin takes to fly from a kill to the HUD, in seconds. */
  duration: 0.6,
}

export const upgradeConfig = {
  /**
   * Radius around the map center, in world units. Doubles as both the
   * deposit-trigger distance AND the safe zone: enemies lose interest in a
   * player standing inside it (see Enemy's chase check and Player.onHit).
   */
  radius: 8,
  /** Total coins required to complete the upgrade. */
  cost: 20,
  /** Seconds between each 1-coin deposit while standing in the zone. */
  depositInterval: 0.15,
  /** How much the player's attack damage increases per purchase. */
  attackDamageIncrease: 3,
  /** How much the player's max hp increases (and heals by) per purchase. */
  maxHpIncrease: 5,
  /** How much the player's attack hitbox radius increases per purchase, in world units. */
  attackRangeIncrease: 0.3,
  /** How much the player's move speed increases per purchase, in world units per second. */
  moveSpeedIncrease: 0.4,
  /** Seconds before another upgrade can be purchased after one is taken. */
  cooldownSeconds: 60,
}

export const worldBendConfig = {
  /** How strongly the world curves away from the camera. 0 disables the effect. */
  strength: 0.0008,
}

export const colliderConfig = {
  /** Color of the debug circle drawn under every entity to visualize its hitbox. */
  hitboxColor: 0xff0000,
  hitboxOpacity: 0.6,
}

export const inputConfig = {
  /** Max distance the analog stick can travel from its base, in pixels. */
  maxRadius: 50,
}

export const animationConfig = {
  /** Idle breathing: cycles per second and how much the scale pulses. */
  breatheFrequency: 0.85,
  breatheAmount: 0.08,

  /** Jog cycle: base + speed-scaled cycles per second. */
  jogBaseFrequency: 1.5,
  jogSpeedFrequency: 0.8,
  /** How high the player bounces at the peak of each jog step, in world units. */
  jogBounceHeight: 0.15,
  /** How much the player squashes/stretches at the peak of each jog step. */
  jogStretchAmount: 0.12,

  /** How quickly the animation blends between idle and jogging, in 1/seconds. */
  blendSpeed: 6,
}
