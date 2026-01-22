<template>
  <div v-if="showModal" class="modal active">
    <div class="modal__overlay" @click="showModal = false"></div>
    <div class="modal__box">
      <button class="modal__close" @click="showModal = false">&times;</button>
      <h2>
        <span class="bracket">&lt;</span>{{ $t('cta.title') }}<span class="bracket">/&gt;</span>
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
</template>

<script setup lang="ts">
const props = defineProps({
  showModal: { type: Boolean, required: true },
})
const emit = defineEmits(['update:showModal'])

const showModal = computed({
  get: () => props.showModal,
  set: (val: boolean) => emit('update:showModal', val),
})
const { submitContact } = useApi()
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

// Close modal on Escape
onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      showModal.value = false
    }
  })
})
</script>