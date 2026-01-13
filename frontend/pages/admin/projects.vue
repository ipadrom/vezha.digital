<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Проекты</h1>
        <button @click="openModal()" class="btn-primary">+ Добавить</button>
      </div>

      <div class="card overflow-hidden">
        <table class="w-full">
          <thead class="bg-light-bg-secondary dark:bg-dark-bg">
            <tr>
              <th class="text-left p-4 text-sm font-medium text-gray-500">Проект</th>
              <th class="text-left p-4 text-sm font-medium text-gray-500">Тип</th>
              <th class="text-left p-4 text-sm font-medium text-gray-500">Статус</th>
              <th class="text-right p-4 text-sm font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id" class="border-t border-light-border dark:border-dark-border">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <img v-if="item.image_url" :src="getImageUrl(item.image_url)" class="w-12 h-12 rounded object-cover" />
                  <div v-else class="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <p class="font-medium">{{ item.title_ru }}</p>
                    <p class="text-sm text-gray-500">{{ item.title_en }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">{{ item.project_type }}</td>
              <td class="p-4">
                <span :class="['text-xs px-2 py-1 rounded', item.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500']">
                  {{ item.is_active ? 'Активен' : 'Скрыт' }}
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
        <div class="bg-light-bg dark:bg-dark-bg rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold mb-4">{{ editingItem ? 'Редактировать' : 'Добавить' }} проект</h2>

          <form @submit.prevent="saveItem" class="space-y-4">
            <!-- Image Upload -->
            <div>
              <label class="block text-sm font-medium mb-2">Изображение проекта</label>
              <div class="flex items-start gap-4">
                <div class="w-32 h-32 rounded-lg border-2 border-dashed border-light-border dark:border-dark-border flex items-center justify-center overflow-hidden">
                  <img v-if="form.image_url" :src="getImageUrl(form.image_url)" class="w-full h-full object-cover" />
                  <span v-else class="text-gray-400 text-sm text-center px-2">Нет изображения</span>
                </div>
                <div class="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="hidden"
                    ref="imageInput"
                  />
                  <button
                    type="button"
                    @click="($refs.imageInput as HTMLInputElement)?.click()"
                    class="btn-secondary mb-2"
                    :disabled="uploading"
                  >
                    {{ uploading ? 'Загрузка...' : 'Выбрать файл' }}
                  </button>
                  <p class="text-xs text-gray-500">JPG, PNG, WebP до 10MB</p>
                  <input
                    v-model="form.image_url"
                    type="text"
                    placeholder="Или вставьте URL"
                    class="mt-2 w-full px-3 py-1.5 text-sm rounded-lg border border-light-border dark:border-dark-border bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Название (RU)</label>
                <input v-model="form.title_ru" type="text" required class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Название (EN)</label>
                <input v-model="form.title_en" type="text" required class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Описание (RU)</label>
                <textarea v-model="form.description_ru" rows="3" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Описание (EN)</label>
                <textarea v-model="form.description_en" rows="3" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Тип проекта</label>
                <select v-model="form.project_type" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent">
                  <option value="web">Web</option>
                  <option value="telegram">Telegram</option>
                  <option value="mobile">Mobile</option>
                  <option value="ai">AI</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Ссылка на проект</label>
                <input v-model="form.link" type="text" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Технологии (через запятую)</label>
              <input v-model="form.technologies" type="text" placeholder="Vue, FastAPI, PostgreSQL" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Порядок</label>
                <input v-model.number="form.sort_order" type="number" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
              <div class="flex items-center gap-2 pt-6">
                <input v-model="form.is_active" type="checkbox" id="is_active" class="rounded" />
                <label for="is_active">Активен</label>
              </div>
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
  title_ru: '',
  title_en: '',
  description_ru: '',
  description_en: '',
  image_url: '',
  link: '',
  project_type: 'web',
  technologies: '',
  sort_order: 0,
  is_active: true,
}

const form = reactive({ ...defaultForm })

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${config.public.apiUrl}${url}`
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const result = await uploadFile(file)
    form.image_url = result.url
  } catch (error) {
    console.error('Upload error:', error)
    alert('Ошибка загрузки файла')
  } finally {
    uploading.value = false
  }
}

const fetchItems = async () => {
  try {
    items.value = await fetchWithAuth('/projects')
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
      await fetchWithAuth(`/projects/${editingItem.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      })
    } else {
      await fetchWithAuth('/projects', {
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
  if (!confirm('Удалить этот проект?')) return
  try {
    await fetchWithAuth(`/projects/${id}`, { method: 'DELETE' })
    fetchItems()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  if (isAuthenticated.value) fetchItems()
})

useHead({ title: 'Проекты - VEZHA Admin' })
</script>
