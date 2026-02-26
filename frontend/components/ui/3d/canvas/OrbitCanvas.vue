<template>
  <div class="orbit-wrapper" ref="containerRef">
    <canvas ref="threeCanvas" class="stack-canvas"></canvas>

    <svg class="stack-connector-svg" overflow="visible">
      <polyline
          ref="connectorLine"
          class="stack-connector-line"
          points="0,0"
      />
    </svg>

    <div ref="labelsContainer" class="stack-labels"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from "three"
import type { ITechStack } from "~/utils/interfaces/ITechStack"
import type { IPlanet } from "~/utils/interfaces/IPlanet"
import parseOBJ from "~/composables/useOBJParser"

const props = defineProps<{
  techs: ITechStack[],
  hoveredTech: string | null,
  menuContainer: HTMLElement | null,
}>()

// ── REFS ──────────────────────────────────────────────────────────
const containerRef = ref<HTMLElement | null>(null)
const threeCanvas = ref<HTMLCanvasElement | null>(null)
const connectorLine = ref<SVGPolylineElement | null>(null)
const labelsContainer = ref<HTMLDivElement | null>(null)

// Используем shallowRef для тяжелых объектов Three.js
const renderer = shallowRef<THREE.WebGLRenderer | null>(null)
const scene = shallowRef<THREE.Scene | null>(null)
const camera = shallowRef<THREE.PerspectiveCamera | null>(null)

const ORBIT_RADII  = [2.2, 3.6, 5.0, 6.4, 7.8]
const ORBIT_TILTS  = [0, 8, -5, 10, -8].map(d => d * Math.PI / 180)
const BASE_SPEEDS  = [0.0004, 0.00032, 0.00025, 0.0002, 0.00016]

let planets: IPlanet[] = []
let labelEls: Record<string, HTMLDivElement> = {}
let rafId = 0

// ── THREE.JS INIT ─────────────────────────────────────────────────
function initThree() {
  if (!threeCanvas.value) return

  const canvas = threeCanvas.value
  const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  r.setClearColor(0x000000, 0)
  renderer.value = r

  const s = new THREE.Scene()
  scene.value = s

  const c = new THREE.PerspectiveCamera(52, 1, 0.1, 200)
  c.position.set(0, 4, 18)
  c.lookAt(0, 0, 0)
  camera.value = c

  // Lights
  s.add(new THREE.AmbientLight(0xffffff, 0.5))
  const sun = new THREE.PointLight(0xffffff, 2, 40)
  s.add(sun)

  const fill = new THREE.DirectionalLight(0x4488ff, 0.4)
  fill.position.set(-6, 4, 5)
  s.add(fill)

  // Orbit rings
  ORBIT_RADII.forEach((radius, i) => {
    const pts: THREE.Vector3[] = []
    for (let step = 0; step <= 128; step++) {
      const a = (step / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
    }
    const ring = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 })
    )
    ring.rotation.x = ORBIT_TILTS[i]
    s.add(ring)
  })

  // Рассчитываем углы для планет
  const orbitCounters: Record<number, number> = {}
  const techAngles = props.techs.map(t => {
    orbitCounters[t.orbit] = (orbitCounters[t.orbit] ?? 0)
    const count = props.techs.filter(x => x.orbit === t.orbit).length
    return ((orbitCounters[t.orbit]++) / count) * Math.PI * 2
  })

  props.techs.forEach((tech, i) => {
    const rVal     = ORBIT_RADII[tech.orbit]
    const tilt     = ORBIT_TILTS[tech.orbit]
    const speed    = BASE_SPEEDS[tech.orbit] * (1 + (i % 3) * 0.15)
    const angle    = techAngles[i]

    const orbitPlane = new THREE.Group()
    orbitPlane.rotation.x = tilt
    s.add(orbitPlane)

    const carrier = new THREE.Group()
    orbitPlane.add(carrier)

    const addModel = (geo: THREE.BufferGeometry) => {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: geo.getAttribute('color') !== undefined,
        emissive: new THREE.Color(0x111111),
        emissiveIntensity: 0.15,
        metalness: 0.35,
        roughness: 0.55,
      })
      const mesh = new THREE.Mesh(geo, mat)
      carrier.add(mesh)
      planets.push({ id: tech.id, label: tech.name, mesh: carrier, obj: mesh, orbitPlane, angle, speed, r: rVal })
    }

    fetch(tech.path)
        .then(res => res.text())
        .then(text => addModel(parseOBJ(text)))
        .catch(() => {
          // Fallback
          const geo = new THREE.IcosahedronGeometry(0.45, 1)
          addModel(geo)
        })
  })
}

function initLabels() {
  if (!labelsContainer.value) return
  props.techs.forEach(tech => {
    const el = document.createElement('div')
    el.textContent = tech.name
    el.className = 'tech-label' // Стили лучше вынести в CSS
    labelsContainer.value?.appendChild(el)
    labelEls[tech.id] = el
  })
}

// ── COORDINATES & CONNECTORS ──────────────────────────────────────
function project3D(wp: THREE.Vector3) {
  if (!camera.value || !threeCanvas.value) return { x: 0, y: 0 }
  const v = wp.clone().project(camera.value)
  const W = threeCanvas.value.clientWidth
  const H = threeCanvas.value.clientHeight
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H }
}

function getMenuItemRect(techId: string) {
  // Используем props.menuContainer вместо несуществующего sectionRef
  if (!props.menuContainer) return null
  const item = props.menuContainer.querySelector<HTMLElement>(`.stack-menu-item[data-id="${techId}"]`)
  if (!item) return null

  const sr = props.menuContainer.getBoundingClientRect()
  const ir = item.getBoundingClientRect()
  return { x: ir.left - sr.left, y: ir.top - sr.top + ir.height / 2 }
}

function drawConnector(techId: string) {
  const p = planets.find(pl => pl.id === techId)
  if (!p || !connectorLine.value) return

  const wp = new THREE.Vector3()
  p.mesh.getWorldPosition(wp)
  const ps = project3D(wp)
  const ms = getMenuItemRect(techId)

  if (!ms) return
  const elbowX = ms.x - 40
  connectorLine.value.setAttribute('points', `${ps.x},${ps.y} ${elbowX},${ps.y} ${ms.x},${ms.y}`)
  connectorLine.value.style.opacity = '1'
}

// ── ANIMATION LOOP ────────────────────────────────────────────────
function animate() {
  rafId = requestAnimationFrame(animate)

  planets.forEach(p => {
    p.angle += p.speed
    p.mesh.position.set(Math.cos(p.angle) * p.r, 0, Math.sin(p.angle) * p.r)
    if (p.obj) (p.obj as THREE.Mesh).rotation.y += 0.003

    const wp = new THREE.Vector3()
    p.mesh.getWorldPosition(wp)
    const sp = project3D(wp)
    const el = labelEls[p.id]
    if (el) {
      el.style.left = sp.x + 'px'
      el.style.top = (sp.y + 30) + 'px'
    }
  })

  if (renderer.value && scene.value && camera.value) {
    renderer.value.render(scene.value, camera.value)
  }

  // Исправлено: доступ к пропсу напрямую и проверка на null
  if (props.hoveredTech) {
    drawConnector(props.hoveredTech)
  } else if (connectorLine.value) {
    connectorLine.value.style.opacity = '0'
  }
}

function onResize() {
  if (!containerRef.value || !renderer.value || !camera.value) return
  const W = containerRef.value.clientWidth
  const H = containerRef.value.clientHeight
  renderer.value.setSize(W, H, false)
  camera.value.aspect = W / H
  camera.value.updateProjectionMatrix()
}

// ── LIFECYCLE ─────────────────────────────────────────────────────
onMounted(() => {
  initThree()
  initLabels()
  window.addEventListener('resize', onResize)
  onResize()
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', onResize)
  renderer.value?.dispose()
})
</script>

<style scoped>
.orbit-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.stack-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.stack-labels {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 8;
}

:deep(.tech-label) {
  position: absolute;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: rgba(224, 224, 224, 0.75);
  transform: translate(-50%, 0);
  pointer-events: none;
  white-space: nowrap;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.8);
  transition: color 0.3s;
}

.stack-connector-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9;
}

.stack-connector-line {
  stroke: var(--accent, #00ff41);
  stroke-width: 1.5;
  fill: none;
  opacity: 0;
  transition: opacity 0.25s;
  filter: drop-shadow(0 0 4px var(--accent, #00ff41));
}

@media (max-width: 768px) {
  .orbit-wrapper,
  .stack-connector-svg,
  .stack-connector-svg,
  .stack-labels
  { display: none !important; }
}
</style>