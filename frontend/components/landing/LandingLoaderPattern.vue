<template>
  <div ref="host" class="vz-preloader__pattern" :style="{ inset: `${inset}px` }" aria-hidden="true">
    <div v-for="(row, rowIndex) in rows" :key="rowIndex" class="vz-preloader__row" :style="{ height: `${rowHeight}px`, fontSize: `${fontSize}px`, paddingBottom: `${rowGap}px` }">
      <span v-for="letter in row" :key="letter.index" class="vz-preloader__letter" :style="{ top: `${-glyphTopRatio * fontSize}px`, left: `${letter.left}px`, width: `${letterWidth}px`, clipPath: `inset(0 ${hiddenPercent(rowIndex, letter.left)}% 0 0)` }">{{ letter.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
const props = withDefaults(defineProps<{ progress: number; fontPixels?: number; letterGap?: number; wordGap?: number; rowGap?: number; inset?: number }>(), { letterGap: 12, rowGap: 0, inset: 0 })
const host = ref<HTMLElement | null>(null)
const size = ref({ width: 1440, height: 900 })
const glyphTopRatio = ref(.15)
function measureGlyphTop() {
  const row = host.value?.querySelector('.vz-preloader__row')
  if (!row) return
  const context = document.createElement('canvas').getContext('2d')
  if (!context) return
  context.font = `700 100px ${getComputedStyle(row).fontFamily}`
  const metrics = context.measureText('VEZHA')
  const ascent = metrics.fontBoundingBoxAscent
  const descent = metrics.fontBoundingBoxDescent
  if (Number.isFinite(ascent) && Number.isFinite(descent)) {
    glyphTopRatio.value = ((100 - ascent - descent) / 2 + ascent - metrics.actualBoundingBoxAscent) / 100
  }
}
const fontSize = computed(() => props.fontPixels ?? (size.value.width <= 767 ? 170 : 250))
const wordSpacing = computed(() => props.wordGap ?? (size.value.width <= 767 ? 0 : 60))
const rowHeight = computed(() => fontSize.value / 1.2 + props.rowGap)
const rowCount = computed(() => Math.max(1, Math.ceil(size.value.height / rowHeight.value)))
const letterWidth = computed(() => fontSize.value * .66 + props.letterGap)
const rows = computed(() => Array.from({ length: rowCount.value }, (_, row) => {
  const offset = row % 2 ? -(5 * letterWidth.value + wordSpacing.value) / 2 : 0
  const count = Math.ceil((size.value.width - offset) / letterWidth.value)
  return Array.from({ length: count }, (_, index) => ({ index, text: 'VEZHA'[index % 5], left: offset + index * letterWidth.value + Math.floor(index / 5) * wordSpacing.value }))
}))
function hiddenPercent(row: number, left: number) {
  const filled = Math.max(0, Math.min(1, (props.progress / 100 * size.value.height - row * rowHeight.value) / Math.min(rowHeight.value, size.value.height - row * rowHeight.value))) * size.value.width
  return 100 * (1 - Math.max(0, Math.min(1, (filled - left) / letterWidth.value)))
}
let observer: ResizeObserver | undefined
onMounted(() => {
  if (!host.value) return
  const measure = () => {
    if (host.value) size.value = { width: Math.max(1, host.value.clientWidth), height: Math.max(1, host.value.clientHeight) }
  }
  measure()
  measureGlyphTop()
  void document.fonts.ready.then(measureGlyphTop)
  observer = new ResizeObserver(measure)
  observer.observe(host.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.vz-preloader__pattern { position: absolute; overflow: hidden; color: #000; pointer-events: none; }
.vz-preloader__row { position: relative; box-sizing: border-box; overflow: hidden; width: 100%; font-family: var(--font-ui); font-weight: 700; line-height: 1; }
.vz-preloader__letter { position: absolute; transform: none; display: block; text-align: center; }
</style>
