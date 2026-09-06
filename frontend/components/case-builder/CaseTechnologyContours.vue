<template>
  <section ref="rootElement" class="technology-contours" :style="mapStyle" :aria-label="content.eyebrow || copy.label" :data-motion-instant="keyboardMode" @keydown.capture="keyboardMode = true" @pointerdown.capture="keyboardMode = false">
    <div ref="surfaceElement" class="technology-contours__surface" :class="{ 'is-measured': measurementReady }" :style="{ height: surfaceHeight === null ? undefined : `${surfaceHeight}px` }">
      <div ref="bodyElement" class="technology-contours__body">
        <header v-if="content.eyebrow || content.title || content.summary" class="technology-contours__intro">
          <small v-if="content.eyebrow">{{ content.eyebrow }}</small>
          <h3 v-if="content.title">{{ content.title }}</h3>
          <p v-if="content.summary">{{ content.summary }}</p>
        </header>
        <div v-if="nodes.length" class="technology-contours__layout">
          <div class="technology-contours__groups">
            <fieldset v-for="group in groups" :key="group.label" :class="{ 'is-selected': group.nodes.some(node => node.id === activeId) }">
              <legend>{{ group.label }}</legend>
              <div class="technology-contours__nodes">
                <button
                  v-for="node in group.nodes"
                  :key="node.id"
                  type="button"
                  class="technology-contours__pill"
                  :aria-label="node.label"
                  :aria-pressed="node.id === activeId"
                  :aria-controls="detailId"
                  :data-technology-id="node.id"
                  :title="node.label"
                  @click="selectTechnology(node.id, $event)"
                >
                  <CaseTechnologyIcon :name="node.icon" />
                  <span class="technology-contours__pill-copy">
                    <small v-if="node.category">{{ node.category }}</small>
                    <b>{{ node.label }}</b>
                  </span>
                </button>
              </div>
            </fieldset>
          </div>
          <aside :id="detailId" class="technology-contours__detail" aria-live="polite" aria-atomic="true">
            <Transition name="technology-copy" mode="out-in">
              <div v-if="active" :key="detailKey" class="technology-contours__detail-content">
                <div class="technology-contours__detail-heading">
                  <CaseTechnologyIcon :name="active.icon" />
                  <h4>{{ active.label }}</h4>
                </div>
                <p>{{ active.description || copy.emptyDescription }}</p>
                <div v-if="related.length" class="technology-contours__related">
                  <small>{{ copy.related }}</small>
                  <ul>
                    <li v-for="node in related" :key="node.id">
                      <button type="button" @click="selectTechnology(technologyId(node, nodes.indexOf(node)), $event, true)">{{ node.label }}<span aria-hidden="true">↗</span></button>
                    </li>
                  </ul>
                </div>
              </div>
            </Transition>
            <small class="technology-contours__hint">{{ copy.hint }}</small>
          </aside>
        </div>
        <p v-else class="technology-contours__empty">{{ copy.empty }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useId } from '#imports'
import CaseTechnologyIcon from './CaseTechnologyIcon.vue'
import { technologyMapStyle, type CaseBlockSettings, type CaseLocale } from '~/utils/caseBuilder'
import { relatedTechnologies, technologyGroups, technologyId, type CaseTechnology } from '~/utils/caseTechnologies'

const props = withDefaults(defineProps<{ content: Record<string, any>; settings: CaseBlockSettings; locale?: CaseLocale }>(), { locale: 'ru' })
const detailId = `technology-detail-${useId()}`
const selectedId = ref('')
const rootElement = ref<HTMLElement | null>(null)
const surfaceElement = ref<HTMLElement | null>(null)
const bodyElement = ref<HTMLElement | null>(null)
const surfaceHeight = ref<number | null>(null)
const measurementReady = ref(false)
const keyboardMode = ref(false)
let resizeObserver: ResizeObserver | null = null
let measurementFrame = 0
let lastWidth = 0
const nodes = computed<CaseTechnology[]>(() => Array.isArray(props.content.items) ? props.content.items : [])
const active = computed(() => nodes.value.find((node, index) => technologyId(node, index) === selectedId.value) || nodes.value[0])
const activeId = computed(() => active.value ? technologyId(active.value, nodes.value.indexOf(active.value)) : '')
const groups = computed(() => technologyGroups(nodes.value, copy.value.label))
const related = computed(() => active.value ? relatedTechnologies(nodes.value, active.value) : [])
const detailKey = computed(() => JSON.stringify([activeId.value, active.value?.label, active.value?.description, active.value?.icon, props.locale, related.value.map(node => [node.id, node.label])]))
const mapStyle = computed(() => technologyMapStyle(props.settings))
const copy = computed(() => props.locale === 'en'
  ? { label: 'Technologies', related: 'Related technologies', hint: 'Select a technology to see its role', empty: 'Add technologies in the case editor.', emptyDescription: 'This component is part of the project stack.' }
  : { label: 'Технологии', related: 'Связанные технологии', hint: 'Выберите технологию, чтобы узнать её роль', empty: 'Добавьте технологии в редакторе кейса.', emptyDescription: 'Этот компонент входит в стек проекта.' })

function selectTechnology(id: string, event: MouseEvent, fromRelated = false) {
  keyboardMode.value = event.detail === 0
  selectedId.value = id
  // Related links leave with the old copy. Preserve a useful keyboard focus target.
  if (fromRelated && keyboardMode.value) {
    const pill = Array.from(rootElement.value?.querySelectorAll<HTMLButtonElement>('[data-technology-id]') || [])
      .find(element => element.dataset.technologyId === id)
    pill?.focus({ preventScroll: true })
  }
}

function measureSurface() {
  const surface = surfaceElement.value
  const body = bodyElement.value
  if (!surface || !body) return
  // Use layout pixels: viewport bounds include ancestor scaling and CSS zoom,
  // which would otherwise be applied a second time to the shell's CSS height.
  const width = body.offsetWidth
  const style = getComputedStyle(surface)
  const height = Math.ceil(body.offsetHeight + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth))
  // Responsive reflow and the initial measurement should not animate from stale geometry.
  if (!lastWidth || Math.abs(lastWidth - width) > 1) {
    measurementReady.value = false
    cancelAnimationFrame(measurementFrame)
    measurementFrame = requestAnimationFrame(() => { measurementReady.value = true })
  }
  lastWidth = width
  surfaceHeight.value = height
}

onMounted(() => {
  // Observe the natural-height body, never the animated shell, to avoid resize loops.
  if (!('ResizeObserver' in window) || !bodyElement.value) return
  measureSurface()
  resizeObserver = new ResizeObserver(measureSurface)
  resizeObserver.observe(bodyElement.value)
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  cancelAnimationFrame(measurementFrame)
})
</script>

<style scoped>
.technology-contours {
  --technology-accent: var(--tech-map-accent);
  --technology-bg: var(--tech-map-background);
  --technology-fg: var(--tech-map-text);
  --technology-muted: color-mix(in srgb, var(--technology-fg) 68%, var(--technology-bg));
  --technology-rule: color-mix(in srgb, var(--technology-fg) 15%, var(--technology-bg));
  container: technology-contours / inline-size;
  color: var(--technology-fg);
  font-family: var(--font-ui);
  grid-column: 1 / -1;
  min-width: 0;
}
.technology-contours__surface {
  box-sizing: border-box;
  overflow: clip;
  padding: clamp(20px, 3cqw, 38px);
  border: 1px solid var(--technology-rule);
  border-radius: 24px;
  background:
    radial-gradient(ellipse at 5% 0%, color-mix(in srgb, #62d8e4 9%, transparent), transparent 46%),
    radial-gradient(ellipse at 62% 100%, color-mix(in srgb, var(--technology-accent) 9%, transparent), transparent 54%),
    var(--technology-bg);
}
.technology-contours__surface.is-measured {
  /* Content disclosure needs a real height change so following sections move with it. */
  transition: height 200ms var(--ease-out, cubic-bezier(.23, 1, .32, 1));
}
.technology-contours__body { display: flow-root; }
.technology-copy-enter-active {
  transition: opacity 180ms var(--ease-out, cubic-bezier(.23, 1, .32, 1)), transform 180ms var(--ease-out, cubic-bezier(.23, 1, .32, 1));
}
.technology-copy-leave-active {
  transition: opacity 100ms var(--ease-out, cubic-bezier(.23, 1, .32, 1)), transform 100ms var(--ease-out, cubic-bezier(.23, 1, .32, 1));
}
.technology-copy-enter-from,
.technology-copy-leave-to { opacity: 0; transform: translateY(8px); }
.technology-contours[data-motion-instant="true"] .technology-contours__surface,
.technology-contours[data-motion-instant="true"] .technology-contours__pill,
.technology-contours[data-motion-instant="true"] .technology-copy-enter-active,
.technology-contours[data-motion-instant="true"] .technology-copy-leave-active,
.technology-contours[data-motion-instant="true"] fieldset { transition: none; }
.technology-contours[data-motion-instant="true"] .technology-copy-enter-from,
.technology-contours[data-motion-instant="true"] .technology-copy-leave-to { opacity: 1; transform: none; }
.technology-contours__intro { max-width: 780px; margin-bottom: 30px; }
.technology-contours__intro > small { display: block; margin-bottom: 12px; font-size: 11px; font-weight: 600; color: var(--technology-muted); }
.technology-contours__intro h3 { margin: 0; font-size: clamp(22px, 2.5cqw, 30px); font-weight: 550; line-height: 1.2; letter-spacing: -.03em; text-wrap: balance; }
.technology-contours__intro p { margin: 14px 0 0; max-width: 72ch; font-size: 14px; line-height: 1.65; color: var(--technology-muted); }
.technology-contours__layout { display: grid; grid-template-columns: minmax(0, 2fr) minmax(220px, 1fr); gap: clamp(24px, 3.5cqw, 44px); align-items: start; }
.technology-contours__groups { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.technology-contours fieldset { margin: 0; min-width: 0; padding: 18px 14px 16px; border: 1px solid var(--technology-rule); border-radius: 20px; transition: border-color var(--motion-fast, 160ms) ease; }
.technology-contours fieldset.is-selected { border-color: color-mix(in srgb, var(--technology-accent) 65%, var(--technology-rule)); }
.technology-contours legend { max-width: calc(100% - 12px); padding: 0 7px; margin-left: 2px; color: var(--technology-muted); font-size: 12px; font-weight: 550; line-height: 1.4; }
.technology-contours__nodes { display: grid; gap: 10px; }
.technology-contours__pill {
  width: 100%;
  min-width: 0;
  min-height: 62px;
  padding: 10px 14px 10px 10px;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  border: 1px solid var(--technology-rule);
  border-radius: 999px;
  background: color-mix(in srgb, var(--technology-bg) 88%, var(--technology-fg) 2%);
  color: var(--technology-fg);
  text-align: left;
  cursor: pointer;
  transition: border-color var(--motion-fast, 160ms) ease, background-color var(--motion-fast, 160ms) ease;
}
.technology-contours__pill-copy { min-width: 0; display: grid; gap: 4px; }
.technology-contours__pill small { color: var(--technology-muted); font-size: 9px; line-height: 1.2; font-weight: 500; }
.technology-contours__pill b { font-size: 14px; line-height: 1.2; font-weight: 620; letter-spacing: -.02em; overflow-wrap: anywhere; }
.technology-contours__pill[aria-pressed="true"] { border-color: var(--technology-accent); background: color-mix(in srgb, var(--technology-accent) 11%, var(--technology-bg)); }
.technology-contours button:focus-visible { outline: 2px solid var(--technology-accent); outline-offset: 4px; }
.technology-contours__detail { padding: 10px 0 0; min-width: 0; display: flex; flex-direction: column; align-self: stretch; }
.technology-contours__detail-heading { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 14px; align-items: center; margin-bottom: 20px; --technology-icon-size: 48px; }
.technology-contours__detail-heading h4 { margin: 0; font-size: 21px; line-height: 24px; font-weight: 550; letter-spacing: -.025em; overflow-wrap: anywhere; }
.technology-contours__detail p { font-size: 14px; line-height: 1.7; margin: 0; color: var(--technology-muted); white-space: pre-line; }
.technology-contours__related { border-top: 1px solid var(--technology-rule); margin-top: 24px; padding-top: 20px; }
.technology-contours__related > small { color: var(--technology-muted); font-size: 11px; }
.technology-contours__related ul { list-style: none; margin: 8px 0 0; padding: 0; }
.technology-contours__related button { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; min-height: 40px; padding: 7px 0; border: 0; background: transparent; color: var(--technology-fg); font: 550 13px/1.4 var(--font-ui); cursor: pointer; text-align: left; }
.technology-contours__related button > span { color: var(--technology-accent); }
.technology-contours__hint { display: block; padding-top: 28px; margin-top: auto; font-size: 11px; line-height: 1.5; color: var(--technology-muted); }
.technology-contours__empty { color: var(--technology-muted); }
@media (hover: hover) and (pointer: fine) {
  .technology-contours__pill:hover { border-color: var(--technology-accent); }
  .technology-contours__related button:hover { color: var(--technology-accent); }
}
@media (prefers-reduced-motion: reduce) {
  .technology-contours__surface.is-measured { transition: none; }
  .technology-contours:not([data-motion-instant="true"]) .technology-copy-enter-active,
  .technology-contours:not([data-motion-instant="true"]) .technology-copy-leave-active {
    transition: opacity 100ms ease;
    /* Retain only the gentle fade over the case-wide near-zero duration reset. */
    transition-duration: 100ms !important;
  }
  .technology-copy-enter-from,
  .technology-copy-leave-to { transform: none; }
}
:global(.case-page[data-theme="dark"] .technology-contours) {
  --technology-bg: var(--case-v2-surface);
  --technology-fg: var(--case-v2-fg);
  --technology-accent: var(--case-v2-accent);
}
@container technology-contours (max-width: 900px) {
  .technology-contours__surface { padding: 24px; }
  .technology-contours__layout { grid-template-columns: minmax(0, 2fr) minmax(190px, 1fr); gap: 24px; }
  .technology-contours__groups { gap: 14px; }
  .technology-contours fieldset { padding: 12px 8px; }
  .technology-contours__pill { grid-template-columns: 30px minmax(0, 1fr); padding: 8px; gap: 7px; --technology-icon-size: 30px; }
  .technology-contours__pill b { font-size: 12px; }
  .technology-contours__detail-heading { gap: 10px; }
  .technology-contours__detail-heading h4 { font-size: 18px; }
}
@container technology-contours (max-width: 680px) {
  .technology-contours__layout {
    grid-template-columns: minmax(0, 1fr) minmax(128px, .72fr);
    gap: 18px;
  }
  .technology-contours__groups { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .technology-contours__detail {
    align-self: stretch;
    padding: 2px 0 0 18px;
    border-left: 1px solid var(--technology-rule);
  }
  .technology-contours__hint { margin-top: 0; }
  .technology-contours__detail-heading {
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 9px;
    margin-bottom: 14px;
    --technology-icon-size: 36px;
  }
  .technology-contours__detail-heading h4 { font-size: 16px; line-height: 1.25; }
  .technology-contours__detail p { font-size: 12px; line-height: 1.6; }
  .technology-contours__related { margin-top: 18px; padding-top: 14px; }
  .technology-contours__related button { min-height: 44px; font-size: 12px; }
  .technology-contours__pill { grid-template-columns: 34px minmax(0, 1fr); --technology-icon-size: 34px; padding: 9px; }
  .technology-contours__pill b { font-size: 13px; }
}
@container technology-contours (max-width: 430px) {
  .technology-contours__surface { padding: 20px 16px; border-radius: 20px; }
  .technology-contours__layout {
    grid-template-columns: minmax(112px, .78fr) minmax(0, 1.22fr);
    gap: 12px;
  }
  .technology-contours fieldset { padding: 10px 6px; border-radius: 16px; }
  .technology-contours legend { padding: 0 5px; font-size: 10px; }
  .technology-contours__nodes { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
  .technology-contours__pill {
    min-height: 0;
    aspect-ratio: 1;
    grid-template-columns: minmax(0, 1fr);
    place-items: center;
    padding: 7px;
    border-radius: 50%;
    --technology-icon-size: 28px;
  }
  .technology-contours__pill-copy { display: none; }
  .technology-contours__detail { padding-left: 12px; }
  .technology-contours__detail-heading {
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 7px;
    --technology-icon-size: 28px;
  }
  .technology-contours__detail-heading h4 { font-size: 14px; }
  .technology-contours__detail p { font-size: 11px; line-height: 1.55; }
  .technology-contours__hint { padding-top: 18px; font-size: 9px; }
  .technology-contours__intro { margin-bottom: 24px; }
}
</style>
