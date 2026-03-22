<template>
  <div v-if="showModal" class="modal active">
    <div class="modal__overlay" @click="showModal = false"></div>
    <div class="modal__box">
      <button class="modal__close" @click="showModal = false">&times;</button>
      <h2 class="section-title modal-title">
        {{ $t('cta.title') }} <span class="bracket">&gt;</span>
      </h2>
      <form @submit.prevent="handleSubmit">
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
          <label for="agree">Я согласен на <a href="/privacy" class="privacy-link" @click.prevent="goToPrivacy">обработку персональных данных</a></label>
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
</template>

<script setup lang="ts">
import {useBlockScroll} from "~/composables/useBlockScroll";

const { lockScroll, unlockScroll} = useBlockScroll()

const props = defineProps({
  showModal: { type: Boolean, required: true },
  initialMessage: { type: String, default: '' },
})

const emit = defineEmits(['update:showModal'])

const showModal = computed({
  get: () => props.showModal,
  set: (val: boolean) => emit('update:showModal', val),
})
const { submitContact } = useApi()
const agreed = ref(false)
const navigatingToPrivacy = ref(false)
const form = reactive({
  name: '',
  contact: '',
  message: '',
})

watch(() => props.showModal, (val) => {
  if (val && props.initialMessage) {
    form.message = props.initialMessage
  }
  if (!val && !navigatingToPrivacy.value) {
    form.message = ''
    form.name = ''
    form.contact = ''
    agreed.value = false
  }
})
const isSubmitting = ref(false)
const status = ref<'success' | 'error' | null>(null)

const handleSubmit = async () => {
  if (!agreed.value) return

  // TODO: раскомментировать после регистрации в РКН
  // isSubmitting.value = true
  // status.value = null
  // try {
  //   await submitContact(form)
  //   status.value = 'success'
  //   form.name = ''
  //   form.contact = ''
  //   form.message = ''
  //   setTimeout(() => {
  //     showModal.value = false
  //     status.value = null
  //   }, 2000)
  // } catch {
  //   status.value = 'error'
  // } finally {
  //   isSubmitting.value = false
  // }

  status.value = 'success'
  form.name = ''
  form.contact = ''
  form.message = ''
  setTimeout(() => {
    showModal.value = false
    status.value = null
  }, 2000)
}

watch(showModal, (isOpen) => {
  isOpen ? lockScroll() : unlockScroll()
})

// Save form data and navigate to privacy page in same tab
const goToPrivacy = () => {
  sessionStorage.setItem('contactFormData', JSON.stringify({
    name: form.name,
    contact: form.contact,
    message: form.message,
    agreed: agreed.value,
  }))
  navigatingToPrivacy.value = true
  showModal.value = false
  nextTick(() => navigateTo('/privacy'))
}

// Restore form data if returning from privacy page
onMounted(() => {
  const saved = sessionStorage.getItem('contactFormData')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      form.name = data.name || ''
      form.contact = data.contact || ''
      form.message = data.message || ''
      agreed.value = data.agreed || false
      sessionStorage.removeItem('contactFormData')
      // Reopen modal
      showModal.value = true
    } catch {}
  }

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      showModal.value = false
    }
  })
})
</script>
<style scoped>
.modal {
  max-height: 100vh;
  overflow-y: hidden;
  position: fixed;
}

.modal-title {
  font-family: var(--font-inter) !important;
  font-size: clamp(1.4rem, 5vw, 2rem);
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: left;
  width: auto;
}

.modal__box label,
.modal__box input,
.modal__box textarea,
.modal__box button,
.modal__box .checkbox label {
  font-family: var(--font-inter);
}

.privacy-link {
  color: var(--accent);
  text-decoration: underline;
}

@media (min-width: 769px) {
  .modal-title {
    font-size: 1.8vw;
    margin-bottom: 1.2vw;
  }

  .modal__box :deep(form) { gap: 1.2vw; }
  .modal__box :deep(.field) { gap: 0.4vw; }
  .modal__box :deep(.field label) { font-size: 0.85vw; }
  .modal__box :deep(.field input),
  .modal__box :deep(.field textarea) { padding: 0.7vw; font-size: 0.85vw; }
  .modal__box :deep(.checkbox) { gap: 0.6vw; }
  .modal__box :deep(.checkbox input) { width: 1.1vw; height: 1.1vw; }
  .modal__box :deep(.checkbox label) { font-size: 0.8vw; }
  .modal__box :deep(.btn-primary) { padding: 0.7vw 1.5vw; font-size: 0.9vw; }
}
</style>