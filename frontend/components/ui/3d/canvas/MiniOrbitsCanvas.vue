<template>
  <canvas ref="miniCanvas"></canvas>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import parseOBJ from "~/composables/useOBJParser";
import { syncThreeRendererPixelRatio } from "~/utils/threeRenderQuality";

const props = defineProps<{
  techs: { color: number; path: string; orbit: number }[]
  reverse?: boolean
}>()

const miniCanvas = ref<HTMLCanvasElement | null>(null)

interface MiniCleanup { cancel: () => void; dispose: () => void }
let miniCleanups: MiniCleanup | null = null

function initMiniOrbit(
    canvas: HTMLCanvasElement,
    techs: { color: number; path: string; orbit: number }[],
    reverse: boolean
): MiniCleanup {
  const SIZE = 120
  canvas.style.width  = SIZE + 'px'
  canvas.style.height = SIZE + 'px'

  const miniRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  const syncResolution = () => {
    syncThreeRendererPixelRatio(miniRenderer)
    miniRenderer.setSize(SIZE, SIZE, false)
  }
  syncResolution()
  miniRenderer.setClearColor(0x000000, 0)
  const viewport = window.visualViewport
  window.addEventListener('resize', syncResolution, { passive: true })
  viewport?.addEventListener('resize', syncResolution, { passive: true })

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
      window.removeEventListener('resize', syncResolution)
      viewport?.removeEventListener('resize', syncResolution)
      miniRenderer.dispose()
    },
  }
}

onMounted(() => {
  if(miniCanvas.value){
    miniCleanups = initMiniOrbit(
        miniCanvas.value,
        props.techs,
        !!props.reverse
    )
  }
})

onBeforeUnmount(() => {
  if(miniCleanups){
    miniCleanups.dispose()
  }
})
</script>
