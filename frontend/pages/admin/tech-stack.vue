<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Стек технологий</h1>
        <button @click="openModal()" class="btn-primary">+ Добавить</button>
      </div>

      <div class="card overflow-hidden">
        <table class="w-full">
          <thead class="bg-light-bg-secondary dark:bg-dark-bg">
            <tr>
              <th class="text-left p-4 text-sm font-medium text-gray-500">Технология</th>
              <th class="text-left p-4 text-sm font-medium text-gray-500">Категория</th>
              <th class="text-left p-4 text-sm font-medium text-gray-500">Порядок</th>
              <th class="text-left p-4 text-sm font-medium text-gray-500">Статус</th>
              <th class="text-right p-4 text-sm font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id" class="border-t border-light-border dark:border-dark-border">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg">
                    <img v-if="item.icon && item.icon.startsWith('/')" :src="getImageUrl(item.icon)" class="w-8 h-8 object-contain" />
                    <span v-else class="text-2xl">{{ item.icon || '⚡' }}</span>
                  </div>
                  <span class="font-medium">{{ item.name }}</span>
                </div>
              </td>
              <td class="p-4">
                <span :class="['text-xs px-2 py-1 rounded', item.category === 'frontend' ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500']">
                  {{ item.category }}
                </span>
              </td>
              <td class="p-4">{{ item.sort_order }}</td>
              <td class="p-4">
                <span :class="['text-xs px-2 py-1 rounded', item.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500']">
                  {{ item.is_active ? 'Активна' : 'Скрыта' }}
                </span>
              </td>
              <td class="p-4 text-right">
                <button @click="openModal(item)" class="text-blue-500 hover:underline mr-3">Изменить</button>
                <button @click="deleteItem(item.id)" class="text-red-500 hover:underline">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showModal = false">
        <div class="bg-light-bg dark:bg-dark-bg rounded-xl p-6 max-w-lg w-full mx-4">
          <h2 class="text-xl font-bold mb-4">{{ editingItem ? 'Редактировать' : 'Добавить' }} технологию</h2>

          <form @submit.prevent="saveItem" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Название</label>
              <input v-model="form.name" type="text" required class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
            </div>

            <!-- Icon Upload -->
            <div>
              <label class="block text-sm font-medium mb-2">Иконка</label>
              <div class="flex items-start gap-4">
                <div class="w-16 h-16 rounded-lg border-2 border-dashed border-light-border dark:border-dark-border flex items-center justify-center overflow-hidden bg-light-bg-secondary dark:bg-dark-bg">
                  <img v-if="form.icon && form.icon.startsWith('/')" :src="getImageUrl(form.icon)" class="w-12 h-12 object-contain" />
                  <span v-else class="text-3xl">{{ form.icon || '⚡' }}</span>
                </div>
                <div class="flex-1">
                  <div class="flex gap-2 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      @change="handleIconUpload"
                      class="hidden"
                      ref="iconInput"
                    />
                    <button
                      type="button"
                      @click="($refs.iconInput as HTMLInputElement)?.click()"
                      class="btn-secondary text-sm"
                      :disabled="uploading"
                    >
                      {{ uploading ? '...' : 'Загрузить' }}
                    </button>
                  </div>
                  <input
                    v-model="form.icon"
                    type="text"
                    placeholder="Emoji или URL иконки"
                    class="w-full px-3 py-1.5 text-sm rounded-lg border border-light-border dark:border-dark-border bg-transparent"
                  />
                  <p class="text-xs text-gray-500 mt-1">Введите emoji (⚡) или загрузите SVG/PNG</p>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Категория</label>
              <select v-model="form.category" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent">
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Порядок</label>
              <input v-model.number="form.sort_order" type="number" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
            </div>

            <div class="flex items-center gap-2">
              <input v-model="form.is_active" type="checkbox" id="is_active" class="rounded" />
              <label for="is_active">Активна</label>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <button type="button" @click="showModal = false" class="btn-secondary">Отмена</button>
              <button type="submit" class="btn-primary">Сохранить</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { fetchWithAuth, uploadFile, isAuthenticated } = useAuth()
const router = useRouter()

watch(isAuthenticated, (value) => {
  if (!value) router.push('/admin/login')
}, { immediate: true })

const items = ref<any[]>([])
const showModal = ref(false)
const editingItem = ref<any>(null)
const uploading = ref(false)

const defaultForm = {
  name: '',
  icon: '⚡',
  category: 'frontend',
  sort_order: 0,
  is_active: true,
}

const form = reactive({ ...defaultForm })

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${config.public.apiUrl}${url}`
}

const handleIconUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const result = await uploadFile(file)
    form.icon = result.url
  } catch (error) {
    console.error('Upload error:', error)
    alert('Ошибка загрузки файла')
  } finally {
    uploading.value = false
  }
}

const fetchItems = async () => {
  try {
    items.value = await fetchWithAuth('/tech-stack')
  } catch (error) {
    console.error(error)
  }
}

const openModal = (item?: any) => {
  if (item) {
    editingItem.value = item
    Object.assign(form, item)
  } else {
    editingItem.value = null
    Object.assign(form, defaultForm)
  }
  showModal.value = true
}

const saveItem = async () => {
  try {
    if (editingItem.value) {
      await fetchWithAuth(`/tech-stack/${editingItem.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      })
    } else {
      await fetchWithAuth('/tech-stack', {
        method: 'POST',
        body: JSON.stringify(form),
      })
    }
    showModal.value = false
    fetchItems()
  } catch (error) {
    console.error(error)
    alert('Ошибка сохранения')
  }
}

const deleteItem = async (id: string) => {
  if (!confirm('Удалить эту технологию?')) return
  try {
    await fetchWithAuth(`/tech-stack/${id}`, { method: 'DELETE' })
    fetchItems()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  if (isAuthenticated.value) fetchItems()
})

useHead({ title: 'Стек технологий - VEZHA Admin' })
</script>
