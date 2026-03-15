<template>
  <section
      id="contacts"
      class="section"
      ref="contactsRef"
  >
    <div class="contact">
        <!-- Left Column: Contact Info -->
        <div class="contact__left">
          <h2 class="section-title contacts-section-title">
            {{ $t('contacts.title') }} <span class="bracket">&gt;</span>
          </h2>
          <div class="contact__cta-group">
            <p class="contacts-subtitle">Обсудим ваш проект и рассчитаем точную стоимость</p>

            <div class="contacts-list">
              <a
                v-if="settings?.contact_telegram"
                :href="`https://t.me/${settings.contact_telegram.replace('@', '')}`"
                target="_blank"
              >
                <span class="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>
                </span>
                Telegram: {{ settings.contact_telegram }}
              </a>
              <a
                v-if="settings?.contact_email"
                :href="`mailto:${settings.contact_email}`"
                @click.prevent="copyToClipboard(settings.contact_email)"
              >
                <span class="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
                </span>
                Email: {{ settings.contact_email }}
              </a>
              <a
                v-if="settings?.contact_phone"
                :href="`tel:${settings.contact_phone?.replace(/\D/g, '')}`"
                @click.prevent="copyToClipboard(settings.contact_phone)"
              >
                <span class="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></svg>
                </span>
                Телефон: {{ settings.contact_phone }}
              </a>
            </div>

            <button class="btn btn-primary btn-large" @click="$emit('openModal')">
              {{ $t('cta.submit') }}
            </button>
          </div>
        </div>

        <!-- Right Column: Terminal -->
          <div
            class="contact__right"
            v-if="isSectionVisible && !isAdaptiveMobile"
          >
            <div class="terminal fade-item">
              <div class="terminal__header">
                <span class="terminal__dots">
                  <span class="terminal__dot terminal__dot--close"></span>
                  <span class="terminal__dot terminal__dot--min"></span>
                  <span class="terminal__dot terminal__dot--max"></span>
                </span>
                <span class="terminal__title">faq.sh</span>
              </div>
              <div class="terminal__body">
                <div class="faq-list">
                  <div
                    v-for="(item, i) in FAQ"
                    :key="i"
                    class="faq-item"
                    :class="{ open: openFaq === i }"
                    @click="openFaq = i"
                  >
                    <div class="faq-item__question">
                      <span class="faq-item__arrow">{{ openFaq === i ? '▾' : '▸' }}</span>
                      <span class="faq-item__text">{{ item.q }}</span>
                    </div>
                    <div v-if="openFaq === i" class="faq-item__answer">
                      {{ item.a }}
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
    q: 'С чего начать, если я не знаю, что именно мне нужно?',
    a: 'Просто напишите. Разберёмся вместе: зададим нужные вопросы, поймём задачу и предложим решение. Без обязательств.',
  },
  {
    q: 'Как быстро вы беретесь за проект?',
    a: 'В течение нескольких часов в рабочее время. Оценку стоимости и сроков даём в течение 1 дня после обсуждения задачи.',
  },
  {
    q: 'Как устроена оплата и что я получу до подписания договора?',
    a: 'Макет и ТЗ согласовываем до подписания договора. Оплата в два этапа: аванс на старте и финальный платёж после сдачи.',
  },
  {
    q: 'Вы соблюдаете сроки?',
    a: 'Да. Закладываем время с запасом и сдаём в срок. Сроки фиксируем в договоре.',
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
      font-family: var(--font-inter);
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
  gap: 3.125vw;
  margin-top: 4vw;
  padding: 0 3.125vw 70px;
  align-items: center;
}

.contact__left {
  align-self: start;
}

.contact__right {
}

.contacts-section-title {
  text-align: left;
  margin-top: 0;
  margin-bottom: 16px;
  white-space: nowrap;
}

.contact__cta-group {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
}

.contacts-subtitle {
  color: #e0e0e0;
  font-family: var(--font-inter);
  font-size: 1.5vw;
  font-weight: 400;
  line-height: 1.8;
  margin-bottom: 0;
  white-space: nowrap;
}

.contacts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 40px;
  margin-bottom: 40px;
}

.contacts-list a {
  display: flex;
  align-items: center;
  gap: 15px;
  color: var(--text);
  text-decoration: none;
  transition: all 0.3s;
  padding: 0.5vw;
  border: 1px solid transparent;
  font-family: var(--font-inter);
  font-size: 1.2vw;
  font-weight: 400;
}

.contacts-list a:hover {
  color: var(--accent);
  border-color: var(--accent);
  padding-left: 20px;
}

.contact-icon {
  color: var(--accent);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 6px rgba(0, 229, 255, 0.4));
}

.contact-icon svg {
  width: 1.5vw;
  height: 1.5vw;
}

/* Terminal */
.terminal {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
}

.terminal__header {
  background: var(--bg-tertiary);
  padding: 0.5vw 0.8vw;
  border-bottom: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 0.9vw;
  font-family: var(--font-inter);
  display: flex;
  align-items: center;
  gap: 0.6vw;
}

.terminal__dots {
  display: flex;
  gap: 0.35vw;
}

.terminal__dot {
  width: 0.65vw;
  height: 0.65vw;
  border-radius: 50%;
}

.terminal__dot--close {
  background: #0a4a50;
}

.terminal__dot--min {
  background: #064e5c;
}

.terminal__dot--max {
  background: var(--accent);
}

.terminal__title {
  font-size: 0.9vw;
}

.terminal__body {
  padding: 1vw;
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
  font-size: 0.9vw;
  line-height: 1.8;
}

/* ── FAQ accordion ── */
.faq-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
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
  padding: 0.5vw 0;
  font-family: var(--font-inter);
  font-size: 1.5vw;
  font-weight: 400;
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
  font-size: 1.5vw;
  margin-top: 1px;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.faq-item__answer {
  font-family: var(--font-inter);
  font-size: 1.2vw;
  font-weight: 400;
  color: #e0e0e0;
  line-height: 1.7;
  padding: 0.4vw 0 0.8vw 0.8vw;
  border-left: 2px solid var(--accent);
  margin-left: 4px;
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
    padding: 0 20px;
  }

  .contact__left h3 {
    font-size: 1.4rem;
    margin-bottom: 12px;
  }

  .contact__left > p {
    font-size: 0.9rem;
    margin-bottom: 20px;
  }

  .contacts-subtitle {
    font-size: 0.95rem;
    white-space: normal;
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

  .contact-icon svg {
    width: 18px;
    height: 18px;
  }

  .btn-large {
    width: 100%;
    text-align: center;
    padding: 6px 12px !important;
    font-size: 0.75rem !important;
  }
}
</style>
