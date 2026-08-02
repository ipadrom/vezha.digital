<template>
  <div v-if="metrics.length" class="case-metrics" :class="getMetricGridClass(metrics.length)">
    <article v-for="metric in metrics" :key="`${metric.value}-${metric.label}`" class="case-metric">
      <strong>{{ metric.value }}</strong>
      <span>{{ metric.label }}</span>
      <small v-if="metric.context">{{ metric.context }}</small>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { IProjectMetric } from "~/utils/interfaces/IProjects";
import { getMetricGridClass } from "~/utils/landingCases";

defineProps<{ metrics: IProjectMetric[] }>();
</script>
