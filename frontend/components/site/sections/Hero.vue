<template>
  <section class="hero" id="hero">
    <div class="hero__background">
      <canvas ref="heroCanvas" id="hero-canvas"></canvas>
    </div>
    <div class="container-main">
      <div class="hero__wrapper">
        <div class="hero__left">
          <h1 class="hero__title">
            <span>{{displayedText}}</span><span class="cursor">|</span>
          </h1>
          <p class="hero__subtitle">{{ props.settings?.hero_subtitle }}</p>
          <button class="btn btn-primary" @click="$emit('openModal')">
            {{ $t('hero.cta') }}
          </button>
        </div>
        <div class="hero__right">
          <div class="hero__logo">
            <span class="hero__logo-script glitch" data-text="Vezha">Vezha</span>
            <span class="hero__logo-digital glitch" data-text="DIGITAL">DIGITAL</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {useTypeWriterAnimation} from "~/composables/useTypeWriterAnimation";
import type {ISettings} from "~/utils/interfaces/ISettings";

const props = defineProps<{
  settings: ISettings | null
}>()

defineEmits(['openModal'])

const heroCanvas = ref<HTMLCanvasElement | null>(null)

const heroTitle = computed(() => {
  if(!props.settings) {
    return ''
  }

  const {hero_title, hero_price} = props.settings;
  return hero_title.replace('{price}', hero_price);
})

const { displayedText } = useTypeWriterAnimation(heroTitle, 50, 300)

// 3D Animation with Three.js
onMounted(() => {
  init3DScene()
})

function init3DScene() {
  const canvas = heroCanvas.value
  if (!canvas || typeof window === 'undefined') return

  // Check if THREE is available
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
  script.onload = () => {
    if (typeof (window as any).THREE === 'undefined') return

    const THREE = (window as any).THREE
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    })

    const container = canvas.parentElement as HTMLElement
    const width = container.clientWidth
    const height = container.clientHeight

    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    camera.position.z = 8

    // Mouse tracking
    const mouse = { x: 0, y: 0 }
    const targetRotation = { x: 0, y: 0 }

    document.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    })

    // Create cubes
    const cubes: any[] = []
    const group = new THREE.Group()
    const sizes = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2]

    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.7, roughness: 0.2, transparent: true, opacity: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0xd0d0d0, metalness: 0.5, roughness: 0.3, transparent: true, opacity: 0.8 })
    ]

    for (let i = 0; i < 35; i++) {
      const size = sizes[Math.floor(Math.random() * sizes.length)]
      const geometry = new THREE.BoxGeometry(size, size, size)
      const material = materials[Math.floor(Math.random() * materials.length)].clone()
      const cube = new THREE.Mesh(geometry, material)

      const radius = 2.5
      const angle = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 3

      cube.position.x = Math.cos(angle) * radius * Math.random()
      cube.position.y = height
      cube.position.z = Math.sin(angle) * radius * Math.random()
      cube.rotation.x = Math.random() * Math.PI
      cube.rotation.y = Math.random() * Math.PI
      cube.rotation.z = Math.random() * Math.PI

      cube.userData = {
        originalY: cube.position.y,
        speed: 0.5 + Math.random() * 1.5,
        amplitude: 0.3 + Math.random() * 0.7,
        offset: Math.random() * Math.PI * 2,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        }
      }

      cubes.push(cube)
      group.add(cube)
    }

    scene.add(group)

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight1.position.set(5, 5, 5)
    scene.add(directionalLight1)

    const directionalLight2 = new THREE.DirectionalLight(0x8888ff, 0.4)
    directionalLight2.position.set(-5, 3, -5)
    scene.add(directionalLight2)

    const pointLight1 = new THREE.PointLight(0xff00ff, 1.5, 15)
    pointLight1.position.set(3, 3, 3)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x00ffff, 1.5, 15)
    pointLight2.position.set(-3, -3, 3)
    scene.add(pointLight2)

    const pointLight3 = new THREE.PointLight(0xffff00, 1, 15)
    pointLight3.position.set(0, 5, -3)
    scene.add(pointLight3)

    let time = 0
    function animate() {
      requestAnimationFrame(animate)
      time += 0.01

      targetRotation.x += (mouse.y * 0.3 - targetRotation.x) * 0.05
      targetRotation.y += (mouse.x * 0.3 - targetRotation.y) * 0.05

      group.rotation.y = time * 0.15 + targetRotation.y
      group.rotation.x = Math.sin(time * 0.2) * 0.1 + targetRotation.x

      cubes.forEach((cube, index) => {
        const floatOffset = Math.sin(time * cube.userData.speed + cube.userData.offset)
        cube.position.y = cube.userData.originalY + floatOffset * cube.userData.amplitude
        cube.rotation.x += cube.userData.rotationSpeed.x
        cube.rotation.y += cube.userData.rotationSpeed.y
        cube.rotation.z += cube.userData.rotationSpeed.z
        const scale = 1 + Math.sin(time * 2 + index) * 0.05
        cube.scale.set(scale, scale, scale)
      })

      pointLight1.position.x = Math.sin(time * 0.7) * 4
      pointLight1.position.z = Math.cos(time * 0.7) * 4
      pointLight2.position.x = Math.cos(time * 0.5) * 4
      pointLight2.position.z = Math.sin(time * 0.5) * 4
      pointLight3.position.x = Math.sin(time * 0.6) * 3
      pointLight3.position.y = 5 + Math.cos(time * 0.8) * 2

      renderer.render(scene, camera)
    }

    animate()

    window.addEventListener('resize', () => {
      const newWidth = window.innerWidth / 2
      camera.aspect = newWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, window.innerHeight)
    })
  }
  document.head.appendChild(script)
}
</script>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 20px 0;
  position: relative;
  overflow: hidden;
  background: #0a0a0a;
}

.hero__background {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  overflow: hidden;
}

.cursor {
  display: inline-block;
  margin-left: 4px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50%, 100% { opacity: 1 }
  25%, 75% { opacity: 0 }
}

#hero-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.hero__wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero__left {
  animation: none;
}

.hero__title {
  font-family: var(--font-epilepsy);
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: #ffffff;
  margin-bottom: 30px;
  text-transform: uppercase;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
  opacity: 0;
  animation: fadeUp 1s ease-out 0.3s forwards;
}

.hero__subtitle {
  font-size: 1.3rem;
  color: var(--text-dim);
  margin-bottom: 40px;
  font-family: 'JetBrains Mono', monospace;
  opacity: 0;
  animation: fadeUp 1s ease-out 0.5s forwards;
}

.hero__right {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeUp 1s ease-out 0.2s both;
  position: relative;
}

.hero__logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  z-index: 10;
  text-align: center;
}

.hero__logo-script {
  font-family: 'Brush Script MT', 'Lucida Handwriting', cursive;
  font-size: 5.5rem;
  font-weight: 400;
  color: #ffffff;
  text-shadow: 0 0 40px rgba(255, 255, 255, 0.5),
               0 0 80px rgba(255, 255, 255, 0.3);
  font-style: italic;
  letter-spacing: 2px;
  line-height: 1;
}

.hero__logo-digital {
  font-family: 'Pixelify Sans', 'Press Start 2P', monospace;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 8px;
  color: #ffffff;
  text-transform: uppercase;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.4),
               0 0 60px rgba(255, 255, 255, 0.2);
  line-height: 1;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .hero__title {
    font-size: 2.8rem;
  }

  .hero__subtitle {
    font-size: 1.1rem;
  }

  .hero__logo-script {
    font-size: 4.5rem;
  }

  .hero__logo-digital {
    font-size: 2.5rem;
    letter-spacing: 6px;
  }
}

@media (max-width: 768px) {
  .hero__wrapper {
    display: flex;
    flex-direction: column;
    padding: 70px 15px 0;
    gap: 40px;
    text-align: center;
  }

  .hero__right {
    order: 1;
  }

  .hero__left {
    order: 2;
  }

  .hero__background {
    position: absolute;
    width: 100%;
    height: 70vh;
    top: 0;
    bottom: auto;
    left: 0;
  }

  .hero__title {
    font-size: 1.2rem;
  }

  .hero__subtitle {
    font-size: 1rem;
  }

  .hero__logo-script {
    font-size: 3.5rem;
    font-family: var(--font-epilepsy);
  }

  .hero__logo-digital {
    font-size: 2rem;
    letter-spacing: 4px;
  }

  .btn-primary {
    padding: 10px 20px;
    font-size: 0.9rem;
    min-width: auto;
    opacity: 0;
    animation: fadeUp 1s ease-out 0.7s forwards;
  }
}

@media (max-width: 480px) {
  .hero__wrapper {
    display: flex;
    flex-direction: column;
    padding: 70px 15px 0;
    gap: 40px;
    text-align: center;
  }

  .hero__right {
    order: 1;
  }

  .hero__left {
    order: 2;
  }

  .hero__background {
    position: absolute;
    width: 100%;
    height: 70vh;
    top: 0;
    bottom: auto;
    left: 0;
  }

  .hero__title {
    font-size: 1.1rem;
  }

  .hero__subtitle {
    font-size: 0.9rem;
  }

  .hero__logo-script {
    font-size: 2.8rem;
    font-family: var(--font-epilepsy);
  }

  .hero__logo-digital {
    font-size: 1.5rem;
    letter-spacing: 3px;
  }

  .btn-primary {
    padding: 8px 16px;
    font-size: 0.8rem;
    letter-spacing: 0;
  }
}
</style>
