<template>
  <section id="contacts" class="vz-contacts">
    <div class="vz-contacts__art" aria-hidden="true">
      <div></div>
      <span v-for="corner in 4" :key="corner" :class="`vz-corner vz-corner--${corner}`"><i></i><b></b></span>
    </div>
    <div class="vz-contacts__inner">
      <div class="vz-section-label">
        <span>{{ copy.label }}</span>
        <i>/</i>
        <span data-secnum>05</span>
      </div>
      <h2><span><span data-reveal>{{ copy.title }}</span></span></h2>
      <div class="vz-contacts__buttons" data-contacts-btns>
        <a class="vz-button vz-button--dark" :href="`mailto:${contactEmail}`">{{ copy.emailCta }}</a>
        <a class="vz-button vz-button--light" :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  copy: {
    label: string;
    title: string;
    emailCta: string;
  };
  contactEmail: string;
}>();
</script>
