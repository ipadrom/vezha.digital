<template>
  <!-- Высокий wrapper: пользователь "скроллит сквозь" него, а sticky-контент стоит на месте -->
  <div id="tech-stack" class="stack-wrapper section" ref="wrapperRef">
    <div class="stack-sticky" ref="sectionRef">
      <!-- Starfield parallax -->
      <canvas ref="starsCanvas" class="stack-stars"></canvas>

      <!-- Section title + description -->
      <div class="stack-info">
        <h2 class="stack-section-title">Стек <span class="bracket">&gt;</span></h2>
        <div class="stack-description">
          <p>Стек подбирается под задачу, а не по трендам.</p>
          <p>Каждый инструмент в нашем арсенале прошёл проверку в реальных проектах: он предсказуем в поведении, хорошо документирован и не создаёт проблем при поддержке и масштабировании.</p>
        </div>
      </div>

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

      <!-- Right-side info blocks (desktop only) -->
      <div class="stack-groups">
        <div class="stack-group">
          <h3 class="stack-group-title">Frontend</h3>
          <p class="stack-group-desc">Интерфейсы, которые быстро грузятся и удобно работают на любом устройстве.</p>
          <div class="stack-group-tags">
            <span class="stack-group-tag">React</span>
            <span class="stack-group-tag">Vue 3</span>
            <span class="stack-group-tag">Next.js</span>
            <span class="stack-group-tag">TypeScript</span>
            <span class="stack-group-tag">Tailwind</span>
          </div>
        </div>
        <div class="stack-group">
          <h3 class="stack-group-title">Backend</h3>
          <p class="stack-group-desc">Надёжная серверная часть, которая не ляжет под нагрузкой и легко масштабируется.</p>
          <div class="stack-group-tags">
            <span class="stack-group-tag">Python</span>
            <span class="stack-group-tag">FastAPI</span>
            <span class="stack-group-tag">PostgreSQL</span>
            <span class="stack-group-tag">Docker</span>
          </div>
        </div>
      </div>

      <!-- Mobile-only layout: 3 rows -->
      <div class="stack-mobile">

        <!-- Row 1: title + description -->
        <div class="stack-mobile-top">
          <h2 class="stack-section-title">Стек <span class="bracket">&gt;</span></h2>
          <div class="stack-description">
            <p>Работаем на проверенном стеке: React, Vue, Next.js на фронте, Python и FastAPI на бэке. Всё упаковываем в Docker, храним в PostgreSQL.</p>
            <p>Не гонимся за хайповыми фреймворками — выбираем то, что надёжно работает и легко поддерживается после сдачи.</p>
          </div>
        </div>

        <!-- Row 2: Frontend orbit canvas (left) + Frontend info (right) -->
        <div class="stack-mobile-row">
          <canvas ref="frontendMiniCanvas" class="orbit-canvas"></canvas>
          <div class="stack-mobile-info">
            <h3 class="stack-group-title">Frontend</h3>
            <p class="stack-group-desc">Интерфейсы, которые быстро грузятся и удобно работают на любом устройстве.</p>
            <div class="stack-group-tags">
              <span class="stack-group-tag">React</span>
              <span class="stack-group-tag">Vue 3</span>
              <span class="stack-group-tag">Next.js</span>
              <span class="stack-group-tag">TypeScript</span>
              <span class="stack-group-tag">Tailwind</span>
            </div>
          </div>
        </div>

        <!-- Row 3: Backend info (left) + Backend orbit canvas (right) -->
        <div class="stack-mobile-row">
          <div class="stack-mobile-info">
            <h3 class="stack-group-title">Backend</h3>
            <p class="stack-group-desc">Надёжная серверная часть, которая не ляжет под нагрузкой и легко масштабируется.</p>
            <div class="stack-group-tags">
              <span class="stack-group-tag">Python</span>
              <span class="stack-group-tag">FastAPI</span>
              <span class="stack-group-tag">PostgreSQL</span>
              <span class="stack-group-tag">Docker</span>
            </div>
          </div>
          <canvas ref="backendMiniCanvas" class="orbit-canvas"></canvas>
        </div>

      </div>
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

const MENU_GROUPS = [
  {
    label: 'Frontend',
    desc: 'Интерфейсы, которые быстро грузятся и удобно работают на любом устройстве',
    items: TECHS.filter(t => ['react', 'vue', 'nextjs', 'typescript', 'tailwind'].includes(t.id)),
  },
  {
    label: 'Backend',
    desc: 'Серверная часть, API и базы данных для надёжной работы под нагрузкой',
    items: TECHS.filter(t => ['python', 'fastapi', 'postgresql'].includes(t.id)),
  },
  {
    label: 'DevOps',
    desc: 'Контейнеризация и автоматический деплой для стабильной инфраструктуры',
    items: TECHS.filter(t => ['docker'].includes(t.id)),
  },
]

const ORBIT_RADII  = [2.2, 3.6, 5.0, 6.4, 7.8]
const ORBIT_TILTS  = [0, 0, 0, 0, 0].map(d => d * Math.PI / 180)
// Уменьшена скорость в 2 раза
const BASE_SPEEDS  = [0.0002, 0.00016, 0.000125, 0.0001, 0.00008]

// ── REFS ──────────────────────────────────────────────────────────
const sectionRef      = ref<HTMLElement | null>(null)
const starsCanvas     = ref<HTMLCanvasElement | null>(null)
const threeCanvas     = ref<HTMLCanvasElement | null>(null)
const connectorLine   = ref<SVGPolylineElement | null>(null)
const labelsContainer = ref<HTMLDivElement | null>(null)
const hoveredTech     = ref<string | null>(null)

// Mini orbit canvases (mobile)
const frontendMiniCanvas = ref<HTMLCanvasElement | null>(null)
const backendMiniCanvas  = ref<HTMLCanvasElement | null>(null)

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
  rotSpeed: number
  selfAngle: number   // accumulated in-plane spin (for billboard effect)
  rotAxis: THREE.Vector3
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
  camera = new THREE.PerspectiveCamera(48, 1, 0.1, 200)
  camera.position.set(0, 22, 1)
  camera.lookAt(0, 0, 0)

  // Lights — optimized for top-down view
  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const topLight = new THREE.DirectionalLight(0xffffff, 1.2)
  topLight.position.set(0, 20, 0)
  scene.add(topLight)
  const sun = new THREE.PointLight(0xffffff, 1.5, 40)
  sun.position.set(0, 5, 0)
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0x4488ff, 0.3)
  fill.position.set(-6, 10, 5)
  scene.add(fill)
  const rim = new THREE.DirectionalLight(0x00E5FF, 0.2)
  rim.position.set(6, 10, -5)
  scene.add(rim)

  // Sun in center
  const sunCoreMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xffe566, emissive: 0xff8800, emissiveIntensity: 2.2, metalness: 0, roughness: 1 })
  )
  scene.add(sunCoreMesh)
  // Outer glow halo
  const sunGlowMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xff9900, transparent: true, opacity: 0.07, side: THREE.BackSide })
  )
  scene.add(sunGlowMesh)

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

  // Random per-orbit offset so planets don't line up on the same axis
  const orbitRandomOffset: Record<number, number> = {}
  ORBIT_RADII.forEach((_, i) => { orbitRandomOffset[i] = Math.random() * Math.PI * 2 })

  // Pre-calculate start angles so items on same orbit are spread evenly + random orbit offset
  const orbitCounters: Record<number, number> = {}
  const techAngles = TECHS.map(t => {
    orbitCounters[t.orbit] = orbitCounters[t.orbit] ?? 0
    const count = TECHS.filter(x => x.orbit === t.orbit).length
    const evenAngle = ((orbitCounters[t.orbit]++) / count) * Math.PI * 2
    return evenAngle + orbitRandomOffset[t.orbit]
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

    // Random self-spin speed with wide variation
    const rotSpeed = (0.002 + Math.random() * 0.008) / 2.5
    const initRotY = Math.random() * Math.PI * 2
    // Random rotation axis (normalized) for non-planar spin
    const rotAxis = new THREE.Vector3(
      Math.random() * 0.6 - 0.3,
      0.5 + Math.random() * 0.5,
      Math.random() * 0.6 - 0.3
    ).normalize()

    const addFallback = () => {
      const geo  = new THREE.IcosahedronGeometry(0.45, 1)
      const mat  = new THREE.MeshStandardMaterial({
        color: tech.color,
        emissive: tech.color,
        emissiveIntensity: 0.3,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.set(-Math.PI / 2, initRotY, 0)
      carrier.add(mesh)
      planets.push({ id: tech.id, label: tech.label, mesh: carrier, obj: mesh, orbitPlane, angle, speed, r, rotSpeed, selfAngle: initRotY, rotAxis })
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
        mesh.rotation.set(-Math.PI / 2, initRotY, 0)
        carrier.add(mesh)
        planets.push({ id: tech.id, label: tech.label, mesh: carrier, obj: mesh, orbitPlane, angle, speed, r, rotSpeed, selfAngle: initRotY, rotAxis })
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
    el.style.color = lid === id ? 'var(--accent, #00E5FF)' : 'rgba(224,224,224,0.75)'
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
    if (p.obj) {
      const mesh = p.obj as THREE.Mesh
      mesh.rotateOnAxis(p.rotAxis, p.rotSpeed)
    }

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
    camera.position.y += (ty + 22 - camera.position.y) * 0.03
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

// ── MINI ORBIT (mobile) ───────────────────────────────────────────
// Techs distributed across 3 orbits (inner=0, middle=1, outer=2)
const MINI_FRONTEND_TECHS = [
  { color: 0x61dafb, path: '/models/react/react.obj',           orbit: 0 }, // React
  { color: 0x42b883, path: '/models/vue/vue.obj',               orbit: 0 }, // Vue 3
  { color: 0xdddddd, path: '/models/nextjs/nextjs.obj',         orbit: 1 }, // Next.js
  { color: 0x3178c6, path: '/models/typescript/typescript.obj', orbit: 1 }, // TypeScript
  { color: 0x38bdf8, path: '/models/tailwind/tailwind.obj',     orbit: 2 }, // Tailwind
]

const MINI_BACKEND_TECHS = [
  { color: 0xffd43b, path: '/models/python/python.obj',         orbit: 0 }, // Python
  { color: 0x009688, path: '/models/fastapi/fastapi.obj',       orbit: 1 }, // FastAPI
  { color: 0x336791, path: '/models/postgresql/postgresql.obj', orbit: 1 }, // PostgreSQL
  { color: 0x2496ed, path: '/models/docker/docker.obj',         orbit: 2 }, // Docker
]

interface MiniCleanup { cancel: () => void; dispose: () => void }
let miniCleanups: MiniCleanup[] = []

function initMiniOrbit(
  canvas: HTMLCanvasElement,
  techs: { color: number; path: string; orbit: number }[],
  reverse: boolean
): MiniCleanup {
  const SIZE = 120
  const dpr  = Math.min(window.devicePixelRatio, 2)
  canvas.width  = SIZE * dpr
  canvas.height = SIZE * dpr
  canvas.style.width  = SIZE + 'px'
  canvas.style.height = SIZE + 'px'

  const miniRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  miniRenderer.setPixelRatio(dpr)
  miniRenderer.setSize(SIZE, SIZE, false)
  miniRenderer.setClearColor(0x000000, 0)

  const miniScene = new THREE.Scene()

  // Top-down orthographic camera
  const d = 2.7
  const miniCam = new THREE.OrthographicCamera(-d, d, d, -d, 0.1, 100)
  miniCam.position.set(0, 10, 0)
  miniCam.lookAt(0, 0, 0)

  // Lights — top-down
  miniScene.add(new THREE.AmbientLight(0xffffff, 0.9))
  const dirL = new THREE.DirectionalLight(0xffffff, 1.4)
  dirL.position.set(0, 10, 0)
  miniScene.add(dirL)
  const fillL = new THREE.DirectionalLight(0x4488ff, 0.5)
  fillL.position.set(-5, 5, 5)
  miniScene.add(fillL)

  // Center glow dot
  const centerGeo = new THREE.SphereGeometry(0.07, 8, 8)
  const centerMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff })
  miniScene.add(new THREE.Mesh(centerGeo, centerMat))

  // 3 concentric circular orbits, viewed from top
  const ORBIT_DEFS = [
    { rx: 0.90, rz: 0.90, tilt: 0, speed: 0.005  }, // inner
    { rx: 1.55, rz: 1.55, tilt: 0, speed: 0.0038 }, // middle
    { rx: 2.15, rz: 2.15, tilt: 0, speed: 0.003  }, // outer
  ]

  // Create orbit groups + circular rings for all 3 orbits
  const orbitGroups: THREE.Group[] = ORBIT_DEFS.map(def => {
    const group = new THREE.Group()
    miniScene.add(group)

    const ringPts: THREE.Vector3[] = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      ringPts.push(new THREE.Vector3(Math.cos(a) * def.rx, 0, Math.sin(a) * def.rz))
    }
    group.add(new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(ringPts),
      new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.22 })
    ))
    return group
  })

  // Count techs per orbit to spread them evenly
  const orbitCounts: Record<number, number> = {}
  const orbitProgress: Record<number, number> = {}
  techs.forEach(t => { orbitCounts[t.orbit] = (orbitCounts[t.orbit] ?? 0) + 1 })

  // rotSpeed: each planet spins at its own pace (desynchronized)
  interface MiniPlanet { mesh: THREE.Mesh; orbitIdx: number; baseAngle: number; rotSpeed: number }
  const miniPlanets: (MiniPlanet | null)[] = new Array(techs.length).fill(null)

  techs.forEach((tech, i) => {
    const oi  = tech.orbit
    const def = ORBIT_DEFS[oi]
    const count = orbitCounts[oi] ?? 1
    orbitProgress[oi] = orbitProgress[oi] ?? 0
    const baseAngle = (orbitProgress[oi]++ / count) * Math.PI * 2
    // Each planet: random initial rotation + unique spin speed
    const rotSpeed = 0.004 + Math.random() * 0.012

    const place = (mesh: THREE.Mesh) => {
      mesh.rotation.y = Math.random() * Math.PI * 2  // random start angle
      mesh.position.set(Math.cos(baseAngle) * def.rx, 0, Math.sin(baseAngle) * def.rz)
      orbitGroups[oi].add(mesh)
      miniPlanets[i] = { mesh, orbitIdx: oi, baseAngle, rotSpeed }
    }

    const addFallback = () => {
      const geo = new THREE.IcosahedronGeometry(0.25, 1)
      const mat = new THREE.MeshStandardMaterial({ color: tech.color, metalness: 0.2, roughness: 0.5 })
      place(new THREE.Mesh(geo, mat))
    }

    fetch(tech.path)
      .then(res => { if (!res.ok) throw new Error(String(res.status)); return res.text() })
      .then(text => {
        const geo = parseOBJ(text)
        const mat = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.3, roughness: 0.55 })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.scale.setScalar(1.1)
        mesh.rotation.x = -Math.PI / 2  // face top-down camera
        place(mesh)
      })
      .catch(addFallback)
  })

  const dir = reverse ? -1 : 1
  let raf = 0
  let frame = 0

  function loop() {
    raf = requestAnimationFrame(loop)
    frame++
    miniPlanets.forEach(planet => {
      if (!planet) return
      const def = ORBIT_DEFS[planet.orbitIdx]
      const a = planet.baseAngle + frame * def.speed * dir
      planet.mesh.position.set(Math.cos(a) * def.rx, 0, Math.sin(a) * def.rz)
      planet.mesh.rotation.y += planet.rotSpeed  // unique speed per planet
    })
    miniRenderer.render(miniScene, miniCam)
  }
  loop()

  return {
    cancel:  () => cancelAnimationFrame(raf),
    dispose: () => {
      cancelAnimationFrame(raf)
      miniRenderer.dispose()
    },
  }
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
  }, { threshold: 0.3 })
  observer.observe(section)

  setTimeout(() => { onResize(); animate() }, 120)

  // Init mini orbit canvases — only on mobile
  if (window.innerWidth <= 768) {
    if (frontendMiniCanvas.value) {
      miniCleanups.push(initMiniOrbit(frontendMiniCanvas.value, MINI_FRONTEND_TECHS, false))
    }
    if (backendMiniCanvas.value) {
      miniCleanups.push(initMiniOrbit(backendMiniCanvas.value, MINI_BACKEND_TECHS, true))
    }
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onScroll)
  renderer?.dispose()
  // Cleanup mini orbit renderers
  miniCleanups.forEach(c => c.dispose())
  miniCleanups = []
})
</script>

<style scoped>
/* ── Wrapper: высокий, пользователь скроллит сквозь него ── */
.stack-wrapper {
  position: relative;
  width: 100%;
  height: 200vh;
}

/* ── Sticky: прилипает под хедером, занимает видимую область ── */
.stack-sticky {
  position: sticky;
  top: 84px;
  width: 100%;
  height: calc(100vh - 84px);
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

.stack-info {
  position: absolute;
  top: 50%;
  left: 3.125vw;
  transform: translateY(-50%);
  z-index: 11;
  pointer-events: none;
  max-width: 25vw;
}

.stack-section-title {
  font-family: var(--font-inter);
  font-size: 4.5vw;
  font-weight: 700;
  color: #fff;
  margin: 0 0 20px 0;
  white-space: nowrap;
}

.stack-description {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stack-description p {
  color: #e0e0e0;
  font-family: var(--font-inter);
  font-size: 1.2vw;
  line-height: 1.8;
  font-weight: 400;
  margin: 0;
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

/* Right-side info blocks */
.stack-groups {
  position: absolute;
  top: 30px;
  bottom: 50px;
  right: 3.125vw;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 25vw;
  pointer-events: none;
}

.stack-group-title {
  font-family: var(--font-inter);
  font-size: 3vw;
  font-weight: 800;
  color: var(--accent);
  margin: 0 0 16px 0;
  white-space: nowrap;
}

.stack-group-desc {
  color: #e0e0e0;
  font-family: var(--font-inter);
  font-size: 1.2vw;
  line-height: 1.8;
  font-weight: 400;
  margin: 0 0 12px 0;
}

.stack-group-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stack-group-tag {
  display: inline-block;
  padding: 0.3vw 0.7vw;
  border: 2px solid var(--accent);
  background: var(--accent);
  color: var(--bg);
  font-family: var(--font-inter);
  font-size: 0.9vw;
  font-weight: 600;
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

/* ── Mobile layout ── */
.stack-mobile { display: none; }

/* ── Desktop fade ── */
@media (min-width: 769px) {
  .stack-sticky {
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 6%);
    mask-image: linear-gradient(to bottom, transparent 0%, black 6%);
  }
}

@media (max-width: 768px) {
  /* Disable scroll-lock, keep relative for absolute children */
  .stack-wrapper { height: auto; margin-bottom: 0 !important; }
  .stack-sticky {
    position: relative;
    top: 0;
    height: auto;
    overflow: hidden;
    background: var(--bg);
    padding: 0 20px 20px;
  }

  .stack-stars {
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
    mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
  }

  /* Hide desktop-only overlay elements */
  .stack-connector-svg,
  .stack-labels,
  .stack-scroll-hint,
  .stack-groups,
  .stack-info { display: none !important; }

  /* Stars and 3D canvas stay as background */
  .stack-stars {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  .stack-canvas {
    display: none !important;
  }

  /* Show mobile layout above canvas */
  .stack-mobile {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* Row 1: title + description */
  .stack-mobile-top .stack-section-title {
    font-size: 1.8rem;
    margin: 0 0 12px;
  }
  .stack-mobile-top .stack-description {
    gap: 8px;
  }
  .stack-mobile-top .stack-description p {
    font-size: 0.83rem;
    color: #e0e0e0;
    line-height: 1.65;
    margin: 0;
  }

  /* Rows 2 & 3 */
  .stack-mobile-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .stack-mobile-info {
    flex: 1;
    min-width: 0;
  }
  .stack-mobile-info .stack-group-title {
    font-size: 1.3rem;
    margin-bottom: 8px;
  }
  .stack-mobile-info .stack-group-desc {
    font-size: 0.78rem;
    line-height: 1.6;
    margin-bottom: 10px;
  }
  .stack-mobile-info .stack-group-tags {
    gap: 5px;
  }
  .stack-mobile-info .stack-group-tag {
    padding: 3px 10px;
    font-size: 0.68rem;
  }

  /* Mini Three.js orbit canvas */
  .orbit-canvas {
    flex-shrink: 0;
    width: 120px;
    height: 120px;
    display: block;
  }
}
</style>
