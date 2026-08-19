<template>
  <StackPrototypeShell class="signal-variant" :theme="theme" variant="signal" @toggle-theme="emit('toggle-theme')">
    <template #background>
      <div class="signal-field">
        <span class="axis axis-x">X / 1280</span>
        <span class="axis axis-y">Y / 0720</span>
        <span class="registration registration-a"></span>
        <span class="registration registration-b"></span>
        <span class="registration registration-c"></span>
      </div>
    </template>

    <template #overlay="{ activeIndex }">
      <svg class="signal-route" viewBox="0 0 1400 430" preserveAspectRatio="none">
        <g :key="activeIndex">
          <path class="route-shadow" :d="routes[activeIndex]" />
          <path class="route-line" :d="routes[activeIndex]" />
          <circle class="route-point" r="4">
            <animateMotion :path="routes[activeIndex]" dur="1.35s" begin="0.18s" fill="freeze" />
          </circle>
        </g>
      </svg>
    </template>

    <template #visual="{ activeIndex }">
      <div class="signal-orbit" :data-step="activeIndex">
        <div class="sphere-aura"></div>
        <svg class="wire-sphere" viewBox="0 0 520 520">
          <circle cx="260" cy="260" r="184" />
          <ellipse cx="260" cy="260" rx="184" ry="78" />
          <ellipse cx="260" cy="260" rx="184" ry="124" />
          <ellipse cx="260" cy="260" rx="78" ry="184" />
          <ellipse cx="260" cy="260" rx="124" ry="184" />
          <path d="M99 172 421 348M77 260h366M99 348 421 172M144 118l232 284M144 402l232-284" />
          <path class="wire-faint" d="M119 139 401 381M78 226l364 68M78 294l364-68M119 381 401 139M190 86l140 348M190 434 330 86" />
          <circle class="sphere-core" cx="260" cy="260" r="62" />
          <ellipse class="orbit-ring" cx="260" cy="260" rx="226" ry="108" transform="rotate(-24 260 260)" />
        </svg>
        <span
          v-for="(item, index) in stackItems[activeIndex]"
          :key="item"
          class="orbit-label"
          :style="labelStyles[index]"
        >{{ item }}</span>
      </div>
    </template>
  </StackPrototypeShell>
</template>

<script setup lang="ts">
import StackPrototypeShell from "./StackPrototypeShell.vue";

defineProps<{ theme: "light" | "dark" }>();
const emit = defineEmits<{ "toggle-theme": [] }>();

const routes = [
  "M220 42 C540 42 675 42 820 150 C925 228 1000 186 1082 206",
  "M220 144 C500 144 670 142 815 194 C930 236 1000 218 1082 216",
  "M220 246 C500 246 655 246 820 238 C925 232 1000 234 1082 228",
  "M220 348 C515 348 670 344 825 282 C930 240 1000 246 1082 240",
];

const stackItems = [
  ["React", "Vue 3", "Next.js", "TypeScript", "Tailwind"],
  ["Go", "Gin", "PostgreSQL", "Redis"],
  ["Docker", "Nginx", "CI/CD", "Linux"],
  ["Kotlin", "Swift", "Flutter", "Expo", "PWA"],
];

const labelStyles = [
  { top: "18%", right: "4%" },
  { top: "38%", right: "-1%" },
  { top: "69%", right: "13%" },
  { top: "78%", left: "15%" },
  { top: "49%", left: "-2%" },
];
</script>

<style scoped>
.signal-field {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background-image:
    linear-gradient(var(--hair-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--hair-soft) 1px, transparent 1px),
    linear-gradient(color-mix(in srgb, var(--accent) 9%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--accent) 9%, transparent) 1px, transparent 1px);
  background-position: center;
  background-size: 72px 72px, 72px 72px, 288px 288px, 288px 288px;
}

.signal-field::after {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--pointer-x) var(--pointer-y), color-mix(in srgb, var(--accent) 8%, transparent), transparent 26%);
  content: "";
  transition: opacity 180ms ease-out;
}

.axis {
  position: absolute;
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.08em;
  opacity: 0.48;
}

.axis-x { right: 28px; bottom: 26px; }
.axis-y { top: 30px; left: 28px; }

.registration {
  position: absolute;
  width: 24px;
  height: 24px;
  opacity: 0.5;
}

.registration::before,
.registration::after {
  position: absolute;
  background: var(--hair);
  content: "";
}

.registration::before { top: 11px; left: 0; width: 24px; height: 1px; }
.registration::after { top: 0; left: 11px; width: 1px; height: 24px; }
.registration-a { top: 24%; left: 57%; }
.registration-b { right: 5%; bottom: 9%; }
.registration-c { bottom: 14%; left: 6%; }

.signal-route {
  width: 100%;
  height: 100%;
  overflow: visible;
  fill: none;
}

.route-shadow,
.route-line {
  stroke-linecap: round;
  stroke-width: 1.4;
}

.route-shadow {
  stroke: color-mix(in srgb, var(--accent) 25%, transparent);
  stroke-width: 8;
  opacity: 0.18;
}

.route-line {
  stroke: var(--accent);
  stroke-dasharray: 1300;
  stroke-dashoffset: 1300;
  animation: route-draw 720ms cubic-bezier(0.16, 1, 0.3, 1) 80ms forwards;
}

.route-point {
  fill: var(--accent-two);
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--accent) 80%, transparent));
}

.signal-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(43vw, 510px);
  max-width: 100%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  animation: signal-enter 760ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.sphere-aura {
  position: absolute;
  inset: 13%;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent), color-mix(in srgb, var(--accent-two) 5%, transparent) 48%, transparent 72%);
  filter: blur(20px);
}

.wire-sphere {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  fill: none;
  stroke: color-mix(in srgb, var(--ink) 56%, transparent);
  stroke-width: 1.1;
}

.wire-sphere > :not(.orbit-ring) {
  transform-origin: 260px 260px;
  animation: sphere-drift 16s linear infinite;
}

.wire-faint {
  stroke: color-mix(in srgb, var(--accent) 34%, transparent);
}

.sphere-core {
  stroke: color-mix(in srgb, var(--accent) 45%, transparent);
}

.orbit-ring {
  stroke: color-mix(in srgb, var(--accent) 42%, transparent);
  stroke-dasharray: 4 6;
}

.orbit-label {
  position: absolute;
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  padding: 0 12px;
  border: 1px solid var(--chip-border);
  border-radius: 8px;
  background: var(--surface-raised);
  box-shadow: 0 8px 24px rgba(10, 16, 32, 0.08);
  color: var(--ink);
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  white-space: nowrap;
  animation: label-enter 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.orbit-label:nth-of-type(2) { animation-delay: 40ms; }
.orbit-label:nth-of-type(3) { animation-delay: 80ms; }
.orbit-label:nth-of-type(4) { animation-delay: 120ms; }
.orbit-label:nth-of-type(5) { animation-delay: 160ms; }

@keyframes route-draw { to { stroke-dashoffset: 0; } }
@keyframes sphere-drift { to { transform: rotate(360deg); } }
@keyframes signal-enter { from { opacity: 0; transform: translate(-50%, -46%) scale(0.94); } }
@keyframes label-enter { from { opacity: 0; transform: translateY(8px); } }

@media (max-width: 820px) {
  .signal-route { display: none; }
  .signal-orbit { width: min(88vw, 430px); }
}
</style>
