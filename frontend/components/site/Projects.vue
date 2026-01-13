<template>
  <section id="projects" class="py-20 bg-light-bg-secondary dark:bg-dark-bg-secondary">
    <div class="container-main">
      <h2 class="section-title">
        <UiGlitchText :text="$t('projects.title')">{{ $t('projects.title') }}</UiGlitchText>
      </h2>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <a v-for="project in projects" :key="project.id" :href="project.project_url || '#'" :target="project.project_url ? '_blank' : undefined" class="card group hover:border-accent-light dark:hover:border-accent-dark transition-colors">
          <!-- Image placeholder -->
          <div class="aspect-video bg-gray-200 dark:bg-dark-border rounded-lg mb-4 overflow-hidden">
            <img v-if="project.image_url" :src="project.image_url" :alt="project.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <p class="text-sm text-gray-500 dark:text-gray-500 mb-1">{{ project.type }}</p>
          <h3 class="font-semibold text-lg group-hover:text-accent-light dark:group-hover:text-accent-dark transition-colors">
            {{ project.name }}
          </h3>
          <p v-if="project.description" class="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {{ project.description }}
          </p>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  projects: any[]
}>()
</script>
