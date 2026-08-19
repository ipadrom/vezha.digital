<template>
  <StackPrototypeShell class="modular-variant" :theme="theme" variant="modular" @toggle-theme="emit('toggle-theme')">
    <template #background="{ activeIndex }">
      <div class="module-field" :data-step="activeIndex">
        <span v-for="cell in 48" :key="cell" :class="{ 'is-hot': hotCells[activeIndex].includes(cell) }"></span>
        <i class="module-axis">SYSTEM / ASSEMBLY / 0{{ activeIndex + 1 }}</i>
      </div>
    </template>

    <template #visual="{ activeIndex }">
      <div class="module-visual" :data-step="activeIndex">
        <div class="module-plane"></div>
        <div class="module-cluster">
          <div
            v-for="(module, index) in modules"
            :key="index"
            class="voxel"
            :style="moduleStyle(index, activeIndex)"
          >
            <i class="voxel-top"></i><i class="voxel-left"></i><i class="voxel-right"></i>
          </div>
        </div>
        <div class="module-labels">
          <span v-for="item in stackItems[activeIndex]" :key="item">{{ item }}</span>
        </div>
        <span class="assembly-note">ASSEMBLY {{ String(activeIndex + 1).padStart(2, "0") }} / 04</span>
      </div>
    </template>
  </StackPrototypeShell>
</template>

<script setup lang="ts">
import StackPrototypeShell from "./StackPrototypeShell.vue";

defineProps<{ theme: "light" | "dark" }>();
const emit = defineEmits<{ "toggle-theme": [] }>();

const modules = Array.from({ length: 12 });
const formations = [
  [[-132, -94], [-52, -112], [32, -105], [116, -76], [-145, -18], [-61, -30], [24, -28], [111, -8], [-112, 62], [-29, 58], [58, 52], [135, 68]],
  [[-118, -116], [-38, -116], [42, -116], [122, -116], [-118, -34], [-38, -34], [42, -34], [122, -34], [-78, 48], [2, 48], [82, 48], [2, 128]],
  [[-146, -72], [-66, -72], [14, -72], [94, -72], [-106, 10], [-26, 10], [54, 10], [134, 10], [-146, 92], [-66, 92], [14, 92], [94, 92]],
  [[-74, -146], [6, -146], [86, -106], [-74, -64], [6, -64], [86, -24], [-74, 18], [6, 18], [86, 58], [-74, 100], [6, 100], [86, 140]],
];

const stackItems = [
  ["React", "Vue 3", "Next.js", "TypeScript", "Tailwind"],
  ["Go", "Gin", "PostgreSQL", "Redis"],
  ["Docker", "Nginx", "CI/CD", "Linux"],
  ["Kotlin", "Swift", "Flutter", "Expo", "PWA"],
];

const hotCells = [
  [7, 8, 15, 16, 23],
  [11, 12, 19, 20, 27],
  [22, 23, 24, 30, 31],
  [14, 21, 28, 35, 42],
];

function moduleStyle(index: number, activeIndex: number) {
  const [x, y] = formations[activeIndex][index];
  return {
    "--voxel-x": `${x}px`,
    "--voxel-y": `${y}px`,
    "--voxel-delay": `${index * 12}ms`,
    "--voxel-opacity": index > 9 && activeIndex === 1 ? 0.48 : 1,
  };
}
</script>

<style scoped>
.module-field {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(6, 1fr);
  overflow: hidden;
}

.module-field > span {
  border-right: 1px solid var(--hair-soft);
  border-bottom: 1px solid var(--hair-soft);
  background: transparent;
  transition: background 220ms ease-out;
}

.module-field > span.is-hot {
  background: color-mix(in srgb, var(--accent) 5%, transparent);
}

.module-field::after {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 77% 58%, color-mix(in srgb, var(--accent-two) 7%, transparent), transparent 27%);
  content: "";
}

.module-axis {
  position: absolute;
  right: 30px;
  bottom: 25px;
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  font-style: normal;
  letter-spacing: 0.12em;
}

.module-visual {
  position: absolute;
  inset: 0;
  animation: module-enter 720ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.module-plane {
  position: absolute;
  top: 52%;
  left: 50%;
  width: 420px;
  height: 310px;
  border: 1px solid var(--hair);
  background-image:
    linear-gradient(var(--hair-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--hair-soft) 1px, transparent 1px);
  background-size: 32px 32px;
  transform: translate(-50%, -50%) perspective(620px) rotateX(62deg) rotateZ(45deg);
  transform-origin: center;
}

.module-cluster {
  position: absolute;
  top: 49%;
  left: 50%;
  width: 1px;
  height: 1px;
}

.voxel {
  position: absolute;
  top: 0;
  left: 0;
  width: 54px;
  height: 54px;
  opacity: var(--voxel-opacity);
  transform: translate(var(--voxel-x), var(--voxel-y));
  transition:
    transform 260ms cubic-bezier(0.23, 1, 0.32, 1) var(--voxel-delay),
    opacity 180ms ease-out;
}

.voxel i {
  position: absolute;
  display: block;
  border: 1px solid color-mix(in srgb, var(--ink) 22%, transparent);
}

.voxel-top {
  inset: 0;
  background: color-mix(in srgb, var(--surface-raised) 84%, var(--accent) 16%);
  transform: rotate(45deg) skew(-8deg, -8deg) scale(0.72);
}

.voxel-left {
  top: 32px;
  left: 7px;
  width: 38px;
  height: 25px;
  background: color-mix(in srgb, var(--surface) 82%, var(--accent) 18%);
  clip-path: polygon(0 0, 100% 43%, 100% 100%, 0 57%);
  transform: translateX(-12px);
}

.voxel-right {
  top: 32px;
  left: 31px;
  width: 38px;
  height: 25px;
  background: color-mix(in srgb, var(--surface) 72%, var(--accent-two) 28%);
  clip-path: polygon(0 43%, 100% 0, 100% 57%, 0 100%);
}

.voxel:nth-child(3n + 1) .voxel-top {
  background: color-mix(in srgb, var(--surface-raised) 73%, var(--accent-two) 27%);
}

.module-labels {
  position: absolute;
  right: 0;
  bottom: 5%;
  left: 10%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7px;
}

.module-labels span {
  min-height: 29px;
  padding: 7px 11px;
  border: 1px solid var(--chip-border);
  border-radius: 7px;
  background: var(--surface-raised);
  color: var(--ink);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  box-shadow: 0 8px 18px rgba(20, 28, 42, 0.08);
}

.assembly-note {
  position: absolute;
  top: 4%;
  right: 2%;
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.13em;
}

@keyframes module-enter {
  from { opacity: 0; transform: translateY(22px) scale(0.96); }
}

@media (max-width: 820px) {
  .module-visual { transform: scale(0.84); }
  .module-plane { width: 360px; }
}
</style>
