<template>
  <div class="case-visual" :class="`case-visual--${variant}`">
    <img v-if="project.cover_image_url || project.image_url" :src="project.cover_image_url || project.image_url || ''" :alt="project.name" />
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
    <div v-if="project.hero_metric_value" class="case-visual__metric">
      <strong>{{ project.hero_metric_value }}</strong><span>{{ project.hero_metric_label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IProjects } from "~/utils/interfaces/IProjects";

withDefaults(defineProps<{ project: IProjects; indexLabel?: string; variant?: "default" | "wide" }>(), {
  indexLabel: "01", variant: "default",
});
</script>
