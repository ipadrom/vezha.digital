<template>
  <Teleport to="body">
    <div class="site-mobile-menu-layer" :class="{ 'is-hidden': !shown }" :data-theme="theme" :aria-hidden="shown ? undefined : 'true'" :inert="shown ? undefined : true" @keydown.esc.stop.prevent="closeMenu">
      <div class="site-mobile-menu-glass" aria-hidden="true"></div>
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
const emit = defineEmits<{ 'toggle-theme': []; close: [] }>();
const open = ref(false);
// Closing hands the header back to the scroll state, which grants the usual grace period.
watch(open, (isOpen) => { if (!isOpen) emit('close'); });
// An open menu outranks the scroll state: it must not slide away under the finger.
const shown = computed(() => props.visible || open.value);
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
function closeOnOutsidePointer(event: PointerEvent) {
  if (!open.value) return;
  const target = event.target;
  if (target instanceof Node && panel.value?.contains(target)) return;
  event.preventDefault();
  event.stopPropagation();
  closeMenu();
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
onMounted(() => {
  viewport = window.matchMedia('(min-width: 901px)');
  viewport.addEventListener('change', closeOnDesktop);
  document.addEventListener('pointerdown', closeOnOutsidePointer, true);
});
onBeforeUnmount(() => {
  viewport?.removeEventListener('change', closeOnDesktop);
  document.removeEventListener('pointerdown', closeOnOutsidePointer, true);
});
</script>

<style scoped>
/* Stay content-sized. A full-viewport fixed layer makes iOS Safari inset the safe areas and paint them white. */
.site-mobile-menu-layer { position: fixed; top: 0; right: 0; left: 0; z-index: 1200; pointer-events: none; color: #202127; font-family: var(--font-ui, sans-serif); --menu-bg: rgb(247 248 250 / 72%); --menu-rule: #ececef; transition: transform 0.26s ease, opacity 0.2s ease, visibility 0.26s; }
.site-mobile-menu-layer.is-hidden { transform: translateY(calc(-100% - 24px)); opacity: 0; visibility: hidden; pointer-events: none; }
.site-mobile-menu-layer[data-theme="dark"] { color: #f2f3f7; --menu-bg: rgb(20 21 24 / 66%); --menu-rule: #26282d; }
.site-mobile-menu-glass {
  position: absolute;
  /* Blur the status bar strip too, instead of leaving the page's flat fill there. */
  top: 0;
  right: 0;
  left: 0;
  height: calc(88px + env(safe-area-inset-top, 0px));
  pointer-events: none;
  background: transparent;
  backdrop-filter: blur(14px) saturate(1.12);
  -webkit-backdrop-filter: blur(14px) saturate(1.12);
  mask-image: linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%);
}
.site-mobile-menu { position: relative; pointer-events: auto; margin: calc(10px + env(safe-area-inset-top, 0px)) 20px 0; padding: 0 8px 0 16px; overflow: auto; max-height: calc(100svh - 24px - env(safe-area-inset-top, 0px)); border: 1px solid color-mix(in srgb, var(--menu-rule) 68%, white); border-radius: 30px; background: var(--menu-bg); box-shadow: 0 14px 42px rgb(34 38 54 / 10%); backdrop-filter: saturate(1.18) blur(18px); -webkit-backdrop-filter: saturate(1.18) blur(18px); }
.site-mobile-menu header { display: flex; align-items: center; justify-content: space-between; height: 58px; gap: 8px; }
.site-mobile-menu-controls { display: flex; gap: 12px; }
.site-mobile-menu button { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; padding: 0; border: 1px solid var(--menu-rule); box-sizing: border-box; border-radius: 50%; background: rgb(255 255 255 / 16%); color: inherit; cursor: pointer; }
.site-mobile-menu svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; }
.site-mobile-menu nav { padding: 0 8px 14px 0; display: flex; flex-direction: column; }
.site-mobile-menu nav a { display: flex; align-items: center; min-height: 56px; border-top: 1px solid var(--menu-rule); color: inherit; font-size: 17px; font-weight: 500; text-decoration: none; }
.site-mobile-menu nav a:first-child { border-top: 0; }
.site-mobile-menu :is(a, button):focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .site-mobile-menu-layer { transition: none; } }
@media (min-width: 901px) { .site-mobile-menu-layer { display: none !important; } }
</style>
