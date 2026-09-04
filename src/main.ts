import * as THREE from 'three'
import * as dat from 'dat.gui'
import './style.css'
import {
  cameraConfig,
  groundConfig,
  skyConfig,
  playerConfig,
  animationConfig,
  enemyConfig,
  clusterConfig,
  upgradeConfig,
  worldBendConfig,
} from './config'
import { World } from './core/World'
import { AnalogInput } from './input/AnalogInput'
import { Player } from './entities/Player'
import { Enemy } from './entities/Enemy'
import { EnemyClusterSystem } from './entities/EnemyClusterSystem'
import { UpgradeStation } from './entities/UpgradeStation'
import { initDamagePopups } from './effects/DamagePopup'
import { applyWorldBend, updateWorldBend } from './effects/WorldBend'
import { initCoinHud } from './ui/CoinHud'
import { initCoinFly } from './effects/CoinFly'
import { initHealthBar } from './ui/HealthBar'
import { initStatsHud } from './ui/StatsHud'
import { createGrassTexture } from './effects/GrassTexture'

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = ''

const scene = new THREE.Scene()
scene.background = new THREE.Color(skyConfig.color)
scene.fog = new THREE.Fog(skyConfig.color, skyConfig.fogNear, skyConfig.fogFar)

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  500
)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
app.appendChild(renderer.domElement)
initDamagePopups(camera, renderer)
const coinHudIcon = initCoinHud()
initCoinFly(camera, renderer, coinHudIcon)
const updateHealthBar = initHealthBar()
const updateStatsHud = initStatsHud()

// Ground: a large grass-textured plane centered at the world origin.
const groundGeometry = new THREE.PlaneGeometry(
  groundConfig.size,
  groundConfig.size,
  groundConfig.divisions,
  groundConfig.divisions
)
const grassTexture = createGrassTexture()
const tileRepeat = groundConfig.size / groundConfig.textureTileSize
grassTexture.repeat.set(tileRepeat, tileRepeat)
const groundMaterial = applyWorldBend(new THREE.MeshStandardMaterial({ map: grassTexture }))
const ground = new THREE.Mesh(groundGeometry, groundMaterial)
ground.rotation.x = -Math.PI / 2
scene.add(ground)

const light = new THREE.DirectionalLight(0xffffff, 2)
light.position.set(2, 2, 2)
scene.add(light)
scene.add(new THREE.AmbientLight(0xffffff, 0.3))

// Input + world + player: the analog stick drives the player's velocity,
// which is applied every fixed 30fps tick inside Player.fixedUpdate.
const input = new AnalogInput(renderer.domElement)
const world = new World()

const player = new Player(input)
world.add(player)
scene.add(player.object)

// Enemies spawn in clusters (a home area + a shared type per cluster) rather
// than scattered independently. Each cluster keeps its population topped up
// over time: when a member dies, EnemyClusterSystem schedules a replacement
// of the same type near the cluster's center after clusterConfig.respawnDelay.
const clusterSystem = new EnemyClusterSystem(player, (enemy) => {
  world.add(enemy)
  scene.add(enemy.object)
})

world.onEntityRemoved = (entity) => {
  scene.remove(entity.object)
  if (entity instanceof Enemy) clusterSystem.notifyEnemyRemoved(entity.clusterId)
}

// Upgrade station: a pad at the map center. Standing on it drains coins one
// at a time (visualized as coins flying from the HUD to the pad) toward a
// permanent upgrade (attack, hp, attack range, move speed); progress persists
// across visits until it's paid off, then it goes on cooldown. The same area
// is also a safe zone: enemies can wander in, but lose interest in a player
// standing inside it (see Enemy's chase check and Player.onHit).
const upgradeStation = new UpgradeStation(player, camera, renderer)
scene.add(upgradeStation.object)

// The tuning panel is a dev tool: only mount it when explicitly requested
// via a `?dev=1` URL query, so it never shows up for normal play.
if (new URLSearchParams(window.location.search).get('dev') === '1') {
  const gui = new dat.GUI()
  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(cameraConfig, 'distance', 1, 50, 0.1)
  cameraFolder.add(cameraConfig, 'yaw', -180, 180, 1)
  cameraFolder.add(cameraConfig, 'pitch', -89, 89, 1)
  cameraFolder.add(cameraConfig, 'followSpeed', 0.5, 20, 0.5)
  cameraFolder.open()

  const playerFolder = gui.addFolder('Player')
  playerFolder.add(playerConfig, 'moveSpeed', 0.5, 20, 0.5)
  playerFolder.add(playerConfig, 'attackDamage', 1, 20, 1)
  playerFolder.add(playerConfig, 'attackCooldown', 0.1, 3, 0.1)
  playerFolder.open()

  const enemyFolder = gui.addFolder('Enemy AI')
  enemyFolder.add(enemyConfig, 'wanderRadius', 1, 20, 0.5)
  enemyFolder.add(enemyConfig, 'wanderIntervalMin', 0.5, 10, 0.5)
  enemyFolder.add(enemyConfig, 'wanderIntervalMax', 0.5, 15, 0.5)
  enemyFolder.add(enemyConfig, 'aggroLeashMultiplier', 1, 3, 0.1)
  enemyFolder.open()

  const clusterFolder = gui.addFolder('Cluster')
  clusterFolder.add(clusterConfig, 'enemiesPerCluster', 1, 12, 1)
  clusterFolder.add(clusterConfig, 'clusterRadius', 1, 20, 0.5)
  clusterFolder.add(clusterConfig, 'respawnDelay', 1, 30, 1)
  clusterFolder.open()

  const animationFolder = gui.addFolder('Animation')
  animationFolder.add(animationConfig, 'breatheFrequency', 0.1, 3, 0.1)
  animationFolder.add(animationConfig, 'breatheAmount', 0, 0.2, 0.01)
  animationFolder.add(animationConfig, 'jogBaseFrequency', 0, 5, 0.1)
  animationFolder.add(animationConfig, 'jogSpeedFrequency', 0, 10, 0.1)
  animationFolder.add(animationConfig, 'jogBounceHeight', 0, 0.5, 0.01)
  animationFolder.add(animationConfig, 'jogStretchAmount', 0, 0.5, 0.01)
  animationFolder.add(animationConfig, 'blendSpeed', 0.5, 20, 0.5)

  const worldBendFolder = gui.addFolder('World Bend')
  worldBendFolder.add(worldBendConfig, 'strength', 0, 0.005, 0.0001)
  worldBendFolder.open()

  const upgradeFolder = gui.addFolder('Upgrade Station')
  upgradeFolder.add(upgradeConfig, 'cost', 1, 200, 1)
  upgradeFolder.add(upgradeConfig, 'depositInterval', 0.02, 1, 0.01)
  upgradeFolder.add(upgradeConfig, 'attackDamageIncrease', 1, 20, 1)
  upgradeFolder.add(upgradeConfig, 'maxHpIncrease', 1, 30, 1)
  upgradeFolder.add(upgradeConfig, 'attackRangeIncrease', 0, 2, 0.1)
  upgradeFolder.add(upgradeConfig, 'moveSpeedIncrease', 0, 2, 0.1)
  upgradeFolder.add(upgradeConfig, 'cooldownSeconds', 1, 120, 1)
  upgradeFolder.open()
}

function updateCamera(deltaTime: number) {
  const yawRad = THREE.MathUtils.degToRad(cameraConfig.yaw)
  const pitchRad = THREE.MathUtils.degToRad(cameraConfig.pitch)

  const offset = new THREE.Vector3(
    cameraConfig.distance * Math.cos(pitchRad) * Math.sin(yawRad),
    cameraConfig.distance * Math.sin(pitchRad),
    cameraConfig.distance * Math.cos(pitchRad) * Math.cos(yawRad)
  )
  const targetPosition = offset.add(player.object.position)

  // Frame-rate independent exponential smoothing: closes a consistent
  // fraction of the remaining gap per second, regardless of delta time.
  const smoothing = 1 - Math.exp(-cameraConfig.followSpeed * deltaTime)
  camera.position.lerp(targetPosition, smoothing)
  camera.lookAt(player.object.position)
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const timer = new THREE.Timer()
timer.connect(document)

function animate() {
  requestAnimationFrame(animate)
  timer.update()
  const deltaTime = Math.min(timer.getDelta(), 0.25)
  world.update(deltaTime)
  clusterSystem.update(deltaTime)
  upgradeStation.update(deltaTime)
  updateCamera(deltaTime)
  updateWorldBend(camera)
  updateHealthBar(player.hp, player.maxHp)
  updateStatsHud(player.level, player.attackDamage, player.moveSpeed)
  renderer.render(scene, camera)
}

animate()
