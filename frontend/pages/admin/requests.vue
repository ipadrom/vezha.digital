<template>
  <AdminLayout>
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Заявки</h1>

      <div class="card">
        <div v-if="items.length === 0" class="text-center py-12 text-gray-500">
          Заявок пока нет
        </div>

        <div v-else class="divide-y divide-light-border dark:divide-dark-border">
          <div v-for="item in items" :key="item.id" class="p-4">
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="font-medium">{{ item.name }}</p>
                <p class="text-sm text-gray-500">{{ item.contact }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span :class="['text-xs px-2 py-1 rounded', item.is_processed ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500']">
                  {{ item.is_processed ? 'Обработана' : 'Новая' }}
                </span>
                <button v-if="!item.is_processed" @click="processRequest(item.id)" class="text-sm text-blue-500 hover:underline">
                  Отметить
                </button>
                <button @click="deleteRequest(item.id)" class="text-sm text-red-500 hover:underline">
                  Удалить
                </button>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{{ item.message }}</p>
            <p class="text-xs text-gray-500 mt-2">{{ formatDate(item.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
const { fetchWithAuth, isAuthenticated } = useAuth()
const router = useRouter()

watch(isAuthenticated, (value) => {
  if (!value) router.push('/admin/login')
}, { immediate: true })

const items = ref<any[]>([])

const fetchItems = async () => {
  try {
    items.value = await fetchWithAuth('/requests')
  } catch (error) {
    console.error(error)
  }
}

const processRequest = async (id: string) => {
  try {
    await fetchWithAuth(`/requests/${id}/process`, { method: 'PUT' })
    fetchItems()
  } catch (error) {
    console.error(error)
  }
}

const deleteRequest = async (id: string) => {
  if (!confirm('Удалить эту заявку?')) return
  try {
    await fetchWithAuth(`/requests/${id}`, { method: 'DELETE' })
    fetchItems()
  } catch (error) {
    console.error(error)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  if (isAuthenticated.value) fetchItems()
})

useHead({ title: 'Заявки - VEZHA Admin' })
</script>
