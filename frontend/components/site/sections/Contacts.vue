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
          <div class="contact__right" v-if="isSectionVisible">
            <TransitionGroup
                name="fade-down"
                appear
            >
            <div class="terminal fade-item">
              <div class="terminal__header fade-item" style="--enter-delay: 0.1s">contact.sh</div>
              <div class="terminal__body fade-item">
                <div class="terminal__line fade-item">
                  <span class="prompt fade-item" style="--enter-delay: 0.2s">$</span> cat contact_info.json
                </div>
                <pre style="--enter-delay: 0.3s">{
  "status": "open_to_work",
  "services": [
    "web_development",
    "telegram_apps",
    "ai_integration"
  ],
  "location": "Moscow, Russia",
  "response_time": "24 hours",
  "free_consultation": true
}</pre>
              </div>
            </div>
            </TransitionGroup>
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
    grid-template-columns: 1fr 1fr;
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

  .terminal {
    max-width: 100%;
  }

  .terminal__header {
    font-size: 0.8rem;
    padding: 8px 12px;
  }

  .terminal__body {
    padding: 12px;
  }

  .terminal__body pre {
    font-size: 0.75rem;
    line-height: 1.4;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .terminal__line {
    font-size: 0.8rem;
    margin-bottom: 10px;
  }
}
</style>
