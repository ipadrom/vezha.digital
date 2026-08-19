<template>
  <StackPrototypeShell class="topo-variant" :theme="theme" variant="topographic" @toggle-theme="emit('toggle-theme')">
    <template #background="{ activeIndex }">
      <div class="topo-field" :data-step="activeIndex">
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          <g class="contours contours-a">
            <path d="M-80 640C90 520 100 362 294 331s319 117 458 32 143-259 343-285 324 96 521 26" />
            <path d="M-72 674C118 548 128 393 304 363s308 109 448 31 158-238 348-260 316 92 507 34" />
            <path d="M-60 709C148 574 151 430 318 398s295 98 438 26 171-215 352-233 301 83 486 39" />
            <path d="M-42 744C176 603 180 465 334 434s283 89 427 23 184-192 353-204 286 72 469 43" />
            <path d="M-20 780C208 629 214 503 352 472s267 76 410 17 195-166 352-174 272 59 451 47" />
          </g>
          <g class="contours contours-b">
            <path d="M1020 944c-92-186-23-296 104-370s278-32 338-168 7-274 137-368" />
            <path d="M1066 940c-84-168-18-268 97-337s253-30 309-153 10-246 125-333" />
            <path d="M1110 932c-73-151-14-238 91-305s226-27 280-137 12-218 112-297" />
          </g>
        </svg>
        <span class="topo-index">ELEV / 0{{ activeIndex + 1 }}</span>
      </div>
    </template>

    <template #visual="{ activeIndex }">
      <div class="topo-object" :data-step="activeIndex">
        <div class="topo-shadow"></div>
        <div class="topo-disc">
          <span v-for="ring in 10" :key="ring" class="topo-ring" :style="{ '--ring': ring }"></span>
          <span class="topo-center"></span>
        </div>
        <div class="topo-legend">
          <span v-for="item in stackItems[activeIndex]" :key="item">{{ item }}</span>
        </div>
        <span class="height-mark height-mark-a">+{{ 12 + activeIndex * 7 }}</span>
        <span class="height-mark height-mark-b">0{{ activeIndex + 1 }} / 04</span>
      </div>
    </template>
  </StackPrototypeShell>
</template>

<script setup lang="ts">
import StackPrototypeShell from "./StackPrototypeShell.vue";

defineProps<{ theme: "light" | "dark" }>();
const emit = defineEmits<{ "toggle-theme": [] }>();

const stackItems = [
  ["React", "Vue 3", "Next.js", "TypeScript", "Tailwind"],
  ["Go", "Gin", "PostgreSQL", "Redis"],
  ["Docker", "Nginx", "CI/CD", "Linux"],
  ["Kotlin", "Swift", "Flutter", "Expo", "PWA"],
];
</script>

<style scoped>
.topo-field {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 77% 57%, color-mix(in srgb, var(--accent-two) 8%, transparent), transparent 29%),
    linear-gradient(135deg, color-mix(in srgb, var(--accent) 3%, transparent), transparent 42%);
}

.topo-field svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: color-mix(in srgb, var(--ink) 12%, transparent);
  stroke-width: 1;
}

.topo-variant[data-theme="dark"] .topo-field svg {
  stroke: color-mix(in srgb, var(--ink) 18%, transparent);
}

.contours {
  transform-origin: center;
  transition: transform 240ms cubic-bezier(0.23, 1, 0.32, 1);
}

.topo-field[data-step="1"] .contours-a { transform: translate(-12px, 10px) scale(1.01); }
.topo-field[data-step="2"] .contours-a { transform: translate(18px, -8px) scale(1.025); }
.topo-field[data-step="3"] .contours-a { transform: translate(-6px, -18px) scale(1.04); }
.topo-field[data-step="1"] .contours-b { transform: translate(8px, -10px); }
.topo-field[data-step="2"] .contours-b { transform: translate(-14px, 12px); }
.topo-field[data-step="3"] .contours-b { transform: translate(18px, 16px); }

.topo-index {
  position: absolute;
  right: 30px;
  bottom: 24px;
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.14em;
}

.topo-object {
  --object-rotate: -8deg;
  position: absolute;
  top: 50%;
  left: 52%;
  width: min(39vw, 470px);
  max-width: 96%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%) rotate(var(--object-rotate));
  transition: transform 260ms cubic-bezier(0.23, 1, 0.32, 1);
  animation: topo-enter 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.topo-object[data-step="1"] { --object-rotate: 5deg; transform: translate(-47%, -50%) rotate(var(--object-rotate)); }
.topo-object[data-step="2"] { --object-rotate: -3deg; transform: translate(-52%, -47%) rotate(var(--object-rotate)); }
.topo-object[data-step="3"] { --object-rotate: 9deg; transform: translate(-49%, -52%) rotate(var(--object-rotate)); }

.topo-shadow {
  position: absolute;
  inset: 18% 11% 8% 19%;
  border-radius: 46% 54% 63% 37% / 44% 34% 66% 56%;
  background: color-mix(in srgb, var(--accent) 13%, transparent);
  filter: blur(28px);
  transform: translate(18px, 24px);
}

.topo-disc {
  position: absolute;
  inset: 10%;
  border: 1px solid color-mix(in srgb, var(--ink) 16%, transparent);
  border-radius: 46% 54% 63% 37% / 44% 34% 66% 56%;
  background: color-mix(in srgb, var(--surface-raised) 78%, transparent);
  box-shadow: 0 22px 52px rgba(24, 31, 47, 0.1);
}

.topo-variant[data-theme="dark"] .topo-disc {
  border-color: color-mix(in srgb, var(--ink) 24%, transparent);
  background: color-mix(in srgb, var(--surface-raised) 90%, var(--accent) 10%);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.34),
    0 0 72px color-mix(in srgb, var(--accent) 10%, transparent);
}

.topo-ring {
  position: absolute;
  inset: calc(var(--ring) * 3.7%);
  border: 1px solid color-mix(in srgb, var(--ink) calc(20% - var(--ring) * 0.7%), transparent);
  border-radius: 48% 52% 58% 42% / 41% 47% 53% 59%;
  transform: rotate(calc(var(--ring) * 4deg));
}

.topo-ring:nth-child(2n) {
  border-color: color-mix(in srgb, var(--accent) 24%, transparent);
  border-radius: 58% 42% 46% 54% / 52% 39% 61% 48%;
}

.topo-variant[data-theme="dark"] .topo-ring {
  border-color: color-mix(in srgb, var(--ink) 27%, transparent);
}

.topo-variant[data-theme="dark"] .topo-ring:nth-child(2n) {
  border-color: color-mix(in srgb, var(--accent) 42%, transparent);
}

.topo-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 10px var(--accent-soft);
  transform: translate(-50%, -50%);
}

.topo-legend {
  position: absolute;
  right: -2%;
  bottom: 4%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  width: 64%;
  transform: rotate(calc(var(--object-rotate) * -1));
}

.topo-legend span {
  padding: 7px 10px;
  border: 1px solid var(--chip-border);
  border-radius: 7px;
  background: var(--surface-raised);
  color: var(--ink);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  box-shadow: 0 8px 18px rgba(24, 31, 47, 0.07);
}

.height-mark {
  position: absolute;
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.11em;
}

.height-mark-a { top: 11%; left: 4%; }
.height-mark-b { top: 18%; right: 2%; }

@keyframes topo-enter {
  from { opacity: 0; transform: translate(-50%, -44%) rotate(-14deg) scale(0.92); }
}

@media (max-width: 820px) {
  .topo-object { width: min(90vw, 430px); }
}
</style>
