<template>
  <section id="stages" class="py-20 bg-light-bg-secondary dark:bg-dark-bg-secondary">
    <div class="container-main">
      <h2 class="section-title">
        <UiGlitchText :text="$t('stages.title')">{{ $t('stages.title') }}</UiGlitchText>
      </h2>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="stage in stages" :key="stage.id" class="card relative">
          <!-- Step number -->
          <div class="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-accent-light dark:bg-accent-dark flex items-center justify-center text-white dark:text-dark-bg font-bold text-xl">
            {{ stage.step_number.toString().padStart(2, '0') }}
          </div>

          <div class="pt-4">
            <h3 class="font-semibold text-lg mb-2">{{ stage.title }}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">{{ stage.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  stages: any[]
}>()
</script>
