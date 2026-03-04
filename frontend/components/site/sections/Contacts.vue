<template>
  <section id="contacts" class="section" ref="contactsRef">
    <div class="container-main">
      <div class="contact">

        <div class="contact__left">
          <h2 class="section-title contacts-section-title">
            {{ $t('contacts.title') }} <span class="bracket">&gt;</span>
          </h2>
          <p class="contacts-subtitle">Обсудим ваш проект и рассчитаем точную стоимость</p>

          <div class="contacts-list">
            <a v-if="settings?.contact_telegram"
               :href="`https://t.me/${settings.contact_telegram.replace('@', '')}`"
               target="_blank">
              <span>📱</span> Telegram: {{ settings.contact_telegram }}
            </a>
            <a v-if="settings?.contact_email"
               :href="`mailto:${settings.contact_email}`"
               @click.prevent="copyToClipboard(settings.contact_email)">
              <span>📧</span> Email: {{ settings.contact_email }}
            </a>
            <a v-if="settings?.contact_phone"
               :href="`tel:${settings.contact_phone?.replace(/\D/g, '')}`"
               @click.prevent="copyToClipboard(settings.contact_phone)">
              <span>📞</span> Телефон: {{ settings.contact_phone }}
            </a>
          </div>

          <button class="btn btn-primary btn-large" @click="$emit('openModal')">
            {{ $t('cta.submit') }}
          </button>
        </div>

        <ContactTerminal
            :faq="FAQ"
        />

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ContactTerminal from "~/components/ui/terminal/ContactTerminal.vue";

defineProps<{
  settings?: Record<string, string>
}>()

const FAQ = [
  {
    q: 'Почему важно, чтобы над проектом работала команда?',
    a: 'Один разработчик не может закрыть все задачи качественно. С вами работают дизайнер, копирайтер, маркетолог, разработчик и менеджер. Команда делает не просто сайт — а систему, которая приводит клиентов.',
  },
  {
    q: 'Зачем нужна аналитика, если сайт и так работает?',
    a: 'Без аналитики вы не знаете, что именно работает, а что — нет. Аналитика позволяет принимать решения на основе данных и масштабировать то, что реально приносит результат.',
  },
  {
    q: 'Почему не стоит заказывать сайт у фрилансера?',
    a: 'Фрилансер — это риск. Один человек не успеет сделать качественно дизайн, код, тексты и SEO одновременно. Команда даёт системный результат, поддержку и ответственность.',
  },
  {
    q: 'Сколько стоит разработка сайта?',
    a: 'Стоимость зависит от задачи: лендинг, корпоративный сайт или сложное веб-приложение — это разные бюджеты. Напишите нам — мы бесплатно оценим ваш проект.',
  },
  {
    q: 'Как быстро вы отвечаете на запросы?',
    a: 'Первый ответ — в течение 24 часов. На консультацию выходим в удобное для вас время.',
  },
]

const isAdaptiveMobile = ref(false)
const checkIsAdaptiveMobile = () => {
  isAdaptiveMobile.value = window.innerWidth <= 768
}

defineEmits(['openModal'])

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    const notification = document.createElement('div')
    notification.textContent = 'Скопировано!'
    notification.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: var(--accent);
      color: var(--bg);
      padding: 15px 25px;
      font-family: 'JetBrains Mono', monospace;
      z-index: 10000;
      animation: fadeUp 0.3s ease-out;
    `
    document.body.appendChild(notification)
    setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transition = 'opacity 0.3s'
      setTimeout(() => document.body.removeChild(notification), 300)
    }, 2000)
  })
}

onMounted(() => {
  checkIsAdaptiveMobile()
  window.addEventListener('resize', checkIsAdaptiveMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkIsAdaptiveMobile)
})
</script>

<style scoped>
.contact {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  margin-top: 5rem;
}

.contacts-section-title {
  text-align: left;
  margin-top: 0;
  margin-bottom: 16px;
  white-space: nowrap;
}

.contacts-subtitle {
  color: var(--text-dim);
  font-family: var(--font-inter);
  font-size: 1.1rem;
  margin-bottom: 40px;
}

.contacts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.contacts-list a {
  display: flex;
  align-items: center;
  gap: 15px;
  color: var(--text);
  text-decoration: none;
  transition: all 0.3s;
  padding: 10px;
  border: 1px solid transparent;
}

.contacts-list a:hover {
  color: var(--accent);
  border-color: var(--accent);
  padding-left: 20px;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .contact {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 30px;
    font-size: 1rem;

  }

  .contact__left h3 {
    font-size: 1.4rem;
    margin-bottom: 12px;
  }

  .contact__left > p {
    font-size: 0.9rem;
    margin-bottom: 20px;
  }

  .contacts-list {
    gap: 12px;
    margin-bottom: 20px;
  }

  .contacts-list a {
    font-size: 0.85rem;
    padding: 6px 8px;
    gap: 10px;
  }
}
</style>
