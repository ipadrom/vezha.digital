<template>
  <section class="case-menu-preview" :class="`case-menu-preview--${view}`">
    <div class="case-menu-canvas">
      <header class="case-menu-canvas__header">
        <span class="case-menu-canvas__brand"><b>VEZHA</b><small>DIGITAL</small></span>
        <span>КОНЦЕПТ ВЫБОРА КЕЙСА / {{ variant.padStart(2, "0") }}</span>
      </header>

      <div class="menu-demo" :class="`menu-demo--v${variant}`">
        <aside v-if="variant === '1'" class="menu-rail" aria-label="Редакторский rail">
          <button
            v-for="project in projects"
            :key="project.id"
            type="button"
            class="menu-rail__item"
            :class="{ 'is-active': project.id === activeProjectId }"
            :aria-pressed="project.id === activeProjectId"
            @click="activeProjectId = project.id"
          >
            <span>{{ project.id }}</span>
            <b>{{ project.name }}</b>
            <small>{{ project.kind }}</small>
          </button>
        </aside>

        <nav v-if="variant === '2'" class="menu-index" aria-label="Верхний индекс">
          <button
            v-for="project in projects"
            :key="project.id"
            type="button"
            :class="{ 'is-active': project.id === '01' }"
          >
            <span>{{ project.id }}</span>{{ project.short }}
          </button>
        </nav>

        <aside v-if="variant === '5'" class="menu-track" aria-label="Числовой трек">
          <button
            v-for="project in projects"
            :key="project.id"
            type="button"
            :class="{ 'is-active': project.id === '01' }"
            :aria-label="project.name"
          >
            {{ project.id }}
          </button>
        </aside>

        <article class="demo-case">
          <div v-if="variant === '3'" class="menu-selector">
            <span>ВЫБРАННЫЙ КЕЙС</span>
            <button type="button" :aria-expanded="isSelectorOpen" @click="isSelectorOpen = !isSelectorOpen">
              <small>01 / 04</small>
              <b>WELLNESS APP</b>
              <i aria-hidden="true">⌄</i>
            </button>
            <div v-if="isSelectorOpen" class="menu-selector__list">
              <button v-for="project in projects.slice(1)" :key="project.id" type="button">
                <small>{{ project.id }}</small>{{ project.name }}
              </button>
            </div>
          </div>

          <div class="demo-case__copy">
            <span>КЕЙС {{ activeProject.id }} / {{ projects.length.toString().padStart(2, "0") }}</span>
            <h1>{{ activeProject.name }}</h1>
            <p>{{ activeProject.description }}</p>
            <dl>
              <div><dt>ФОРМАТ</dt><dd>{{ activeProject.kind }}</dd></div>
              <div><dt>СФЕРА</dt><dd>{{ activeProject.sector }}</dd></div>
            </dl>
          </div>

          <div class="demo-case__visual" :aria-label="`Превью ${activeProject.name}`">
            <div class="demo-case__phone">
              <span>{{ activeProject.monogram }}</span>
              <small>{{ activeProject.name }}</small>
            </div>
          </div>
        </article>

        <aside v-if="variant === '4'" class="menu-stack" aria-label="Стопка кейсов">
          <button
            v-for="(project, index) in projects"
            :key="project.id"
            type="button"
            :class="{ 'is-active': project.id === '01' }"
            :style="{
              '--stack-offset': `${38 + index * 118}px`,
              '--stack-shift': `${index * 2}px`,
              '--stack-nudge': `${index * 7}px`,
              '--stack-mobile-shift': `${index * 5}px`,
            }"
          >
            <span>{{ project.id }} / 04</span>
            <b>{{ project.name }}</b>
          </button>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CaseMenuVariantId, CaseMenuView } from "~/utils/caseMenuVariants";

defineProps<{ variant: CaseMenuVariantId; view: CaseMenuView }>();

const isSelectorOpen = ref(false);

const projects = [
  { id: "01", name: "WELLNESS APP", short: "WELLNESS", kind: "PRODUCT / PWA / VUE", sector: "WELLNESS", monogram: "W", description: "От персонального трекера к единой системе тренировок и питания." },
  { id: "02", name: "МЕНЮ ДЛЯ ЗАКАЗА", short: "МЕНЮ", kind: "TELEGRAM MINI APP", sector: "HOSPITALITY", monogram: "M", description: "Быстрый сценарий заказа, который остаётся удобным прямо в мессенджере." },
  { id: "03", name: "AI-ПОДДЕРЖКА", short: "AI", kind: "AI / AUTOMATION", sector: "CUSTOMER CARE", monogram: "A", description: "Система поддержки, которая помогает команде отвечать точнее и быстрее." },
  { id: "04", name: "CRM-СИСТЕМА", short: "CRM", kind: "CORPORATE SYSTEM", sector: "OPERATIONS", monogram: "C", description: "Единая рабочая среда для прозрачных процессов и сильной клиентской команды." },
];

const activeProjectId = ref(projects[0].id);
const activeProject = computed(() => projects.find((project) => project.id === activeProjectId.value) ?? projects[0]);
</script>
