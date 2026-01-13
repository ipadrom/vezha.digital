<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Услуги</h1>
        <button @click="openModal()" class="btn-primary">+ Добавить</button>
      </div>

      <div class="card overflow-hidden">
        <table class="w-full">
          <thead class="bg-light-bg-secondary dark:bg-dark-bg">
            <tr>
              <th class="text-left p-4 text-sm font-medium text-gray-500">Название</th>
              <th class="text-left p-4 text-sm font-medium text-gray-500">Цена</th>
              <th class="text-left p-4 text-sm font-medium text-gray-500">Статус</th>
              <th class="text-right p-4 text-sm font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id" class="border-t border-light-border dark:border-dark-border">
              <td class="p-4">
                <p class="font-medium">{{ item.name_ru }}</p>
                <p class="text-sm text-gray-500">{{ item.name_en }}</p>
              </td>
              <td class="p-4">от {{ formatPrice(item.price_from) }} {{ item.price_currency }}</td>
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
        <div class="bg-light-bg dark:bg-dark-bg rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold mb-4">{{ editingItem ? 'Редактировать' : 'Добавить' }} услугу</h2>

          <form @submit.prevent="saveItem" class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Название (RU)</label>
                <input v-model="form.name_ru" type="text" required class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Название (EN)</label>
                <input v-model="form.name_en" type="text" required class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Описание (RU)</label>
                <textarea v-model="form.description_ru" required rows="3" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Описание (EN)</label>
                <textarea v-model="form.description_en" required rows="3" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Примеры (RU)</label>
                <input v-model="form.examples_ru" type="text" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Примеры (EN)</label>
                <input v-model="form.examples_en" type="text" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
            </div>

            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Иконка</label>
                <input v-model="form.icon" type="text" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Цена от</label>
                <input v-model.number="form.price_from" type="number" required class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Порядок</label>
                <input v-model.number="form.sort_order" type="number" class="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
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
const { fetchWithAuth, isAuthenticated } = useAuth()
const router = useRouter()

watch(isAuthenticated, (value) => {
  if (!value) router.push('/admin/login')
}, { immediate: true })

const items = ref<any[]>([])
const showModal = ref(false)
const editingItem = ref<any>(null)

const defaultForm = {
  icon: 'code',
  name_ru: '',
  name_en: '',
  description_ru: '',
  description_en: '',
  examples_ru: '',
  examples_en: '',
  price_from: 50000,
  price_currency: '₽',
  sort_order: 0,
  is_active: true,
}

const form = reactive({ ...defaultForm })

const fetchItems = async () => {
  try {
    items.value = await fetchWithAuth('/services')
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
      await fetchWithAuth(`/services/${editingItem.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      })
    } else {
      await fetchWithAuth('/services', {
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
  if (!confirm('Удалить эту услугу?')) return
  try {
    await fetchWithAuth(`/services/${id}`, { method: 'DELETE' })
    fetchItems()
  } catch (error) {
    console.error(error)
  }
}

const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price)

onMounted(() => {
  if (isAuthenticated.value) fetchItems()
})

useHead({ title: 'Услуги - VEZHA Admin' })
</script>
