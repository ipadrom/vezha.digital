<template>
  <Teleport to="body">
    <div :data-visible="visible" :aria-hidden="visible ? undefined : true" :inert="visible ? undefined : true" class="site-mobile-menu-layer" :class="{ 'is-open': open }" :data-theme="theme" @keydown.esc.stop.prevent="closeMenu">
      <svg class="site-mobile-menu-filter" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <filter :id="`${id}-refraction`" x="-10%" y="-40%" width="120%" height="180%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="2" seed="8" result="glass-waves" />
            <feGaussianBlur in="glass-waves" stdDeviation="2" result="glass-map" />
            <feDisplacementMap in="SourceGraphic" in2="glass-map" scale="24" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div class="site-mobile-menu-glass" :style="{ '--menu-refraction': `url(#${id}-refraction)` }" aria-hidden="true"></div>
      <div v-show="open" class="site-mobile-menu-backdrop" aria-hidden="true" @click="closeMenu"></div>
      <section ref="panel" :id="id" class="site-mobile-menu" :class="{ 'is-open': open }" :role="open ? 'dialog' : undefined" :aria-modal="open ? true : undefined" :aria-label="ru ? 'Меню сайта' : 'Site menu'" @keydown.tab="trapFocus">
        <header>
          <SiteBrand class="site-mobile-menu-logo" :theme="theme" @click="open = false" />
          <div class="site-mobile-menu-controls">
            <button type="button" :aria-label="ru ? 'Сменить тему' : 'Change theme'" @click="emit('toggle-theme')"><SiteThemeIcon :theme="theme" /></button>
            <SiteMenuButton :label="open ? (ru ? 'Закрыть меню' : 'Close menu') : (ru ? 'Открыть меню' : 'Open menu')" :expanded="open" :controls="`${id}-links`" @activate="open = !open" />
          </div>
        </header>
        <nav v-show="open" :id="`${id}-links`" :aria-label="ru ? 'Основная навигация' : 'Main navigation'">
          <NuxtLink v-for="link in links" :key="link.href" :to="link.href" @click="open = false">{{ link.label }}</NuxtLink>
        </nav>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import SiteMenuButton from './SiteMenuButton.vue';
import SiteBrand from './SiteBrand.vue';
import SiteThemeIcon from './SiteThemeIcon.vue';
const props = withDefaults(defineProps<{ visible?: boolean; theme: 'light' | 'dark'; locale: 'ru' | 'en'; id: string }>(), { visible: true });
const emit = defineEmits<{ 'toggle-theme': [] }>();
const open = ref(false);
const ru = computed(() => props.locale === 'ru');
const links = computed(() => [
  { href: '/#cases', label: ru.value ? 'Кейсы' : 'Cases' },
  { href: '/#services', label: ru.value ? 'Услуги' : 'Services' },
  { href: '/#about', label: ru.value ? 'О нас' : 'About' },
  { href: '/#contacts', label: ru.value ? 'Контакты' : 'Contacts' },
]);
const panel = ref<HTMLElement | null>(null);
let viewport: MediaQueryList | null = null;
function closeMenu() {
  if (!open.value) return;
  open.value = false;
  panel.value?.querySelector<HTMLButtonElement>('.site-menu-button')?.focus({ preventScroll: true });
}
function closeOnDesktop(event: MediaQueryListEvent) { if (event.matches) open.value = false; }
function trapFocus(event: KeyboardEvent) {
  if (!open.value) return;
  const controls = panel.value?.querySelectorAll<HTMLElement>('a[href], button');
  if (!controls?.length) return;
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
watch(() => props.visible, (visible) => { if (!visible) open.value = false; });
onMounted(() => {
  viewport = window.matchMedia('(min-width: 901px)');
  viewport.addEventListener('change', closeOnDesktop);
});
onBeforeUnmount(() => viewport?.removeEventListener('change', closeOnDesktop));
</script>

<style scoped>
.site-mobile-menu-layer { position: fixed; inset: 0 0 auto; height: calc(98px + env(safe-area-inset-top, 0px)); z-index: 1200; pointer-events: none; color: #202127; font-family: var(--font-ui, sans-serif); --menu-bg: rgb(255 255 255 / 72%); --menu-rule: #ececef; }
/* Keep the same header geometry before loading and on the first menu tap.
   The dialog may extend below the band; only its click-away layer is full-screen. */
.site-mobile-menu-layer[data-visible="false"] { opacity: 0; }
.site-mobile-menu-layer { will-change: opacity; }
.site-mobile-menu-layer[data-theme="dark"] { color: #f2f3f7; --menu-bg: rgb(14 15 18 / 66%); --menu-rule: #26282d; }
.site-mobile-menu-filter { position: absolute; pointer-events: none; overflow: hidden; }
.site-mobile-menu-glass {
  position: absolute;
  inset: 0 0 auto;
  height: calc(98px + env(safe-area-inset-top, 0px));
  pointer-events: none;
  background: transparent;
  backdrop-filter: blur(14px) saturate(1.12);
  -webkit-backdrop-filter: blur(14px) saturate(1.12);
  mask-image: linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%);
}
@supports (backdrop-filter: url("#mobile-header-refraction")) {
  .site-mobile-menu-glass { backdrop-filter: var(--menu-refraction) blur(2px) saturate(1.12); }
}
.site-mobile-menu-backdrop { position: fixed; inset: 0; pointer-events: auto; }
.site-mobile-menu { position: relative; pointer-events: auto; margin: calc(10px + env(safe-area-inset-top, 0px)) 20px 0; padding: 0 8px 0 16px; overflow: auto; max-height: calc(100dvh - 24px - env(safe-area-inset-top, 0px)); border: 1px solid color-mix(in srgb, var(--menu-rule) 68%, white); border-radius: 30px; background: color-mix(in srgb, var(--menu-bg) 82%, transparent); box-shadow: 0 14px 42px rgb(34 38 54 / 10%); backdrop-filter: saturate(1.18) blur(18px); -webkit-backdrop-filter: saturate(1.18) blur(18px); }
.site-mobile-menu header { display: flex; align-items: center; justify-content: space-between; height: 58px; gap: 8px; }
.site-mobile-menu-controls { display: flex; gap: 12px; }
.site-mobile-menu button { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; padding: 0; border: 1px solid var(--menu-rule); box-sizing: border-box; border-radius: 50%; background: rgb(255 255 255 / 16%); color: inherit; cursor: pointer; }
.site-mobile-menu svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; }
.site-mobile-menu nav { padding: 0 8px 14px 0; display: flex; flex-direction: column; }
.site-mobile-menu nav a { display: flex; align-items: center; min-height: 56px; border-top: 1px solid var(--menu-rule); color: inherit; font-size: 17px; font-weight: 500; text-decoration: none; }
.site-mobile-menu nav a:first-child { border-top: 0; }
.site-mobile-menu :is(a, button):focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
@media (min-width: 901px) { .site-mobile-menu-layer { display: none !important; } }
</style>
