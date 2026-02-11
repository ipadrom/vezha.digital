<template>
  <div class="tech-icon-3d" ref="containerRef"></div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  modelUrl: string
  isActive?: boolean
}>()

const isIconActive = ref(false)

const containerRef = ref<HTMLDivElement | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let model: THREE.Object3D
let animationFrameId: number
let resizeObserver: ResizeObserver

const init = () => {

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    camera.position.set(0, 0, 2.5)
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    containerRef.value?.appendChild(renderer.domElement)

    const light = new THREE.AmbientLight(0xffffff, 1)
    scene.add(light)

    const loader = new OBJLoader()
        loader.load(props.modelUrl, (object) => {
          console.log("Loaded:", props.modelUrl)
          model = object

          model.traverse((obj) => {
            if (!(obj as THREE.Mesh).isMesh) return

            const mesh = obj as THREE.Mesh

            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => {
                mat.needsUpdate = true
              })
            } else if (mesh.material) {
              mesh.material.needsUpdate = true
            }
          })

          const dirLight = new THREE.DirectionalLight(0xffffff, 1)
          dirLight.position.set(2, 2, 2)
          scene.add(dirLight)



          const box = new THREE.Box3().setFromObject(model)
          const size = new THREE.Vector3()
          box.getSize(size)

          const maxAxis = Math.max(size.x, size.y, size.z)

          const scale = 1.23 / maxAxis
          model.scale.setScalar(scale)

          box.setFromObject(model)
          const center = new THREE.Vector3()
          box.getCenter(center)
          model.position.sub(center)

          scene.add(model)
        }, undefined,
        (err) => console.error("Error loading model:", err)
    )
}

const adaptiveRenderer = () => {
  if (!containerRef.value) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

const rotationSpeed = 0.01
const resetDuration = 0.5
let targetRotationY = 0
const fps = 60
const resetSpeed = 1 / (resetDuration * fps)

const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    if (model) {
        if(isIconActive.value) {
          targetRotationY += rotationSpeed
        }

      model.rotation.y += (targetRotationY - model.rotation.y) * resetSpeed
    }
    renderer.render(scene, camera)
}

watch(() => props.isActive, (newVal) => {
  isIconActive.value = newVal || false

  if(!newVal) {
    targetRotationY = 0
  }
})

onMounted(() => {
    init()
    animate()
    adaptiveRenderer()

    resizeObserver = new ResizeObserver(adaptiveRenderer)
    resizeObserver.observe(containerRef.value!)

})

onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrameId)
    resizeObserver?.disconnect()
    renderer.dispose()
    scene.clear()
})
</script>

<style scoped>
.tech-icon-3d {
    width: 70px;
    height: 70px;
}

@media (max-width: 768px) {
  .tech-icon-3d {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .tech-icon-3d {
    width: 24px;
    height: 24px;
  }
}
</style>
