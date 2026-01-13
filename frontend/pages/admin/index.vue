<template>
  <AdminLayout>
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Dashboard</h1>

      <!-- Stats -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card">
          <p class="text-sm text-gray-500">Услуги</p>
          <p class="text-3xl font-bold">{{ stats.services }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-500">Проекты</p>
          <p class="text-3xl font-bold">{{ stats.projects }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-500">Заявки</p>
          <p class="text-3xl font-bold">{{ stats.requests }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-gray-500">Необработанных</p>
          <p class="text-3xl font-bold text-accent-light dark:text-accent-dark">{{ stats.unprocessed }}</p>
        </div>
      </div>

      <!-- Recent Requests -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Последние заявки</h2>
          <NuxtLink to="/admin/requests" class="text-sm text-accent-light dark:text-accent-dark hover:underline">
            Все заявки →
          </NuxtLink>
        </div>

        <div v-if="recentRequests.length === 0" class="text-center py-8 text-gray-500">
          Заявок пока нет
        </div>

        <div v-else class="space-y-3">
          <div v-for="request in recentRequests" :key="request.id" class="p-4 rounded-lg bg-light-bg-secondary dark:bg-dark-bg">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-medium">{{ request.name }}</p>
                <p class="text-sm text-gray-500">{{ request.contact }}</p>
              </div>
              <span :class="['text-xs px-2 py-1 rounded', request.is_processed ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500']">
                {{ request.is_processed ? 'Обработана' : 'Новая' }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{{ request.message }}</p>
            <p class="text-xs text-gray-500 mt-2">{{ formatDate(request.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
const { fetchWithAuth, isAuthenticated } = useAuth()
const router = useRouter()

// Redirect if not authenticated
watch(isAuthenticated, (value) => {
  if (!value) {
    router.push('/admin/login')
  }
}, { immediate: true })

const stats = ref({
  services: 0,
  projects: 0,
  requests: 0,
  unprocessed: 0,
})

const recentRequests = ref<any[]>([])

const fetchData = async () => {
  try {
    const [services, projects, requests] = await Promise.all([
      fetchWithAuth<any[]>('/services'),
      fetchWithAuth<any[]>('/projects'),
      fetchWithAuth<any[]>('/requests'),
    ])

    stats.value = {
      services: services.length,
      projects: projects.length,
      requests: requests.length,
      unprocessed: requests.filter(r => !r.is_processed).length,
    }

    recentRequests.value = requests.slice(0, 5)
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    fetchData()
  }
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

useHead({
  title: 'Dashboard - VEZHA Admin',
})
</script>
