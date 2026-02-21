<template>
  <!-- Высокий wrapper: пользователь "скроллит сквозь" него, а sticky-контент стоит на месте -->
  <div id="tech-stack" class="stack-wrapper" ref="wrapperRef">
    <div class="stack-sticky" ref="sectionRef">
      <!-- Starfield parallax -->
      <StarfieldParallax class="stack-stars"/>

      <OrbitCanvas
        :techs="TECHS"
        :hovered-tech="hoveredTech"
        :menu-container="sectionRef"
      />

      <!-- Scroll progress indicator -->
      <ScrollProgressIndicator
          :progress="scrollProgressNorm"
      />

      <RightStackMenu
        :techs="TECHS"
        :hoveredTech="hoveredTech"
        @update:hoveredTech="hoveredTech = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import type { ITechStack } from '~/utils/interfaces/ITechStack'
import StarfieldParallax from "~/components/ui/3d/StarfieldParallax.vue";
import RightStackMenu from "~/components/ui/RightStackMenu.vue";
import ScrollProgressIndicator from "~/components/ui/ScrollProgressIndicator.vue";
import OrbitCanvas from "~/components/ui/3d/OrbitCanvas.vue";

const props = defineProps<{
  techStack: ITechStack[]
}>()

// ── CONFIG ────────────────────────────────────────────────────────
const TECHS: ITechStack[] = props.techStack && [
  { id: 'react',       name: 'React',      color: 0x61dafb, path: '/models/react/react.obj',               orbit: 0 },
  { id: 'vue',         name: 'Vue 3',      color: 0x42b883, path: '/models/vue/vue.obj',                   orbit: 1 },
  { id: 'nextjs',      name: 'Next.js',    color: 0xdddddd, path: '/models/nextjs/nextjs.obj',             orbit: 1 },
  { id: 'typescript',  name: 'TypeScript', color: 0x3178c6, path: '/models/typescript/typescript.obj',     orbit: 2 },
  { id: 'tailwind',    name: 'Tailwind',   color: 0x38bdf8, path: '/models/tailwind/tailwind.obj',         orbit: 2 },
  { id: 'python',      name: 'Python',     color: 0xffd43b, path: '/models/python/python.obj',             orbit: 3 },
  { id: 'fastapi',     name: 'FastAPI',    color: 0x009688, path: '/models/fastapi/fastapi.obj',           orbit: 3 },
  { id: 'postgresql',  name: 'PostgreSQL', color: 0x336791, path: '/models/postgresql/postgresql.obj',     orbit: 4 },
  { id: 'docker',      name: 'Docker',     color: 0x2496ed, path: '/models/docker/docker.obj',             orbit: 4 },
]

// ── REFS ──────────────────────────────────────────────────────────
const sectionRef      = ref<HTMLElement | null>(null)
const hoveredTech     = ref<string | null>(null)

// ── INTERNALS ─────────────────────────────────────────────────────
let rafId = 0

const wrapperRef = ref<HTMLElement | null>(null)
const scrollProgressNorm = ref(0)

function onScroll() {
  const wrapper = wrapperRef.value
  if (!wrapper) return
  const rect     = wrapper.getBoundingClientRect()
  const viewH    = window.innerHeight
  const scrolled = -rect.top
  const total    = wrapper.offsetHeight - viewH
  scrollProgressNorm.value = total > 0
      ? Math.min(1, Math.max(0, scrolled / total))
      : 0
}

// ── LIFECYCLE ─────────────────────────────────────────────────────
onMounted(() => {
  // Bind data-id to menu items for connector lookup
  const section = sectionRef.value!
  section.querySelectorAll<HTMLElement>('.stack-menu-item').forEach((el, i) => {
    el.dataset.id = TECHS[i]?.id ?? ''
  })

  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('scroll', onScroll)
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