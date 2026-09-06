<template>
  <span class="technology-icon" aria-hidden="true">
    <span :style="{ maskImage: `url('${technologyIconPath(name)}')` }" />
  </span>
</template>

<script setup lang="ts">
import { technologyIconPath } from '~/utils/caseTechnologies'
defineProps<{ name?: string }>()
</script>

<style scoped>
.technology-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: var(--technology-icon-size, 36px);
  height: var(--technology-icon-size, 36px);
  color: var(--technology-accent, var(--tech-map-accent, #8170f5));
  border-radius: 50%;
  background: color-mix(in srgb, currentColor 10%, transparent);
}
.technology-icon > span {
  width: 54%;
  height: 54%;
  background: currentColor;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}
</style>
