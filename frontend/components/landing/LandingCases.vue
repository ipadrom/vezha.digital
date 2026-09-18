<template>
  <section id="cases" class="vz-cases" aria-labelledby="cases-title">
    <header class="vz-cases__heading">
      <div class="vz-cases__title-block">
        <div class="vz-section-label"><span>{{ copy.label }}</span><i>/</i><span>05</span></div>
        <h2 id="cases-title"><span><span data-reveal>{{ copy.title }}</span></span></h2>
      </div>
      <p>{{ copy.intro }}</p>
    </header>

    <div v-if="activeCase" class="vz-cases__shell" role="region" aria-roledescription="carousel" :aria-label="copy.tabAria">
      <div class="vz-cases__stage" :data-direction="transitionDirection">
        <Transition name="case-switch">
          <CaseArtifactVisual :key="activeCase.id" :project="activeCase" :index-label="two(activeIndex + 1)" :locale="currentLocale" />
        </Transition>
        <div v-if="cases.length > 1" class="vz-cases__controls" role="group" :aria-label="copy.tabAria" @keydown="onControlsKeydown">
          <button type="button" aria-controls="case-summary" :aria-label="currentLocale === 'ru' ? 'Предыдущий кейс' : 'Previous case'" @click="move(-1)">
            <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M9 5 4 10l5 5M4 10h12" /></svg>
          </button>
          <span class="vz-cases__counter" aria-live="polite" aria-atomic="true">{{ two(activeIndex + 1) }} / {{ two(cases.length) }}</span>
          <button type="button" aria-controls="case-summary" :aria-label="currentLocale === 'ru' ? 'Следующий кейс' : 'Next case'" @click="move(1)">
            <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m11 5 5 5-5 5M4 10h12" /></svg>
          </button>
        </div>
      </div>
      <footer id="case-summary" class="vz-cases__summary">
        <div class="vz-cases__summary-copy" aria-live="polite" aria-atomic="true">
          <h3>{{ activeCase.name }}</h3>
          <p v-if="activeCase.type">{{ activeCase.type }}</p>
        </div>
        <NuxtLink class="vz-cases__open" :to="`/cases/${activeCase.slug}`" :aria-label="`${copy.open}: ${activeCase.name}`">
          {{ copy.open }}
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M5 15 15 5M5 5h10v10" /></svg>
        </NuxtLink>
      </footer>
    </div>
    <div v-else class="vz-cases__empty" role="status"><p>{{ copy.empty }}</p></div>
  </section>
</template>

<script setup lang="ts">
import CaseArtifactVisual from "~/components/cases/CaseArtifactVisual.vue";
import type { IProjects } from "~/utils/interfaces/IProjects";
import { mergeFeaturedProjects, moveCaseIndex } from "~/utils/landingCases";

const props = defineProps<{
  projects: IProjects[];
  fallback: IProjects[];
  copy: {
    label: string;
    title: string;
    intro: string;
    tabAria: string;
    open: string;
    proof: string;
    empty: string;
  };
}>();

const { locale } = useI18n();
const currentLocale = computed<"ru" | "en">(() => locale.value === "ru" ? "ru" : "en");
const activeIndex = ref(0);
const transitionDirection = ref<"next" | "previous">("next");
const cases = computed(() => mergeFeaturedProjects(props.projects, props.fallback));
const activeCase = computed(() => cases.value[activeIndex.value]);
const two = (value: number) => String(value).padStart(2, "0");
function move(direction: 1 | -1) {
  transitionDirection.value = direction === 1 ? "next" : "previous";
  activeIndex.value = moveCaseIndex(activeIndex.value, direction, cases.value.length);
}
function onControlsKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    move(event.key === "ArrowRight" ? 1 : -1);
  } else if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    transitionDirection.value = event.key === "Home" ? "previous" : "next";
    activeIndex.value = event.key === "Home" ? 0 : Math.max(0, cases.value.length - 1);
  }
}
watch(cases, () => {
  if (activeIndex.value >= cases.value.length) activeIndex.value = 0;
});
</script>

<style src="~/assets/css/landing-cases.css"></style>
