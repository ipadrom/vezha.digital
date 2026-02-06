<template>
<section>
  <ServiceHero
      :service="service"
      @openModal="showModal = true"
  />

  <ServiceAbout
      :service="service"
  />

  <ServiceFeatures
      :service="service"
  />

  <ServicePricing
      :services="mockServices"
  />

  <ServiceProjects
      :service="service"
  />

  <ContactModal
      v-model:showModal="showModal"
  />

  <Contacts
      :settings="settings"
      @openModal="showModal = true"
  />
</section>
</template>

<script setup lang="ts">
import Contacts from "~/components/site/sections/Contacts.vue";
import type {IService} from "~/utils/interfaces/IService";
import ServiceHero from "~/components/site/services/ServiceHero.vue";
import ContactModal from "~/components/modals/ContactModal.vue";
import ServiceAbout from "~/components/site/services/ServiceAbout.vue";
import ServiceFeatures from "~/components/site/services/ServiceFeatures.vue";
import ServicePricing from "~/components/site/services/ServicePricing.vue";
import ServiceProjects from "~/components/site/services/ServiceProjects.vue";

definePageMeta({
  layout: 'site-custom'
})

const api = useApi()
const route = useRoute()
const serviceId = computed(() => route.params.id as string)

const showModal = ref(false)

const settings = ref<Record<string, string>>({})

const {data: service} = await useAsyncData<IService>(
    `service-${serviceId.value}`,
    () => api.getServiceId(serviceId.value),
    {
      watch: [serviceId]
    }
)

const mockServices: IService[] = [
  {
    id: 'landing',
    icon: 'landing.svg',
    name: 'Лендинг под ключ',
    description: 'Одностраничный сайт для презентации продукта или услуги с акцентом на конверсию.',
    examples: 'Сайты для стартапов, маркетинговые страницы, MVP',
    price_from: 30000,
    price_currency: '₽',
    deadline: '5–7 дней',
  },
  {
    id: 'corporate',
    icon: 'corporate.svg',
    name: 'Корпоративный сайт',
    description: 'Многостраничный сайт для компании с услугами, блогом и контактами.',
    examples: 'IT-компании, агентства, бизнес-сайты',
    price_from: 70000,
    price_currency: '₽',
    deadline: '10–14 дней',
  },
  {
    id: 'shop',
    icon: 'shop.svg',
    name: 'Интернет-магазин',
    description: 'Полноценный e-commerce с каталогом, корзиной и оплатой.',
    examples: 'Магазины одежды, цифровых товаров, маркетплейсы',
    price_from: 120000,
    price_currency: '₽',
    deadline: '14–21 день',
  },
  {
    id: 'spa',
    icon: 'spa.svg',
    name: 'SPA / Web-приложение',
    description: 'Интерактивное веб-приложение на Vue / Nuxt с API.',
    examples: 'CRM, панели управления, личные кабинеты',
    price_from: 150000,
    price_currency: '₽',
    deadline: '20–30 дней',
  },
  {
    id: 'redesign',
    icon: 'redesign.svg',
    name: 'Редизайн сайта',
    description: 'Обновление дизайна и UX без потери текущего контента.',
    examples: 'Редизайн старых сайтов, улучшение UI',
    price_from: 40000,
    price_currency: '₽',
    deadline: '7–10 дней',
  },
  // {
  //   id: 'seo',
  //   icon: 'seo.svg',
  //   name: 'SEO-подготовка',
  //   description: 'Техническая оптимизация сайта под поисковые системы.',
  //   examples: 'Оптимизация скорости, мета-данные, структура',
  //   price_from: 25000,
  //   price_currency: '₽',
  //   deadline: '3–5 дней',
  // },
  // {
  //   id: 'support',
  //   icon: 'support.svg',
  //   name: 'Поддержка и доработка',
  //   description: 'Поддержка проекта, исправления и развитие функционала.',
  //   examples: 'Фиксы, новые блоки, улучшения',
  //   price_from: 15000,
  //   price_currency: '₽',
  //   deadline: 'По запросу',
  // },
]

onMounted(async () => {
  const data = await api.getSettings();
  settings.value = data.settings;
});
</script>

<style scoped>

</style>