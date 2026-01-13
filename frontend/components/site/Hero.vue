<template>
  <section id="hero" class="min-h-screen flex items-center pt-16 bg-gradient-to-b from-light-bg to-light-bg-secondary dark:from-dark-bg dark:to-dark-bg-secondary">
    <div class="container-main py-20">
      <div class="max-w-4xl mx-auto text-center">
        <!-- Main Title -->
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          {{ $t('hero.title') }}
          <span class="text-accent-light dark:text-accent-dark">
            {{ settings?.hero_price || '50 000' }} ₽
          </span>
        </h1>

        <!-- Subtitle -->
        <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8">
          {{ $t('hero.subtitle') }}
        </p>

        <!-- Tags -->
        <p class="text-gray-500 dark:text-gray-500 mb-10">
          {{ $t('hero.tags') }}
        </p>

        <!-- CTA Button -->
        <a href="#contacts" class="btn-primary inline-block text-lg px-8 py-4">
          {{ $t('hero.cta') }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  settings?: Record<string, string>
}>()
</script>
