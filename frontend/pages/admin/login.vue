<template>
  <main class="studio-login">
    <section class="studio-login__intro">
      <NuxtLink to="/">VEZHA.DIGITAL</NuxtLink>
      <div><span>CASE ASSEMBLY SYSTEM</span><h1>История проекта начинается здесь.</h1><p>Собирайте кейсы как последовательность решений, визуалов и доказательств.</p></div>
      <small>PRIVATE WORKSPACE / 2026</small>
    </section>
    <section class="studio-login__access">
      <div>
        <span class="login-index">ACCESS / 01</span>
        <h2>Вход в студию</h2>
        <p>Используйте Telegram-аккаунт администратора.</p>
        <div ref="telegramContainer" class="telegram-slot">
          <template v-if="!config.public.telegramBotUsername">
            <b>Telegram Login не настроен</b><small>Добавьте NUXT_PUBLIC_TELEGRAM_BOT_USERNAME в окружение.</small>
          </template>
        </div>
        <button v-if="isLocalhost" class="local-login" type="button" :disabled="isLoading" @click="handleLocalLogin">
          {{ isLoading ? 'Входим…' : 'Войти локально без Telegram' }}
        </button>
        <small v-if="isLocalhost" class="local-login-note">Только для локальной разработки</small>
        <p v-if="error" class="login-error">{{ error }}</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Вход — VEZHA Studio' })
const config = useRuntimeConfig()
const { loginWithTelegram, loginAsDeveloper } = useAuth()
const telegramContainer = ref<HTMLElement | null>(null)
const error = ref('')
const isLoading = ref(false)
const isLocalhost = ref(false)

onMounted(() => {
  isLocalhost.value = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  if (!config.public.telegramBotUsername) return
  ;(window as any).onTelegramAuth = async (user: unknown) => {
    error.value = ''
    try {
      await loginWithTelegram(user)
      window.location.replace('/admin/cases')
    }
    catch (cause) { error.value = cause instanceof Error ? cause.message : 'Этот аккаунт не имеет доступа.' }
  }
  const script = document.createElement('script')
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', String(config.public.telegramBotUsername))
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-radius', '6')
  script.setAttribute('data-onauth', 'onTelegramAuth(user)')
  script.setAttribute('data-request-access', 'write')
  script.async = true
  telegramContainer.value?.appendChild(script)
})

const handleLocalLogin = async () => {
  isLoading.value = true
  error.value = ''
  try {
    await loginAsDeveloper()
    window.location.replace('/admin/cases')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Не удалось выполнить локальный вход.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.studio-login { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(380px, .75fr); color: #121722; background: #f4f6f8; }
.studio-login__intro { min-height: 100vh; padding: clamp(28px, 5vw, 72px); display: flex; flex-direction: column; justify-content: space-between; color: white; background: #121722; }
.studio-login__intro > a { color: white; font: 600 12px var(--font-mono); letter-spacing: .12em; text-decoration: none; }
.studio-login__intro div { max-width: 760px; }
.studio-login__intro span, .studio-login__intro small, .login-index { color: #7ba0ff; font: 600 10px var(--font-mono); letter-spacing: .14em; }
.studio-login__intro h1 { margin: 18px 0; font: 500 clamp(54px, 7vw, 112px)/.88 var(--font-ui); letter-spacing: -.06em; }
.studio-login__intro p { max-width: 560px; color: #aeb7c6; font-size: 17px; }
.studio-login__access { display: grid; place-items: center; padding: 30px; }
.studio-login__access > div { width: min(100%, 390px); }
.studio-login__access h2 { margin: 14px 0 8px; font: 700 38px var(--font-ui); }
.studio-login__access p { color: #697386; }
.telegram-slot { min-height: 78px; margin-top: 28px; padding: 18px; display: grid; place-items: center; gap: 5px; border: 1px solid #dbe0e7; border-radius: 10px; background: white; text-align: center; }
.telegram-slot small { color: #697386; }
.local-login { width: 100%; margin-top: 12px; padding: 14px 18px; border: 0; border-radius: 8px; color: white; background: #315efb; font: 700 14px var(--font-ui); cursor: pointer; transition: background .18s ease, transform .18s ease; }
.local-login:hover { background: #214be1; transform: translateY(-1px); }
.local-login:disabled { cursor: wait; opacity: .65; transform: none; }
.local-login-note { display: block; margin-top: 8px; color: #8a94a5; text-align: center; }
.login-error { padding: 10px; color: #9d2525 !important; background: #ffe8e8; }
@media (max-width: 800px) { .studio-login { grid-template-columns: 1fr; } .studio-login__intro { min-height: 48vh; } .studio-login__access { min-height: 52vh; } .studio-login__intro h1 { font-size: clamp(48px, 14vw, 76px); } }
</style>
