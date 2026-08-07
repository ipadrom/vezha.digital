<template>
  <div class="freeform-stage" :style="stageStyle">
    <div
      v-for="element in elements"
      :key="element.id"
      class="freeform-element"
      :class="`freeform-element--${element.type}`"
      :style="elementStyle(element)"
    >
      <span v-if="element.type === 'eyebrow'" class="builder-eyebrow">{{ element.text }}</span>
      <h2 v-else-if="element.type === 'heading'">{{ element.text }}</h2>
      <p v-else-if="element.type === 'text'">{{ element.text }}</p>
      <img v-else-if="element.type === 'image' && element.url" :src="element.url" :alt="element.alt || ''" />
      <video v-else-if="element.type === 'video' && element.url" controls playsinline :poster="element.poster || undefined"><source :src="element.url" /></video>
      <a v-else-if="element.type === 'button' && element.href" :href="element.href" class="freeform-button">{{ element.text }} <b>↗</b></a>
      <span v-else-if="element.type === 'button'" class="freeform-button">{{ element.text }} <b>↗</b></span>
      <div v-else-if="element.type === 'metric'" class="freeform-metric"><b>{{ element.value }}</b><span>{{ element.label }}</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CaseElementBox, CaseFreeformElement, CaseBlockSettings } from '~/utils/caseBuilder'

const props = defineProps<{ content: Record<string, any>; settings: CaseBlockSettings }>()
const elements = computed<CaseFreeformElement[]>(() => Array.isArray(props.content.elements) ? props.content.elements : [])
const stageStyle = computed(() => ({
  '--freeform-height-desktop': `${Number(props.settings.freeform_height_desktop) || 620}px`,
  '--freeform-height-tablet': `${Number(props.settings.freeform_height_tablet) || 560}px`,
  '--freeform-height-mobile': `${Number(props.settings.freeform_height_mobile) || 720}px`,
}))

const safeBox = (box: CaseElementBox | undefined): CaseElementBox => ({
  x: Number(box?.x) || 0,
  y: Number(box?.y) || 0,
  w: Math.max(1, Number(box?.w) || 20),
  h: Math.max(1, Number(box?.h) || 10),
})

const elementStyle = (element: CaseFreeformElement) => {
  const style: Record<string, string> = {}
  for (const viewport of ['desktop', 'tablet', 'mobile'] as const) {
    const box = safeBox(element[viewport])
    style[`--${viewport}-x`] = `${box.x}%`
    style[`--${viewport}-y`] = `${box.y}%`
    style[`--${viewport}-w`] = `${box.w}%`
    style[`--${viewport}-h`] = `${box.h}%`
  }
  return style
}
</script>

<style scoped>
.freeform-stage { position: relative; width: 100%; height: var(--freeform-height-desktop); min-height: 360px; overflow: hidden; }
.freeform-element { position: absolute; left: var(--desktop-x); top: var(--desktop-y); width: var(--desktop-w); height: var(--desktop-h); min-width: 0; overflow: hidden; }
.freeform-element--eyebrow { display: flex; align-items: center; }
.freeform-element--heading { display: flex; align-items: center; }
.freeform-element--heading h2 { margin: 0; font: 500 clamp(32px, 5.7cqw, 92px)/.88 var(--font-ui); letter-spacing: -.07em; overflow-wrap: anywhere; }
.freeform-element--text p { margin: 0; color: var(--case-muted); font-size: clamp(14px, 1.35cqw, 21px); line-height: 1.45; white-space: pre-line; }
.freeform-element--image img { width: 100%; height: 100%; display: block; object-fit: cover; }
.freeform-element--video video { width:100%; height:100%; display:block; object-fit:cover; background:#000; }
.freeform-element--button { display: flex; align-items: flex-start; }
.freeform-button { width: 100%; padding: 14px 0; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid currentColor; color: inherit; font: 600 12px var(--font-mono); letter-spacing: .04em; text-decoration: none; text-transform: uppercase; }
.freeform-metric { width: 100%; height: 100%; padding: clamp(12px, 2cqw, 28px); display: grid; align-content: center; color: #fff; background: var(--case-blue); }
.freeform-metric b { font: 700 clamp(26px, 4cqw, 58px)/1 var(--font-mono); }
.freeform-metric span { margin-top: 8px; font-size: 12px; }
@media (max-width: 1024px) {
  .freeform-stage { height: var(--freeform-height-tablet); }
  .freeform-element { left: var(--tablet-x); top: var(--tablet-y); width: var(--tablet-w); height: var(--tablet-h); }
}
@media (max-width: 640px) {
  .freeform-stage { height: var(--freeform-height-mobile); }
  .freeform-element { left: var(--mobile-x); top: var(--mobile-y); width: var(--mobile-w); height: var(--mobile-h); }
  .freeform-element--heading h2 { font-size: clamp(30px, 11vw, 58px); }
  .freeform-element--text p { font-size: 15px; }
}
</style>
