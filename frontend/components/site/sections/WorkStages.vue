<template>
  <!-- Tall wrapper: scroll-lock effect via CSS sticky -->
  <div id="stages" class="stages-wrapper" ref="wrapperRef">
    <div class="stages-sticky" ref="sectionRef">

      <!-- Starfield parallax canvas -->
      <canvas ref="starsCanvas" class="stages-stars"></canvas>

      <!-- Section title -->
      <h2 class="stages-section-title">Этапы работы <span class="bracket">&gt;</span></h2>

      <!-- Top-right info block (desktop only) -->
      <div class="stages-top-right stages-desktop">
        <h3 class="stages-top-right__title">Полный контроль</h3>
        <p class="stages-top-right__desc">Вы в курсе каждого шага — фиксированные сроки, регулярные отчёты и согласование на каждом этапе. Никаких сюрпризов, только предсказуемый результат.</p>
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

          <!-- Connector line from active node to card -->
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

        <!-- Active card (absolutely positioned) -->
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
              <div class="description-header">
                <h3 class="description-title">{{ STAGES[activeStage].title }}</h3>
              </div>
              <div class="description-divider"></div>
              <p>{{ STAGES[activeStage].description }}</p>
              <ul>
                <li v-for="f in STAGES[activeStage].features" :key="f">{{ f }}</li>
              </ul>
              <div class="duration-wrapper">
                <div class="c-card__duration">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="duration-icon"><path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M12 6v6l4 2"/><path d="M2.5 8.875a10 10 0 0 0-.5 3"/><path d="M2.83 16a10 10 0 0 0 2.43 3.4"/><path d="M4.636 5.235a10 10 0 0 1 .891-.857"/><path d="M8.644 21.42a10 10 0 0 0 7.631-.38"/></svg>
                  {{ STAGES[activeStage].duration }}
                </div>
              </div>
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
const SVG_H = 380

// Wider spacing, larger vertical wave — shifted down by 80px
const NODES = [
  { x:  80,  y: 270 },
  { x: 250,  y: 180 },
  { x: 410,  y: 290 },
  { x: 550,  y: 170 },
  { x: 710,  y: 280 },
  { x: 870,  y: 175 },
  { x: 1030, y: 265 },
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

const getCardW = () => window.innerWidth * 0.16
const getCardH = () => window.innerWidth * 0.12

const CARD_DOWN_INDICES = new Set([3, 5])

function cardLineEnd(i: number) {
  const goDown = CARD_DOWN_INDICES.has(i)
  return { x: NODES[i].x, y: NODES[i].y + (goDown ? 65 : -65) }
}

function cardStyle(i: number): Record<string, string> {
  const wrap = svgWrap.value
  if (!wrap) return {}
  const wW = wrap.clientWidth
  const scale = wW / SVG_W
  const px = NODES[i].x * scale
  const py = NODES[i].y * scale

  const goDown = CARD_DOWN_INDICES.has(i)
  const downGap = i === 5 ? -30 : 15
  const gap = Math.round((goDown ? downGap : 40) * scale)
  const cardH = getCardH()
  const cardTop = goDown
    ? Math.min(py + gap, wrap.clientHeight - cardH - 8)
    : Math.max(8, py - cardH - gap)

  const cardW = getCardW()
  let cardLeft = px - cardW / 2
  cardLeft = Math.max(40, Math.min(wW - cardW - 40, cardLeft))

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
/* ── Scroll-lock wrapper ── */
.stages-wrapper {
  position: relative;
  height: 140vh;
}

.stages-sticky {
  position: sticky;
  top: 84px;
  height: calc(100vh - 84px);
  width: 100%;
  overflow: hidden;
  background: #060610;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ── Top-right info block ── */
.stages-top-right {
  position: absolute;
  top: 30px;
  right: 6vw;
  z-index: 10;
  max-width: 38vw;
  pointer-events: none;
}

.stages-top-right__title {
  font-family: var(--font-inter);
  font-size: 3vw;
  font-weight: 800;
  color: var(--accent);
  margin: 0 0 16px 0;
  white-space: nowrap;
}

.stages-top-right__desc {
  color: #e0e0e0;
  font-family: var(--font-inter);
  font-size: 1.2vw;
  line-height: 1.8;
  margin: 0;
}

/* ── Starfield ── */
.stages-stars {
  position: absolute;
  inset: 0;
  width: 100%;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%);
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* ── Section title ── */
.stages-section-title {
  position: absolute;
  top: 16px;
  left: 3.125vw;
  font-family: var(--font-inter);
  font-size: 4.5vw;
  font-weight: 700;
  color: #fff;
  z-index: 11;
  pointer-events: none;
  margin: 0;
}

/* ── Constellation wrapper ── */
.constellation-wrap {
  position: relative;
  z-index: 2;
  width: 100%;
  margin-top: 10vh;
  padding: 0 3.125vw;
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
  font-family: var(--font-inter);
  font-size: 0.7vw;
  fill: var(--accent);
  opacity: 0.7;
  transition: opacity 0.3s;
}
.c-node-group.hovered .c-number {
  opacity: 1;
}

.c-label {
  font-family: var(--font-inter);
  font-size: 0.7vw;
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
  width: 16vw;
  z-index: 10;
  background: var(--bg-secondary);
  border: 1px solid var(--accent);
  padding: 0.85vw 1vw;
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.12), -3px 0 0 0 var(--accent);
  pointer-events: none;
}

.c-card__desc {
  font-family: var(--font-inter);
  font-size: 1.2vw;
  color: #e0e0e0;
  line-height: 1.8;
  font-weight: 600;
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
  font-size: 1vw;
  color: var(--accent);
  opacity: 0.85;
}
.c-card__features li::before {
  content: '→ ';
  opacity: 0.6;
}

.c-card__duration {
  font-family: var(--font-inter);
  font-size: 1vw;
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

/* ── Desktop fade ── */
@media (min-width: 769px) {
  .stages-sticky {
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 6%);
    mask-image: linear-gradient(to bottom, transparent 0%, black 6%);
  }
}

/* ── Responsive ── */
@media (max-width: 768px) {
  /* On mobile: no scroll-lock, normal flow */
  .stages-wrapper {
    height: auto;
    margin-bottom: 20px;
  }
  .stages-sticky {
    position: static;
    height: auto;
    min-height: auto;
    padding: 0;
    justify-content: flex-start;
    gap: 20px;
    background: var(--bg);
    overflow: visible;
  }

  /* Hide desktop-only elements on mobile */
  .stages-stars,
  .stages-top-right {
    display: none;
  }

  /* Title: in flow on mobile, not absolute */
  .stages-section-title {
    position: static;
    top: auto;
    left: auto;
    font-size: clamp(2rem, 4vw, 3rem);
    text-align: left;
    padding: 0 20px;
    margin: 0 0 16px;
    width: 100%;
    box-sizing: border-box;
  }

  .stages-desktop {
    display: none !important;
  }

  .stages-scroll-hint {
    display: none;
  }

  .stages-mobile {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: stretch;
    gap: 12px;
    min-height: auto;
    margin-top: 0;
    padding: 0 20px;
    width: 100%;
    position: relative;
    z-index: 2;
    box-sizing: border-box;
  }

  .stages-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    align-self: stretch;
    justify-content: space-between;
  }

  .stage-item {
    border-left: 3px solid transparent;
    padding: 8px 0 8px 10px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .stage-item.active {
    border-left-color: var(--accent);
    box-shadow: -8px 0 12px -5px rgba(0, 229, 255, 0.3);
  }

  .stage-item__number {
    display: none;
  }

  .stage-item__title {
    font-family: var(--font-inter);
    font-size: 0.8rem;
    color: #e0e0e0;
    font-weight: 700;
    line-height: 1.3;
  }

  .stage-item.active .stage-item__title {
    color: var(--accent);
  }

  .stages-description {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: 14px 16px 14px 20px;
    align-self: stretch;
    position: relative;
    overflow: hidden;
    min-height: 368px;
  }

  .stages-description::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
  }

  .description-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  .description-title {
    font-family: var(--font-inter);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--accent);
    margin: 0;
  }

  .description-number {
    font-family: var(--font-inter);
    font-size: 2rem;
    font-weight: 800;
    color: var(--accent);
    opacity: 0.15;
    line-height: 1;
  }

  .description-divider {
    height: 1px;
    background: var(--accent);
    opacity: 0.3;
    margin-bottom: 10px;
  }

  .description-content {
    color: #e0e0e0;
    font-size: 0.85rem;
    line-height: 1.6;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .description-content ul {
    margin-top: 10px;
    padding-left: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .description-content ul li {
    padding: 4px 0 4px 18px;
    position: relative;
    font-size: 0.85rem;
    font-weight: 600;
    color: #e0e0e0;
    line-height: 1.5;
  }

  .description-content ul li::before {
    content: '>';
    position: absolute;
    left: 0;
    color: var(--accent);
    font-weight: 700;
  }

  .description-content .duration-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: auto;
    padding-top: 10px;
  }

  .description-content .c-card__duration {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 229, 255, 0.3);
    font-family: var(--font-inter);
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--accent);
    line-height: 1.5;
  }

  .description-content .c-card__duration .duration-icon {
    flex-shrink: 0;
    color: var(--accent);
  }
}
</style>
