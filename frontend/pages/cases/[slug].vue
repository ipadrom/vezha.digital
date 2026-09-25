<template>
  <div class="case-page" :data-theme="theme" :data-case-slug="slug">
    <CaseScrollThumb :theme="theme" />
    <div v-if="heroBackground" class="case-top-tint" :style="{ backgroundColor: heroBackground }" aria-hidden="true" />
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
import PublicCaseBuilder from "~/components/case-builder/PublicCaseBuilder.vue";
import type { IProjectDetail, IProjects } from "~/utils/interfaces/IProjects";
import { getCaseFallbacks } from "~/utils/caseFallbacks";
import { caseHeroColorDefaults, normalizeHexColor } from "~/utils/caseBuilder";
import { absoluteSiteUrl, shareImageUrl } from "~/utils/seo";

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
// Loaded during SSR so crawlers and link previews get the case title, description and image.
const { data: caseData, refresh: refreshCase } = await useAsyncData(`case-page:${slug.value}`, async () => {
  const [projectResult, projectsResult] = await Promise.allSettled([
    getProjectBySlug(slug.value, currentLocale.value),
    getProjects(currentLocale.value),
  ]);
  return {
    project: projectResult.status === "fulfilled" ? projectResult.value : null,
    projects: projectsResult.status === "fulfilled" ? projectsResult.value : null,
  };
}, { watch: [slug, currentLocale] });
const project = computed<IProjectDetail | null>(() => caseData.value?.project || fallbacks.value.find((item) => item.slug === slug.value) || null);
const publicProjects = computed<IProjects[]>(() => caseData.value?.projects || fallbacks.value);
if (!project.value) throw createError({ statusCode: 404, statusMessage: "Case not found", fatal: true });
watch(project, (value) => {
  if (!value) showError({ statusCode: 404, statusMessage: "Case not found" });
});
const caseIndex = computed(() => Math.max(0, fallbacks.value.findIndex((item) => item.slug === project.value?.slug)));
const relatedProjects = computed(() => publicProjects.value.filter(item => item.slug !== slug.value));
const two = (value: number) => String(value).padStart(2, "0");
const heroBackground = computed(() => {
  const hero = project.value?.blocks?.find((block) => block.type === "hero");
  return hero ? normalizeHexColor(hero.settings?.hero_background, caseHeroColorDefaults.background) : null;
});

const seoDescription = computed(() => project.value?.seo_description || project.value?.description || project.value?.subtitle || "");
const canonicalUrl = computed(() => absoluteSiteUrl(`/cases/${slug.value}`));
useSeoMeta({
  title: () => project.value?.seo_title || `${project.value?.name} — VEZHA Digital`,
  description: seoDescription,
  ogTitle: () => project.value?.seo_title || project.value?.name,
  ogDescription: seoDescription,
  ogType: "article",
  ogUrl: canonicalUrl,
  ogImage: () => shareImageUrl(project.value?.seo_image_url, project.value?.cover_image_url, project.value?.image_url),
  twitterCard: "summary_large_image",
  robots: () => project.value?.seo_noindex || project.value?.metrics.some((metric) => metric.is_demo) ? "noindex, nofollow" : undefined,
});
useHead({ link: [{ rel: "canonical", href: canonicalUrl }] });
function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
  localStorage.setItem("vz_theme", theme.value);
}
onMounted(() => {
  theme.value = localStorage.getItem("vz_theme") === "dark" ? "dark" : "light";
  // A failed server-side fetch rendered the local fallback; retry from the browser.
  if (!caseData.value?.project) refreshCase();
});
</script>

<style src="~/assets/css/case-detail.css"></style>

<style>
/* Not a src block: plugin-vue maps one src file to one SFC, and index.vue owns this one.
   The import must open the block: CSS drops an @import that follows any rule. */
@import "~/assets/css/site-polish.css";
/* iOS Safari tints its status band from the first full-width fixed box with a plain background at the top edge
   (sampled 4px inside). This strip gives it the case header colour; the root background covers the bottom band. */
.case-top-tint { display: none; }
@media (max-width: 900px) {
  .case-top-tint { position: fixed; top: 0; right: 0; left: 0; z-index: 211; display: block; height: 6px; }
}
</style>
