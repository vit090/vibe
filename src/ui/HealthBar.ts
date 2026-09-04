/** Mounts the top-of-screen player health bar. Returns a function to call each frame with (hp, maxHp). */
export function initHealthBar(): (hp: number, maxHp: number) => void {
  const container = document.createElement('div')
  container.className = 'health-bar'

  const fill = document.createElement('div')
  fill.className = 'health-bar__fill'
  container.appendChild(fill)

  const label = document.createElement('span')
  label.className = 'health-bar__label'
  container.appendChild(label)

  document.body.appendChild(container)

  return (hp: number, maxHp: number) => {
    const ratio = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0
    fill.style.width = `${ratio * 100}%`
    label.textContent = `${Math.ceil(Math.max(0, hp))} / ${maxHp}`
  }
}
