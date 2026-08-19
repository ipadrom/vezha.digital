<template>
  <div class="stack-prototype" :data-theme="theme" :data-variant="variant">
    <header class="site-nav">
      <a class="brand" href="#" aria-label="VEZHA Digital" @click.prevent>
        <strong>VEZHA</strong><span>DIGITAL</span>
      </a>

      <nav class="site-links" aria-label="Основная навигация">
        <a href="#" @click.prevent>Кто мы</a>
        <a href="#" aria-current="page" @click.prevent>Стек</a>
        <a href="#" @click.prevent>Услуги</a>
        <a href="#" @click.prevent>Кейсы</a>
        <a href="#" @click.prevent>Контакты</a>
      </nav>

      <div class="site-actions">
        <button class="theme-toggle" type="button" :aria-label="themeToggleLabel" @click="emit('toggle-theme')">
          <svg v-if="theme === 'light'" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M15.2 13.4A6.3 6.3 0 0 1 6.6 4.8 6.4 6.4 0 1 0 15.2 13.4Z" />
          </svg>
          <svg v-else viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="3.2" />
            <path d="M10 2V.8M10 19.2V18M18 10h1.2M.8 10H2M15.7 4.3l.9-.9M3.4 16.6l.9-.9M15.7 15.7l.9.9M3.4 3.4l.9.9" />
          </svg>
        </button>
        <a class="project-cta" href="#" @click.prevent>Обсудить проект</a>
      </div>
    </header>

    <main
      class="stack-stage"
      :style="pointerStyle"
      @pointermove="updatePointer"
      @pointerleave="resetPointer"
    >
      <slot name="background" :active-index="activeIndex" :group="activeGroup" />

      <div class="stage-content">
        <div class="stage-head">
          <div class="title-block">
            <div class="section-label"><span>СТЕК</span><i>/</i><span>02</span></div>
            <h1>Стек подбирается под задачу, а не по трендам</h1>
          </div>

          <div class="section-meta">
            <div class="section-counter"><strong>{{ counter }}</strong><span>/ 04</span></div>
            <p>Каждый инструмент проверен в реальных проектах и предсказуем в поддержке.</p>
          </div>
        </div>

        <div class="stage-body">
          <div class="stack-timeline">
            <span class="timeline-track" aria-hidden="true"><i :style="timelineFillStyle"></i></span>
            <button
              v-for="(group, index) in groups"
              :key="group.title"
              class="stack-row"
              :class="{ 'is-active': activeIndex === index, 'is-past': index < activeIndex }"
              type="button"
              :aria-pressed="activeIndex === index"
              @click="selectGroup(index)"
            >
              <strong>{{ group.title }}</strong>
              <span class="row-node" aria-hidden="true"><i></i></span>
              <span class="row-copy">
                <span>{{ group.description }}</span>
                <span class="technology-list">
                  <span v-for="item in group.items" :key="item">{{ item }}</span>
                </span>
              </span>
            </button>
          </div>

          <div class="stack-visual" aria-hidden="true">
            <slot name="visual" :active-index="activeIndex" :group="activeGroup" />
          </div>

          <div class="stack-overlay" aria-hidden="true">
            <slot name="overlay" :active-index="activeIndex" :group="activeGroup" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
type ThemeMode = "light" | "dark";
type StackGroup = { title: string; description: string; items: string[] };

const props = defineProps<{
  theme: ThemeMode;
  variant: string;
}>();

const emit = defineEmits<{
  "toggle-theme": [];
  "active-change": [index: number];
}>();

const groups: StackGroup[] = [
  {
    title: "Frontend",
    description: "Интерфейсы, которые быстро грузятся и удобно работают на любом устройстве.",
    items: ["React", "Vue 3", "Next.js", "TypeScript", "Tailwind"],
  },
  {
    title: "Backend",
    description: "Надёжная серверная часть, которая не ляжет под нагрузкой и легко масштабируется.",
    items: ["Go", "Gin", "PostgreSQL", "Redis"],
  },
  {
    title: "DevOps",
    description: "Стабильный деплой и мониторинг: предсказуемые релизы и аптайм без сюрпризов.",
    items: ["Docker", "Nginx", "CI/CD", "Linux"],
  },
  {
    title: "Mobile",
    description: "Мобильные приложения и PWA с нативным ощущением на iOS и Android.",
    items: ["Kotlin", "Swift", "Flutter", "Expo", "PWA"],
  },
];

const activeIndex = ref(0);
const pointer = reactive({ x: 50, y: 50 });
const activeGroup = computed(() => groups[activeIndex.value]);
const counter = computed(() => String(activeIndex.value + 1).padStart(2, "0"));
const timelineFillStyle = computed(() => ({ height: `${(activeIndex.value / (groups.length - 1)) * 100}%` }));
const pointerStyle = computed(() => ({ "--pointer-x": `${pointer.x}%`, "--pointer-y": `${pointer.y}%` }));
const themeToggleLabel = computed(() => (
  props.theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"
));

function selectGroup(index: number) {
  activeIndex.value = index;
  emit("active-change", index);
}

function updatePointer(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 100;
  pointer.y = ((event.clientY - rect.top) / rect.height) * 100;
}

function resetPointer() {
  pointer.x = 50;
  pointer.y = 50;
}
</script>

<style scoped>
.stack-prototype {
  --surface: #f8f9f8;
  --surface-raised: #ffffff;
  --ink: #17191d;
  --text: #4f555f;
  --muted: #9197a1;
  --idle: #9ea4ad;
  --hair: rgba(23, 25, 29, 0.12);
  --hair-soft: rgba(23, 25, 29, 0.055);
  --chip: rgba(255, 255, 255, 0.72);
  --chip-border: rgba(23, 25, 29, 0.13);
  --accent: #5568ff;
  --accent-soft: rgba(85, 104, 255, 0.17);
  --accent-two: #62c8f2;
  min-height: 100vh;
  overflow: hidden;
  background: var(--surface);
  color: var(--ink);
  font-family: "Onest", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.stack-prototype[data-theme="dark"] {
  --surface: #0d1014;
  --surface-raised: #12161b;
  --ink: #f3f4f6;
  --text: #b0b6c0;
  --muted: #69717d;
  --idle: #747b86;
  --hair: rgba(243, 244, 246, 0.14);
  --hair-soft: rgba(243, 244, 246, 0.06);
  --chip: rgba(13, 16, 20, 0.74);
  --chip-border: rgba(243, 244, 246, 0.17);
  --accent: #8792ff;
  --accent-soft: rgba(125, 139, 255, 0.2);
  --accent-two: #69d1ff;
}

* {
  box-sizing: border-box;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

.site-nav {
  position: relative;
  z-index: 20;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 76px;
  padding: 0 40px;
  border-bottom: 1px solid var(--hair);
  background: color-mix(in srgb, var(--surface-raised) 92%, transparent);
  backdrop-filter: blur(12px);
}

.brand {
  display: inline-flex;
  align-items: baseline;
  justify-self: start;
  gap: 6px;
  color: var(--ink);
  text-decoration: none;
}

.brand strong {
  font-size: 17px;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.brand span {
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.2em;
}

.site-links {
  display: flex;
  align-items: center;
  gap: 36px;
}

.site-links a {
  position: relative;
  color: var(--text);
  font-size: 14px;
  text-decoration: none;
}

.site-links a::after {
  position: absolute;
  right: 0;
  bottom: -9px;
  left: 0;
  height: 1px;
  background: var(--ink);
  content: "";
  opacity: 0;
  transform: scaleX(0.5);
  transition: opacity 180ms ease-out, transform 180ms ease-out;
}

.site-links a:hover::after,
.site-links a[aria-current="page"]::after {
  opacity: 1;
  transform: scaleX(1);
}

.site-actions {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 10px;
}

.theme-toggle {
  display: grid;
  width: 44px;
  height: 44px;
  padding: 0;
  place-items: center;
  border: 1px solid var(--hair);
  border-radius: 12px;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition: background 180ms ease-out, transform 180ms ease-out;
}

.theme-toggle:hover {
  background: var(--hair-soft);
}

.theme-toggle:active,
.project-cta:active {
  transform: scale(0.97);
}

.theme-toggle:focus-visible,
.project-cta:focus-visible,
.stack-row:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.theme-toggle svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.project-cta {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 22px;
  border: 1px solid var(--ink);
  border-radius: 12px;
  background: var(--ink);
  color: var(--surface);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 180ms ease-out, transform 180ms ease-out;
}

.project-cta:hover {
  opacity: 0.82;
}

.stack-stage {
  position: relative;
  min-height: calc(100vh - 76px);
  overflow: hidden;
  background: var(--surface);
  isolation: isolate;
}

.stage-content {
  position: relative;
  z-index: 2;
  width: min(100%, 1480px);
  min-height: calc(100vh - 76px);
  margin: 0 auto;
  padding: clamp(48px, 6vh, 78px) 40px 58px;
}

.stage-head {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(290px, 0.7fr);
  gap: clamp(48px, 8vw, 132px);
  align-items: start;
}

.section-label {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
}

.section-label i {
  color: var(--hair);
  font-style: normal;
}

.title-block h1 {
  max-width: 18ch;
  margin: 0;
  color: var(--ink);
  font-size: clamp(42px, 4.1vw, 68px);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 0.95;
  text-wrap: balance;
  text-transform: uppercase;
}

.section-meta {
  padding-top: 20px;
}

.section-counter {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-family: "JetBrains Mono", monospace;
}

.section-counter strong {
  color: var(--ink);
  font-size: clamp(42px, 4vw, 62px);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.section-counter span {
  color: var(--muted);
  font-size: 16px;
  font-variant-numeric: tabular-nums;
}

.section-meta p {
  max-width: 42ch;
  margin: 24px 0 0;
  color: var(--text);
  font-size: 16px;
  line-height: 1.55;
}

.stage-body {
  position: relative;
  display: grid;
  grid-template-columns: minmax(600px, 1.2fr) minmax(390px, 0.8fr);
  gap: 34px;
  min-height: 430px;
  margin-top: clamp(34px, 5vh, 62px);
}

.stack-timeline {
  position: relative;
  z-index: 3;
  align-self: center;
  width: 100%;
}

.timeline-track {
  position: absolute;
  top: 30px;
  bottom: 30px;
  left: 220px;
  width: 1px;
  background: var(--hair);
}

.timeline-track i {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  background: var(--accent);
  transition: height 240ms cubic-bezier(0.23, 1, 0.32, 1);
}

.stack-row {
  position: relative;
  display: grid;
  grid-template-columns: 198px 44px minmax(0, 1fr);
  gap: 0;
  width: 100%;
  min-height: 100px;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.stack-row > strong {
  align-self: start;
  padding-top: 4px;
  color: var(--idle);
  font-size: clamp(23px, 2vw, 30px);
  font-weight: 550;
  letter-spacing: -0.025em;
  line-height: 1;
  transition: color 180ms ease-out, transform 180ms ease-out;
}

.stack-row:hover > strong,
.stack-row.is-active > strong {
  color: var(--ink);
}

.stack-row:hover > strong {
  transform: translateX(4px);
}

.row-node {
  position: relative;
  z-index: 2;
  display: grid;
  width: 44px;
  height: 34px;
  place-items: center;
}

.row-node > i {
  position: relative;
  display: block;
  width: 12px;
  height: 12px;
  border: 2px solid var(--idle);
  border-radius: 50%;
  background: var(--surface);
  transition: border-color 180ms ease-out, box-shadow 220ms ease-out, transform 220ms ease-out;
}

.stack-row.is-past .row-node > i {
  border-color: var(--accent);
  background: var(--accent);
}

.stack-row.is-active .row-node > i {
  border-color: var(--surface);
  background: var(--accent);
  box-shadow: 0 0 0 2px var(--accent), 0 0 0 10px var(--accent-soft);
  transform: scale(1.08);
}

.row-copy {
  display: block;
  padding-right: 10px;
  color: var(--text);
  font-size: 15px;
  line-height: 1.45;
  transition: color 180ms ease-out, opacity 180ms ease-out;
}

.stack-row:not(.is-active) .row-copy {
  opacity: 0.76;
}

.stack-row.is-active .row-copy {
  color: var(--ink);
}

.technology-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
}

.technology-list > span {
  display: inline-flex;
  align-items: center;
  min-height: 29px;
  padding: 0 12px;
  border: 1px solid var(--chip-border);
  border-radius: 999px;
  background: var(--chip);
  color: var(--text);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.01em;
}

.stack-visual {
  position: relative;
  z-index: 2;
  min-width: 0;
  min-height: 430px;
}

.stack-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

::selection {
  background: var(--accent);
  color: #fff;
}

@media (max-width: 1050px) {
  .site-links {
    gap: 22px;
  }

  .stage-body {
    grid-template-columns: minmax(520px, 1.15fr) minmax(320px, 0.85fr);
  }

  .stack-row {
    grid-template-columns: 160px 40px minmax(0, 1fr);
  }

  .timeline-track {
    left: 180px;
  }
}

@media (max-width: 820px) {
  .site-nav {
    grid-template-columns: 1fr auto;
    padding: 0 20px;
  }

  .site-links {
    display: none;
  }

  .project-cta {
    display: none;
  }

  .stage-content {
    padding: 42px 20px 110px;
  }

  .stage-head,
  .stage-body {
    grid-template-columns: 1fr;
  }

  .stage-head {
    gap: 26px;
  }

  .section-meta {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 22px;
    align-items: center;
    padding-top: 0;
  }

  .section-meta p {
    margin: 0;
  }

  .stage-body {
    gap: 26px;
    margin-top: 36px;
  }

  .stack-row {
    grid-template-columns: 112px 36px minmax(0, 1fr);
    min-height: 118px;
  }

  .stack-row > strong {
    font-size: 20px;
  }

  .timeline-track {
    left: 130px;
  }

  .stack-visual {
    min-height: 360px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stack-prototype *,
  .stack-prototype *::before,
  .stack-prototype *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
</style>
