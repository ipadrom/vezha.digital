<template><span class="site-theme-icon" :data-theme="theme" aria-hidden="true">{{ theme === 'dark' ? '☀' : '☾' }}</span></template>
<script setup lang="ts">
defineProps<{ theme: 'light' | 'dark' }>();
</script>
<style scoped>
.site-theme-icon { display: grid; place-items: center; width: 20px; height: 20px; color: #1c1d21; font: 500 16px/1 var(--font-ui, Onest, sans-serif); }
.site-theme-icon[data-theme="dark"] { color: #f2f3f5; }
</style>
