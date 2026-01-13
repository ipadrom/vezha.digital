<template>
  <section id="services" class="py-20 bg-light-bg-secondary dark:bg-dark-bg-secondary">
    <div class="container-main">
      <h2 class="section-title">
        <UiGlitchText :text="$t('services.title')">{{ $t('services.title') }}</UiGlitchText>
      </h2>

      <div class="overflow-x-auto">
        <table class="w-full">
          <tbody>
            <tr v-for="service in services" :key="service.id" class="border-b border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-card transition-colors">
              <td class="py-6 pr-4">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 flex-shrink-0 text-accent-light dark:text-accent-dark">
                    <UiIcon :name="service.icon" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg mb-1">{{ service.name }}</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">{{ service.description }}</p>
                    <p v-if="service.examples" class="text-gray-500 dark:text-gray-500 text-sm">{{ service.examples }}</p>
                  </div>
                </div>
              </td>
              <td class="py-6 pl-4 text-right whitespace-nowrap">
                <span class="text-lg font-semibold text-accent-light dark:text-accent-dark">
                  {{ $t('services.price_from') }} {{ formatPrice(service.price_from) }} {{ service.price_currency }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  services: any[]
}>()

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU').format(price)
}
</script>
