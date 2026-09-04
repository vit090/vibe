import * as THREE from 'three'
import { worldBendConfig } from '../config'

// Shared uniforms: the SAME objects are handed to every material's shader,
// so updating them once (in updateWorldBend) moves every bent mesh at once.
const cameraPositionUniform = { value: new THREE.Vector3() }
const strengthUniform = { value: worldBendConfig.strength }

/**
 * World-curvature ("small planet") effect: pushes vertices down based on
 * their horizontal distance from the camera, so the world appears to curve
 * away at the horizon. A static/global service — call this once on any
 * material to opt it in, no per-mesh setup required.
 */
export function applyWorldBend<T extends THREE.Material>(material: T): T {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uBendCameraPosition = cameraPositionUniform
    shader.uniforms.uBendStrength = strengthUniform

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `
        uniform vec3 uBendCameraPosition;
        uniform float uBendStrength;
        #include <common>
        `
      )
      .replace(
        '#include <project_vertex>',
        `
        vec4 bendWorldPosition = modelMatrix * vec4( transformed, 1.0 );
        float bendDist = distance( bendWorldPosition.xz, uBendCameraPosition.xz );
        bendWorldPosition.y -= bendDist * bendDist * uBendStrength;

        vec4 mvPosition = viewMatrix * bendWorldPosition;
        gl_Position = projectionMatrix * mvPosition;
        `
      )
  }
  material.needsUpdate = true
  return material
}

/** Call once per frame so the bend stays centered on the camera's current position. */
export function updateWorldBend(camera: THREE.Camera): void {
  cameraPositionUniform.value.copy(camera.position)
  strengthUniform.value = worldBendConfig.strength
}
