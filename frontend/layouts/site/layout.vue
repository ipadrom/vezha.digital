<template>
  <div class="page-wrapper">
    <!-- Header -->
    <Header @open-modal="showModal = true"/>

    <main>
      <slot/>
    </main>

    <!-- Particles Canvas -->
    <ParticlesCanvas/>

    <!-- SVG Patterns -->
    <Garlands/>

    <!-- Footer -->
    <Footer :settings="settings"/>

    <!-- Contact Modal -->
    <ContactModal v-model:showModal="showModal"/>

  </div>
</template>

<script setup lang="ts">

import ContactModal from "~/components/modals/ContactModal.vue";
import ParticlesCanvas from "~/components/ui/ParticlesCanvas.vue";
import Garlands from "~/components/ui/Garlands.vue";

const showModal = ref(false);
const settings = ref({})

</script>