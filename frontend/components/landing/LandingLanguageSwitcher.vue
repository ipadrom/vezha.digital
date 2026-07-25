<template>
  <div class="vz-language-switcher" role="group" :aria-label="t('landing.language.label')">
    <button
      v-for="code in localeCodes"
      :key="code"
      type="button"
      :aria-pressed="locale === code"
      :class="{ 'is-active': locale === code }"
      @click="switchLocale(code)"
    >
      {{ code.toUpperCase() }}
    </button>
  </div>
</template>

<script setup lang="ts">
type LocaleCode = "ru" | "en";

const emit = defineEmits<{ changed: [locale: LocaleCode] }>();
const { locale, setLocale, t } = useI18n();
const localeCodes: LocaleCode[] = ["ru", "en"];

async function switchLocale(code: LocaleCode) {
  if (locale.value === code) return;
  await setLocale(code);
  emit("changed", code);
}
</script>

<style scoped>
.vz-language-switcher {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface) 84%, transparent);
}

button {
  min-width: 34px;
  padding: 6px 8px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font: 600 10px/1 "JetBrains Mono", monospace;
  letter-spacing: 0.08em;
  transition: background-color 0.2s ease, color 0.2s ease;
}

button.is-active {
  background: var(--ink);
  color: var(--bg);
}

button:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}
</style>
