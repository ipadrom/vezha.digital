<template>
  <div
    class="case-header-hover-zone"
    aria-hidden="true"
    @pointerenter="handleHeaderZonePointerEnter"
    @pointerleave="handleHeaderZonePointerLeave"
  ></div>
  <header
    class="case-header"
    :data-nav-visible="isHeaderShown ? 'true' : 'false'"
    :aria-hidden="isHeaderShown ? undefined : 'true'"
    :inert="isHeaderShown ? undefined : true"
    @pointerenter="handleHeaderPointerEnter"
    @pointerleave="handleHeaderPointerLeave"
    @focusin="handleHeaderFocusIn"
    @focusout="handleHeaderFocusOut"
  >
    <div class="case-header__inner">
      <NuxtLink class="case-header__logo" to="/"><b>VEZHA</b><span>DIGITAL</span></NuxtLink>
      <nav class="case-header__nav" :aria-label="locale === 'ru' ? 'Навигация кейса' : 'Case navigation'">
        <a href="#story">{{ locale === "ru" ? "История" : "Story" }}</a>
        <a href="#evidence">{{ locale === "ru" ? "Результат" : "Evidence" }}</a>
        <a v-if="hasTechnical" href="#technical">{{ locale === "ru" ? "Система" : "System" }}</a>
      </nav>
      <div class="case-header__actions">
        <button class="case-header__icon" type="button" :aria-label="locale === 'ru' ? 'Сменить тему' : 'Change theme'" @click="$emit('toggle-theme')">{{ theme === "dark" ? "☀" : "☾" }}</button>
        <NuxtLink class="case-header__cta" to="/#cases">{{ locale === "ru" ? "Все кейсы" : "All cases" }} ↗</NuxtLink>
        <button
          class="case-header__menu"
          type="button"
          :aria-expanded="isMenuOpen"
          :aria-label="locale === 'ru' ? 'Открыть меню кейса' : 'Open case menu'"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span></span><span></span>
        </button>
      </div>
    </div>

    <Transition name="case-menu">
      <div v-if="isMenuOpen" class="case-header__mobile-nav">
        <div class="case-header__mobile-top">
          <NuxtLink class="case-header__logo" to="/" aria-label="VEZHA Digital" @click="isMenuOpen = false"><b>VEZHA</b><span>DIGITAL</span></NuxtLink>
          <div class="case-header__mobile-controls">
            <button class="case-header__icon" type="button" :aria-label="locale === 'ru' ? 'Сменить тему' : 'Change theme'" @click="$emit('toggle-theme')">{{ theme === "dark" ? "☀" : "☾" }}</button>
            <button class="case-header__icon" type="button" :aria-label="locale === 'ru' ? 'Закрыть меню' : 'Close menu'" @click="isMenuOpen = false">✕</button>
          </div>
        </div>
        <nav class="case-header__mobile-links" :aria-label="locale === 'ru' ? 'Навигация кейса' : 'Case navigation'">
          <a href="#story" @click="isMenuOpen = false">{{ locale === "ru" ? "История" : "Story" }}</a>
          <a href="#evidence" @click="isMenuOpen = false">{{ locale === "ru" ? "Результат" : "Evidence" }}</a>
          <a v-if="hasTechnical" href="#technical" @click="isMenuOpen = false">{{ locale === "ru" ? "Система" : "System" }}</a>
        </nav>
        <NuxtLink class="case-header__mobile-cta" to="/#cases" @click="isMenuOpen = false">{{ locale === "ru" ? "Посмотреть все кейсы" : "View all cases" }}</NuxtLink>
        <div class="case-header__mobile-meta" aria-hidden="true"><span>VEZHA / DIGITAL</span><span>CASE STUDY</span></div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
defineProps<{ locale: "ru" | "en"; theme: "light" | "dark"; hasTechnical: boolean }>();
defineEmits<{ "toggle-theme": [] }>();
const isMenuOpen = ref(false);
const isHeaderVisible = ref(false);
const isHeaderShown = computed(() => isHeaderVisible.value || isMenuOpen.value);
let isHeaderZoneHovered = false;
let isHeaderHovered = false;
let isHeaderFocused = false;
let headerIdleTimer: ReturnType<typeof setTimeout> | null = null;
let headerLastScrollY = 0;

function clearHeaderIdleTimer() {
  if (!headerIdleTimer) return;
  window.clearTimeout(headerIdleTimer);
  headerIdleTimer = null;
}

function isDesktopHeaderViewport() {
  return window.matchMedia("(min-width: 901px)").matches;
}

function revealHeader() {
  clearHeaderIdleTimer();
  isHeaderVisible.value = true;
}

function queueHeaderHide(delay = 820) {
  if (!isDesktopHeaderViewport()) return;
  clearHeaderIdleTimer();
  headerIdleTimer = window.setTimeout(() => {
    headerIdleTimer = null;
    if (isHeaderZoneHovered || isHeaderHovered || isHeaderFocused || isMenuOpen.value) return;
    isHeaderVisible.value = false;
  }, delay);
}

function handleHeaderScroll() {
  const nextScrollY = Math.max(0, window.scrollY);

  if (isDesktopHeaderViewport()) {
    headerLastScrollY = nextScrollY;
    revealHeader();
    queueHeaderHide();
    return;
  }

  if (isMenuOpen.value || nextScrollY <= 12) {
    headerLastScrollY = nextScrollY;
    isHeaderVisible.value = true;
    return;
  }

  const delta = nextScrollY - headerLastScrollY;
  if (Math.abs(delta) < 6) return;

  isHeaderVisible.value = delta < 0;
  headerLastScrollY = nextScrollY;
}

function handleHeaderZonePointerEnter() {
  isHeaderZoneHovered = true;
  revealHeader();
}

function handleHeaderZonePointerLeave() {
  isHeaderZoneHovered = false;
  queueHeaderHide(220);
}

function handleHeaderPointerEnter() {
  isHeaderHovered = true;
  revealHeader();
}

function handleHeaderPointerLeave() {
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
  clearHeaderIdleTimer();
  headerLastScrollY = Math.max(0, window.scrollY);
  isHeaderVisible.value = !isDesktopHeaderViewport();
}

onMounted(() => {
  handleHeaderResize();
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
  window.addEventListener("resize", handleHeaderResize, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleHeaderScroll);
  window.removeEventListener("resize", handleHeaderResize);
  clearHeaderIdleTimer();
});
</script>
