<template>
  <div class="tech-icon-3d" ref="containerRef"></div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  modelUrl: string
}>()

const containerRef = ref<HTMLDivElement | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let model: THREE.Object3D
let animationFrameId: number

const init = () => {

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    camera.position.set(0, 0, 2.5)
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(70, 70, false)
    
    containerRef.value?.appendChild(renderer.domElement)

    const light = new THREE.AmbientLight(0xffffff, 1)
    scene.add(light)


    const loader = new GLTFLoader()
        loader.load(props.modelUrl, (gltf) => {
            model = gltf.scene

            model.traverse((obj) => {
                if (!(obj as THREE.Mesh).isMesh) return

                const mesh = obj as THREE.Mesh
                const material = mesh.material as THREE.MeshStandardMaterial

                if (!material) return

                if (material.map) {
                    material.map.anisotropy = renderer.capabilities.getMaxAnisotropy()
                    material.map.minFilter = THREE.LinearMipMapLinearFilter
                    material.map.magFilter = THREE.LinearFilter
                    material.map.needsUpdate = true
                }

                material.needsUpdate = true

                if ('roughness' in material) material.roughness = 0.4
                if ('metalness' in material) material.metalness = 0.2
        })



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
        }
    )
}

const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    if (model) {
        model.rotation.y += 0.01
    }
    renderer.render(scene, camera)
}

onMounted(() => {
    init()
    animate()
})

onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrameId)
    renderer.dispose()
    scene.clear()
})
</script>

<style scoped>
.tech-icon-3d {
    width: 70px;
    height: 70px;
}
</style>
