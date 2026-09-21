<template>
  <NuxtLink class="site-brand" :data-theme="theme" :to="to" aria-label="VEZHA Digital"><b>VEZHA</b><small>DIGITAL</small></NuxtLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ theme: 'light' | 'dark'; to?: string }>(), { to: '/' });
</script>

<style scoped>
.site-brand { display: inline-flex; align-items: baseline; flex-shrink: 0; gap: 7px; width: fit-content; color: #1c1d21; font-family: var(--font-ui, Onest, sans-serif); text-decoration: none; }
.site-brand b { font-size: 19px; font-weight: 700; line-height: 1.6; letter-spacing: -.01em; }
.site-brand small { color: #9ba0a8; font: 400 11px/1.6 var(--font-mono, 'JetBrains Mono', monospace); letter-spacing: .18em; text-transform: uppercase; }
.site-brand[data-theme="dark"] { color: #f2f3f5; }
.site-brand[data-theme="dark"] small { color: #79808a; }
</style>
