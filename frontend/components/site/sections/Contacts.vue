<template>
  <section
      id="contacts"
      class="section"
      ref="contactsRef"
  >
    <div class="container-main">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>{{ $t('contacts.title') }}<span class="bracket">/&gt;</span>
      </h2>

      <div class="contact">
        <!-- Left Column: Contact Info -->
        <div class="contact__left">
          <h3 class="font-bold">Готовы начать?</h3>
          <p>Обсудим ваш проект и рассчитаем точную стоимость</p>

          <div class="contacts-list">
            <a
              v-if="settings?.contact_telegram"
              :href="`https://t.me/${settings.contact_telegram.replace('@', '')}`"
              target="_blank"
            >
              <span>📱</span> Telegram: {{ settings.contact_telegram }}
            </a>
            <a
              v-if="settings?.contact_email"
              :href="`mailto:${settings.contact_email}`"
              @click.prevent="copyToClipboard(settings.contact_email)"
            >
              <span>📧</span> Email: {{ settings.contact_email }}
            </a>
            <a
              v-if="settings?.contact_phone"
              :href="`tel:${settings.contact_phone?.replace(/\D/g, '')}`"
              @click.prevent="copyToClipboard(settings.contact_phone)"
            >
              <span>📞</span> Телефон: {{ settings.contact_phone }}
            </a>
          </div>

          <button class="btn btn-primary btn-large" @click="$emit('openModal')">
            {{ $t('cta.submit') }}
          </button>
        </div>

        <!-- Right Column: Terminal -->
          <div
            class="contact__right"
            v-if="isSectionVisible && !isAdaptiveMobile"
          >
            <div class="terminal fade-item">
              <div class="terminal__header">faq.sh</div>
              <div class="terminal__body">
                <div class="terminal__line">
                  <span class="prompt">$</span> cat faq.json
                </div>
                <div class="faq-list">
                  <div
                    v-for="(item, i) in FAQ"
                    :key="i"
                    class="faq-item"
                    :class="{ open: openFaq === i }"
                    @click="openFaq = openFaq === i ? null : i"
                  >
                    <div class="faq-item__question">
                      <span class="faq-item__arrow">{{ openFaq === i ? '▾' : '▸' }}</span>
                      <span class="faq-item__text">{{ item.q }}</span>
                    </div>
                    <Transition name="faq-expand">
                      <div v-if="openFaq === i" class="faq-item__answer">
                        {{ item.a }}
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { isSectionVisible, targetRef: contactsRef } = useSectionVisible(0.1)

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

const openFaq = ref<number | null>(0)

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
}

.contact__left h3 {
  font-family: var(--font-epilepsy);
  font-size: 2rem;
  margin-bottom: 20px;
}

.contact__left > p {
  color: var(--text-dim);
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

/* Terminal */
.terminal {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  overflow: hidden;
}

.terminal__header {
  background: var(--bg-tertiary);
  padding: 10px 15px;
  border-bottom: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 0.9rem;
}

.terminal__body {
  padding: 20px;
}

.terminal__line {
  margin-bottom: 15px;
}

.terminal__line .prompt {
  color: var(--accent);
}

.terminal__body pre {
  color: var(--text-dim);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.8;
}

/* ── FAQ accordion ── */
.faq-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.faq-item {
  border-bottom: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  user-select: none;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-item__question {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  color: #e0e0e0;
  line-height: 1.5;
  transition: color 0.2s;
}

.faq-item:hover .faq-item__question,
.faq-item.open .faq-item__question {
  color: var(--accent);
}

.faq-item__arrow {
  color: var(--accent);
  font-size: 0.75rem;
  margin-top: 1px;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.faq-item__answer {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: var(--text-dim);
  line-height: 1.7;
  padding: 0 0 12px 16px;
  border-left: 2px solid var(--accent);
  margin-left: 4px;
}

/* ── FAQ transition ── */
.faq-expand-enter-active,
.faq-expand-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  overflow: hidden;
}
.faq-expand-enter-from,
.faq-expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.fade-down-enter-from{
  opacity: 0;
  transform: translateY(-15px);
}

.fade-down-enter-to{
  opacity: 1;
  transform: translateY(0);
}

.fade-down-enter-active{
  transition: all 0.5s ease-out;
  transition-delay: var(--enter-delay, 0s);
}

.fade-item {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
  animation: cardRevealDown 0.9s ease-out forwards;
  animation-delay: var(--enter-delay, 0s);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardRevealDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
    clip-path: inset(0 0 100% 0);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    clip-path: inset(0 0 0 0);
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
