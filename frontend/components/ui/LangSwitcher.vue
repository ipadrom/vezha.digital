<template>
  <button
    type="button"
    @click="toggle"
    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-dark-card"
  >
    {{ currentLang === 'ru' ? 'EN' : 'RU' }}
  </button>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()
const currentLang = computed(() => locale.value)

function toggle() {
  const newLang = locale.value === 'ru' ? 'en' : 'ru'
  console.log('Lang toggle clicked, current:', locale.value, 'new:', newLang)
  setLocale(newLang)
}
</script>
