<template>
  <!-- Page Sections -->
  <Hero :settings="settings" @openModal="showModal = true" />
  <TechStack />
  <TechStackSection :tech-stack="techStack" />
  <Services :services="services" />
  <Advantages :advantages="clientTypes" />
  <!-- <Projects :projects="projects" /> -->
  <WorkStages :stages="workStages" />
  <Contacts :settings="settings" @openModal="showModal = true" />

  <!-- Contact Modal -->
  <ContactModal v-model:showModal="showModal"/>
</template>

<script setup lang="ts">
import {definePageMeta} from "#imports";
import Hero from "~/components/site/sections/Hero.vue";
import TechStack from "~/components/site/sections/TechStack.vue";
import TechStackSection from "~/components/site/sections/TechStackSection.vue";
import Services from "~/components/site/sections/Services.vue";
import Advantages from "~/components/site/sections/Advantages.vue";
import Projects from "~/components/site/sections/Projects.vue";
import WorkStages from "~/components/site/sections/WorkStages.vue";
import Contacts from "~/components/site/sections/Contacts.vue";
import ContactModal from "~/components/modals/ContactModal.vue";
import type {IServices} from "~/utils/interfaces/IServices";
import type {IProjects} from "~/utils/interfaces/IProjects";
import type {IAdvantages} from "~/utils/interfaces/IAdvantages";
import type {ITechStack} from "~/utils/interfaces/ITechStack";
import type {IWorkStages} from "~/utils/interfaces/IWorkStages";
import type {ISettings} from "~/utils/interfaces/ISettings";

definePageMeta({
  layout: 'site-custom'
})

const { getServices, getProjects, getAdvantages, getClientTypes, getTechStack, getWorkStages, getSettings } = useApi()

const services = ref<IServices[]>([])
const projects = ref<IProjects[]>([])
const advantages = ref<IAdvantages[]>([])
const clientTypes = ref<any[]>([])
const techStack = ref<ITechStack[]>([])
const workStages = ref<IWorkStages[]>([])
const settings = ref<ISettings | null>(null)

const showModal = ref(false)

// Fetch all data
onMounted(async () => {
  try {
    const [servicesData, projectsData, advantagesData, clientTypesData, techStackData, workStagesData, settingsData] = await Promise.all([
      getServices(),
      getProjects(),
      getAdvantages(),
      getClientTypes(),
      getTechStack(),
      getWorkStages(),
      getSettings(),
    ])

    services.value = servicesData
    projects.value = projectsData
    advantages.value = advantagesData
    clientTypes.value = clientTypesData
    techStack.value = techStackData
    workStages.value = workStagesData
    settings.value = settingsData.settings
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
})

// SEO
useHead({
  title: 'VEZHA Digital — Веб-разработка под ключ',
  meta: [
    { name: 'description', content: 'Разработка Telegram Mini Apps, ботов, веб-сайтов, интернет-магазинов и корпоративных систем. От 40 000 ₽. Запуск за 1–4 недели.' },
    { name: 'keywords', content: 'веб-разработка, Telegram Mini Apps, Telegram боты, интернет-магазин, корпоративные системы, AI автоматизация, мобильные приложения, PWA, разработка сайтов' },
    // OpenGraph
    { property: 'og:title', content: 'VEZHA Digital — Веб-разработка под ключ' },
    { property: 'og:description', content: 'Telegram Mini Apps, боты, сайты, интернет-магазины, AI и корпоративные системы. Команда полного цикла без субподряда.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://vezha.digital' },
    { property: 'og:image', content: 'https://vezha.digital/og-image.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:locale', content: 'ru_RU' },
    { property: 'og:site_name', content: 'VEZHA Digital' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'VEZHA Digital — Веб-разработка под ключ' },
    { name: 'twitter:description', content: 'Telegram Mini Apps, боты, сайты, интернет-магазины, AI и корпоративные системы.' },
    { name: 'twitter:image', content: 'https://vezha.digital/og-image.jpg' },
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Pixelify+Sans:wght@400;500;600;700&display=swap' },
    { rel: 'canonical', href: 'https://vezha.digital' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': 'https://vezha.digital/#organization',
            name: 'VEZHA Digital',
            url: 'https://vezha.digital',
            logo: {
              '@type': 'ImageObject',
              url: 'https://vezha.digital/logo.png',
            },
            contactPoint: [
              {
                '@type': 'ContactPoint',
                telephone: '+7-993-900-23-66',
                contactType: 'sales',
                availableLanguage: ['Russian', 'English'],
              },
            ],
            sameAs: [
              'https://t.me/vezha_digital',
            ],
          },
          {
            '@type': 'WebSite',
            '@id': 'https://vezha.digital/#website',
            url: 'https://vezha.digital',
            name: 'VEZHA Digital',
            publisher: { '@id': 'https://vezha.digital/#organization' },
            inLanguage: 'ru',
          },
          {
            '@type': 'WebPage',
            '@id': 'https://vezha.digital/#webpage',
            url: 'https://vezha.digital',
            name: 'VEZHA Digital — Веб-разработка под ключ',
            description: 'Разработка Telegram Mini Apps, ботов, веб-сайтов, интернет-магазинов и корпоративных систем.',
            isPartOf: { '@id': 'https://vezha.digital/#website' },
            about: { '@id': 'https://vezha.digital/#organization' },
            inLanguage: 'ru',
          },
          {
            '@type': 'ItemList',
            '@id': 'https://vezha.digital/#services',
            name: 'Услуги',
            itemListElement: [
              {
                '@type': 'Service',
                position: 1,
                name: 'Telegram Mini Apps',
                description: 'Мини-приложения внутри Telegram: от каталога до сервиса с оплатой и личным кабинетом.',
                offers: { '@type': 'Offer', priceCurrency: 'RUB', price: '100000', priceValidUntil: '2026-12-31' },
                provider: { '@id': 'https://vezha.digital/#organization' },
              },
              {
                '@type': 'Service',
                position: 2,
                name: 'Telegram боты',
                description: 'Автоматизация через Telegram: приём заявок, запись клиентов, рассылки, AI-ассистенты.',
                offers: { '@type': 'Offer', priceCurrency: 'RUB', price: '40000', priceValidUntil: '2026-12-31' },
                provider: { '@id': 'https://vezha.digital/#organization' },
              },
              {
                '@type': 'Service',
                position: 3,
                name: 'Веб-сайты',
                description: 'Лендинги, корпоративные сайты, каталоги и промо-страницы для всех устройств.',
                offers: { '@type': 'Offer', priceCurrency: 'RUB', price: '40000', priceValidUntil: '2026-12-31' },
                provider: { '@id': 'https://vezha.digital/#organization' },
              },
              {
                '@type': 'Service',
                position: 4,
                name: 'Интернет-магазины',
                description: 'Магазин, удобный покупателю и легко администрируемый.',
                offers: { '@type': 'Offer', priceCurrency: 'RUB', price: '250000', priceValidUntil: '2026-12-31' },
                provider: { '@id': 'https://vezha.digital/#organization' },
              },
              {
                '@type': 'Service',
                position: 5,
                name: 'AI и автоматизация',
                description: 'Чат-боты, обработка данных, автоматизация рутинных процессов с AI.',
                offers: { '@type': 'Offer', priceCurrency: 'RUB', price: '100000', priceValidUntil: '2026-12-31' },
                provider: { '@id': 'https://vezha.digital/#organization' },
              },
              {
                '@type': 'Service',
                position: 6,
                name: 'Корпоративные системы',
                description: 'Инструмент под ваши процессы: учёт, аналитика, управление проектами.',
                offers: { '@type': 'Offer', priceCurrency: 'RUB', price: '450000', priceValidUntil: '2026-12-31' },
                provider: { '@id': 'https://vezha.digital/#organization' },
              },
              {
                '@type': 'Service',
                position: 7,
                name: 'Мобильные приложения',
                description: 'PWA-приложение для iOS и Android без публикации в магазинах.',
                offers: { '@type': 'Offer', priceCurrency: 'RUB', price: '300000', priceValidUntil: '2026-12-31' },
                provider: { '@id': 'https://vezha.digital/#organization' },
              },
            ],
          },
          {
            '@type': 'FAQPage',
            '@id': 'https://vezha.digital/#faq',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Сколько стоит разработка Telegram Mini App?',
                acceptedAnswer: { '@type': 'Answer', text: 'От 100 000 ₽. Финальная стоимость зависит от сложности и функциональности проекта.' },
              },
              {
                '@type': 'Question',
                name: 'Сколько времени занимает разработка?',
                acceptedAnswer: { '@type': 'Answer', text: 'Типовой проект — от 1 до 4 недель. Корпоративные системы — от 2 месяцев.' },
              },
              {
                '@type': 'Question',
                name: 'Какие технологии вы используете?',
                acceptedAnswer: { '@type': 'Answer', text: 'Vue/Nuxt, React/Next.js, Node.js, Python, PostgreSQL, Docker и другие инструменты, подобранные под задачу.' },
              },
            ],
          },
        ],
      }),
    },
  ],
})
</script>
