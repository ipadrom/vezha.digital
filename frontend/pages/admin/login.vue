<template>
  <div class="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
    <div class="card max-w-md w-full mx-4">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-accent-light dark:bg-accent-dark flex items-center justify-center">
          <span class="text-white dark:text-dark-bg font-bold text-3xl">V</span>
        </div>
        <h1 class="text-2xl font-bold">VEZHA Admin</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Войдите через Telegram</p>
      </div>

      <!-- Telegram Login Widget placeholder -->
      <div ref="telegramContainer" class="flex justify-center">
        <div class="text-center text-gray-500 py-4">
          <p class="mb-4">Telegram Login Widget</p>
          <p class="text-sm">Настройте TELEGRAM_BOT_USERNAME в .env</p>
        </div>
      </div>

      <div class="mt-6 pt-6 border-t border-light-border dark:border-dark-border text-center">
        <NuxtLink to="/" class="text-sm text-gray-500 hover:text-accent-light dark:hover:text-accent-dark">
          ← Вернуться на сайт
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { loginWithTelegram, isAuthenticated } = useAuth()
const router = useRouter()

const telegramContainer = ref<HTMLElement | null>(null)

// Redirect if already authenticated
watch(isAuthenticated, (value) => {
  if (value) {
    router.push('/admin')
  }
}, { immediate: true })

// Load Telegram Widget
onMounted(() => {
  if (!config.public.telegramBotUsername) return

  // Create callback function
  ;(window as any).onTelegramAuth = async (user: any) => {
    try {
      await loginWithTelegram(user)
      router.push('/admin')
    } catch (error) {
      console.error('Login failed:', error)
      alert('Ошибка авторизации. Возможно, вы не являетесь администратором.')
    }
  }

  // Load Telegram script
  const script = document.createElement('script')
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', config.public.telegramBotUsername)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-radius', '8')
  script.setAttribute('data-onauth', 'onTelegramAuth(user)')
  script.setAttribute('data-request-access', 'write')
  script.async = true

  if (telegramContainer.value) {
    telegramContainer.value.innerHTML = ''
    telegramContainer.value.appendChild(script)
  }
})

// SEO
useHead({
  title: 'Вход в админку - VEZHA Digital',
})

definePageMeta({
  layout: false,
})
</script>
