<template>
  <canvas ref="starsCanvas" class="stages-stars"></canvas>
</template>
<script lang="ts" setup>
  const starsCanvas = ref<HTMLCanvasElement>();

  let starsCtx: CanvasRenderingContext2D | null = null;
  let starsData: { x: number; y: number; r: number; depth: number; alpha: number }[] = []
  let mouseX = 0;
  let mouseY = 0;
  let rafId = 0;

  function initStars() {
    const c = starsCanvas.value

    if(!c) return

    const W = c.offsetWidth || window.innerWidth;
    const H = c.offsetHeight || window.innerHeight;
    c.width = W;
    c.height = H;

    starsCtx = c.getContext('2d');
    starsData = Array.from({ length: 180}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      depth: Math.random() * 0.8 + 0.2,
      alpha: Math.random() * 0.35 + 0.08,
    }))
  }

  function drawStars() {
    if(!starsCtx || !starsCanvas.value) {
      rafId = requestAnimationFrame(drawStars);
      return;
    }

    const {width: W, height: H} = starsCanvas.value;
    starsCtx.clearRect(0, 0, W, H);
    const cx = mouseX / W - 0.5;
    const cy = mouseY / H - 0.5;

    for(const s of starsData) {
      const ox = cx * s.depth * 30;
      const oy = cy * s.depth * 30;
      starsCtx.beginPath();
      starsCtx.arc(s.x + ox, s.y + oy, s.r, 0, Math.PI * 2);
      starsCtx.fillStyle = `rgba(255,255,255,${s.alpha})`
      starsCtx.fill()
    }
    rafId = requestAnimationFrame(drawStars);
  }

  function onMouseMove(event: MouseEvent) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }

  onMounted(() => {
    setTimeout(initStars, 50);
    drawStars();

    window.addEventListener('mousemove', onMouseMove);
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId);

    window.removeEventListener('mousemove', onMouseMove);
  })
</script>
<style scoped>
.stages-stars {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>