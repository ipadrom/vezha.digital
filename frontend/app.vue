<template>
  <NuxtLayout :name="layout">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Initialize auth on client
const layout = 'site-custom';
const { initAuth } = useAuth()

onMounted(() => {
  initAuth()
})
</script>
