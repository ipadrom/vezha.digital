<template>
  <header class="case-header">
    <NuxtLink class="case-header__logo" to="/"><b>VEZHA</b><span>DIGITAL</span></NuxtLink>
    <nav :aria-label="locale === 'ru' ? 'Навигация кейса' : 'Case navigation'">
      <a href="#story">{{ locale === "ru" ? "История" : "Story" }}</a>
      <a href="#evidence">{{ locale === "ru" ? "Результат" : "Evidence" }}</a>
      <a v-if="hasTechnical" href="#technical">{{ locale === "ru" ? "Система" : "System" }}</a>
    </nav>
    <div class="case-header__actions">
      <button type="button" :aria-label="locale === 'ru' ? 'Сменить язык' : 'Change language'" @click="$emit('toggle-locale')">{{ locale.toUpperCase() }}</button>
      <button type="button" :aria-label="locale === 'ru' ? 'Сменить тему' : 'Change theme'" @click="$emit('toggle-theme')">{{ theme === "dark" ? "☀" : "◐" }}</button>
      <NuxtLink to="/#cases">{{ locale === "ru" ? "Все кейсы" : "All cases" }} ↗</NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ locale: "ru" | "en"; theme: "light" | "dark"; hasTechnical: boolean }>();
defineEmits<{ "toggle-locale": []; "toggle-theme": [] }>();
</script>
