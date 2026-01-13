<template>
  <AdminLayout>
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">Настройки сайта</h1>

      <div class="card">
        <form @submit.prevent="saveSettings" class="space-y-6">
          <div v-for="setting in settings" :key="setting.key" class="border-b border-light-border dark:border-dark-border pb-4 last:border-0">
            <label class="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
              {{ settingLabels[setting.key] || setting.key }}
            </label>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-gray-500">RU</span>
                <input v-model="setting.value_ru" type="text" class="w-full mt-1 px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
              <div>
                <span class="text-xs text-gray-500">EN</span>
                <input v-model="setting.value_en" type="text" class="w-full mt-1 px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-transparent" />
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button type="submit" class="btn-primary">Сохранить</button>
          </div>
        </form>
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

const settings = ref<any[]>([])

const settingLabels: Record<string, string> = {
  hero_title: 'Заголовок Hero',
  hero_subtitle: 'Подзаголовок Hero',
  hero_price: 'Цена в Hero',
  contact_telegram: 'Telegram',
  contact_email: 'Email',
  contact_phone: 'Телефон',
  footer_copyright: 'Копирайт в футере',
  cta_title: 'Заголовок CTA',
  cta_subtitle: 'Подзаголовок CTA',
}

const fetchSettings = async () => {
  try {
    settings.value = await fetchWithAuth('/settings')
  } catch (error) {
    console.error(error)
  }
}

const saveSettings = async () => {
  try {
    for (const setting of settings.value) {
      await fetchWithAuth(`/settings/${setting.key}`, {
        method: 'PUT',
        body: JSON.stringify({
          value_ru: setting.value_ru,
          value_en: setting.value_en,
        }),
      })
    }
    alert('Настройки сохранены')
  } catch (error) {
    console.error(error)
    alert('Ошибка сохранения')
  }
}

onMounted(() => {
  if (isAuthenticated.value) fetchSettings()
})

useHead({ title: 'Настройки - VEZHA Admin' })
</script>
