<template>
  <div class="prototype-page">
    <component
      :is="currentVariant.component"
      :key="`${activeIndex}-${replayKey}`"
      :theme="theme"
      @toggle-theme="toggleTheme"
    />

    <nav ref="pickerRef" class="proto-picker" aria-label="Prototype variants">
      <span ref="highlightRef" class="proto-picker-highlight" aria-hidden="true"></span>
      <button
        v-for="(variant, index) in variants"
        :key="variant.name"
        class="proto-picker-item"
        :data-active="activeIndex === index ? '' : undefined"
        :aria-current="activeIndex === index ? 'true' : undefined"
        @click="setActive(index)"
      >
        {{ variant.name }}
      </button>
      <span class="proto-picker-divider" aria-hidden="true"></span>
      <button class="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" @click="replay">↻</button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import StackModularLab from "~/components/prototypes/stack-backgrounds/StackModularLab.vue";
import StackOpticalScanner from "~/components/prototypes/stack-backgrounds/StackOpticalScanner.vue";
import StackSignalThread from "~/components/prototypes/stack-backgrounds/StackSignalThread.vue";
import StackTopographicField from "~/components/prototypes/stack-backgrounds/StackTopographicField.vue";

definePageMeta({ layout: false });

type ThemeMode = "light" | "dark";
type Variant = { name: string; component: Component };

const variants: Variant[] = [
  { name: "Signal", component: StackSignalThread },
  { name: "Topo", component: StackTopographicField },
  { name: "Modular", component: StackModularLab },
  { name: "Scanner", component: StackOpticalScanner },
];

const route = useRoute();
const router = useRouter();
const initialVariant = Math.min(Math.max(Number(route.query.v || 1) - 1, 0), variants.length - 1);
const initialTheme: ThemeMode = route.query.theme === "dark" ? "dark" : "light";
const activeIndex = ref(initialVariant);
const replayKey = ref(0);
const theme = ref<ThemeMode>(initialTheme);
const pickerRef = ref<HTMLElement | null>(null);
const highlightRef = ref<HTMLElement | null>(null);
const currentVariant = computed(() => variants[activeIndex.value]);

function moveHighlight() {
  const picker = pickerRef.value;
  const highlight = highlightRef.value;
  if (!picker || !highlight) return;
  const items = picker.querySelectorAll<HTMLElement>(".proto-picker-item:not(.proto-picker-replay)");
  const item = items.item(activeIndex.value);
  if (!item) return;
  highlight.style.width = `${item.offsetWidth}px`;
  highlight.style.transform = `translateX(${item.offsetLeft}px)`;
}

function syncUrl() {
  void router.replace({
    query: { ...route.query, v: String(activeIndex.value + 1), theme: theme.value },
  });
}

function setActive(index: number) {
  if (index < 0 || index >= variants.length) return;
  activeIndex.value = index;
  replayKey.value += 1;
  syncUrl();
  void nextTick(moveHighlight);
}

function replay() {
  replayKey.value += 1;
}

function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
  syncUrl();
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const number = Number.parseInt(event.key, 10);
  if (number >= 1 && number <= variants.length) setActive(number - 1);
  else if (event.key === "ArrowRight") setActive((activeIndex.value + 1) % variants.length);
  else if (event.key === "ArrowLeft") setActive((activeIndex.value - 1 + variants.length) % variants.length);
  else if (event.key === "r" || event.key === "R") replay();
}

onMounted(() => {
  moveHighlight();
  window.addEventListener("resize", moveHighlight);
  document.addEventListener("keydown", handleKeydown);
  requestAnimationFrame(() => requestAnimationFrame(() => pickerRef.value?.setAttribute("data-ready", "")));
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", moveHighlight);
  document.removeEventListener("keydown", handleKeydown);
});

useHead({ title: "Stack background prototypes — VEZHA Digital" });
</script>

<style scoped>
.prototype-page {
  min-height: 100vh;
}

.proto-picker {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(10, 10, 10, 0.82);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
    0 8px 24px rgba(0, 0, 0, 0.24),
    0 2px 6px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  -webkit-user-select: none;
}

.proto-picker-highlight {
  position: absolute;
  top: 4px;
  left: 0;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  will-change: transform;
}

.proto-picker[data-ready] .proto-picker-highlight {
  transition:
    transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
    width 250ms cubic-bezier(0.23, 1, 0.32, 1);
}

@media (prefers-reduced-motion: reduce) {
  .proto-picker[data-ready] .proto-picker-highlight { transition: none; }
}

.proto-picker-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font: inherit;
  cursor: pointer;
  transition: color 150ms ease-out;
}

.proto-picker-item:hover {
  color: rgba(255, 255, 255, 0.85);
}

.proto-picker-item:active {
  transform: scale(0.97);
}

.proto-picker-item:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.4);
  outline-offset: 2px;
}

.proto-picker-item[data-active] {
  color: #fff;
}

.proto-picker-divider {
  width: 1px;
  height: 16px;
  margin: 0 4px;
  background: rgba(255, 255, 255, 0.12);
}

.proto-picker-replay {
  padding: 0 10px;
  font-size: 14px;
}

.proto-picker[data-position="top"] {
  bottom: auto;
  top: 24px;
}
</style>
