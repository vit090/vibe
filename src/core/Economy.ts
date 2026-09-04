type CoinsListener = (coins: number, delta: number) => void

let coins = 0
const listeners = new Set<CoinsListener>()

export function getCoins(): number {
  return coins
}

/** Adds (or subtracts) coins and notifies listeners (e.g. the HUD). */
export function addCoins(amount: number): void {
  if (amount === 0) return
  coins += amount
  for (const listener of listeners) listener(coins, amount)
}

/** Subscribes to coin changes; returns an unsubscribe function. */
export function onCoinsChanged(listener: CoinsListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
