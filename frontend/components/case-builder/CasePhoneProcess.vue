<template>
  <div ref="root" class="phone-process">
    <header class="builder-heading builder-process-chapter" :data-od-id="`case-heading-${block.id}`">
      <h3>{{ block.content.eyebrow }}</h3>
      <div class="builder-process-chapter__copy">
        <p v-if="block.content.title" class="builder-process-chapter__lead">{{ block.content.title }}</p>
        <p v-if="summary" class="builder-process-chapter__summary">{{ summary }}</p>
      </div>
    </header>

    <div class="phone-process__layout">
      <ol class="phone-process__steps" role="list" :style="{ '--accordion-height': `${accordionHeight}px` }">
        <li v-for="(item, index) in items" :key="index" :class="{ 'is-active': activeIndex === index }">
          <div class="phone-process__step">
            <h4>
              <button
                :id="`${panelId(index)}-trigger`"
                type="button"
                class="builder-process__trigger phone-process__trigger"
                :aria-expanded="activeIndex === index"
                :aria-controls="panelId(index)"
                :data-od-id="`case-process-${block.id}-${index + 1}`"
                @click="selectStep(index)"
              >
                <span class="phone-process__number">{{ String(index + 1).padStart(2, '0') }}</span>
                <b>{{ item.title }}</b>
                <i aria-hidden="true"><span /><span /></i>
              </button>
            </h4>
            <div
              :id="panelId(index)"
              class="phone-process__copy"
              :style="{ height: activeIndex === index ? (panelHeights[index] === undefined ? 'auto' : `${panelHeights[index]}px`) : '0px' }"
              :aria-hidden="activeIndex !== index"
              :aria-labelledby="`${panelId(index)}-trigger`"
              role="region"
            >
              <div class="phone-process__copy-inner">
                <p v-if="item.description">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </li>
      </ol>
      <figure v-if="activeItem" class="phone-process__preview" :aria-label="activeItem.title">
        <div v-if="activeItem.video_url" class="phone-process__screen">
          <video :key="`${block.id}-${activeIndex}-${activeItem.video_url}`" :src="activeItem.video_url" :poster="activeItem.poster_url || undefined" :aria-label="activeItem.title" controls playsinline preload="metadata" />
        </div>
        <a
          v-else-if="activeItem.image_url"
          class="phone-process__screen"
          :href="screenUrl(activeItem)"
          target="_blank"
          rel="noopener"
          :aria-label="`${locale === 'ru' ? 'Открыть скриншот' : 'Open screenshot'}: ${screenAlt(activeItem)}`"
        >
          <img :src="screenUrl(activeItem)" :alt="screenAlt(activeItem)" width="1440" height="3200" decoding="async" />
        </a>
        <div v-else class="phone-process__screen phone-process__empty">{{ locale === 'ru' ? 'Экран пока не добавлен' : 'No screen added yet' }}</div>
        <figcaption class="phone-process__caption">
          <div v-if="!activeItem.video_url && activeItem.image_url && activeItem.secondary_image_url" class="phone-process__views" :aria-label="locale === 'ru' ? 'Экран приложения' : 'App screen'" role="group">
            <button type="button" :aria-pressed="!secondaryScreen" @click="secondaryScreen = false">{{ activeItem.image_label || (locale === 'ru' ? 'Экран 1' : 'Screen 1') }}</button>
            <button type="button" :aria-pressed="secondaryScreen" @click="secondaryScreen = true">{{ activeItem.secondary_image_label || (locale === 'ru' ? 'Экран 2' : 'Screen 2') }}</button>
          </div>
          <p v-else>{{ String(activeIndex + 1).padStart(2, '0') }} / {{ String(items.length).padStart(2, '0') }}<span class="phone-process__caption-title"> — {{ activeItem.title }}</span></p>
          <p v-if="activeItem.media_caption">{{ activeItem.media_caption }}</p>
        </figcaption>
      </figure>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CaseLocale, PublicBuilderBlock } from '~/utils/caseBuilder'

const props = defineProps<{ block: PublicBuilderBlock; locale: CaseLocale }>()
const root = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const secondaryScreen = ref(false)
const items = computed<Record<string, any>[]>(() => props.block.content.items || [])
const activeItem = computed(() => items.value[activeIndex.value])
const accordionHeight = ref(0)
const panelHeights = ref<number[]>([])
const summary = computed(() => String(props.block.content.summary || '').trim())
const panelId = (index: number) => `phone-process-${props.block.id}-${index}`
const screenUrl = (item: Record<string, any>) => secondaryScreen.value && item.secondary_image_url ? item.secondary_image_url : item.image_url
const screenAlt = (item: Record<string, any>) => (secondaryScreen.value && item.secondary_image_url ? item.secondary_image_alt : item.image_alt) || item.title

let sizeObserver: ResizeObserver | null = null
let preloadObserver: IntersectionObserver | null = null

function selectStep(index: number) {
  activeIndex.value = index
}

function measureAccordion() {
  if (!root.value) return
  const triggers = [...root.value.querySelectorAll<HTMLElement>('.phone-process__trigger')]
  const panels = [...root.value.querySelectorAll<HTMLElement>('.phone-process__copy-inner')]
  // Closed panels remain measurable but are absent from reading/focus order.
  // Reserve enough space for the longest description, so switching never
  // pushes the rest of the section down or introduces an inner scrollbar.
  // Measure layout pixels: viewport bounds include the site's presentation zoom
  // and would apply that scale a second time when assigned as a CSS height.
  const headingsHeight = triggers.reduce((height, trigger) => height + trigger.offsetHeight, 0)
  panelHeights.value = panels.map(panel => panel.offsetHeight)
  const descriptionHeight = Math.max(0, ...panelHeights.value)
  accordionHeight.value = Math.ceil(headingsHeight + descriptionHeight + triggers.length)
}

async function observeAccordion() {
  await nextTick()
  sizeObserver?.disconnect()
  if (root.value) sizeObserver?.observe(root.value)
  root.value?.querySelectorAll('.phone-process__trigger, .phone-process__copy-inner').forEach(element => sizeObserver?.observe(element))
  measureAccordion()
}

watch(activeIndex, () => { secondaryScreen.value = false })
watch(() => props.block.id, () => { activeIndex.value = 0; secondaryScreen.value = false })
watch(items, () => {
  activeIndex.value = Math.min(activeIndex.value, Math.max(0, items.value.length - 1))
  void observeAccordion()
})

onMounted(() => {
  sizeObserver = new ResizeObserver(measureAccordion)
  void observeAccordion()
  // Warm the next screens only as the reader approaches this section.
  preloadObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return
    items.value.forEach(item => {
      for (const url of [item.image_url, item.secondary_image_url].filter(Boolean)) {
        const image = new Image()
        image.src = url
      }
    })
    preloadObserver?.disconnect()
  }, { rootMargin: '600px' })
  if (root.value) preloadObserver.observe(root.value)
})

onBeforeUnmount(() => {
  sizeObserver?.disconnect()
  preloadObserver?.disconnect()
})
</script>

<style scoped>
.phone-process { grid-column: 1 / -1; min-width: 0; container-type: inline-size; container-name: phone-process; }
.phone-process__layout {
  display: grid;
  grid-template-columns: var(--case-editorial-grid);
  column-gap: var(--case-editorial-gap);
  align-items: start;
}
.phone-process__steps {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
  min-height: var(--accordion-height, 0px);
  margin: 0;
  padding: 0;
  list-style: none;
}
.phone-process__steps > li { position: relative; }
.phone-process__step { min-width: 0; border-top: var(--case-rule); }
.phone-process__step h4 { margin: 0; }
.phone-process .phone-process__steps .phone-process__trigger {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr) 2.75rem;
  gap: 1rem;
  align-items: center;
  width: 100%;
  min-height: 3.75rem;
  padding: clamp(0.75rem, 1.5svh, 1rem) 0;
  border: 0;
  background: transparent;
  color: var(--case-v2-fg);
  text-align: left;
  font: 540 var(--case-type-disclosure)/1.28 var(--font-ui);
  letter-spacing: -0.022em;
  cursor: pointer;
}
.phone-process .phone-process__number { font: 650 var(--case-type-label)/1.35 var(--font-mono); letter-spacing: 0.09em; color: var(--case-v2-muted); }
.phone-process .is-active .phone-process__trigger { color: var(--case-v2-accent); }
.phone-process .is-active .phone-process__trigger > i span:last-child { transform: translate(-50%, -50%) rotate(0deg); }
.phone-process .phone-process__trigger:focus-visible > i { color: var(--case-v2-surface); }
@media (hover: hover) and (pointer: fine) {
  .phone-process .phone-process__trigger:hover { color: var(--case-v2-accent); }
  .phone-process .phone-process__trigger:hover > i { color: var(--case-v2-surface); }
}
.phone-process__copy {
  overflow: hidden;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  transition: height 280ms var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1)), opacity 180ms ease, visibility 0s 280ms;
}
.phone-process__copy-inner { width: 100%; box-sizing: border-box; padding: 0.25rem 0 1.25rem; }
.is-active .phone-process__copy { visibility: visible; opacity: 1; pointer-events: auto; transition-delay: 0s; }
.phone-process__copy p { max-width: 58ch; margin: 0; color: var(--case-v2-fg); font: 400 var(--case-type-lead)/1.58 var(--font-ui); letter-spacing: -0.012em; text-wrap: pretty; white-space: pre-line; }
.phone-process__preview {
  grid-column: 1;
  grid-row: 1;
  align-self: start;
  display: grid;
  justify-items: center;
  gap: 1rem;
  min-width: 0;
  margin: 0;
}
.phone-process__screen {
  display: block;
  /* Centre the phone in the heading column and keep the whole section compact. */
  width: min(90%, 308px, calc(40.5svh - 6.48rem));
  max-width: 100%;
  justify-self: center;
  border-radius: 1rem;
}
.phone-process__screen img,
.phone-process__screen video {
  display: block;
  width: 100%;
  height: auto;
  max-height: min(760px, calc(100svh - 16rem));
  object-fit: contain;
  border: var(--case-rule);
  border-radius: inherit;
}
.phone-process__empty { aspect-ratio: 9 / 20; display: grid; place-items: center; padding: 1rem; border: var(--case-rule); color: var(--case-v2-muted); text-align: center; font-size: var(--case-type-caption); }
.phone-process__caption { min-height: 3rem; width: 100%; text-align: center; color: var(--case-v2-muted); font: 500 var(--case-type-caption)/1.5 var(--font-ui); }
.phone-process__caption p { margin: 0; }
.phone-process__views { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; }
.phone-process__views button { min-height: 2.75rem; padding: 0.5rem 1rem; border: var(--case-rule); border-radius: 0.75rem; background: transparent; color: var(--case-v2-fg); font: inherit; cursor: pointer; }
.phone-process__views button[aria-pressed="true"] { background: var(--case-v2-accent-soft); border-color: var(--case-v2-accent); }
.phone-process :is(button, a):focus-visible { outline: 2px solid var(--case-v2-focus); outline-offset: 5px; }

@container phone-process (max-width: 959px) {
  .phone-process__layout { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: clamp(1.5rem, 5vw, 2rem); }
  .phone-process__steps, .phone-process__preview { width: 100%; }
  .phone-process__steps > li { display: block; border-top: var(--case-rule); }
  .phone-process__step { padding-bottom: 0; border: 0; }
  .phone-process .phone-process__steps .phone-process__trigger { grid-template-columns: 1.5rem minmax(0, 1fr) 2rem; gap: 0.5rem; }
  .phone-process .phone-process__trigger > i { width: 2rem; height: 2rem; transform: none; }
  .phone-process .phone-process__trigger > .phone-process__number { transform: none; }
  .phone-process__copy-inner { padding: 0 0 1rem; }
  .phone-process__preview { padding-bottom: 0; }
  .phone-process__screen { width: min(100%, 18rem); }
  .phone-process__screen img, .phone-process__screen video { max-height: none; }
}

@media (max-width: 760px) {
  /* The shared process layout moves mobile gutters from the parent to its
     children. Match the heading's gutter for this custom two-column body. */
  .phone-process__layout { padding-inline: var(--case-content-gutter); box-sizing: border-box; }
}

@container phone-process (max-width: 600px) {
  .phone-process .phone-process__steps .phone-process__trigger {
    grid-template-columns: minmax(0, 1fr) 1.75rem;
    gap: 0.25rem 0.375rem;
    min-height: 2.75rem;
    padding-block: 0.75rem;
  }
  .phone-process .phone-process__trigger > .phone-process__number { display: none; }
  .phone-process .phone-process__trigger > b { grid-column: 1; grid-row: 1; font-size: 0.875rem; line-height: 1.35; letter-spacing: -0.015em; overflow-wrap: anywhere; }
  .phone-process .phone-process__trigger > i { grid-column: 2; grid-row: 1; width: 1.75rem; height: 1.75rem; }
  .phone-process__copy-inner { padding: 0 0 1rem; }
  .phone-process__copy p { overflow-wrap: anywhere; }
  .phone-process__preview { gap: 0.5rem; }
  .phone-process__screen { border-radius: 0.625rem; }
  .phone-process__caption { min-height: 0; font-size: 0.75rem; }
  .phone-process__caption-title { display: none; }
  .phone-process__views { gap: 0.375rem; }
  .phone-process__views button { width: 100%; padding: 0.375rem 0.25rem; font-size: 0.75rem; line-height: 1.35; }
}

@media (prefers-reduced-motion: reduce) {
  .phone-process__copy { transition: opacity 100ms ease; }
  .phone-process .phone-process__trigger > i { color: var(--case-v2-surface); }
  .phone-process .phone-process__trigger > i span { transition: background-color 100ms ease; }
}
</style>
