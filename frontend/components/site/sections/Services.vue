<template>
  <section id="services" class="section">
    <div class="container-main">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>{{ $t('services.title') }}<span class="bracket">/&gt;</span>
      </h2>

      <div class="services-new">
        <!-- Left Column: Services List -->
        <div class="services-list">
            <div
                v-for="service in services"
                :key="service.id"
                class="service-item"
                :class="{ active: activeService === service.id }"
                @mouseenter="activeService = service.id"
            >
              <div class="service-header">
                  <h3>{{ service.name }}</h3>
                  <p class="price">{{ $t('services.price_from') }} {{ formatPrice(service.price_from) }}
                    {{ service.price_currency }}
                  </p>
              </div>
            </div>
        </div>

        <!-- Right Column: Service Details -->
        <div class="service-details">
          <div
            v-for="service in services"
            :key="service.id"
            class="service-detail"
            :class="{ active: activeService === service.id }"
          >
            <h3>{{ service.name }}</h3>
            <p class="price">{{ $t('services.price_from') }} {{ formatPrice(service.price_from) }} {{ service.price_currency }}</p>
            <p class="desc">{{ service.description }}</p>
            <div class="service-content">
              <p v-if="service.examples"><strong>Примеры:</strong> {{ service.examples }}</p>
              <ul v-if="service.features && service.features.length">
                <li v-for="(feature, idx) in service.features" :key="idx">{{ feature }}</li>
              </ul>
            </div>
          </div>
          <NuxtLink class="redirect-btn" :to="`/services/${services.id}`">
              {{$t('services.redirect_btn')}}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  services: any[]
}>()

const activeService = ref<number | null>(null)

// Set first service as active by default
onMounted(() => {
  if (props.services.length > 0) {
    activeService.value = props.services[0].id
  }
})

watch(() => props.services, (newServices) => {
  if (newServices.length > 0 && !activeService.value) {
    activeService.value = newServices[0].id
  }
}, { immediate: true })

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU').format(price)
}
</script>

<style scoped>
.services-new {
  display: flex;
  gap: 30px;
  min-height: 600px;
}

.services-list {
  flex: 0 0 450px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: visible;
  padding-right: 5px;
}

.service-item {
  background: var(--bg-secondary);
  border: 3px solid var(--border);
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
  color: #e0e0e0;
}

.service-item:hover,
.service-item.active {
  border-color: var(--accent);
  box-shadow: 0 0 15px var(--shadow);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}

.service-item h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.1rem;
  margin: 0;
  color: var(--text);
  flex: 1;
}

.service-item .price {
  font-family: var(--font-pixel);
  font-size: 1rem;
  color: var(--accent);
  margin: 0 0 0 10px;
  font-weight: 600;
  white-space: nowrap;
  position: relative;
}

.service-item .price::after {
  content: " ->";
  font-family: var(--font-epilepsy);
  margin-left: 5px;
}

.service-details {
  flex: 1 1 40%;
  max-height: 466px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 30px;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
}

.service-detail {
  display: none;
  color: #e0e0e0;
  position: relative;
}

.service-detail.active {
  display: block;
  padding-bottom: 20px;
}

.service-detail h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: var(--accent);
}

.service-detail .price {
  font-family: var(--font-pixel);
  font-size: 1.5rem;
  color: var(--accent);
  margin-bottom: 15px;
  font-weight: 600;
}

.service-detail .desc {
  font-size: 1.1rem;
  color: #e0e0e0;
  margin-bottom: 25px;
  line-height: 1.6;
}

.service-content p {
  color: #e0e0e0;
  margin-bottom: 15px;
  line-height: 1.6;
}

.service-content ul {
  list-style: none;
  padding-left: 0;
}

.service-content ul li {
  color: #e0e0e0;
  padding: 8px 0 8px 20px;
  position: relative;
  line-height: 1.5;
}

.service-content ul li::before {
  content: '>';
  position: absolute;
  left: 0;
  color: var(--accent);
}

.redirect-btn{
  width: 240px;
  padding: 5px 10px;
  font-size: 0.8rem;
  background: var(--accent);
  color: var(--bg);
  cursor: pointer;
  align-self: flex-end;
  margin-top: auto;
}

.redirect-btn:hover {
  background: var(--bg);
  color: var(--accent);
  border: 1px solid var(--accent);
}

@media (max-width: 992px) {
  .services-new {
    flex-direction: column;
  }

  .services-list {
    flex: none;
    width: 100%;
  }

  .service-details {
    min-height: 300px;
  }
}
</style>
