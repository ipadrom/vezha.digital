<template>
  <canvas ref="particlesCanvas" id="particles-canvas"></canvas>
</template>
<script setup lang="ts">
const particlesCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
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
  const colors = ['#00E5FF', '#00E5FF', '#00E5FF', '#ffffff', '#a0a0a0']

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
</script>
<style scoped>
#particles-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
}
</style>