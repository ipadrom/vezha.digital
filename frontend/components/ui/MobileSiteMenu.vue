<template>
  <Teleport to="body">
    <div class="site-mobile-menu-layer" :class="{ 'is-hidden': !shown }" :data-theme="theme" :aria-hidden="shown ? undefined : 'true'" :inert="shown ? undefined : true" @keydown.esc.stop.prevent="closeMenu()">
      <div class="site-mobile-menu-glass" aria-hidden="true"><span></span></div>
      <section ref="panel" :id="id" class="site-mobile-menu" :class="{ 'is-open': open }" :role="open ? 'dialog' : undefined" :aria-modal="open ? true : undefined" :aria-label="ru ? 'Меню сайта' : 'Site menu'" @keydown.tab="trapFocus">
        <header>
          <SiteBrand class="site-mobile-menu-logo" :theme="theme" @click="open = false" />
          <div class="site-mobile-menu-controls">
            <button type="button" :aria-label="ru ? 'Сменить тему' : 'Change theme'" @click="emit('toggle-theme')"><SiteThemeIcon :theme="theme" /></button>
            <SiteMenuButton :label="open ? (ru ? 'Закрыть меню' : 'Close menu') : (ru ? 'Открыть меню' : 'Open menu')" :expanded="open" :controls="`${id}-links`" @activate="open = !open" />
          </div>
        </header>
        <div v-show="open" :id="`${id}-links`" class="site-mobile-menu-body">
          <template v-if="view === 'links'">
            <nav :aria-label="ru ? 'Основная навигация' : 'Main navigation'">
              <NuxtLink v-for="link in links" :key="link.href" :to="link.href" @click="open = false">{{ link.label }}</NuxtLink>
            </nav>
            <button ref="ctaButton" type="button" class="site-mobile-menu-cta" @click="showView('contacts', $event)">
              {{ ru ? 'Обсудить проект' : 'Discuss a project' }}<span aria-hidden="true">→</span>
            </button>
          </template>
          <div v-else class="site-mobile-menu-contacts" role="group" :aria-label="ru ? 'Контакты' : 'Contacts'">
            <div class="site-mobile-menu-contacts-head">
              <button ref="backButton" type="button" class="site-mobile-menu-back" :aria-label="ru ? 'Назад к меню' : 'Back to menu'" @click="showView('links', $event)">
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M9 5 4 10l5 5M4 10h12" /></svg>
              </button>
              <p>{{ ru ? 'Как удобнее связаться?' : 'How would you like to reach us?' }}</p>
            </div>
            <a class="site-mobile-menu-contact" :href="contactTelegram.url" target="_blank" rel="noopener noreferrer">
              <i aria-hidden="true"><svg class="is-filled" viewBox="0 0 24 24"><path d="M21.4 3.6c.3-1.2-.5-1.7-1.4-1.3L2.5 9c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4L17.3 5.3c.5-.3.9-.1.5.3l-8.5 7.7-.3 4.7c.5 0 .7-.2 1-.5l2.2-2.1 4.6 3.4c.9.5 1.5.3 1.7-.8L21.4 3.6Z" /></svg></i>
              <span><b>Telegram</b><small>{{ contactTelegram.handle }}</small></span>
            </a>
            <button type="button" class="site-mobile-menu-contact" :aria-label="ru ? `Скопировать почту ${contactEmail}` : `Copy email ${contactEmail}`" @click="copyValue('email', contactEmail)">
              <i aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg></i>
              <span><b>{{ ru ? 'Почта' : 'Email' }}</b><small>{{ copiedKey === 'email' ? copiedLabel : contactEmail }}</small></span>
            </button>
            <button type="button" class="site-mobile-menu-contact" :aria-label="ru ? `Скопировать телефон ${contactPhone}` : `Copy phone ${contactPhone}`" @click="copyValue('phone', contactPhone)">
              <i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg></i>
              <span><b>{{ ru ? 'Телефон' : 'Phone' }}</b><small>{{ copiedKey === 'phone' ? copiedLabel : contactPhone }}</small></span>
            </button>
            <p class="site-mobile-menu-status" role="status" aria-live="polite">{{ copiedKey ? copiedLabel : '' }}</p>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import SiteMenuButton from './SiteMenuButton.vue';
import SiteBrand from './SiteBrand.vue';
import SiteThemeIcon from './SiteThemeIcon.vue';
import { contactPhone, contactTelegram, defaultContactEmail, useContactCopy } from '~/composables/useContactCopy';
const props = withDefaults(defineProps<{ visible?: boolean; theme: 'light' | 'dark'; locale: 'ru' | 'en'; id: string; contactEmail?: string }>(), { visible: true, contactEmail: defaultContactEmail });
const emit = defineEmits<{ 'toggle-theme': []; close: [] }>();
const open = ref(false);
// The panel shows either the links or the contacts; every close starts over at the links.
const view = ref<'links' | 'contacts'>('links');
const ctaButton = ref<HTMLButtonElement | null>(null);
const backButton = ref<HTMLButtonElement | null>(null);
const { copiedKey, copyValue } = useContactCopy();
// Closing hands the header back to the scroll state, which grants the usual grace period.
watch(open, (isOpen) => { if (!isOpen) { emit('close'); view.value = 'links'; } });
// An open menu outranks the scroll state: it must not slide away under the finger.
const shown = computed(() => props.visible || open.value);
const ru = computed(() => props.locale === 'ru');
const copiedLabel = computed(() => ru.value ? 'Скопировано' : 'Copied');
// Focus follows the switch only for keyboard activation (detail 0): after a tap Safari would draw its focus ring.
async function showView(next: 'links' | 'contacts', event: MouseEvent) {
  view.value = next;
  if (event.detail !== 0) return;
  await nextTick();
  (next === 'contacts' ? backButton.value : ctaButton.value)?.focus();
}
const links = computed(() => [
  { href: '/#services', label: ru.value ? 'Услуги' : 'Services' },
  { href: '/#cases', label: ru.value ? 'Кейсы' : 'Cases' },
  { href: '/#about', label: ru.value ? 'Кто мы' : 'About' },
  { href: '/#stack', label: ru.value ? 'Стек' : 'Stack' },
  { href: '/#clients', label: ru.value ? 'Клиенты' : 'Clients' },
  { href: '/#contacts', label: ru.value ? 'Контакты' : 'Contacts' },
]);
const panel = ref<HTMLElement | null>(null);
let viewport: MediaQueryList | null = null;
// Only a keyboard close hands focus back to the toggle: after a tap Safari would draw its focus ring.
function closeMenu(restoreFocus = true) {
  if (!open.value) return;
  open.value = false;
  if (restoreFocus) panel.value?.querySelector<HTMLButtonElement>('.site-menu-button')?.focus({ preventScroll: true });
}
function closeOnOutsidePointer(event: PointerEvent) {
  if (!open.value) return;
  const target = event.target;
  if (target instanceof Node && panel.value?.contains(target)) return;
  event.preventDefault();
  event.stopPropagation();
  closeMenu(false);
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
/* iOS Safari tints the status bar from the fixed box it hit-tests just inside the top edge (WebKit fixedContainerEdges).
   A backdrop filter anywhere in that lineage yields no colour, so the bar falls back to the root background, white.
   The layer itself stays visibility: hidden, which makes WebKit skip it and sample the page; its children opt back in. */
.site-mobile-menu-layer { position: fixed; top: env(safe-area-inset-top, 0px); right: 0; left: 0; z-index: 1200; visibility: hidden; pointer-events: none; color: #202127; font-family: var(--font-ui, sans-serif); --menu-bg: rgb(247 248 250 / 72%); --menu-rule: #ececef; --menu-cta-bg: #1c1d21; --menu-cta-fg: #fff; transition: transform 0.26s ease, opacity 0.2s ease; }
.site-mobile-menu-layer > * { visibility: visible; transition: visibility 0.26s; }
.site-mobile-menu-layer.is-hidden { transform: translateY(calc(-100% - 24px - env(safe-area-inset-top, 0px))); opacity: 0; pointer-events: none; }
.site-mobile-menu-layer.is-hidden > * { visibility: hidden; }
.site-mobile-menu-layer[data-theme="dark"] { color: #f2f3f7; --menu-bg: rgb(20 21 24 / 66%); --menu-rule: #26282d; --menu-cta-bg: #f2f3f7; --menu-cta-fg: #141518; }
.site-mobile-menu-glass {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 88px;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%);
}

/* WebKit paints an opaque fill when one element carries both a mask and a
   backdrop filter, so the blur lives on a child of the masked box. */
.site-mobile-menu-glass > span {
  position: absolute;
  display: block;
  inset: 0;
  background: transparent;
  backdrop-filter: blur(14px) saturate(1.12);
  -webkit-backdrop-filter: blur(14px) saturate(1.12);
}
.site-mobile-menu { position: relative; pointer-events: auto; margin: 10px 20px 0; padding: 0 8px 0 16px; overflow: auto; max-height: calc(100svh - 24px - env(safe-area-inset-top, 0px)); border: 1px solid color-mix(in srgb, var(--menu-rule) 68%, white); border-radius: 30px; background: var(--menu-bg); box-shadow: 0 14px 42px rgb(34 38 54 / 10%); backdrop-filter: saturate(1.18) blur(18px); -webkit-backdrop-filter: saturate(1.18) blur(18px); }
.site-mobile-menu header { display: flex; align-items: center; justify-content: space-between; height: 58px; gap: 8px; }
.site-mobile-menu-controls { display: flex; gap: 12px; }
.site-mobile-menu button { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; padding: 0; border: 1px solid var(--menu-rule); box-sizing: border-box; border-radius: 50%; background: rgb(255 255 255 / 16%); color: inherit; cursor: pointer; }
.site-mobile-menu svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; }
.site-mobile-menu-body { padding: 0 8px 16px 0; }
.site-mobile-menu nav { display: flex; flex-direction: column; }
.site-mobile-menu nav a { display: flex; align-items: center; min-height: 56px; border-top: 1px solid var(--menu-rule); color: inherit; font-size: 17px; font-weight: 500; text-decoration: none; }
.site-mobile-menu nav a:first-child { border-top: 0; }
.site-mobile-menu :is(a, button):focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.site-mobile-menu .site-mobile-menu-cta { gap: 10px; width: 100%; height: 54px; margin-top: 6px; border: 0; border-radius: 18px; background: var(--menu-cta-bg); color: var(--menu-cta-fg); font: 500 17px/1.2 var(--font-ui, sans-serif); }
.site-mobile-menu-contacts, .site-mobile-menu nav { animation: site-menu-view-in 220ms cubic-bezier(.23, 1, .32, 1); }
.site-mobile-menu-contacts { display: flex; flex-direction: column; }
.site-mobile-menu-contacts-head { display: flex; align-items: center; gap: 12px; min-height: 56px; }
.site-mobile-menu-contacts-head p { margin: 0; font-size: 17px; font-weight: 600; }
.site-mobile-menu .site-mobile-menu-contact { display: grid; grid-template-columns: 44px minmax(0, 1fr); column-gap: 14px; align-items: center; justify-content: stretch; width: 100%; height: auto; min-height: 64px; padding: 0; border: 0; border-top: 1px solid var(--menu-rule); border-radius: 0; background: transparent; color: inherit; font: inherit; text-align: left; text-decoration: none; }
.site-mobile-menu-contact i { display: grid; width: 44px; height: 44px; place-items: center; border: 1px solid var(--menu-rule); box-sizing: border-box; border-radius: 50%; }
.site-mobile-menu-contact svg.is-filled { fill: currentColor; stroke: none; }
.site-mobile-menu-contact span { display: grid; gap: 2px; min-width: 0; }
.site-mobile-menu-contact b { font-size: 17px; font-weight: 500; }
.site-mobile-menu-contact small { overflow: hidden; font-size: 14px; opacity: .62; text-overflow: ellipsis; white-space: nowrap; }
.site-mobile-menu-status { position: absolute; overflow: hidden; width: 1px; height: 1px; clip-path: inset(50%); white-space: nowrap; }
@keyframes site-menu-view-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .site-mobile-menu-layer { transition: none; } .site-mobile-menu-contacts, .site-mobile-menu nav { animation: none; } }
@media (min-width: 901px) { .site-mobile-menu-layer { display: none !important; } }
</style>
