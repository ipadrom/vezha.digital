<template>
  <span class="glitch" :data-text="text">
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>
