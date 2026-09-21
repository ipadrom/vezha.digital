<template>
  <Teleport to="body">
    <div class="site-mobile-menu-layer" :data-theme="theme" @keydown.esc.stop.prevent="emit('close')">
      <div class="site-mobile-menu-backdrop" aria-hidden="true" @click="emit('close')"></div>
      <section ref="panel" :id="id" class="site-mobile-menu" :data-variant="brandVariant" role="dialog" aria-modal="true" :aria-label="ru ? 'Меню сайта' : 'Site menu'" @keydown.tab="trapFocus">
        <header>
          <SiteBrand class="site-mobile-menu-logo" :theme="theme" @click="emit('close')" />
          <div class="site-mobile-menu-controls">
            <button type="button" :aria-label="ru ? 'Сменить тему' : 'Change theme'" @click="emit('toggle-theme')">
              <SiteThemeIcon :theme="theme" />
            </button>
            <button ref="closeButton" type="button" :aria-label="ru ? 'Закрыть меню' : 'Close menu'" @click="emit('close')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg></button>
          </div>
        </header>
        <nav :aria-label="ru ? 'Основная навигация' : 'Main navigation'">
          <NuxtLink v-for="link in links" :key="link.href" :to="link.href" @click="emit('close')">{{ link.label }}</NuxtLink>
        </nav>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import SiteBrand from './SiteBrand.vue';
import SiteThemeIcon from './SiteThemeIcon.vue';
const props = defineProps<{ theme: 'light' | 'dark'; locale: 'ru' | 'en'; id?: string; brandVariant?: 'case' }>();
const emit = defineEmits<{ close: []; 'toggle-theme': [] }>();
const ru = computed(() => props.locale === 'ru');
const links = computed(() => [
  { href: '/#cases', label: ru.value ? 'Кейсы' : 'Cases' },
  { href: '/#services', label: ru.value ? 'Услуги' : 'Services' },
  { href: '/#about', label: ru.value ? 'О нас' : 'About' },
  { href: '/#contacts', label: ru.value ? 'Контакты' : 'Contacts' },
]);
const panel = ref<HTMLElement | null>(null);
const closeButton = ref<HTMLButtonElement | null>(null);
let opener: HTMLElement | null = null;
let viewport: MediaQueryList | null = null;
function closeOnDesktop(event: MediaQueryListEvent) { if (event.matches) emit('close'); }
function trapFocus(event: KeyboardEvent) {
  const controls = panel.value?.querySelectorAll<HTMLElement>('a[href], button');
  if (!controls?.length) return;
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
onMounted(() => {
  // Touch browsers may leave focus on body when the menu button is tapped.
  opener = (props.id
    ? document.querySelector<HTMLElement>(`button[aria-controls="${CSS.escape(props.id)}"]`)
    : null) || document.activeElement as HTMLElement;
  closeButton.value?.focus({ preventScroll: true });
  viewport = window.matchMedia('(min-width: 901px)');
  viewport.addEventListener('change', closeOnDesktop);
});
onBeforeUnmount(() => {
  viewport?.removeEventListener('change', closeOnDesktop);
  nextTick(() => {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
});
</script>

<style scoped>
.site-mobile-menu-layer { position: fixed; inset: 0; z-index: 1200; color: #202127; font-family: var(--font-ui, sans-serif); --menu-bg: rgb(255 255 255 / 72%); --menu-rule: #ececef; }
.site-mobile-menu-layer[data-theme="dark"] { color: #f2f3f7; --menu-bg: rgb(14 15 18 / 66%); --menu-rule: #26282d; }
.site-mobile-menu-backdrop { position: absolute; inset: 0; }
.site-mobile-menu { position: relative; margin: 10px 20px 0; padding: 0 8px 14px 16px; overflow: auto; max-height: calc(100dvh - 24px); border: 1px solid color-mix(in srgb, var(--menu-rule) 68%, white); border-radius: 30px; background: color-mix(in srgb, var(--menu-bg) 82%, transparent); box-shadow: 0 14px 42px rgb(34 38 54 / 10%); backdrop-filter: saturate(1.18) blur(18px); -webkit-backdrop-filter: saturate(1.18) blur(18px); }
.site-mobile-menu header { display: flex; align-items: center; justify-content: space-between; min-height: 58px; gap: 8px; }
.site-mobile-menu[data-variant="case"] { margin-top: calc(12px + env(safe-area-inset-top, 0px)); }
.site-mobile-menu-controls { display: flex; gap: 12px; }
.site-mobile-menu button { display: grid; place-items: center; width: 44px; height: 44px; padding: 0; border: 1px solid var(--menu-rule); box-sizing: border-box; border-radius: 50%; background: rgb(255 255 255 / 16%); color: inherit; cursor: pointer; }
.site-mobile-menu svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; }
.site-mobile-menu nav { padding-right: 8px; display: flex; flex-direction: column; animation: menu-in 180ms cubic-bezier(.23,1,.32,1); }
.site-mobile-menu nav a { display: flex; align-items: center; min-height: 56px; border-top: 1px solid var(--menu-rule); color: inherit; font-size: 17px; font-weight: 500; text-decoration: none; }
.site-mobile-menu nav a:first-child { border-top: 0; }
.site-mobile-menu :is(a, button):focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
@keyframes menu-in { from { opacity: .6; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .site-mobile-menu nav { animation: none; } }
</style>
