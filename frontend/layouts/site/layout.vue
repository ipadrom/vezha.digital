<template>
  <div class="page-wrapper">
    <!-- Header -->
    <Header @open-modal="openModal()"/>

    <main>
      <slot/>
    </main>

    <!-- Footer -->
    <Footer :settings="settings"/>

    <!-- Contact Modal -->
    <ContactModal v-model:showModal="showModal" :initial-message="modalMessage"/>

  </div>
</template>

<script setup lang="ts">

import ContactModal from "~/components/modals/ContactModal.vue";

const showModal = ref(false)
const settings = ref({})

const modalRequest = useState<{ open: boolean; message: string }>('modalRequest', () => ({ open: false, message: '' }))
const modalMessage = ref('')

const openModal = (message = '') => {
  modalMessage.value = message
  showModal.value = true
}

watch(() => modalRequest.value.open, (val) => {
  if (val) {
    openModal(modalRequest.value.message)
    modalRequest.value = { open: false, message: '' }
  }
})

</script>