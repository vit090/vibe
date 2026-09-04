import * as THREE from 'three'

/**
 * Procedurally draws a tileable grass texture on an offscreen canvas: a base
 * green fill speckled with thousands of small, randomly angled "blades" in
 * varied shades, then wraps it as a THREE.CanvasTexture.
 */
export function createGrassTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#4a9c3f'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 5000; i++) {
    const shade = Math.random()
    const r = Math.floor(45 + shade * 35)
    const g = Math.floor(110 + shade * 90)
    const b = Math.floor(35 + shade * 25)
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

    const x = Math.random() * size
    const y = Math.random() * size
    const width = 1 + Math.random() * 1.5
    const height = 3 + Math.random() * 5

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((Math.random() - 0.5) * 0.8)
    ctx.fillRect(-width / 2, -height / 2, width, height)
    ctx.restore()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
