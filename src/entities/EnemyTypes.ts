/**
 * Per-archetype enemy data: everything that makes one enemy type look and
 * fight differently from another. Shared AI feel/pacing (wander radius,
 * aggro hysteresis, etc.) stays in config.ts's enemyConfig instead, since
 * it applies the same way to every type.
 */
export interface EnemyTypeDef {
  id: string
  label: string
  color: number
  /** Body radius, in world units (drives its hurtbox and debug circle). */
  radius: number
  maxHp: number
  /** Damage dealt per attack against the player. */
  attackDamage: number
  /** Knockback force applied to the player when this type lands a hit. */
  attackKnockback: number
  /** How far this type can reach to attack, in world units (its offensive hitbox radius). */
  attackRange: number
  /** Seconds between this type's attacks. */
  attackCooldown: number
  /** Wander movement speed, in world units per second. */
  wanderSpeed: number
  /** Movement speed while chasing the player, in world units per second. */
  chaseSpeed: number
  /** How far this type can detect the player and start chasing, in world units. */
  aggroRange: number
  /** Coins awarded for killing this type. */
  coinReward: number
}

export const ENEMY_TYPES = {
  grunt: {
    id: 'grunt',
    label: 'Grunt',
    color: 0xff4444,
    radius: 0.6,
    maxHp: 10,
    attackDamage: 4,
    attackKnockback: 5,
    attackRange: 1.2,
    attackCooldown: 1,
    wanderSpeed: 2,
    chaseSpeed: 3,
    aggroRange: 9,
    coinReward: 5,
  },
  runner: {
    id: 'runner',
    label: 'Runner',
    color: 0xffee55,
    radius: 0.45,
    maxHp: 6,
    attackDamage: 2,
    attackKnockback: 3,
    attackRange: 1.0,
    attackCooldown: 0.7,
    wanderSpeed: 3,
    chaseSpeed: 4.2,
    aggroRange: 11,
    coinReward: 4,
  },
  brute: {
    id: 'brute',
    label: 'Brute',
    color: 0x8b1a1a,
    radius: 0.9,
    maxHp: 25,
    attackDamage: 8,
    attackKnockback: 10,
    attackRange: 1.4,
    attackCooldown: 1.4,
    wanderSpeed: 1.2,
    chaseSpeed: 1.8,
    aggroRange: 7,
    coinReward: 12,
  },
  swarmer: {
    id: 'swarmer',
    label: 'Swarmer',
    color: 0xdd66ff,
    radius: 0.35,
    maxHp: 3,
    attackDamage: 1,
    attackKnockback: 2,
    attackRange: 0.8,
    attackCooldown: 0.5,
    wanderSpeed: 3.5,
    chaseSpeed: 3.8,
    aggroRange: 8,
    coinReward: 2,
  },
  elite: {
    id: 'elite',
    label: 'Elite',
    color: 0xff33cc,
    radius: 0.85,
    maxHp: 30,
    attackDamage: 9,
    attackKnockback: 9,
    attackRange: 1.5,
    attackCooldown: 0.9,
    wanderSpeed: 2.2,
    chaseSpeed: 3.2,
    aggroRange: 12,
    coinReward: 20,
  },
} as const satisfies Record<string, EnemyTypeDef>

export type EnemyTypeId = keyof typeof ENEMY_TYPES

interface WeightedType {
  type: EnemyTypeDef
  weight: number
}

// Rarer/stronger types (elite) get a lower weight, so they show up less often.
const WEIGHTED_TYPES: WeightedType[] = [
  { type: ENEMY_TYPES.grunt, weight: 30 },
  { type: ENEMY_TYPES.runner, weight: 25 },
  { type: ENEMY_TYPES.brute, weight: 15 },
  { type: ENEMY_TYPES.swarmer, weight: 20 },
  { type: ENEMY_TYPES.elite, weight: 10 },
]

/** Picks a random enemy type, weighted so rarer/stronger types show up less often. */
export function pickRandomEnemyType(): EnemyTypeDef {
  const totalWeight = WEIGHTED_TYPES.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = Math.random() * totalWeight

  for (const { type, weight } of WEIGHTED_TYPES) {
    if (roll < weight) return type
    roll -= weight
  }

  return WEIGHTED_TYPES[0].type
}
