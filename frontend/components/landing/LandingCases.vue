<template>
  <section id="cases" class="vz-cases" aria-labelledby="cases-title">
    <header class="vz-cases__heading">
      <div class="vz-cases__title-block">
        <div class="vz-section-label"><span>{{ copy.label }}</span><i>/</i><span>04</span></div>
        <h2 id="cases-title">{{ copy.title }}</h2>
      </div>
      <p>{{ copy.intro }}</p>
    </header>

    <div class="vz-cases__shell">
      <div class="vz-cases__tabs" role="tablist" :aria-label="copy.tabAria" @keydown.left.prevent="move(-1)" @keydown.right.prevent="move(1)">
        <button v-for="(item, index) in cases" :id="`case-tab-${index}`" :key="item.slug || item.id" type="button" role="tab"
          :aria-selected="index === activeIndex" :tabindex="index === activeIndex ? 0 : -1" @click="activeIndex = index">
          <span>{{ two(index + 1) }}</span><b>{{ item.name }}</b><small>{{ item.type }}</small>
        </button>
      </div>

      <Transition name="case-switch" mode="out-in">
        <article v-if="activeCase" :key="activeCase.id" class="vz-cases__active" role="tabpanel" :aria-labelledby="`case-tab-${activeIndex}`">
          <div class="vz-cases__story">
            <div class="vz-cases__meta"><span>{{ activeCase.industry }}</span><span>{{ activeCase.type }}</span></div>
            <h3>{{ activeCase.name }}</h3>
            <p>{{ activeCase.description }}</p>
            <CaseMetricGrid :metrics="activeCase.metrics.slice(0, 3)" />
            <NuxtLink class="vz-cases__link" :to="`/cases/${activeCase.slug}`">{{ copy.open }} <span>↗</span></NuxtLink>
          </div>
          <CaseVisual :project="activeCase" :index-label="two(activeIndex + 1)" :locale="currentLocale" />
        </article>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import CaseMetricGrid from "~/components/cases/CaseMetricGrid.vue";
import CaseVisual from "~/components/cases/CaseVisual.vue";
import type { IProjects } from "~/utils/interfaces/IProjects";
import { mergeFeaturedProjects, moveCaseIndex } from "~/utils/landingCases";

const props = defineProps<{ projects: IProjects[]; fallback: IProjects[]; copy: { label: string; title: string; intro: string; tabAria: string; open: string } }>();
const { locale } = useI18n();
const currentLocale = computed<"ru" | "en">(() => locale.value === "ru" ? "ru" : "en");
const activeIndex = ref(0);
const cases = computed(() => mergeFeaturedProjects(props.projects, props.fallback, ["wellness-app"]));
const activeCase = computed(() => cases.value[activeIndex.value]);
const two = (value: number) => value.toString().padStart(2, "0");
function move(direction: 1 | -1) {
  activeIndex.value = moveCaseIndex(activeIndex.value, direction, cases.value.length);
  nextTick(() => document.getElementById(`case-tab-${activeIndex.value}`)?.focus());
}
watch(cases, () => { if (activeIndex.value >= cases.value.length) activeIndex.value = 0; });
</script>

<style src="~/assets/css/landing-cases.css"></style>
