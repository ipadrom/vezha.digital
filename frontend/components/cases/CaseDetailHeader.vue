<template>
  <SiteHeaderGlass :visible="isHeaderShown && hasScrolled && !isHeaderMediaColliding" />
  <div
    class="case-header-hover-zone"
    aria-hidden="true"
    @pointerenter="handleHeaderZonePointerEnter"
    @pointerleave="handleHeaderZonePointerLeave"
  ></div>
  <header
    class="case-header"
    :data-nav-visible="isHeaderShown ? 'true' : 'false'"
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
    <div ref="headerInnerRef" class="case-header__inner site-header-pill">
      <SiteBrand class="case-header__logo" :theme="theme" />
      <nav class="case-header__nav" :aria-label="locale === 'ru' ? 'Навигация кейса' : 'Case navigation'">
        <a href="#story">{{ locale === "ru" ? "История" : "Story" }}</a>
        <a href="#evidence">{{ locale === "ru" ? "Результат" : "Evidence" }}</a>
        <a v-if="hasTechnical" href="#technical">{{ locale === "ru" ? "Система" : "System" }}</a>
      </nav>
      <div class="case-header__actions">
        <button class="case-header__icon site-header-icon" type="button" :aria-label="locale === 'ru' ? 'Сменить тему' : 'Change theme'" @click="$emit('toggle-theme')"><SiteThemeIcon :theme="theme" /></button>
        <NuxtLink class="case-header__cta site-header-cta" to="/#cases">{{ locale === "ru" ? "Все кейсы" : "All cases" }} ↗</NuxtLink>
      </div>
    </div>

  </header>
  <MobileSiteMenu id="case-mobile-menu" :visible="isHeaderShown" :theme="theme" :locale="locale" @toggle-theme="$emit('toggle-theme')" @close="holdHeader" />
</template>

<script setup lang="ts">
import MobileSiteMenu from "~/components/ui/MobileSiteMenu.vue";
import SiteBrand from "~/components/ui/SiteBrand.vue";
import SiteThemeIcon from "~/components/ui/SiteThemeIcon.vue";
import SiteHeaderGlass from "~/components/ui/SiteHeaderGlass.vue";
defineProps<{ locale: "ru" | "en"; theme: "light" | "dark"; hasTechnical: boolean }>();
defineEmits<{ "toggle-theme": [] }>();
const isHeaderVisible = ref(true);
const headerInnerRef = ref<HTMLElement | null>(null);
const headerMediaShift = ref(0);
const hasScrolled = ref(false);
const isHeaderMediaColliding = ref(false);
const isHeaderMediaCovered = ref(false);
const isHeaderShown = computed(() => isHeaderVisible.value && !isHeaderMediaCovered.value);
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
  if (!isDesktopHeaderViewport() || !headerInner) {
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
    if (isHeaderZoneHovered || isHeaderHovered || isHeaderFocused) return;
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

  headerLastScrollY = nextScrollY;
  revealHeader();
  queueHeaderHide();
}

// Restart the idle countdown instead of dropping the header the moment a
// transient overlay, such as the mobile menu, stops holding it open.
function holdHeader() {
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
  isHeaderVisible.value = headerLastScrollY <= 12;
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
