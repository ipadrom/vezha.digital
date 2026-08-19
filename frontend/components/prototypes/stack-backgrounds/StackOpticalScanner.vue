<template>
  <StackPrototypeShell class="scanner-variant" :theme="theme" variant="scanner" @toggle-theme="emit('toggle-theme')">
    <template #background="{ activeIndex }">
      <div class="scanner-field" :data-step="activeIndex">
        <div class="type-rail">
          <span
            v-for="(label, index) in labels"
            :key="label"
            :class="{ 'is-active': index === activeIndex }"
          >{{ label }}</span>
        </div>
        <span class="scan-line"></span>
        <span class="scanner-index">SCAN / {{ String(activeIndex + 1).padStart(2, "0") }}</span>
      </div>
    </template>

    <template #visual="{ activeIndex }">
      <div class="optical-visual" :data-step="activeIndex">
        <div class="optical-orb">
          <span v-for="ring in 14" :key="ring" class="optical-ring" :style="{ '--ring': ring }"></span>
          <span class="orb-axis orb-axis-x"></span>
          <span class="orb-axis orb-axis-y"></span>
          <span class="orb-aperture"></span>
          <span class="orb-sweep"></span>
        </div>
        <div class="scanner-readout">
          <span v-for="(item, index) in stackItems[activeIndex]" :key="item">
            <i>{{ String(index + 1).padStart(2, "0") }}</i>{{ item }}
          </span>
        </div>
      </div>
    </template>
  </StackPrototypeShell>
</template>

<script setup lang="ts">
import StackPrototypeShell from "./StackPrototypeShell.vue";

defineProps<{ theme: "light" | "dark" }>();
const emit = defineEmits<{ "toggle-theme": [] }>();

const labels = ["FRONTEND", "BACKEND", "DEVOPS", "MOBILE"];
const stackItems = [
  ["React", "Vue 3", "Next.js", "TypeScript", "Tailwind"],
  ["Go", "Gin", "PostgreSQL", "Redis"],
  ["Docker", "Nginx", "CI/CD", "Linux"],
  ["Kotlin", "Swift", "Flutter", "Expo", "PWA"],
];
</script>

<style scoped>
.scanner-field {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background:
    linear-gradient(90deg, transparent 49.95%, var(--hair-soft) 50%, transparent 50.05%),
    linear-gradient(0deg, transparent 49.95%, var(--hair-soft) 50%, transparent 50.05%);
}

.type-rail {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 102%;
  transform: translate(-50%, -50%) rotate(-5deg);
}

.type-rail span {
  grid-area: 1 / 1;
  color: transparent;
  font-size: clamp(120px, 17vw, 270px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.8;
  text-align: center;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--ink) 6%, transparent);
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 200ms ease-out, transform 220ms cubic-bezier(0.23, 1, 0.32, 1);
}

.type-rail span.is-active {
  opacity: 1;
  transform: translateY(0);
}

.scan-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--pointer-x);
  width: 1px;
  background: linear-gradient(transparent 5%, color-mix(in srgb, var(--accent) 60%, transparent) 24%, var(--accent) 50%, color-mix(in srgb, var(--accent) 60%, transparent) 76%, transparent 95%);
  box-shadow: 0 0 26px color-mix(in srgb, var(--accent) 26%, transparent);
  opacity: 0.65;
  transition: left 90ms linear;
}

.scanner-index {
  position: absolute;
  right: 30px;
  bottom: 25px;
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.15em;
}

.optical-visual {
  position: absolute;
  inset: 0;
  animation: optical-enter 680ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.optical-orb {
  position: absolute;
  top: 48%;
  left: 50%;
  width: min(36vw, 430px);
  max-width: 94%;
  aspect-ratio: 1;
  border: 1px solid var(--hair);
  border-radius: 50%;
  background: color-mix(in srgb, var(--surface-raised) 66%, transparent);
  overflow: hidden;
  transform: translate(-50%, -50%);
}

.optical-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--ring) * 6.2%);
  aspect-ratio: 1;
  border: 1px solid color-mix(in srgb, var(--ink) calc(24% - var(--ring) * 0.8%), transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.optical-ring:nth-child(3n) {
  border-color: color-mix(in srgb, var(--accent) 34%, transparent);
}

.orb-axis {
  position: absolute;
  background: var(--hair);
}

.orb-axis-x { top: 50%; right: 0; left: 0; height: 1px; }
.orb-axis-y { top: 0; bottom: 0; left: 50%; width: 1px; }

.orb-aperture {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 58px;
  height: 58px;
  border: 1px solid var(--accent);
  border-radius: 50%;
  background: var(--surface);
  box-shadow: 0 0 0 12px var(--accent-soft);
  transform: translate(-50%, -50%);
}

.orb-sweep {
  position: absolute;
  top: -5%;
  bottom: -5%;
  left: 50%;
  width: 38%;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent-two) 12%, transparent), transparent);
  transform-origin: left center;
  animation: orb-sweep 2.8s cubic-bezier(0.23, 1, 0.32, 1) both;
}

.scanner-readout {
  position: absolute;
  right: -1%;
  bottom: 2%;
  display: grid;
  width: 54%;
  border-top: 1px solid var(--hair);
}

.scanner-readout span {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px solid var(--hair-soft);
  color: var(--ink);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
}

.scanner-readout i {
  color: var(--accent);
  font-style: normal;
  font-variant-numeric: tabular-nums;
}

@keyframes optical-enter {
  from { opacity: 0; transform: scale(0.96); filter: blur(8px); }
}

@keyframes orb-sweep {
  from { opacity: 0; transform: rotate(-130deg); }
  30% { opacity: 1; }
  to { opacity: 0.45; transform: rotate(130deg); }
}

@media (max-width: 820px) {
  .optical-orb { width: min(84vw, 400px); }
  .scanner-readout { right: 6%; width: 44%; }
  .type-rail span { font-size: 26vw; }
}
</style>
