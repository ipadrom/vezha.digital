<template>
  <!-- Page Sections -->
  <Hero :settings="settings" @openModal="showModal = true" />
  <TechStack />
  <TechStackSection :tech-stack="techStack" />
  <Services :services="services" />
  <Advantages :advantages="advantages" />
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

const { getServices, getProjects, getAdvantages, getTechStack, getWorkStages, getSettings } = useApi()

const services = ref<IServices[]>([])
const projects = ref<IProjects[]>([])
const advantages = ref<IAdvantages[]>([])
const techStack = ref<ITechStack[]>([])
const workStages = ref<IWorkStages[]>([])
const settings = ref<ISettings | null>(null)

const showModal = ref(false)

// Fetch all data
onMounted(async () => {
  try {
    const [servicesData, projectsData, advantagesData, techStackData, workStagesData, settingsData] = await Promise.all([
      getServices(),
      getProjects(),
      getAdvantages(),
      getTechStack(),
      getWorkStages(),
      getSettings(),
    ])

    services.value = servicesData
    projects.value = projectsData
    advantages.value = advantagesData
    techStack.value = techStackData
    workStages.value = workStagesData
    settings.value = settingsData.settings
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
})

// SEO
useHead({
  title: 'VEZHA Digital - Веб-разработка под ключ',
  meta: [
    { name: 'description', content: 'Разработка Telegram Mini Apps, ботов, веб-сайтов и интернет-магазинов. От 50 000 ₽. Запуск за 1-4 недели.' },
    { property: 'og:title', content: 'VEZHA Digital - Веб-разработка под ключ' },
    { property: 'og:description', content: 'Разработка Telegram Mini Apps, ботов, веб-сайтов и интернет-магазинов' },
    { property: 'og:type', content: 'website' },
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Pixelify+Sans:wght@400;500;600;700&display=swap' },
  ],
})
</script>
