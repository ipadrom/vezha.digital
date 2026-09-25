<template>
  <!-- Inline SVG instead of the ☀/☾ glyphs: iOS Safari rendered the sun as a colour emoji. -->
  <span class="site-theme-icon" :data-theme="theme" aria-hidden="true">
    <svg v-if="theme === 'dark'" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
      <circle cx="10" cy="10" r="3.4" />
      <path d="M10 2.2v2.1M10 15.7v2.1M2.2 10h2.1M15.7 10h2.1M4.5 4.5l1.5 1.5M14 14l1.5 1.5M15.5 4.5 14 6M6 14l-1.5 1.5" />
    </svg>
    <svg v-else viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
      <path d="M11.6 2.6a7.4 7.4 0 1 0 5.8 11.3 6.2 6.2 0 0 1-5.8-11.3Z" />
    </svg>
  </span>
</template>
<script setup lang="ts">
defineProps<{ theme: 'light' | 'dark' }>();
</script>
<style scoped>
.site-theme-icon { display: grid; place-items: center; width: 20px; height: 20px; color: #1c1d21; }
.site-theme-icon[data-theme="dark"] { color: #f2f3f5; }
.site-theme-icon svg { display: block; width: 18px; height: 18px; }
</style>
