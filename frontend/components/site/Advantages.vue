<template>
  <section id="advantages" class="py-20">
    <div class="container-main">
      <h2 class="section-title">
        <UiGlitchText :text="$t('advantages.title')">{{ $t('advantages.title') }}</UiGlitchText>
      </h2>

      <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div v-for="advantage in advantages" :key="advantage.id" class="card text-center">
          <div class="w-16 h-16 mx-auto mb-6 text-accent-light dark:text-accent-dark">
            <UiIcon :name="advantage.icon" />
          </div>
          <h3 class="text-2xl font-bold mb-4">
            <UiGlitchText :text="advantage.title">{{ advantage.title }}</UiGlitchText>
          </h3>
          <p class="text-gray-600 dark:text-gray-400">{{ advantage.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  advantages: any[]
}>()
</script>
