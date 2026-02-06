<template>
  <section class="section" ref="targetRef">
    <div class="container">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>
        Примеры проектов с ценами
        <span class="bracket">/&gt;</span>
      </h2>
      <div v-if="isSectionVisible" class="services-new">
        <TransitionGroup
            tag="div"
            name="service"
            class="services-list"
            appear
        >
          <div
              v-for="(service, index) in services"
              class="service-item fade-item"
              :class="{ active: activeService === service.id}"
              :style="{'--enter-delay' : `${index * 120}ms`}"
              @mouseenter="!isAdaptiveMobile && (activeService = service.id)"
              @click="onServiceClick(service.id)"
          >
            <div
              v-if="!isAdaptiveMobile"
              class="service-header"
              @click.stop
            >
              <h3 class="font-bold">{{ service.name }}</h3>
              <div>
                <p class="price">{{ $t('services.price_from') }} {{ formatPrice(service.price_from) }}
                  {{ service.price_currency }}
                </p>
                <p class="service-deadline">
                  {{service.deadline}}
                </p>
              </div>
            </div>
            <div
                v-else
                class="service-header"
            >
              <h3 class="font-bold">{{ service.name }}</h3>
              <p class="price">
                {{ $t('services.price_from') }} {{ formatPrice(service.price_from) }}
                {{ service.price_currency }}
              </p>
            </div>

            <Transition name="expand">
              <div v-if="activeService === service.id && isAdaptiveMobile" class="service-mobile-content">
                <p class="desc">{{ service.description }}</p>
                <div class="service-content">
                  <p v-if="service.examples"><strong>Примеры:</strong> {{ service.examples }}</p>
                  <ul v-if="service.features && service.features.length">
                    <li v-for="(feature, idx) in service.features" :key="idx">{{ feature }}</li>
                  </ul>
                </div>
              </div>
            </Transition>
          </div>
        </TransitionGroup>

        <div
            v-if="services.length && !isAdaptiveMobile"
            class="service-details fade-item"
            style="--enter-delay: 0.1s"
        >
          <TransitionGroup
              name="fade-down"
              appear
          >
            <div
                v-for="service in services"
                :key="service.id"
                class="service-detail fade-item"
                :class="{ active: activeService === service.id }"
                style="--enter-delay: 0.1s"
            >
              <h3 class="font-bold">{{ service.name }}</h3>
              <p class="price">{{ $t('services.price_from') }} {{ formatPrice(service.price_from) }} {{ service.price_currency }}</p>
              <p class="service-deadline">
                Срок: {{service.deadline}}
              </p>
              <p class="desc">{{ service.description }}</p>
              <div class="service-content fade-item" style="--enter-delay: 0.2s">
                <p v-if="service.examples" class="">
                  <strong>Примеры:</strong> {{ service.examples }}
                </p>
                <ul v-if="service.features && service.features.length" style="--enter-delay: 0.8s">
                  <li v-for="(feature, idx) in service.features" :key="idx">{{ feature }}</li>
                </ul>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  const { isSectionVisible, targetRef } = useSectionVisible(0.1)

  const props = defineProps<{
    services: any[];
  }>()

  const isAdaptiveMobile = ref(false)

  const checkIsAdaptiveMobile = () => {
    isAdaptiveMobile.value = window.innerWidth <= 992
  }

  const activeService = ref<string | null>(null)

  const setActiveFirst = () => {
    if (!props.services || !props.services.length) return

    if (activeService.value === null) {
      activeService.value = props.services[0].id
    }
  }

  const onServiceClick = (id: string) => {
    if (!isAdaptiveMobile.value) return
    activeService.value = activeService.value === id ? null : id
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price)
  }

  onMounted(() => {
    checkIsAdaptiveMobile()
    window.addEventListener('resize', checkIsAdaptiveMobile)
    setActiveFirst()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', checkIsAdaptiveMobile)
  })

  watch(
      () => props.services,
      () => setActiveFirst(),
      { immediate: true }
  )

</script>

<style scoped>
.services-new {
  display: flex;
  gap: 30px;
  max-height: 466px;
}

.services-list {
  flex: 0 0 450px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: visible;
  padding-right: 5px;
}

.service-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.service-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.service-enter-active {
  transition: all 0.5s ease-out;
  transition-delay: var(--enter-delay);
}

.service-item {
  background: var(--bg-secondary);
  border: 3px solid var(--border);
  padding: 12px;
  cursor: pointer;
  color: #e0e0e0;
  border-left: 3px solid var(--accent);
  transition: all 0.2s ease-out;

  box-shadow:
      -10px 0 15px -5px
      rgba(0, 255, 65, 0.3);
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
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  color: var(--accent);
  margin: 0 0 0 10px;
  font-weight: 600;
  white-space: nowrap;
  position: relative;
}

.service-item .service-deadline{
  font-size: 1rem;
  text-align: end;
  color: var(--text-dim);
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
  border-left: 3px solid var(--accent);
  padding: 30px;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;

  box-shadow:
      -10px 0 15px -5px
      rgba(0, 255, 65, 0.3);
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
  font-family: 'JetBrains Mono', monospace;
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

.service-detail .service-deadline {
  margin-bottom: 15px;
  color: var(--accent);
}

.fade-down-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-down-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.fade-down-enter-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
  transition-delay: 0.25s;
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
  align-self: flex-end;
  padding: 12px 28px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: var(--bg);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  margin-top: auto;
}

.redirect-btn:hover {
  background: var(--bg);
  color: var(--accent);
  border: 1px solid var(--accent);
}

.fade-item {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
  animation: cardRevealDown 0.9s ease-out forwards;
  animation-delay: var(--enter-delay, 0s);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 1000px;
  opacity: 1;
}

.service-mobile-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}

.service-mobile-content .desc {
  font-size: 1rem;
  color: #e0e0e0;
  margin-bottom: 15px;
  line-height: 1.6;
}

.service-mobile-content .service-content p {
  color: #e0e0e0;
  margin-bottom: 12px;
  line-height: 1.6;
  font-size: 0.95rem;
}

.service-mobile-content .service-content ul {
  list-style: none;
  padding-left: 0;
  margin-bottom: 15px;
}

.service-mobile-content .service-content ul li {
  color: #e0e0e0;
  padding: 6px 0 6px 20px;
  position: relative;
  line-height: 1.5;
  font-size: 0.9rem;
}

.service-mobile-content .service-content ul li::before {
  content: '>';
  position: absolute;
  left: 0;
  color: var(--accent);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardRevealDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
    clip-path: inset(0 0 100% 0);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    clip-path: inset(0 0 0 0);
  }
}

@media (max-width: 992px) {
  .services-new {
    display: block;
    flex-direction: column;
    max-height: none;
  }

  .services-list {
    flex: none;
    width: 100%;
    overflow: visible;
  }

  .service-details {
    min-height: 300px;
  }

  .service-details.mobile {
    margin-top: 20px;
    padding: 20px;
  }

  .service-details.mobile .service-detail {
    display: block;
  }

  .service-item {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>