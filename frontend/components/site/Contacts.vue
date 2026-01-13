<template>
  <section id="contacts" class="py-20">
    <div class="container-main">
      <div class="grid lg:grid-cols-2 gap-12">
        <!-- Contact Info -->
        <div>
          <h2 class="text-3xl md:text-4xl font-bold mb-8">
            <UiGlitchText :text="$t('contacts.title')">{{ $t('contacts.title') }}</UiGlitchText>
          </h2>

          <div class="space-y-6">
            <!-- Telegram -->
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.912.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.751-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.099.154.232.17.325.014.094.032.309.018.476z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">{{ $t('contacts.telegram') }}</p>
                <a :href="`https://t.me/${(settings?.contact_telegram || '').replace('@', '')}`" target="_blank" class="font-medium hover:text-accent-light dark:hover:text-accent-dark transition-colors">
                  {{ settings?.contact_telegram }}
                </a>
              </div>
            </div>

            <!-- Email -->
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-accent-light/10 dark:bg-accent-dark/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-accent-light dark:text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">{{ $t('contacts.email') }}</p>
                <a :href="`mailto:${settings?.contact_email}`" class="font-medium hover:text-accent-light dark:hover:text-accent-dark transition-colors">
                  {{ settings?.contact_email }}
                </a>
              </div>
            </div>

            <!-- Phone -->
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">{{ $t('contacts.phone') }}</p>
                <a :href="`tel:${settings?.contact_phone?.replace(/\D/g, '')}`" class="font-medium hover:text-accent-light dark:hover:text-accent-dark transition-colors">
                  {{ settings?.contact_phone }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="card">
          <h3 class="text-2xl font-bold mb-2">{{ $t('cta.title') }}</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">{{ $t('cta.subtitle') }}</p>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <input
                v-model="form.name"
                type="text"
                :placeholder="$t('cta.name')"
                required
                class="w-full px-4 py-3 rounded-lg bg-light-bg-secondary dark:bg-dark-bg border border-light-border dark:border-dark-border focus:border-accent-light dark:focus:border-accent-dark outline-none transition-colors"
              />
            </div>
            <div>
              <input
                v-model="form.contact"
                type="text"
                :placeholder="$t('cta.contact')"
                required
                class="w-full px-4 py-3 rounded-lg bg-light-bg-secondary dark:bg-dark-bg border border-light-border dark:border-dark-border focus:border-accent-light dark:focus:border-accent-dark outline-none transition-colors"
              />
            </div>
            <div>
              <textarea
                v-model="form.message"
                :placeholder="$t('cta.message')"
                required
                rows="4"
                class="w-full px-4 py-3 rounded-lg bg-light-bg-secondary dark:bg-dark-bg border border-light-border dark:border-dark-border focus:border-accent-light dark:focus:border-accent-dark outline-none transition-colors resize-none"
              />
            </div>

            <!-- Status message -->
            <p v-if="status" :class="['text-sm', status === 'success' ? 'text-green-500' : 'text-red-500']">
              {{ status === 'success' ? $t('cta.success') : $t('cta.error') }}
            </p>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
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

const form = reactive({
  name: '',
  contact: '',
  message: '',
})

const isSubmitting = ref(false)
const status = ref<'success' | 'error' | null>(null)

const handleSubmit = async () => {
  isSubmitting.value = true
  status.value = null

  try {
    await submitContact(form)
    status.value = 'success'
    form.name = ''
    form.contact = ''
    form.message = ''
  } catch {
    status.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>
