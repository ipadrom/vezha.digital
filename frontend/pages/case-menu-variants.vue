<template>
  <main class="case-variants-page">
    <header class="case-variants-toolbar">
      <div class="case-variants-toolbar__title">
        <NuxtLink to="/#cases">← НАЗАД К КЕЙСАМ</NuxtLink>
        <h1>ВАРИАНТЫ МЕНЮ КЕЙСОВ</h1>
        <p>{{ selected.name }} — {{ selected.note }}</p>
      </div>

      <div class="case-variants-toolbar__controls">
        <fieldset>
          <legend>ВАРИАНТ</legend>
          <button
            v-for="item in caseMenuVariants"
            :key="item.id"
            type="button"
            :aria-pressed="variant === item.id"
            @click="setVariant(item.id)"
          >
            {{ item.id }}
          </button>
        </fieldset>

        <fieldset>
          <legend>РЕЖИМ</legend>
          <button type="button" :aria-pressed="view === 'desktop'" @click="setView('desktop')">ДЕСКТОП</button>
          <button type="button" :aria-pressed="view === 'mobile'" @click="setView('mobile')">МОБИЛКА</button>
        </fieldset>
      </div>
    </header>

    <CaseMenuVariantsPreview :variant="variant" :view="view" />
  </main>
</template>

<script setup lang="ts">
import CaseMenuVariantsPreview from "~/components/cases/CaseMenuVariantsPreview.vue";
import {
  caseMenuVariants,
  getCaseMenuVariant,
  normalizeCaseMenuVariant,
  normalizeCaseMenuView,
  type CaseMenuView,
} from "~/utils/caseMenuVariants";

const route = useRoute();
const router = useRouter();

const variant = computed(() => normalizeCaseMenuVariant(route.query.variant));
const view = computed(() => normalizeCaseMenuView(route.query.view));
const selected = computed(() => getCaseMenuVariant(variant.value));

function setVariant(value: string) {
  router.replace({ query: { ...route.query, variant: normalizeCaseMenuVariant(value), view: view.value } });
}

function setView(value: CaseMenuView) {
  router.replace({ query: { ...route.query, variant: variant.value, view: value } });
}

useHead({ title: "Варианты меню кейсов — VEZHA Digital" });
</script>

<style src="~/assets/css/case-menu-variants.css"></style>
