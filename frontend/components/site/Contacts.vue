<template>
  <section id="contacts" class="section">
    <div class="container-main">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>{{ $t('contacts.title') }}<span class="bracket">/&gt;</span>
      </h2>

      <div class="contact">
        <!-- Left Column: Contact Info -->
        <div class="contact__left">
          <h3>Готовы начать?</h3>
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

          <a href="#" class="btn btn-primary btn-large" @click.prevent="showModal = true">
            {{ $t('cta.submit') }}
          </a>
        </div>

        <!-- Right Column: Terminal -->
        <div class="contact__right">
          <div class="terminal">
            <div class="terminal__header">contact.sh</div>
            <div class="terminal__body">
              <div class="terminal__line">
                <span class="prompt">$</span> cat contact_info.json
              </div>
              <pre>{
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
        </div>
      </div>

      <!-- Contact Modal -->
      <div v-if="showModal" class="modal active">
        <div class="modal__overlay" @click="showModal = false"></div>
        <div class="modal__box">
          <button class="modal__close" @click="showModal = false">&times;</button>
          <h2><span class="bracket">&lt;</span>{{ $t('cta.title') }}<span class="bracket">/&gt;</span></h2>
          <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
            <div class="field">
              <label>{{ $t('cta.name') }}</label>
              <input v-model="form.name" type="text" required />
            </div>
            <div class="field">
              <label>{{ $t('cta.contact') }}</label>
              <input v-model="form.contact" type="text" required />
            </div>
            <div class="field">
              <label>{{ $t('cta.message') }}</label>
              <textarea v-model="form.message" rows="5" required></textarea>
            </div>
            <div class="checkbox">
              <input v-model="agreed" type="checkbox" id="agree" required />
              <label for="agree">Я согласен на обработку персональных данных</label>
            </div>

            <p v-if="status" :class="['text-sm', status === 'success' ? 'text-accent' : 'text-red-500']">
              {{ status === 'success' ? $t('cta.success') : $t('cta.error') }}
            </p>

            <button type="submit" :disabled="isSubmitting" class="btn btn-primary btn-full">
              {{ isSubmitting ? '...' : $t('cta.submit') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  settings?: Record<string, string>
}>()

const { submitContact } = useApi()

const showModal = ref(false)
const agreed = ref(false)

const form = reactive({
  name: '',
  contact: '',
  message: '',
})

const isSubmitting = ref(false)
const status = ref<'success' | 'error' | null>(null)

const handleSubmit = async () => {
  if (!agreed.value) return

  isSubmitting.value = true
  status.value = null

  try {
    await submitContact(form)
    status.value = 'success'
    form.name = ''
    form.contact = ''
    form.message = ''
    setTimeout(() => {
      showModal.value = false
      status.value = null
    }, 2000)
  } catch {
    status.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

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
  font-size: 2rem;
  margin-bottom: 20px;
  color: var(--text);
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

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal.active {
  display: flex;
}

.modal__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(5px);
}

.modal__box {
  position: relative;
  background: var(--bg-secondary);
  border: 1px solid var(--accent);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 40px;
  z-index: 1;
}

.modal__close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s;
  width: 40px;
  height: 40px;
}

.modal__close:hover {
  color: var(--accent);
  transform: rotate(90deg);
}

.modal__box h2 {
  font-size: 1.8rem;
  margin-bottom: 30px;
  font-family: var(--font-pixel);
}

.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin-top: 2px;
}

.checkbox label {
  color: var(--text-dim);
  font-size: 0.85rem;
  cursor: pointer;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .contact {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}
</style>
