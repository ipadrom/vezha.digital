<template>
  <NuxtLayout :name="layout">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()

// Initialize auth on client
const { initAuth } = useAuth()

const layout = computed(() => {
  if(route.meta.layout === false){
    return false
  }

  return route.path.startsWith('/admin') ? 'admin-layout' : 'site-layout'
})

onMounted(() => {
  initAuth()
})
</script>
