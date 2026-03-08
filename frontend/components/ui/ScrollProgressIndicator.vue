<template>
  <div class="stack-scroll-hint">
    <div class="stack-scroll-bar" :style="{ width: (progress * 100) + '%' }"></div>
  </div>
</template>
<script setup lang="ts">
  defineProps<{
    progress: number
  }>()
</script>
<style scoped>
.stack-scroll-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255,255,255,0.06);
  z-index: 20;
}

.stack-scroll-bar {
  height: 100%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  transition: width 0.25s ease;
  width: 0;
}
</style>