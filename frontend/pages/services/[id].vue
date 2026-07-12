<template>
<section>
  <ServiceHero
      :service="service"
      @openModal="showModal = true"
  />

  <ServiceAbout
      v-if="service?.about"
      :service="service ? [service] : []"
  />

  <ServiceFeatures
      v-if="service?.items && service.items.length"
      :items="service?.items"
  />

  <ServicePricing
      v-if="service?.example_list && service.example_list.length"
      :examples="service?.example_list || []"
  />

  <ServiceProjects
      :service="service ? [service] : []"
  />

  <ContactModal
      v-model:showModal="showModal"
  />

  <Contacts
      :settings="settings"
      @openModal="showModal = true"
  />
</section>
</template>

<script setup lang="ts">
import Contacts from "~/components/site/sections/Contacts.vue";
import type {IServices} from "~/utils/interfaces/IServices";
import ServiceHero from "~/components/site/services/ServiceHero.vue";
import ContactModal from "~/components/modals/ContactModal.vue";
import ServiceAbout from "~/components/site/services/ServiceAbout.vue";
import ServiceFeatures from "~/components/site/services/ServiceFeatures.vue";
import ServicePricing from "~/components/site/services/ServicePricing.vue";
import ServiceProjects from "~/components/site/services/ServiceProjects.vue";

const api = useApi()
const route = useRoute()
const serviceId = computed(() => route.params.id as string)

const showModal = ref(false)

const settings = ref<Record<string, string>>({})

const {data: service} = await useAsyncData<IServices>(
    `service-${serviceId.value}`,
    () => api.getServiceId(serviceId.value),
    {
      watch: [serviceId]
    }
)


onMounted(async () => {
  const data = await api.getSettings();
  settings.value = data.settings;
});
</script>
