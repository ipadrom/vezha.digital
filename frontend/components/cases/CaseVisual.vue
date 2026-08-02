<template>
  <div class="case-visual" :class="`case-visual--${variant}`">
    <WellnessPhoneVisual v-if="project.slug === 'wellness-app'" :title="project.name" :locale="locale" :variant="variant" />
    <img v-else-if="project.cover_image_url || project.image_url" :src="project.cover_image_url || project.image_url || ''" :alt="project.name" />
    <div v-else class="case-visual__product" aria-hidden="true">
      <div class="case-visual__top"><span></span><span></span><span></span><b>VEZHA / {{ indexLabel }}</b></div>
      <div class="case-visual__body">
        <div class="case-visual__rail"><i v-for="item in 5" :key="item"></i></div>
        <div class="case-visual__screen">
          <p>{{ project.type }}</p>
          <strong>{{ project.name }}</strong>
          <div class="case-visual__lines"><i></i><i></i><i></i></div>
        </div>
        <div class="case-visual__signal"><span></span><span></span><span></span></div>
      </div>
    </div>
    <div v-if="project.hero_metric_value && project.slug !== 'wellness-app'" class="case-visual__metric">
      <strong>{{ project.hero_metric_value }}</strong><span>{{ project.hero_metric_label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import WellnessPhoneVisual from "~/components/cases/WellnessPhoneVisual.vue";
import type { IProjects } from "~/utils/interfaces/IProjects";

withDefaults(defineProps<{ project: IProjects; indexLabel?: string; variant?: "default" | "wide"; locale?: "ru" | "en" }>(), {
  indexLabel: "01", variant: "default", locale: "ru",
});
</script>
