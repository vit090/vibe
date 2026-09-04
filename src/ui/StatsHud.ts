/** Mounts a compact player-stats row. Returns a function to call each frame with (level, attack, speed). */
export function initStatsHud(): (level: number, attack: number, speed: number) => void {
  const container = document.createElement('div')
  container.className = 'stats-hud'

  const levelChip = document.createElement('div')
  levelChip.className = 'stats-hud__chip'

  const attackChip = document.createElement('div')
  attackChip.className = 'stats-hud__chip'

  const speedChip = document.createElement('div')
  speedChip.className = 'stats-hud__chip'

  container.append(levelChip, attackChip, speedChip)
  document.body.appendChild(container)

  return (level: number, attack: number, speed: number) => {
    levelChip.textContent = `Lv. ${level}`
    attackChip.textContent = `ATK ${attack}`
    speedChip.textContent = `SPD ${speed.toFixed(1)}`
  }
}
