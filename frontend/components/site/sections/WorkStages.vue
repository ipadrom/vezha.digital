<template>
  <!-- Tall wrapper: scroll-lock effect via CSS sticky -->
  <div id="stages" class="stages-wrapper" ref="wrapperRef">
    <div class="stages-sticky" ref="sectionRef">

      <!-- Starfield parallax canvas -->
      <canvas ref="starsCanvas" class="stages-stars"></canvas>

      <!-- Ghost watermark -->
      <div class="stages-watermark">
        <span class="wm-bracket">&lt;</span>Этапы<span class="wm-bracket">/&gt;</span>
      </div>

      <!-- Desktop: constellation -->
      <div class="constellation-wrap stages-desktop" ref="svgWrap">
        <svg
          class="constellation-svg"
          :viewBox="`0 0 ${SVG_W} ${SVG_H}`"
          :width="SVG_W"
          :height="SVG_H"
          overflow="visible"
        >
          <!-- Lines between nodes -->
          <line
            v-for="(seg, i) in segments"
            :key="'l'+i"
            :x1="seg.x1" :y1="seg.y1"
            :x2="seg.x2" :y2="seg.y2"
            class="c-line"
            :class="{ visible: visibleCount > seg.after }"
          />

          <!-- Hover connector line from node to card -->
          <line
            v-if="hoveredIdx !== null"
            :x1="NODES[hoveredIdx].x"
            :y1="NODES[hoveredIdx].y"
            :x2="cardLineEnd(hoveredIdx).x"
            :y2="cardLineEnd(hoveredIdx).y"
            class="c-connector"
          />

          <!-- Nodes -->
          <g
            v-for="(node, i) in NODES"
            :key="'n'+i"
            class="c-node-group"
            :class="{ visible: visibleCount > i, hovered: hoveredIdx === i }"
            @mouseenter="hoveredIdx = i"
            @mouseleave="hoveredIdx = null"
            style="cursor:pointer"
          >
            <!-- Glow ring -->
            <circle :cx="node.x" :cy="node.y" r="30" class="c-glow" />
            <!-- Outer ring -->
            <circle :cx="node.x" :cy="node.y" r="14" class="c-ring" />
            <!-- Inner dot -->
            <circle :cx="node.x" :cy="node.y" r="7" class="c-dot" />

            <!-- Number above -->
            <text :x="node.x" :y="node.y - 26" class="c-number" text-anchor="middle">
              {{ String(i + 1).padStart(2, '0') }}
            </text>
            <!-- Title below -->
            <text :x="node.x" :y="node.y + 36" class="c-label" text-anchor="middle">
              {{ STAGES[i].title }}
            </text>
          </g>
        </svg>

        <!-- Hover cards (absolutely positioned) -->
        <div
          v-for="(node, i) in NODES"
          v-show="hoveredIdx === i"
          :key="'card'+i"
          class="c-card"
          :style="cardStyle(i)"
        >
          <p class="c-card__desc">{{ STAGES[i].description }}</p>
          <ul class="c-card__features">
            <li v-for="f in STAGES[i].features" :key="f">{{ f }}</li>
          </ul>
          <span class="c-card__duration">{{ STAGES[i].duration }}</span>
        </div>
      </div>

      <!-- Scroll progress bar -->
      <div class="stages-scroll-hint">
        <div class="stages-scroll-bar" :style="{ width: (scrollProgressNorm * 100) + '%' }"></div>
      </div>

      <!-- Mobile view -->
      <div class="stages-mobile">
        <div class="stages-list">
          <div
            v-for="(s, i) in STAGES"
            :key="i"
            class="stage-item"
            :class="{ active: activeStage === i }"
            @click="activeStage = i"
          >
            <div class="stage-item__number">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="stage-item__title">{{ s.title }}</div>
          </div>
        </div>
        <div class="stages-description">
          <Transition name="fade" mode="out-in">
            <div :key="activeStage" class="description-content">
              <p>{{ STAGES[activeStage].description }}</p>
              <ul>
                <li v-for="f in STAGES[activeStage].features" :key="f">{{ f }}</li>
              </ul>
              <span class="c-card__duration">{{ STAGES[activeStage].duration }}</span>
            </div>
          </Transition>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineProps<{ stages?: any[] }>()

// ── DATA ──────────────────────────────────────────────────────────
const STAGES = [
  {
    title: 'Анализ',
    description: 'Изучаем бизнес, цели и аудиторию. Составляем техническое задание.',
    duration: '1–3 дня',
    features: ['Интервью с заказчиком', 'Анализ конкурентов', 'ТЗ и оценка бюджета'],
  },
  {
    title: 'Проектирование',
    description: 'Создаём архитектуру, прототипы и UX-логику будущего продукта.',
    duration: '2–4 дня',
    features: ['Прототипы экранов', 'Архитектура системы', 'Согласование с клиентом'],
  },
  {
    title: 'Дизайн',
    description: 'Разрабатываем визуальную концепцию и дизайн-систему проекта.',
    duration: '3–7 дней',
    features: ['UI Kit и стили', 'Адаптив под устройства', 'Финальные макеты'],
  },
  {
    title: 'Разработка',
    description: 'Пишем код: Frontend, Backend, интеграции с внешними сервисами.',
    duration: '7–21 день',
    features: ['Frontend + Backend', 'API интеграции', 'Code review'],
  },
  {
    title: 'Тестирование',
    description: 'Проверяем функциональность, нагрузку и UX на всех устройствах.',
    duration: '2–5 дней',
    features: ['Функциональное тестирование', 'Нагрузочное тестирование', 'Фикс багов'],
  },
  {
    title: 'Запуск',
    description: 'Разворачиваем проект на сервере, настраиваем CI/CD и мониторинг.',
    duration: '1–2 дня',
    features: ['Деплой на сервер', 'Настройка CI/CD', 'Обучение команды'],
  },
  {
    title: 'Поддержка',
    description: 'Остаёмся на связи: обновления, доработки, консультации после запуска.',
    duration: 'Ongoing',
    features: ['Мониторинг и аптайм', 'Обновления и доработки', 'Техническая поддержка'],
  },
]

// ── SVG LAYOUT ────────────────────────────────────────────────────
const SVG_W = 1100
const SVG_H = 300

// Wider spacing, larger vertical wave
const NODES = [
  { x:  80,  y: 190 },
  { x: 250,  y: 100 },
  { x: 410,  y: 210 },
  { x: 550,  y:  90 },
  { x: 710,  y: 200 },
  { x: 870,  y:  95 },
  { x: 1030, y: 185 },
]

const segments = NODES.slice(0, -1).map((n, i) => ({
  x1: n.x, y1: n.y,
  x2: NODES[i + 1].x, y2: NODES[i + 1].y,
  after: i,
}))

// ── REFS ──────────────────────────────────────────────────────────
const wrapperRef  = ref<HTMLElement | null>(null)
const sectionRef  = ref<HTMLElement | null>(null)
const starsCanvas = ref<HTMLCanvasElement | null>(null)
const svgWrap     = ref<HTMLElement | null>(null)

// ── ANIMATION ─────────────────────────────────────────────────────
const visibleCount = ref(0)
let animTimer: ReturnType<typeof setTimeout> | null = null

function startAnimation() {
  if (visibleCount.value >= NODES.length) return
  animTimer = setTimeout(() => {
    visibleCount.value++
    startAnimation()
  }, 180)
}

// ── STARFIELD PARALLAX ────────────────────────────────────────────
let starsCtx: CanvasRenderingContext2D | null = null
let starsData: { x: number; y: number; r: number; depth: number; alpha: number }[] = []
let mouseX = 0
let mouseY = 0
let rafId = 0

function initStars() {
  const c = starsCanvas.value
  if (!c) return
  const W = c.offsetWidth || window.innerWidth
  const H = c.offsetHeight || window.innerHeight
  c.width = W
  c.height = H
  starsCtx = c.getContext('2d')
  starsData = Array.from({ length: 180 }, () => ({
    x:     Math.random() * W,
    y:     Math.random() * H,
    r:     Math.random() * 1.2 + 0.2,
    depth: Math.random() * 0.8 + 0.2,
    alpha: Math.random() * 0.35 + 0.08,
  }))
}

function drawStarsFrame() {
  if (!starsCtx || !starsCanvas.value) {
    rafId = requestAnimationFrame(drawStarsFrame)
    return
  }
  const { width: W, height: H } = starsCanvas.value
  starsCtx.clearRect(0, 0, W, H)
  const cx = mouseX / W - 0.5
  const cy = mouseY / H - 0.5
  for (const s of starsData) {
    const ox = cx * s.depth * 30
    const oy = cy * s.depth * 30
    starsCtx.beginPath()
    starsCtx.arc(s.x + ox, s.y + oy, s.r, 0, Math.PI * 2)
    starsCtx.fillStyle = `rgba(255,255,255,${s.alpha})`
    starsCtx.fill()
  }
  rafId = requestAnimationFrame(drawStarsFrame)
}

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
}

// ── SCROLL PROGRESS ───────────────────────────────────────────────
const scrollProgressNorm = ref(0)

function onScroll() {
  const wrapper = wrapperRef.value
  if (!wrapper) return
  const rect = wrapper.getBoundingClientRect()
  const wrapH = wrapper.offsetHeight
  const stickyH = window.innerHeight
  const scrollable = wrapH - stickyH
  const scrolled = -rect.top
  scrollProgressNorm.value = Math.max(0, Math.min(1, scrolled / scrollable))
}

// ── HOVER ─────────────────────────────────────────────────────────
const hoveredIdx = ref<number | null>(0)

const CARD_W = 220
const CARD_H = 170

function cardLineEnd(i: number) {
  const goUp = NODES[i].y > SVG_H / 2
  return { x: NODES[i].x, y: NODES[i].y + (goUp ? -65 : 65) }
}

function cardStyle(i: number): Record<string, string> {
  const wrap = svgWrap.value
  if (!wrap) return {}
  const wW = wrap.clientWidth
  const scale = wW / SVG_W
  const px = NODES[i].x * scale
  const py = NODES[i].y * scale

  const goUp = NODES[i].y > SVG_H / 2
  const cardTop = goUp ? py - CARD_H - 70 : py + 70

  let cardLeft = px - CARD_W / 2
  cardLeft = Math.max(8, Math.min(wW - CARD_W - 8, cardLeft))

  return {
    left:      `${cardLeft}px`,
    top:       `${cardTop}px`,
    transform: 'none',
  }
}

// ── INTERSECTION (trigger animation) ─────────────────────────────
let observer: IntersectionObserver | null = null

// ── MOBILE ────────────────────────────────────────────────────────
const activeStage = ref(0)

// ── LIFECYCLE ─────────────────────────────────────────────────────
onMounted(() => {
  observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && visibleCount.value === 0) {
      startAnimation()
    }
  }, { threshold: 0.15 })
  if (sectionRef.value) observer.observe(sectionRef.value)

  setTimeout(initStars, 50)
  drawStarsFrame()

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', initStars)
})

onBeforeUnmount(() => {
  if (animTimer) clearTimeout(animTimer)
  cancelAnimationFrame(rafId)
  observer?.disconnect()
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', initStars)
})
</script>

<style scoped>
/* ── Scroll-lock wrapper (200vh = modest scroll lock) ── */
.stages-wrapper {
  position: relative;
  height: 200vh;
}

.stages-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #060610;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ── Starfield ── */
.stages-stars {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* ── Watermark ── */
.stages-watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-epilepsy);
  font-size: clamp(80px, 16vw, 220px);
  font-weight: 900;
  color: rgba(0, 229, 255, 0.03);
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  z-index: 0;
}

.wm-bracket {
  color: rgba(0, 229, 255, 0.025);
}

/* ── Constellation wrapper ── */
.constellation-wrap {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
}

.constellation-svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

/* ── Lines ── */
.c-line {
  stroke: var(--accent);
  stroke-width: 1.5;
  opacity: 0;
  transition: opacity 0.4s ease;
  filter: drop-shadow(0 0 4px var(--accent));
}
.c-line.visible {
  opacity: 0.35;
}

/* ── Connector line node→card ── */
.c-connector {
  stroke: var(--accent);
  stroke-width: 1.2;
  opacity: 0.7;
  stroke-dasharray: 5 3;
  filter: drop-shadow(0 0 4px var(--accent));
}

/* ── Node group ── */
.c-node-group {
  opacity: 0;
  transition: opacity 0.4s ease;
}
.c-node-group.visible {
  opacity: 1;
}

.c-glow {
  fill: var(--accent);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.c-node-group.hovered .c-glow {
  opacity: 0.15;
}

.c-ring {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2;
  opacity: 0.5;
  transition: opacity 0.3s, stroke-width 0.3s;
}
.c-node-group.hovered .c-ring {
  opacity: 1;
  stroke-width: 2.5;
  filter: drop-shadow(0 0 8px var(--accent));
}

.c-dot {
  fill: var(--accent);
  transition: r 0.3s;
  filter: drop-shadow(0 0 5px var(--accent));
}
.c-node-group.hovered .c-dot {
  r: 10;
  filter: drop-shadow(0 0 12px var(--accent));
}

.c-number {
  font-family: var(--font-epilepsy);
  font-size: 14px;
  fill: var(--accent);
  opacity: 0.7;
  transition: opacity 0.3s;
}
.c-node-group.hovered .c-number {
  opacity: 1;
}

.c-label {
  font-family: var(--font-epilepsy);
  font-size: 16px;
  fill: #e0e0e0;
  opacity: 0.8;
  transition: opacity 0.3s, fill 0.3s;
}
.c-node-group.hovered .c-label {
  fill: var(--accent);
  opacity: 1;
}

/* ── Hover card ── */
.c-card {
  position: absolute;
  width: 220px;
  z-index: 10;
  background: var(--bg-secondary);
  border: 1px solid var(--accent);
  padding: 16px 18px;
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.12), -3px 0 0 0 var(--accent);
  pointer-events: none;
}

.c-card__desc {
  font-family: var(--font-inter);
  font-size: 0.75rem;
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 10px;
}

.c-card__features {
  list-style: none;
  padding: 0;
  margin: 0 0 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.c-card__features li {
  font-family: var(--font-inter);
  font-size: 0.7rem;
  color: var(--accent);
  opacity: 0.85;
}
.c-card__features li::before {
  content: '→ ';
  opacity: 0.6;
}

.c-card__duration {
  font-family: var(--font-epilepsy);
  font-size: 0.85rem;
  color: var(--accent);
  opacity: 0.75;
}

/* ── Scroll progress bar ── */
.stages-scroll-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(0, 229, 255, 0.08);
  z-index: 3;
}

.stages-scroll-bar {
  height: 100%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  transition: width 0.1s linear;
}

/* ── Mobile ── */
.stages-mobile {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  /* On mobile: no scroll-lock, normal flow */
  .stages-wrapper {
    height: auto;
  }
  .stages-sticky {
    position: static;
    height: auto;
    min-height: 100vh;
    padding: 60px 0 40px;
    justify-content: flex-start;
  }

  .stages-desktop {
    display: none !important;
  }

  .stages-mobile {
    display: grid;
    grid-template-columns: 40% 60%;
    gap: 15px;
    min-height: 300px;
    margin-top: 20px;
    padding: 0 20px;
    width: 100%;
    position: relative;
    z-index: 2;
  }

  .stages-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .stage-item {
    border-left: 3px solid transparent;
    padding: 10px 0 10px 15px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stage-item.active {
    border-left-color: var(--accent);
    box-shadow: -10px 0 15px -5px rgba(0, 229, 255, 0.3);
  }

  .stage-item__number {
    font-family: var(--font-epilepsy);
    font-size: 2rem;
    color: var(--accent);
    font-weight: 700;
  }

  .stage-item__title {
    font-family: var(--font-epilepsy);
    font-size: 0.85rem;
    color: #e0e0e0;
    font-weight: 700;
  }

  .stages-description {
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    padding: 20px;
  }

  .description-content {
    color: #e0e0e0;
    font-size: 0.85rem;
    line-height: 1.6;
  }

  .description-content ul {
    margin-top: 10px;
    padding-left: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}
</style>
