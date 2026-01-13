<template>
  <div class="min-h-screen">
    <SiteHeader />
    <main>
      <SiteHero :settings="settings" />
      <SiteServices :services="services" />
      <SiteAdvantages :advantages="advantages" />
      <SiteProjects :projects="projects" />
      <SiteTechStack :tech-stack="techStack" />
      <SiteWorkStages :stages="workStages" />
      <SiteContacts :settings="settings" />
    </main>
    <SiteFooter :settings="settings" />
  </div>
</template>

<script setup lang="ts">
const { getServices, getProjects, getAdvantages, getTechStack, getWorkStages, getSettings } = useApi()

const services = ref<any[]>([])
const projects = ref<any[]>([])
const advantages = ref<any[]>([])
const techStack = ref<any[]>([])
const workStages = ref<any[]>([])
const settings = ref<Record<string, string>>({})

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
})
</script>
