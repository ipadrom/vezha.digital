<template>
  <svg class="case-glass-filter" width="0" height="0" aria-hidden="true" focusable="false">
    <defs>
      <filter id="case-header-refraction" x="-10%" y="-40%" width="120%" height="180%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="2" seed="8" result="glass-waves" />
        <feGaussianBlur in="glass-waves" stdDeviation="2" result="glass-map" />
        <feDisplacementMap in="SourceGraphic" in2="glass-map" scale="24" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
  <div
    class="case-header-hover-zone"
    aria-hidden="true"
    @pointerenter="handleHeaderZonePointerEnter"
    @pointerleave="handleHeaderZonePointerLeave"
  ></div>
  <header
    class="case-header"
    :data-nav-visible="isHeaderShown ? 'true' : 'false'"
    :data-menu-open="isMenuOpen ? 'true' : undefined"
    :data-media-collision="isHeaderMediaColliding ? 'true' : undefined"
    :data-scrolled="hasScrolled ? 'true' : 'false'"
    :style="headerStyle"
    :aria-hidden="isHeaderShown ? undefined : 'true'"
    :inert="isHeaderShown ? undefined : true"
    @pointerenter="handleHeaderPointerEnter"
    @pointerleave="handleHeaderPointerLeave"
    @focusin="handleHeaderFocusIn"
    @focusout="handleHeaderFocusOut"
  >
    <div ref="headerInnerRef" class="case-header__inner">
      <SiteBrand class="case-header__logo" :theme="theme" />
      <nav class="case-header__nav" :aria-label="locale === 'ru' ? 'Навигация кейса' : 'Case navigation'">
        <a href="#story">{{ locale === "ru" ? "История" : "Story" }}</a>
        <a href="#evidence">{{ locale === "ru" ? "Результат" : "Evidence" }}</a>
        <a v-if="hasTechnical" href="#technical">{{ locale === "ru" ? "Система" : "System" }}</a>
      </nav>
      <div class="case-header__actions">
        <button class="case-header__icon" type="button" :aria-label="locale === 'ru' ? 'Сменить тему' : 'Change theme'" @click="$emit('toggle-theme')"><SiteThemeIcon :theme="theme" /></button>
        <NuxtLink class="case-header__cta" to="/#cases">{{ locale === "ru" ? "Все кейсы" : "All cases" }} ↗</NuxtLink>
        <SiteMenuButton
          class="case-header__menu"
          :expanded="isMenuOpen"
          controls="case-mobile-menu"
          :label="locale === 'ru' ? 'Открыть меню кейса' : 'Open case menu'"
          @activate="isMenuOpen = true"
        />
      </div>
    </div>

    <MobileSiteMenu :open="isMenuOpen" id="case-mobile-menu" brand-variant="case" :theme="theme" :locale="locale" @close="isMenuOpen = false" @toggle-theme="$emit('toggle-theme')" />
  </header>
</template>

<script setup lang="ts">
import SiteMenuButton from "~/components/ui/SiteMenuButton.vue";
import MobileSiteMenu from "~/components/ui/MobileSiteMenu.vue";
import SiteBrand from "~/components/ui/SiteBrand.vue";
import SiteThemeIcon from "~/components/ui/SiteThemeIcon.vue";
defineProps<{ locale: "ru" | "en"; theme: "light" | "dark"; hasTechnical: boolean }>();
defineEmits<{ "toggle-theme": [] }>();
const isMenuOpen = ref(false);
const isHeaderVisible = ref(true);
const headerInnerRef = ref<HTMLElement | null>(null);
const headerMediaShift = ref(0);
const hasScrolled = ref(false);
const isHeaderMediaColliding = ref(false);
const isHeaderMediaCovered = ref(false);
const isHeaderShown = computed(() => isMenuOpen.value || (isHeaderVisible.value && !isHeaderMediaCovered.value));
const headerStyle = computed(() => ({ "--case-header-media-shift": `${headerMediaShift.value}px` }));
let isHeaderZoneHovered = false;
let isHeaderHovered = false;
let isHeaderFocused = false;
let headerIdleTimer: ReturnType<typeof setTimeout> | null = null;
let headerLastScrollY = 0;
let headerWasDesktop: boolean | null = null;

function clearHeaderIdleTimer() {
  if (!headerIdleTimer) return;
  window.clearTimeout(headerIdleTimer);
  headerIdleTimer = null;
}

function isDesktopHeaderViewport() {
  return window.matchMedia("(min-width: 901px)").matches;
}

function updateHeaderMediaCollision() {
  hasScrolled.value = window.scrollY > 12;
  const headerInner = headerInnerRef.value;
  if (!isDesktopHeaderViewport() || !headerInner || isMenuOpen.value) {
    headerMediaShift.value = 0;
    isHeaderMediaColliding.value = false;
    isHeaderMediaCovered.value = false;
    return;
  }

  const headerTop = headerInner.offsetTop;
  const headerBottom = headerTop + headerInner.offsetHeight;
  const video = Array.from(document.querySelectorAll<HTMLElement>(".builder-media-hero > video, .builder-media-hero > img, .builder-media-hero > picture > img"))
    .find((item) => {
      const rect = item.getBoundingClientRect();
      return rect.bottom > headerTop && rect.top < headerBottom;
    });

  if (!video) {
    headerMediaShift.value = 0;
    isHeaderMediaColliding.value = false;
    isHeaderMediaCovered.value = false;
    return;
  }

  const videoRect = video.getBoundingClientRect();
  const isCovered = videoRect.top <= 0 && videoRect.bottom >= headerBottom;

  if (isCovered) headerMediaShift.value = -headerBottom;
  else if (videoRect.top > 0) headerMediaShift.value = Math.min(0, videoRect.top - headerBottom);
  else headerMediaShift.value = Math.max(0, videoRect.bottom - headerTop);

  isHeaderMediaColliding.value = true;
  isHeaderMediaCovered.value = isCovered;
}

function revealHeader() {
  clearHeaderIdleTimer();
  isHeaderVisible.value = true;
}

function queueHeaderHide(delay = 820) {
  clearHeaderIdleTimer();
  if (Math.max(0, window.scrollY) <= 12) {
    isHeaderVisible.value = true;
    return;
  }
  headerIdleTimer = window.setTimeout(() => {
    headerIdleTimer = null;
    if (isHeaderZoneHovered || isHeaderHovered || isHeaderFocused || isMenuOpen.value) return;
    isHeaderVisible.value = false;
  }, delay);
}

function handleHeaderScroll() {
  const nextScrollY = Math.max(0, window.scrollY);
  updateHeaderMediaCollision();

  if (nextScrollY <= 12) {
    headerLastScrollY = nextScrollY;
    revealHeader();
    return;
  }

  if (isDesktopHeaderViewport()) {
    headerLastScrollY = nextScrollY;
    revealHeader();
    queueHeaderHide();
    return;
  }

  if (isMenuOpen.value) {
    headerLastScrollY = nextScrollY;
    revealHeader();
    return;
  }

  headerLastScrollY = nextScrollY;
  revealHeader();
  queueHeaderHide();
}

function handleHeaderZonePointerEnter(event: PointerEvent) {
  if (event.pointerType === "touch") return;
  isHeaderZoneHovered = true;
  revealHeader();
}

function handleHeaderZonePointerLeave(event: PointerEvent) {
  if (event.pointerType === "touch") return;
  isHeaderZoneHovered = false;
  queueHeaderHide(220);
}

function handleHeaderPointerEnter(event: PointerEvent) {
  if (event.pointerType === "touch") return;
  isHeaderHovered = true;
  revealHeader();
}

function handleHeaderPointerLeave(event: PointerEvent) {
  if (event.pointerType === "touch") return;
  isHeaderHovered = false;
  queueHeaderHide(220);
}

function handleHeaderFocusIn() {
  isHeaderFocused = true;
  revealHeader();
}

function handleHeaderFocusOut(event: FocusEvent) {
  const header = event.currentTarget;
  const next = event.relatedTarget;
  if (header instanceof HTMLElement && next instanceof Node && header.contains(next)) return;
  isHeaderFocused = false;
  queueHeaderHide(220);
}

function handleHeaderResize() {
  const isDesktop = isDesktopHeaderViewport();
  headerLastScrollY = Math.max(0, window.scrollY);
  updateHeaderMediaCollision();
  if (headerWasDesktop === isDesktop) return;

  headerWasDesktop = isDesktop;
  clearHeaderIdleTimer();
  isHeaderVisible.value = headerLastScrollY <= 12 || !isDesktop;
}

onMounted(() => {
  handleHeaderResize();
  nextTick(updateHeaderMediaCollision);
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
  window.addEventListener("resize", handleHeaderResize, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleHeaderScroll);
  window.removeEventListener("resize", handleHeaderResize);
  clearHeaderIdleTimer();
});
</script>
