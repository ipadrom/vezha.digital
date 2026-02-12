<template>
  <!-- Высокий wrapper: пользователь "скроллит сквозь" него, а sticky-контент стоит на месте -->
  <div id="tech-stack" class="stack-wrapper" ref="wrapperRef">
    <div class="stack-sticky" ref="sectionRef">
      <!-- Starfield parallax -->
      <canvas ref="starsCanvas" class="stack-stars"></canvas>

      <!-- Ghost watermark -->
      <div class="stack-watermark"><span class="wm-bracket">&lt;</span>Стек<span class="wm-bracket">/&gt;</span></div>

      <!-- Three.js 3D models -->
      <canvas ref="threeCanvas" class="stack-canvas"></canvas>

      <!-- SVG connector line -->
      <svg class="stack-connector-svg" overflow="visible">
        <polyline
          ref="connectorLine"
          class="stack-connector-line"
          points="0,0"
        />
      </svg>

      <!-- Labels container (populated by JS) -->
      <div ref="labelsContainer" class="stack-labels"></div>

      <!-- Scroll progress indicator -->
      <div class="stack-scroll-hint">
        <div class="stack-scroll-bar" :style="{ width: (scrollProgressNorm * 100) + '%' }"></div>
      </div>

      <!-- Right menu -->
      <nav class="stack-menu">
        <div
          v-for="tech in TECHS"
          :key="tech.id"
          class="stack-menu-item"
          :class="{ active: hoveredTech === tech.id }"
          @mouseenter="onMenuEnter(tech.id)"
          @mouseleave="onMenuLeave"
        >
          <span>{{ tech.label }}</span>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import type { ITechStack } from '~/utils/interfaces/ITechStack'

defineProps<{ techStack: ITechStack[] }>()

// ── CONFIG ────────────────────────────────────────────────────────
const TECHS = [
  { id: 'react',       label: 'React',      color: 0x61dafb, path: '/models/react/react.obj',               orbit: 0 },
  { id: 'vue',         label: 'Vue 3',      color: 0x42b883, path: '/models/vue/vue.obj',                   orbit: 1 },
  { id: 'nextjs',      label: 'Next.js',    color: 0xdddddd, path: '/models/nextjs/nextjs.obj',             orbit: 1 },
  { id: 'typescript',  label: 'TypeScript', color: 0x3178c6, path: '/models/typescript/typescript.obj',     orbit: 2 },
  { id: 'tailwind',    label: 'Tailwind',   color: 0x38bdf8, path: '/models/tailwind/tailwind.obj',         orbit: 2 },
  { id: 'python',      label: 'Python',     color: 0xffd43b, path: '/models/python/python.obj',             orbit: 3 },
  { id: 'fastapi',     label: 'FastAPI',    color: 0x009688, path: '/models/fastapi/fastapi.obj',           orbit: 3 },
  { id: 'postgresql',  label: 'PostgreSQL', color: 0x336791, path: '/models/postgresql/postgresql.obj',     orbit: 4 },
  { id: 'docker',      label: 'Docker',     color: 0x2496ed, path: '/models/docker/docker.obj',             orbit: 4 },
]

const ORBIT_RADII  = [2.2, 3.6, 5.0, 6.4, 7.8]
const ORBIT_TILTS  = [0, 8, -5, 10, -8].map(d => d * Math.PI / 180)
const BASE_SPEEDS  = [0.0004, 0.00032, 0.00025, 0.0002, 0.00016]

// ── REFS ──────────────────────────────────────────────────────────
const sectionRef      = ref<HTMLElement | null>(null)
const starsCanvas     = ref<HTMLCanvasElement | null>(null)
const threeCanvas     = ref<HTMLCanvasElement | null>(null)
const connectorLine   = ref<SVGPolylineElement | null>(null)
const labelsContainer = ref<HTMLDivElement | null>(null)
const hoveredTech     = ref<string | null>(null)

// ── INTERNALS ─────────────────────────────────────────────────────
let stars: { x: number; y: number; r: number; depth: number; alpha: number }[] = []
let mouseX = 0, mouseY = 0

interface Planet {
  id: string
  label: string
  mesh: THREE.Group   // carrier (moves along orbit)
  obj: THREE.Object3D | null
  orbitPlane: THREE.Group
  angle: number
  speed: number
  r: number
}

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let planets: Planet[] = []
let labelEls: Record<string, HTMLDivElement> = {}
let rafId = 0
let starsCtx: CanvasRenderingContext2D | null = null

// ── STARFIELD ─────────────────────────────────────────────────────
function initStars(W: number, H: number) {
  const c = starsCanvas.value!
  c.width = W; c.height = H
  starsCtx = c.getContext('2d')
  stars = Array.from({ length: 260 }, () => ({
    x:     Math.random() * W,
    y:     Math.random() * H,
    r:     Math.random() * 1.2 + 0.2,
    depth: Math.random() * 3 + 1,
    alpha: Math.random() * 0.55 + 0.25,
  }))
}

function drawStars() {
  if (!starsCtx || !starsCanvas.value) return
  const W = starsCanvas.value.width, H = starsCanvas.value.height
  starsCtx.clearRect(0, 0, W, H)
  const cx = mouseX / (W || 1) - 0.5
  const cy = mouseY / (H || 1) - 0.5
  for (const s of stars) {
    const px = ((s.x + cx * s.depth * 20) % W + W) % W
    const py = ((s.y + cy * s.depth * 20) % H + H) % H
    starsCtx.beginPath()
    starsCtx.arc(px, py, s.r, 0, Math.PI * 2)
    starsCtx.fillStyle = `rgba(255,255,255,${s.alpha})`
    starsCtx.fill()
  }
}

// ── OBJ PARSER (vertex colors) ────────────────────────────────────
function parseOBJ(text: string): THREE.BufferGeometry {
  const positions: [number, number, number][] = []
  const vColors:   [number, number, number][] = []
  const normals:   [number, number, number][] = []
  const posArr: number[] = []
  const colArr: number[] = []
  const norArr: number[] = []

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('v ')) {
      const p = line.split(/\s+/)
      positions.push([+p[1], +p[2], +p[3]])
      vColors.push(p.length >= 7 ? [+p[4], +p[5], +p[6]] : [1, 1, 1])
    } else if (line.startsWith('vn ')) {
      const p = line.split(/\s+/)
      normals.push([+p[1], +p[2], +p[3]])
    } else if (line.startsWith('f ')) {
      const verts = line.split(/\s+/).slice(1)
      for (let k = 1; k < verts.length - 1; k++) {
        for (const v of [verts[0], verts[k], verts[k + 1]]) {
          const idx = v.split('/')
          const vi  = (parseInt(idx[0]) || 1) - 1
          const ni  = idx[2] ? (parseInt(idx[2]) - 1) : -1
          posArr.push(...(positions[vi] ?? [0, 0, 0]))
          colArr.push(...(vColors[vi]   ?? [1, 1, 1]))
          norArr.push(...(ni >= 0 ? (normals[ni] ?? [0, 1, 0]) : [0, 1, 0]))
        }
      }
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3))
  geo.setAttribute('color',    new THREE.Float32BufferAttribute(colArr, 3))
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(norArr, 3))

  geo.computeBoundingBox()
  const bbox = geo.boundingBox!
  const center = new THREE.Vector3()
  bbox.getCenter(center)
  const size = new THREE.Vector3()
  bbox.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  geo.translate(-center.x, -center.y, -center.z)

  // Нормализуем до ~0.75 единиц
  const s = 0.75 / maxDim
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(i, pos.getX(i) * s, pos.getY(i) * s, pos.getZ(i) * s)
  }
  pos.needsUpdate = true
  geo.computeBoundingBox()
  return geo
}

// ── THREE.JS INIT ─────────────────────────────────────────────────
function initThree() {
  const canvas = threeCanvas.value!
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  scene  = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(52, 1, 0.1, 200)
  camera.position.set(0, 4, 18)
  camera.lookAt(0, 0, 0)

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const sun = new THREE.PointLight(0xffffff, 2, 40)
  sun.position.set(0, 0, 0)
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0x4488ff, 0.4)
  fill.position.set(-6, 4, 5)
  scene.add(fill)
  const rim = new THREE.DirectionalLight(0x00ff41, 0.25)
  rim.position.set(0, -5, -8)
  scene.add(rim)

  // Orbit rings
  const orbitGroup = new THREE.Group()
  scene.add(orbitGroup)
  ORBIT_RADII.forEach((r, i) => {
    const pts: THREE.Vector3[] = []
    for (let s = 0; s <= 128; s++) {
      const a = (s / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r))
    }
    const ring = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 })
    )
    ring.rotation.x = ORBIT_TILTS[i]
    orbitGroup.add(ring)
  })

  // Pre-calculate start angles so items on same orbit are spread evenly
  const orbitCounters: Record<number, number> = {}
  const techAngles = TECHS.map(t => {
    orbitCounters[t.orbit] = orbitCounters[t.orbit] ?? 0
    const count = TECHS.filter(x => x.orbit === t.orbit).length
    return ((orbitCounters[t.orbit]++) / count) * Math.PI * 2
  })

  TECHS.forEach((tech, i) => {
    const r      = ORBIT_RADII[tech.orbit]
    const tilt   = ORBIT_TILTS[tech.orbit]
    const speed  = BASE_SPEEDS[tech.orbit] * (1 + (i % 3) * 0.15)
    const angle  = techAngles[i]

    const orbitPlane = new THREE.Group()
    orbitPlane.rotation.x = tilt
    scene!.add(orbitPlane)

    const carrier = new THREE.Group()
    orbitPlane.add(carrier)

    const addFallback = () => {
      const geo  = new THREE.IcosahedronGeometry(0.45, 1)
      const mat  = new THREE.MeshStandardMaterial({
        color: tech.color,
        emissive: tech.color,
        emissiveIntensity: 0.3,
      })
      const mesh = new THREE.Mesh(geo, mat)
      carrier.add(mesh)
      planets.push({ id: tech.id, label: tech.label, mesh: carrier, obj: mesh, orbitPlane, angle, speed, r })
    }

    fetch(tech.path)
      .then(res => { if (!res.ok) throw new Error(String(res.status)); return res.text() })
      .then(text => {
        const geo = parseOBJ(text)
        const mat = new THREE.MeshStandardMaterial({
          vertexColors: true,
          emissive: new THREE.Color(0x111111),
          emissiveIntensity: 0.15,
          metalness: 0.35,
          roughness: 0.55,
        })
        const mesh = new THREE.Mesh(geo, mat)
        carrier.add(mesh)
        planets.push({ id: tech.id, label: tech.label, mesh: carrier, obj: mesh, orbitPlane, angle, speed, r })
      })
      .catch(addFallback)
  })
}

// ── LABELS ────────────────────────────────────────────────────────
function initLabels() {
  const container = labelsContainer.value!
  TECHS.forEach(tech => {
    const el = document.createElement('div')
    el.textContent = tech.label
    el.style.cssText = `
      position:absolute;
      font-family:'JetBrains Mono',monospace;
      font-size:0.7rem;
      letter-spacing:0.08em;
      color:rgba(224,224,224,0.75);
      transform:translate(-50%,0);
      pointer-events:none;
      white-space:nowrap;
      text-shadow:0 0 6px rgba(0,0,0,0.8);
      transition:color 0.3s;
    `
    container.appendChild(el)
    labelEls[tech.id] = el
  })
}

// ── CONNECTOR ─────────────────────────────────────────────────────
function project3D(wp: THREE.Vector3): { x: number; y: number } {
  const v = wp.clone().project(camera!)
  const W = threeCanvas.value!.clientWidth  || threeCanvas.value!.width
  const H = threeCanvas.value!.clientHeight || threeCanvas.value!.height
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H }
}

function getMenuItemRect(techId: string): { x: number; y: number } | null {
  const section = sectionRef.value!
  const item = section.querySelector<HTMLElement>(`.stack-menu-item[data-id="${techId}"]`)
  if (!item) return null
  const sr = section.getBoundingClientRect()
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

function clearConnector() {
  if (connectorLine.value) connectorLine.value.style.opacity = '0'
}

// ── MENU EVENTS ───────────────────────────────────────────────────
function onMenuEnter(id: string) {
  hoveredTech.value = id
  Object.entries(labelEls).forEach(([lid, el]) => {
    el.style.color = lid === id ? 'var(--accent, #00ff41)' : 'rgba(224,224,224,0.75)'
  })
}

function onMenuLeave() {
  hoveredTech.value = null
  clearConnector()
  Object.values(labelEls).forEach(el => { el.style.color = 'rgba(224,224,224,0.75)' })
}

// ── RESIZE ────────────────────────────────────────────────────────
function onResize() {
  const section = sectionRef.value!
  const W = section.clientWidth  || window.innerWidth
  const H = section.clientHeight || 700
  renderer?.setSize(W, H, false)
  if (camera) { camera.aspect = W / H; camera.updateProjectionMatrix() }
  initStars(W, H)
}

// ── ANIMATE ───────────────────────────────────────────────────────
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
    if (el) { el.style.left = sp.x + 'px'; el.style.top = (sp.y + 30) + 'px' }
  })

  // Camera parallax
  const W = starsCanvas.value?.width ?? 1
  const H = starsCanvas.value?.height ?? 1
  const tx = (mouseX / W - 0.5) * 1.8
  const ty = -(mouseY / H - 0.5) * 1.2
  if (camera) {
    camera.position.x += (tx - camera.position.x) * 0.03
    camera.position.y += (ty + 4 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
  }

  renderer?.render(scene!, camera!)
  drawStars()
  if (hoveredTech.value) drawConnector(hoveredTech.value)
}

// ── SCROLL PROGRESS (CSS sticky approach) ─────────────────────────
// wrapperRef — высокий div, sectionRef — sticky child внутри него
const wrapperRef = ref<HTMLElement | null>(null)
const scrollProgressNorm = ref(0)

function onScroll() {
  const wrapper = wrapperRef.value
  if (!wrapper) return
  const rect     = wrapper.getBoundingClientRect()
  const viewH    = window.innerHeight
  // Сколько уже "проскроллили" сквозь wrapper
  // rect.top < 0 — wrapper ушёл вверх
  const scrolled = -rect.top                          // px прокрученных внутри wrapper
  const total    = wrapper.offsetHeight - viewH       // максимально возможный скролл
  scrollProgressNorm.value = total > 0
    ? Math.min(1, Math.max(0, scrolled / total))
    : 0
}

// ── LIFECYCLE ─────────────────────────────────────────────────────
onMounted(() => {
  initThree()
  initLabels()

  // Bind data-id to menu items for connector lookup
  const section = sectionRef.value!
  section.querySelectorAll<HTMLElement>('.stack-menu-item').forEach((el, i) => {
    el.dataset.id = TECHS[i]?.id ?? ''
  })

  section.addEventListener('mousemove', (e: MouseEvent) => {
    const r = section.getBoundingClientRect()
    mouseX = e.clientX - r.left
    mouseY = e.clientY - r.top
  })

  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onScroll, { passive: true })

  // IntersectionObserver — animate only when visible
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) animate()
      else cancelAnimationFrame(rafId)
    })
  }, { threshold: 0.01 })
  observer.observe(section)

  setTimeout(() => { onResize(); animate() }, 120)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onScroll)
  renderer?.dispose()
})
</script>

<style scoped>
/* ── Wrapper: высокий, пользователь скроллит сквозь него ── */
.stack-wrapper {
  position: relative;
  width: 100%;
  height: 300vh; /* 3 экрана = ~"5 скроллов" задержки */
}

/* ── Sticky: прилипает к верху, занимает весь экран ── */
.stack-sticky {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #060610;
}

.stack-stars {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.stack-watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-epilepsy);
  font-size: clamp(8rem, 20vw, 18rem);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.03);
  letter-spacing: 0.05em;
  pointer-events: none;
  z-index: 1;
  user-select: none;
}

.wm-bracket {
  color: rgba(0, 255, 65, 0.04);
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
  overflow: hidden;
}

.stack-connector-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9;
  overflow: visible;
}

.stack-connector-line {
  stroke: var(--accent);
  stroke-width: 1.5;
  fill: none;
  opacity: 0;
  transition: opacity 0.25s;
  filter: drop-shadow(0 0 4px var(--accent));
}

/* Right side menu */
.stack-menu {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 18px;
  pointer-events: auto;
}

.stack-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  justify-content: flex-end;
}

.stack-menu-item span {
  font-family: var(--font-epilepsy);
  font-size: 1rem;
  color: var(--text-dim);
  transition: color 0.3s;
  letter-spacing: 0.05em;
}

.stack-menu-item::after {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-dim);
  flex-shrink: 0;
  transition: background 0.3s, box-shadow 0.3s;
}

.stack-menu-item:hover span,
.stack-menu-item.active span {
  color: var(--accent);
}

.stack-menu-item:hover::after,
.stack-menu-item.active::after {
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
}

/* Scroll progress bar */
.stack-scroll-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255,255,255,0.06);
  z-index: 20;
}

.stack-scroll-bar {
  height: 100%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  transition: width 0.25s ease;
  width: 0%;
}

@media (max-width: 768px) {
  .stack-menu {
    right: 12px;
    gap: 12px;
  }
  .stack-menu-item span {
    font-size: 0.75rem;
  }
}
</style>
