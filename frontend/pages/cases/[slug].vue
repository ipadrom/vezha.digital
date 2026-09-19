<template>
  <div class="case-page" :data-theme="theme" :data-case-slug="slug">
    <CaseScrollThumb :theme="theme" />
    <CaseDetailHeader :locale="currentLocale" :theme="theme" :has-technical="Boolean(project?.technologies.length)" @toggle-theme="toggleTheme" />

    <main v-if="project">
      <CaseMediaViewer :locale="currentLocale">
      <PublicCaseBuilder
        v-if="project.blocks?.length"
        :blocks="project.blocks"
        :locale="currentLocale"
        :related-projects="relatedProjects"
        :current-slug="slug"
      />
      <template v-else>
      <section class="case-hero">
        <div class="case-hero__index"><span>CASE / {{ two(caseIndex + 1) }}</span><span>{{ project.year || "2026" }}</span></div>
        <div class="case-hero__title">
          <p>{{ project.type }} · {{ project.industry }}</p>
          <h1>{{ project.name }}</h1>
          <p>{{ project.subtitle }}</p>
        </div>
        <dl class="case-hero__facts">
          <div><dt>{{ currentLocale === "ru" ? "Формат" : "Format" }}</dt><dd>{{ project.type }}</dd></div>
          <div><dt>{{ currentLocale === "ru" ? "Сфера" : "Industry" }}</dt><dd>{{ project.industry }}</dd></div>
          <div><dt>{{ currentLocale === "ru" ? "Контур" : "Scope" }}</dt><dd>{{ project.timeline }}</dd></div>
        </dl>
        <CaseVisual :project="project" :index-label="two(caseIndex + 1)" :locale="currentLocale" variant="wide" />
      </section>

      <WellnessCaseStudy v-if="project.slug === 'wellness-app'" :project="project" :locale="currentLocale" />
      <template v-else>
      <section id="story" class="case-story">
        <header><span>{{ currentLocale === "ru" ? "01 / История" : "01 / Story" }}</span><h2>{{ currentLocale === "ru" ? "Сначала — задача. Потом — интерфейс." : "The task comes first. The interface follows." }}</h2></header>
        <div class="case-story__chapters">
          <article><span>{{ currentLocale === "ru" ? "Вызов" : "Challenge" }}</span><p>{{ project.challenge }}</p></article>
          <article><span>{{ currentLocale === "ru" ? "Решение" : "Solution" }}</span><p>{{ project.solution }}</p></article>
        </div>
        <div class="case-story__artifact" aria-hidden="true"><div><span>01 / INPUT</span><b>{{ project.industry }}</b></div><i>→</i><div><span>02 / SYSTEM</span><b>VEZHA.DIGITAL</b></div><i>→</i><div><span>03 / PRODUCT</span><b>{{ project.type }}</b></div></div>
      </section>

      <CaseGallery :gallery="project.gallery" :locale="currentLocale" />
      <CaseResults :summary="project.result_summary" :metrics="project.metrics" :testimonial="project.testimonial" :author="project.testimonial_author" :locale="currentLocale" />
      <CaseTechnicalModule :technologies="project.technologies" :project-type="project.type" :locale="currentLocale" />
      </template>
      </template>
      <section v-if="!project.blocks?.some(block => block.type === 'next_case')" class="builder-case"><div class="builder-block builder-block--next_case"><div class="builder-block__inner"><CaseNavigation :content="{ title: currentLocale === 'ru' ? 'Другие проекты' : 'More projects', cta_label: currentLocale === 'ru' ? 'Все кейсы' : 'All cases' }" :locale="currentLocale" :related-projects="relatedProjects" :current-slug="slug" /></div></div></section>
      </CaseMediaViewer>
    </main>
  </div>
</template>

<script setup lang="ts">
import CaseMediaViewer from "~/components/cases/CaseMediaViewer.vue";
import CaseNavigation from "~/components/cases/CaseNavigation.vue";
import CaseDetailHeader from "~/components/cases/CaseDetailHeader.vue";
import CaseGallery from "~/components/cases/CaseGallery.vue";
import CaseResults from "~/components/cases/CaseResults.vue";
import CaseScrollThumb from "~/components/cases/CaseScrollThumb.vue";
import CaseTechnicalModule from "~/components/cases/CaseTechnicalModule.vue";
import CaseVisual from "~/components/cases/CaseVisual.vue";
import WellnessCaseStudy from "~/components/cases/WellnessCaseStudy.vue";
import PublicCaseBuilder from "~/components/case-builder/PublicCaseBuilder.vue";
import type { IProjectDetail, IProjects } from "~/utils/interfaces/IProjects";
import { getCaseFallbacks } from "~/utils/caseFallbacks";

definePageMeta({ layout: false });
const route = useRoute();
const { locale } = useI18n();
const { getProjectBySlug, getProjects } = useApi();
const currentLocale = computed<"ru" | "en">(() => locale.value === "ru" ? "ru" : "en");
const theme = ref<"light" | "dark">("light");
useHead(() => ({
  htmlAttrs: {
    class: `case-route case-route--${theme.value} overlay-scrollbar-route`,
  },
}));
const slug = computed(() => String(route.params.slug));
const fallbacks = computed(() => getCaseFallbacks(currentLocale.value));
const project = ref<IProjectDetail | null>(null);
const publicProjects = ref<IProjects[]>([]);
const caseIndex = computed(() => Math.max(0, fallbacks.value.findIndex((item) => item.slug === project.value?.slug)));
const relatedProjects = computed(() => publicProjects.value.filter(item => item.slug !== slug.value));
const two = (value: number) => String(value).padStart(2, "0");

async function loadProject() {
  const fallback = fallbacks.value.find((item) => item.slug === slug.value) || null;
  const [projectResult, projectsResult] = await Promise.allSettled([
    getProjectBySlug(slug.value, currentLocale.value),
    getProjects(currentLocale.value),
  ]);
  project.value = projectResult.status === "fulfilled" ? projectResult.value : fallback;
  publicProjects.value = projectsResult.status === "fulfilled" ? projectsResult.value : fallbacks.value;
  if (!project.value) throw createError({ statusCode: 404, statusMessage: "Case not found" });
  applySeo();
}
function applySeo() {
  if (!project.value) return;
  useSeoMeta({
    title: project.value.seo_title || `${project.value.name} — VEZHA Digital`,
    description: project.value.seo_description || project.value.description || project.value.subtitle || "",
    ogImage: project.value.seo_image_url || project.value.cover_image_url || project.value.image_url || undefined,
    robots: project.value.seo_noindex || project.value.metrics.some((metric) => metric.is_demo) ? "noindex, nofollow" : undefined,
  });
}
function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
  localStorage.setItem("vz_theme", theme.value);
}
watch([slug, currentLocale], loadProject);
onMounted(() => {
  theme.value = localStorage.getItem("vz_theme") === "dark" ? "dark" : "light";
  loadProject();
});
</script>

<style src="~/assets/css/case-detail.css"></style>

<style src="~/assets/css/site-polish.css"></style>
