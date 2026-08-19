<template>
  <header class="case-header">
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
</script>
