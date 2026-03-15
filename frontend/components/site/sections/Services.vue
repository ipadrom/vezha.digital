<template>
  <section
      id="services"
      class="section"
      ref="servicesRef"
  >
    <div class="services-container">
      <h2 class="section-title" style="text-align: left;">
        {{ $t('services.title') }} <span class="bracket">&gt;</span>
      </h2>

      <div v-if="isSectionVisible" class="services-new">
        <!-- Left Column: Services List -->
        <TransitionGroup
            name="service"
            tag="div"
            class="services-list"
            appear
        >
            <div
                v-for="(service, index) in services"
                :key="service.id"
                class="service-item fade-item"
                :class="{ active: activeService === service.id }"
                :style="{'--enter-delay': `${index * 120}ms`}"
                @mouseenter="!isAdaptiveMobile && (activeService = service.id)"
                @click="onServiceClick(service.id)"
            >
              <div
                  v-if="!isAdaptiveMobile"
                  class="service-header"
              >
                  <h3 class="font-bold">{{ service.name }}</h3>
                  <p class="price">{{ $t('services.price_from') }} {{ formatPrice(service.price_from) }}
                    {{ service.price_currency }} <span class="arrow">&gt;</span>
                  </p>
              </div>

              <div
                  v-else
                  class="service-header"
              >
                <h3 class="font-bold">{{ service.name }}</h3>
                <p class="price">
                  {{ $t('services.price_from') }} {{ formatPrice(service.price_from) }}
                  {{ service.price_currency }} <span class="arrow">&gt;</span>
                </p>
              </div>

              <!-- Mobile Service Details -->
              <Transition name="expand">
                <div v-if="activeService === service.id && isAdaptiveMobile" class="service-mobile-content">
                  <div class="service-mobile-divider"></div>
                  <p class="desc">{{ service.description }}</p>
                  <div class="service-content">
                    <div v-if="service.examples" class="service-example-tags">
                      <span v-for="tag in service.examples.split(',')" :key="tag" class="service-example-tag">{{ tag.trim() }}</span>
                    </div>
                    <ul v-if="service.features && service.features.length">
                      <li v-for="(feature, idx) in service.features" :key="idx">{{ feature.text }}</li>
                    </ul>
                  </div>
                  <button class="redirect-btn" @click.stop="openServiceModal(service.name)">
                    {{$t('services.redirect_btn')}}
                  </button>
                </div>
              </Transition>
            </div>
        </TransitionGroup>

        <!-- Right Column: Service Details -->
          <div
              v-if="services.length && !isAdaptiveMobile"
              class="service-details fade-item"
              style="--enter-delay: 0.1s"
          >
              <div
                  v-for="service in services"
                  :key="service.id"
                  class="service-detail"
                  :class="{ active: activeService === service.id }"
              >
                <h3 class="font-bold">{{ service.name }}</h3>
                <p class="price">{{ $t('services.price_from') }} {{ formatPrice(service.price_from) }} {{ service.price_currency }}</p>
                <p class="desc">{{ service.description }}</p>
                <div class="service-content">
                  <div v-if="service.examples" class="service-example-tags">
                    <span v-for="tag in service.examples.split(',')" :key="tag" class="service-example-tag">{{ tag.trim() }}</span>
                  </div>
                  <ul v-if="service.features && service.features.length">
                    <li v-for="(feature, idx) in service.features" :key="idx">{{ feature.text }}</li>
                  </ul>
                </div>
                <div class="redirect-btn-wrapper">
                  <button class="redirect-btn" @click="openServiceModal(service.name)">
                    {{$t('services.redirect_btn')}}
                  </button>
                </div>
              </div>
          </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {IServices} from "~/utils/interfaces/IServices";

const { isSectionVisible, targetRef: servicesRef } = useSectionVisible(0.1)
const route = useRoute()
const modalRequest = useState<{ open: boolean; message: string }>('modalRequest', () => ({ open: false, message: '' }))

const openServiceModal = (serviceName: string) => {
  modalRequest.value = { open: true, message: `Интересует услуга: ${serviceName}` }
}

const props = defineProps<{
  services: IServices[]
}>()

const isAdaptiveMobile = ref(false)
const checkIsAdaptiveMobile = () => {
  isAdaptiveMobile.value = window.innerWidth <= 992
}

const onServiceClick = (id: string) => {
  if (isAdaptiveMobile.value) {
    activeService.value = activeService.value === id ? null : id
  } else {
    const service = props.services.find(s => s.id === id)
    if (service) openServiceModal(service.name)
  }
}

const activeService = ref<string | null>(null)

const setActiveFirst = () => {
  if (props.services.length > 0 && !activeService.value) {
    activeService.value = props.services[0].id ?? null
  }
}

onMounted(() => {
  checkIsAdaptiveMobile()
  setActiveFirst()
  window.addEventListener('resize', checkIsAdaptiveMobile)
  if (route.query.service) {
    activeService.value = route.query.service as string
  }
})

watch(() => route.query.service, (id) => {
  if (id) {
    activeService.value = id as string
    nextTick(() => {
      document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' })
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsAdaptiveMobile)
})

watch(() => props.services, () => {
  setActiveFirst()
}, { immediate: true })

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU').format(price)
}
</script>

<style scoped>
.services-container {
  padding: 0 3.125vw;
}

.services-container :deep(.section-title) {
  margin-top: 0;
}

.services-new {
  display: flex;
  gap: 30px;
  align-items: stretch;
}

.services-list {
  flex: 0 0 35vw;
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
  border: 1px solid var(--border);
  padding: 1vw 1vw;
  cursor: pointer;
  color: #e0e0e0;
  transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out;
  position: relative;
  overflow: hidden;
}

.service-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}

.service-item:hover,
.service-item.active {
  border-color: var(--accent);
  box-shadow: -10px 0 20px -5px rgba(0, 229, 255, 0.25);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  text-decoration: none;
  color: inherit;
}

.service-item h3 {
  font-family: var(--font-inter);
  font-size: 1.5vw;
  font-weight: 800;
  margin: 0;
  color: var(--text);
  flex: 1;
  transition: color 0.2s;
}

.service-item:hover h3,
.service-item.active h3 {
  color: var(--accent);
}

.service-item .price {
  font-family: var(--font-inter);
  font-size: 1.5vw;
  color: var(--accent);
  margin: 0 0 0 10px;
  font-weight: 700;
  white-space: nowrap;
  position: relative;
}

.arrow {
  color: var(--accent);
  font-weight: 700;
  margin-left: 4px;
}

.service-details {
  flex: 1 1 40%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  align-self: stretch;
}

.service-details::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}

.service-detail {
  display: none;
  color: #e0e0e0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1vw 2vw 1vw;
  overflow: hidden;
}

.service-detail.active {
  display: block;
}


.service-detail h3 {
  font-family: var(--font-inter);
  font-size: 2.5vw;
  margin-bottom: 15px;
  color: var(--accent);
  font-weight: 800;
}

.service-detail .price {
  font-family: var(--font-inter);
  font-size: 1.8vw;
  color: var(--accent);
  margin-bottom: 15px;
  font-weight: 700;
}

.service-detail .desc {
  font-family: var(--font-inter);
  font-size: 1.2vw;
  color: #e0e0e0;
  margin-bottom: 25px;
  line-height: 1.8;
  font-weight: 400;
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
  font-family: var(--font-inter);
  color: #e0e0e0;
  margin-bottom: 15px;
  line-height: 1.4;
}

.service-content ul {
  list-style: none;
  padding-left: 0;
}

.service-content ul li {
  font-family: var(--font-inter);
  font-size: 1.2vw;
  font-weight: 600;
  color: #e0e0e0;
  padding: 0.5vw 0 0.5vw 1.5vw;
  position: relative;
  line-height: 1.5;
}

.service-content ul li::before {
  content: '>';
  position: absolute;
  left: 0;
  color: var(--accent);
}

.redirect-btn-wrapper {
  position: absolute;
  bottom: 2vw;
  right: 2vw;
}

.redirect-btn {
  padding: clamp(8px, 0.625vw, 14px) clamp(14px, 1.45vw, 26px);
  font-family: var(--font-inter);
  font-size: clamp(0.8rem, 1vw, 1.1rem);
  font-weight: 400;
  border: 2px solid var(--accent);
  background: var(--accent);
  color: var(--bg);
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
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

.service-mobile-divider {
  height: 1px;
  background: var(--accent);
  opacity: 0.3;
  margin: 10px 0;
}

.service-mobile-content .desc {
  font-family: var(--font-inter);
  font-size: 1rem;
  color: #e0e0e0;
  margin-bottom: 15px;
  line-height: 1.6;
}

.service-mobile-content .service-content p {
  font-family: var(--font-inter);
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
  font-family: var(--font-inter);
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

@keyframes scanLineDown {
  to { height: 100%; }
}

.service-example-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}

.service-example-tag {
  display: inline-block;
  padding: 0.3vw 0.7vw;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #0a0a0a;
  font-family: var(--font-inter);
  font-size: 0.9vw;
  font-weight: 600;
}

@media (max-width: 992px) {
  .services-container {
    padding: 0 20px 0;
  }

  .services-new {
    display: block;
    flex-direction: column;
    height: auto;
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

  .service-item h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--accent);
  }

  .service-item .price {
    font-size: 1rem;
    font-weight: 600;
  }

  .service-item {
    padding: 12px 12px 12px 20px;
    box-shadow:
        inset 0 0 0 3px rgba(0, 0, 0, 0.0001),
        -10px 0 15px -5px rgba(0, 255, 65, 0.3);
  }

  .service-item:hover,
  .service-item.active {
    box-shadow:
        inset 0 0 0 3px var(--accent),
        0 0 15px var(--accent);
  }

  .redirect-btn {
    position: static;
    align-self: flex-end;
    margin-top: auto;
    margin-left: -8px;
    width: calc(100% + 8px);
    padding: 6px 12px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 2px solid var(--accent);
    text-align: center;
  }

  .service-example-tags {
    max-height: 3.2em;
    overflow: hidden;
    margin-bottom: 15px;
  }

  .service-example-tag {
    padding: 2px 6px;
    font-size: 0.65rem;
  }
}
</style>
