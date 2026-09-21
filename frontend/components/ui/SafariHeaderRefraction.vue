<template>
  <div v-if="webkit" v-show="active !== false" ref="lens" class="safari-header-refraction" aria-hidden="true" inert>
    <svg width="0" height="0" class="safari-header-refraction__filter" aria-hidden="true">
      <defs>
        <filter :id="filterId" x="-10%" y="-40%" width="120%" height="180%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="2" seed="8" result="waves" />
          <feGaussianBlur in="waves" stdDeviation="2" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="24" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
    <div class="safari-header-refraction__effect" :style="{ filter: `url(#${filterId}) blur(2px)` }">
      <div ref="surface" class="safari-header-refraction__surface"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// WebKit cannot refract the live backdrop with an SVG reference filter. Render
// an inert, clipped copy of the visible content through a regular SVG filter.
const props = defineProps<{ id: string; active?: boolean }>()
const filterId = `${props.id}-snapshot-refraction`
const webkit = ref(false)
const lens = ref<HTMLElement | null>(null)
const surface = ref<HTMLElement | null>(null)
let frame = 0
let dirty = true
let snapshotId = 0
let observer: MutationObserver | null = null
let resizeObserver: ResizeObserver | null = null
let media: MediaQueryList | null = null
const copies = new Map<HTMLElement, { copy: HTMLElement; tracked: Array<[HTMLElement, HTMLElement]> }>()
const sourceSelector = '.case-page .builder-block, .vz-min > section, .vz-min > footer'
const skipSelector = 'script, iframe, .vz-hero__negative, .vz-section-liquid, [data-negative-clone], .site-mobile-menu-layer'

function snapshot(source: HTMLElement) {
  const copy = source.cloneNode(true) as HTMLElement
  const originals = [source, ...source.querySelectorAll<HTMLElement>('*')]
  const clones = [copy, ...copy.querySelectorAll<HTMLElement>('*')]
  const tracked: Array<[HTMLElement, HTMLElement]> = []
  const ids = new Map<string, string>()
  const sequence = ++snapshotId
  for (let i = 0; i < originals.length; i++) {
    const original = originals[i], clone = clones[i]
    if (original.id) ids.set(original.id, `${filterId}-${sequence}-${i}`)
    const style = getComputedStyle(original)
    for (const property of style) clone.style.setProperty(property, style.getPropertyValue(property))
    clone.style.setProperty('animation', 'none', 'important')
    clone.style.setProperty('transition', 'none', 'important')
    clone.style.setProperty('pointer-events', 'none', 'important')
    clone.removeAttribute('autofocus')
    clone.removeAttribute('name')
    if (original.matches(skipSelector)) clone.style.setProperty('display', 'none', 'important')
    if (original instanceof HTMLCanvasElement && clone instanceof HTMLCanvasElement) {
      try { clone.getContext('2d')?.drawImage(original, 0, 0) } catch { /* Leave unavailable GPU frames transparent. */ }
    }
    if (clone instanceof HTMLVideoElement) {
      clone.removeAttribute('autoplay'); clone.preload = 'none'; clone.muted = true
    }
    if (original !== source && ['sticky', 'fixed'].includes(style.position)) {
      tracked.push([original, clone])
      // Sticky positioning in the clipped mirror must not stick a second time.
      clone.style.position = 'relative'
      clone.style.inset = 'auto'
    }
  }
  // Keep SVG references local and never duplicate live anchors or form IDs.
  for (const clone of clones) {
    if (clone.id) clone.id = ids.get(clone.id) || ''
    for (const attribute of [...clone.attributes]) {
      let value = attribute.value
      for (const [oldId, newId] of ids) {
        value = value.replaceAll(`url(#${oldId})`, `url(#${newId})`)
        if (['href', 'xlink:href'].includes(attribute.name) && value === `#${oldId}`) value = `#${newId}`
      }
      if (value !== attribute.value) clone.setAttribute(attribute.name, value)
    }
  }
  copy.inert = true
  copy.style.setProperty('position', 'absolute', 'important')
  copy.style.setProperty('margin', '0', 'important')
  copy.style.setProperty('transform', 'none', 'important')
  copy.style.setProperty('translate', 'none', 'important')
  copy.style.setProperty('visibility', 'visible', 'important')
  surface.value!.append(copy)
  return { copy, tracked }
}

function render() {
  frame = 0
  if (!lens.value || !surface.value) return
  if (props.active === false || !media?.matches || document.hidden) {
    surface.value.replaceChildren(); copies.clear(); return
  }
  const band = lens.value.getBoundingClientRect()
  const sources = [...document.querySelectorAll<HTMLElement>(sourceSelector)].filter(source => {
    if (source.closest('[data-negative-clone], .safari-header-refraction')) return false
    const rect = source.getBoundingClientRect()
    return rect.width > 0 && rect.bottom > band.top - 24 && rect.top < band.bottom + 24
  })
  for (const [source, entry] of copies) {
    if (dirty || !sources.includes(source)) { entry.copy.remove(); copies.delete(source) }
  }
  for (const source of sources) {
    let entry = copies.get(source)
    if (!entry) { entry = snapshot(source); copies.set(source, entry) }
    const rect = source.getBoundingClientRect()
    Object.assign(entry.copy.style, { left: `${rect.left - band.left}px`, top: `${rect.top - band.top}px`, width: `${rect.width}px`, height: `${rect.height}px` })
    // Align sticky children against their actual on-screen coordinates.
    for (const [original, clone] of entry.tracked) {
      clone.style.translate = 'none'
      const actual = original.getBoundingClientRect(), mirrored = clone.getBoundingClientRect()
      clone.style.translate = `${actual.left - mirrored.left}px ${actual.top - mirrored.top}px`
    }
  }
  dirty = false
}
function schedule() { if (!frame) frame = requestAnimationFrame(render) }
function invalidate() { dirty = true; schedule() }
function sourceLoaded(event: Event) {
  if (event.target instanceof Element && event.target.closest('#__nuxt')) invalidate()
}
watch(() => props.active, active => {
  if (active === false) { surface.value?.replaceChildren(); copies.clear() }
  invalidate()
})
onMounted(async () => {
  const ua = navigator.userAgent
  webkit.value = /AppleWebKit/.test(ua) && (!/Chrome|Chromium|Edg|OPR/.test(ua) || /iPhone|iPad|iPod/.test(ua))
  if (!webkit.value) return
  await nextTick()
  media = window.matchMedia('(max-width: 900px)')
  media.addEventListener('change', invalidate)
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', invalidate, { passive: true })
  window.visualViewport?.addEventListener('resize', invalidate, { passive: true })
  document.addEventListener('visibilitychange', invalidate)
  document.addEventListener('load', sourceLoaded, true)
  observer = new MutationObserver(records => {
    if (records.some(record => {
      const target = record.target instanceof Element ? record.target : record.target.parentElement
      return target?.closest('.case-page, .vz-min') && !target.closest('.safari-header-refraction, [data-negative-clone], .vz-section-liquid, .vz-hero__negative') && (record.type !== 'attributes' || ['data-theme', 'aria-expanded', 'data-active'].includes(record.attributeName || ''))
    })) invalidate()
  })
  const root = document.querySelector('#__nuxt')
  if (root) observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-theme', 'aria-expanded', 'data-active'] })
  resizeObserver = new ResizeObserver(invalidate)
  if (root) resizeObserver.observe(root)
  schedule()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect(); resizeObserver?.disconnect()
  media?.removeEventListener('change', invalidate)
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', invalidate)
  window.visualViewport?.removeEventListener('resize', invalidate)
  document.removeEventListener('visibilitychange', invalidate)
  document.removeEventListener('load', sourceLoaded, true)
  copies.clear()
})
</script>

<style scoped>
.safari-header-refraction { position: absolute; inset: 0 0 auto; height: calc(98px + env(safe-area-inset-top, 0px)); overflow: hidden; pointer-events: none; mask-image: linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%); }
.safari-header-refraction__filter { position: absolute; }
.safari-header-refraction__effect, .safari-header-refraction__surface { position: absolute; inset: 0; pointer-events: none; }
.safari-header-refraction__surface { overflow: hidden; }
@media (min-width: 901px) { .safari-header-refraction { display: none; } }
</style>
