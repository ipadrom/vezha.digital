<template>
  <div class="wellness-case">
    <section id="evidence" class="wellness-evidence">
      <header><span>{{ locale === "ru" ? "01 / Показатели" : "01 / Evidence" }}</span><h2>{{ content.evidenceTitle }}</h2></header>
      <p class="wellness-evidence__lead">{{ evidenceLead }}</p>
      <CaseMetricGrid :metrics="project.metrics" />
      <p v-if="hasDemoMetrics" class="wellness-evidence__demo"><span>DEMO</span>{{ content.demoLabel }}</p>
    </section>

    <section id="story" class="wellness-evolution">
      <header><span>{{ content.evolution.eyebrow }}</span><h2>{{ content.evolution.title }}</h2></header>
      <div class="wellness-evolution__grid">
        <article v-for="stage in [content.evolution.before, content.evolution.after]" :key="stage.label">
          <span>{{ stage.label }}</span><h3>{{ stage.title }}</h3>
          <ol><li v-for="point in stage.points" :key="point">{{ point }}</li></ol>
        </article>
      </div>
    </section>

    <WellnessCaseChapter :chapter="content.chapters[0]" />
    <WellnessCaseChapter :chapter="content.chapters[1]" reverse />

    <section class="wellness-technical-intro">
      <span>{{ content.technical.eyebrow }}</span>
      <div><h2>{{ content.technical.title }}</h2><p>{{ content.technical.lead }}</p></div>
    </section>
    <CaseTechnicalModule :technologies="project.technologies" :project-type="project.type" :locale="locale" />

    <section class="wellness-conclusion">
      <span>{{ content.conclusion.eyebrow }}</span>
      <div><h2>{{ content.conclusion.title }}</h2><p>{{ content.conclusion.lead }}</p></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import CaseMetricGrid from "~/components/cases/CaseMetricGrid.vue";
import CaseTechnicalModule from "~/components/cases/CaseTechnicalModule.vue";
import WellnessCaseChapter from "~/components/cases/WellnessCaseChapter.vue";
import type { IProjectDetail } from "~/utils/interfaces/IProjects";
import { getWellnessCaseContent } from "~/utils/wellnessCaseContent";

const props = defineProps<{ project: IProjectDetail; locale: "ru" | "en" }>();
const content = computed(() => getWellnessCaseContent(props.locale));
const hasDemoMetrics = computed(() => props.project.metrics.some((metric) => metric.is_demo));
const evidenceLead = computed(() => hasDemoMetrics.value ? content.value.evidenceLead : content.value.verifiedEvidenceLead);
</script>

<style src="~/assets/css/wellness-case.css"></style>
