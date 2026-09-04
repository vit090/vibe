import { inputConfig } from '../config'

/**
 * A virtual analog stick driven by Pointer Events, so the same code path
 * handles mouse and touch. Press anywhere on `target` to plant the stick's
 * base at that point, then drag to produce a normalized direction:
 * x/y each in [-1, 1], with y positive meaning "up/forward".
 */
export class AnalogInput {
  readonly direction = { x: 0, y: 0 }

  private active = false
  private pointerId: number | null = null
  private baseX = 0
  private baseY = 0

  private readonly target: HTMLElement
  private readonly baseEl: HTMLDivElement
  private readonly stickEl: HTMLDivElement

  constructor(target: HTMLElement) {
    this.target = target
    this.baseEl = document.createElement('div')
    this.baseEl.className = 'joystick-base'
    this.stickEl = document.createElement('div')
    this.stickEl.className = 'joystick-stick'
    this.baseEl.appendChild(this.stickEl)
    this.baseEl.style.display = 'none'
    document.body.appendChild(this.baseEl)

    target.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('pointerup', this.onPointerUp)
    window.addEventListener('pointercancel', this.onPointerUp)
  }

  dispose(): void {
    this.target.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('pointercancel', this.onPointerUp)
    this.baseEl.remove()
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (this.active) return
    this.active = true
    this.pointerId = event.pointerId
    this.baseX = event.clientX
    this.baseY = event.clientY

    this.baseEl.style.left = `${this.baseX}px`
    this.baseEl.style.top = `${this.baseY}px`
    this.baseEl.style.display = 'block'
    this.stickEl.style.transform = 'translate(0px, 0px)'
  }

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.active || event.pointerId !== this.pointerId) return

    const dx = event.clientX - this.baseX
    const dy = event.clientY - this.baseY
    const distance = Math.min(Math.hypot(dx, dy), inputConfig.maxRadius)
    const angle = Math.atan2(dy, dx)
    const clampedX = Math.cos(angle) * distance
    const clampedY = Math.sin(angle) * distance

    this.stickEl.style.transform = `translate(${clampedX}px, ${clampedY}px)`

    this.direction.x = clampedX / inputConfig.maxRadius
    this.direction.y = -clampedY / inputConfig.maxRadius
  }

  private onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return
    this.active = false
    this.pointerId = null
    this.direction.x = 0
    this.direction.y = 0
    this.baseEl.style.display = 'none'
  }
}
