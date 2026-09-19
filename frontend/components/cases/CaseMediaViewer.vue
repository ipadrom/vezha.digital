<template>
  <div ref="root" class="case-media-surface" @click.capture="openFromEvent" @keydown="openFromKeyboard">
    <slot />
  </div>
  <Teleport to="body">
    <dialog ref="dialog" class="case-media-viewer" :aria-label="locale === 'ru' ? 'Просмотр медиа' : 'Media viewer'" @cancel.prevent="close" @click="onBackdrop" @keydown="navigate" @touchstart.passive="touchStart" @touchend.passive="touchEnd">
      <button class="case-media-viewer__close" type="button" :aria-label="locale === 'ru' ? 'Закрыть' : 'Close'" @click="close">✕</button>
      <figure v-if="active">
        <video v-if="active.video" :key="active.src" :src="active.src" :poster="active.poster" controls playsinline preload="metadata" />
        <img v-else :src="active.src" :alt="active.alt" />
        <figcaption v-if="active.alt">{{ active.alt }}</figcaption>
      </figure>
      <nav v-if="items.length > 1" :aria-label="locale === 'ru' ? 'Медиа кейса' : 'Case media'">
        <button type="button" :aria-label="locale === 'ru' ? 'Предыдущее' : 'Previous'" @click="move(-1)">←</button>
        <span aria-live="polite">{{ index + 1 }} / {{ items.length }}</span>
        <button type="button" :aria-label="locale === 'ru' ? 'Следующее' : 'Next'" @click="move(1)">→</button>
      </nav>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ locale: 'ru' | 'en' }>()
const root = ref<HTMLElement | null>(null)
const dialog = ref<HTMLDialogElement | null>(null)
const items = ref<Array<{ src: string; alt: string; video: boolean; poster?: string }>>([])
const index = ref(0)
const active = computed(() => items.value[index.value])
const { lockScroll, unlockScroll } = useBlockScroll()
let observer: MutationObserver | undefined
let opener: HTMLElement | null = null
let locked = false
let touchX = 0
let touchY = 0
let swipeAllowed = false
const selector = 'figure img, figure video, .builder-process__media img, .builder-process__media video, .phone-process img, .phone-process video, .case-gallery img, .case-gallery video, .case-visual > img, .freeform-stage img, .freeform-stage video'
function mediaElements() {
  return Array.from(root.value?.querySelectorAll<HTMLImageElement | HTMLVideoElement>(selector) || []).filter(el => {
    const link = el.closest('a')
    return !el.closest('.builder-related-card, .builder-hero__mark, [aria-hidden="true"]') && (!link || link.href === el.src || link.href === el.currentSrc) && Boolean(el.currentSrc || el.src || el.querySelector('source')?.src)
  })
}
function enhance() {
  for (const el of mediaElements()) {
    el.classList.add('case-media-expandable')
    if (!(el instanceof HTMLVideoElement && el.controls) && !el.closest('a, button') && !el.hasAttribute('data-media-enhanced')) {
      el.setAttribute('data-media-enhanced', 'true')
      el.tabIndex = 0
      el.setAttribute('role', 'button')
      el.setAttribute('aria-label', `${props.locale === 'ru' ? 'Открыть медиа' : 'Open media'}: ${el.getAttribute('alt') || el.getAttribute('aria-label') || ''}`.replace(/(Открыть медиа: |Open media: )+/g, '$1'))
    }
  }
}
function open(el: HTMLImageElement | HTMLVideoElement) {
  const elements = mediaElements().filter(item => item.getClientRects().length > 0)
  const position = elements.indexOf(el)
  if (position < 0) return
  items.value = elements.map(item => ({ src: item.currentSrc || item.src || item.querySelector('source')?.src || '', alt: item.getAttribute('alt') || item.closest('figure')?.querySelector('figcaption')?.textContent || '', video: item instanceof HTMLVideoElement, poster: item instanceof HTMLVideoElement ? item.poster : undefined }))
  index.value = position
  opener = el.closest('a') || el
  if (el instanceof HTMLVideoElement) el.pause()
  lockScroll()
  locked = true
  dialog.value?.showModal()
}
function openFromEvent(event: MouseEvent) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return
  const target = event.target
  const el = target instanceof HTMLAnchorElement ? target.querySelector("img, video") : target
  if (!(el instanceof HTMLImageElement || el instanceof HTMLVideoElement) || !mediaElements().includes(el)) return
  event.preventDefault()
  event.stopPropagation()
  open(el)
}
function openFromKeyboard(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  const el = event.target
  if (!(el instanceof HTMLImageElement || el instanceof HTMLVideoElement) || !el.classList.contains('case-media-expandable')) return
  event.preventDefault()
  open(el)
}
function close() {
  dialog.value?.querySelector('video')?.pause()
  dialog.value?.close()
  items.value = []
  if (locked) unlockScroll()
  locked = false
  opener?.focus({ preventScroll: true })
}
function onBackdrop(event: MouseEvent) { if (event.target === dialog.value) close() }
function move(direction: number) { index.value = (index.value + direction + items.value.length) % items.value.length }
function navigate(event: KeyboardEvent) {
  if (event.target instanceof HTMLVideoElement) return
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1) }
}
function touchStart(event: TouchEvent) { swipeAllowed = event.target instanceof HTMLImageElement; touchX = event.changedTouches[0].clientX; touchY = event.changedTouches[0].clientY }
function touchEnd(event: TouchEvent) { const dx = event.changedTouches[0].clientX - touchX; const dy = event.changedTouches[0].clientY - touchY; if (swipeAllowed && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1) }
onMounted(() => { enhance(); observer = new MutationObserver(enhance); if (root.value) observer.observe(root.value, { childList: true, subtree: true }); })
onBeforeUnmount(() => { observer?.disconnect(); if (locked) unlockScroll(); dialog.value?.close() })
</script>

<style>
.case-media-expandable { cursor: zoom-in; }
.case-media-expandable:focus-visible { outline: 2px solid currentColor; outline-offset: 5px; }
.case-media-viewer { position: fixed; inset: 0; width: 100%; max-width: none; height: 100%; max-height: none; margin: 0; padding: max(64px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(76px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left)); border: 0; background: rgb(10 12 17 / 96%); color: #fff; }
.case-media-viewer[open] { display: grid; place-items: center; }
.case-media-viewer::backdrop { background: rgb(10 12 17 / 85%); }
.case-media-viewer figure { display: flex; flex-direction: column; align-items: center; min-height: 0; max-height: 100%; max-width: 100%; margin: 0; pointer-events: none; }
.case-media-viewer img, .case-media-viewer video { display: block; max-width: 100%; max-height: calc(100dvh - 180px - env(safe-area-inset-top) - env(safe-area-inset-bottom)); object-fit: contain; pointer-events: auto; }
.case-media-viewer figcaption { margin-top: 12px; max-width: 70ch; font-size: 14px; text-align: center; overflow: auto; pointer-events: auto; }
.case-media-viewer button { min-width: 44px; min-height: 44px; color: inherit; background: transparent; border: 1px solid rgb(255 255 255 / 30%); border-radius: 50%; cursor: pointer; }
.case-media-viewer button:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }
.case-media-viewer__close { position: absolute; top: max(12px, env(safe-area-inset-top)); right: max(16px, env(safe-area-inset-right)); }
.case-media-viewer nav { position: absolute; bottom: max(16px, env(safe-area-inset-bottom)); display: flex; gap: 20px; align-items: center; font-variant-numeric: tabular-nums; }
</style>
