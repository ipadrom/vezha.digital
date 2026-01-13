<template>
  <NuxtPage />
</template>

<script setup lang="ts">
// Initialize auth on client
const { initAuth } = useAuth()

onMounted(() => {
  initAuth()
})
</script>
