<template>
  <section id="evidence" class="case-results">
    <header><span>{{ locale === "ru" ? "02 / Доказательства" : "02 / Evidence" }}</span><h2>{{ locale === "ru" ? "Результат в структуре, а не в обещании" : "The result lives in the structure, not the promise" }}</h2></header>
    <p v-if="summary" class="case-results__lead">{{ summary }}</p>
    <CaseMetricGrid :metrics="metrics" />
    <blockquote v-if="testimonial"><p>“{{ testimonial }}”</p><cite>{{ author }}</cite></blockquote>
  </section>
</template>

<script setup lang="ts">
import CaseMetricGrid from "~/components/cases/CaseMetricGrid.vue";
import type { IProjectMetric } from "~/utils/interfaces/IProjects";
defineProps<{ summary?: string | null; metrics: IProjectMetric[]; testimonial?: string | null; author?: string | null; locale: "ru" | "en" }>();
</script>
