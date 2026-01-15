<template>
  <div class="min-h-screen">
    <SiteHeader />
    <main>
      <SiteHero :settings="settings" />
      <SiteTechStack :tech-stack="techStack" />
      <SiteServices :services="services" />
      <SiteAdvantages :advantages="advantages" />
      <SiteProjects :projects="projects" />
      <SiteWorkStages :stages="workStages" />
      <SiteContacts :settings="settings" />
    </main>
    <SiteFooter :settings="settings" />

    <!-- Particles Canvas -->
    <canvas ref="particlesCanvas" id="particles-canvas"></canvas>

    <!-- SVG Patterns -->
    <div class="pattern-container pattern-left">
      <div class="pattern-repeater">
        <img v-for="i in 5" :key="i" src="/pattern/pattern-left.svg" alt="" aria-hidden="true" />
      </div>
    </div>
    <div class="pattern-container pattern-right">
      <div class="pattern-repeater">
        <img v-for="i in 5" :key="i" src="/pattern/pattern-right.svg" alt="" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getServices, getProjects, getAdvantages, getTechStack, getWorkStages, getSettings } = useApi()

const services = ref<any[]>([])
const projects = ref<any[]>([])
const advantages = ref<any[]>([])
const techStack = ref<any[]>([])
const workStages = ref<any[]>([])
const settings = ref<Record<string, string>>({})

const particlesCanvas = ref<HTMLCanvasElement | null>(null)

// Fetch all data
onMounted(async () => {
  try {
    const [servicesData, projectsData, advantagesData, techStackData, workStagesData, settingsData] = await Promise.all([
      getServices(),
      getProjects(),
      getAdvantages(),
      getTechStack(),
      getWorkStages(),
      getSettings(),
    ])

    services.value = servicesData
    projects.value = projectsData
    advantages.value = advantagesData
    techStack.value = techStackData
    workStages.value = workStagesData
    settings.value = settingsData.settings
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }

  // Initialize particles
  initParticles()
})

// Particles System
function initParticles() {
  const canvas = particlesCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles: any[] = []
  const particleChars = ['>', '$', '_', '|', '{', '}', '<', '/', '>', '•', '·']
  const colors = ['#00ff41', '#00ff41', '#00ff41', '#ffffff', '#a0a0a0']

  class Particle {
    x: number
    y: number
    char: string
    color: string
    alpha: number
    decay: number
    vx: number
    vy: number

    constructor(x: number, y: number) {
      this.x = x
      this.y = y
      this.char = particleChars[Math.floor(Math.random() * particleChars.length)]
      this.color = colors[Math.floor(Math.random() * colors.length)]
      this.alpha = 1
      this.decay = 0.015
      this.vx = (Math.random() - 0.5) * 0.5
      this.vy = (Math.random() - 0.5) * 0.5
    }

    update() {
      this.x += this.vx
      this.y += this.vy
      this.alpha -= this.decay
    }

    draw() {
      if (!ctx) return
      ctx.save()
      ctx.globalAlpha = this.alpha
      ctx.fillStyle = this.color
      ctx.font = '14px JetBrains Mono'
      ctx.fillText(this.char, this.x, this.y)
      ctx.restore()
    }
  }

  document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.7) {
      particles.push(new Particle(e.clientX, e.clientY))
    }
  })

  function animate() {
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update()
      particles[i].draw()

      if (particles[i].alpha <= 0) {
        particles.splice(i, 1)
      }
    }

    requestAnimationFrame(animate)
  }

  animate()

  window.addEventListener('resize', () => {
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })
}

// SEO
useHead({
  title: 'VEZHA Digital - Веб-разработка под ключ',
  meta: [
    { name: 'description', content: 'Разработка Telegram Mini Apps, ботов, веб-сайтов и интернет-магазинов. От 50 000 ₽. Запуск за 1-4 недели.' },
    { property: 'og:title', content: 'VEZHA Digital - Веб-разработка под ключ' },
    { property: 'og:description', content: 'Разработка Telegram Mini Apps, ботов, веб-сайтов и интернет-магазинов' },
    { property: 'og:type', content: 'website' },
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Pixelify+Sans:wght@400;500;600;700&display=swap' },
  ],
})
</script>

<style>
#particles-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
}

.pattern-container {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 120px;
  z-index: 1;
  pointer-events: none;
  opacity: 0.3;
}

.pattern-left {
  left: 0;
}

.pattern-right {
  right: 0;
}

.pattern-repeater {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-around;
}

.pattern-repeater img {
  display: block;
  margin: 0 auto;
  width: 80px;
  height: auto;
}

@media (max-width: 1400px) {
  .pattern-container {
    display: none;
  }
}
</style>
