<template>
  <section id="stages" ref="rootRef" class="vz-stages" data-stages-dark>
    <div class="vz-code-layer" data-code-layer aria-hidden="true">
      <pre>{{ typedCode[0] }}<span class="vz-code-caret"></span></pre>
      <pre>{{ typedCode[1] }}<span class="vz-code-caret"></span></pre>
    </div>

    <div class="vz-stages__aura" aria-hidden="true"></div>
    <div class="vz-wrap">
      <div class="vz-stages__head">
        <div class="vz-section-label">
          <span>{{ copy.label }}</span><i>/</i><span data-secnum>04</span>
        </div>
        <h2><span><span data-reveal>{{ copy.title }}</span></span></h2>
        <p>{{ copy.text }}</p>
      </div>

      <div class="vz-stage-cards" data-stages-cards>
        <article
          v-for="(stage, index) in stages"
          :key="`${stage.n}-${stage.title}`"
          data-stage-card
          :style="{ '--stage-index': index }"
          :class="['vz-stage-card', { 'vz-stage-card--dark': index === 1 || index === 3 || index === 6 }]"
        >
          <div class="vz-stage-card__num">{{ stage.n }}</div>
          <div class="vz-stage-card__content">
            <span>{{ stage.dur }}</span>
            <h3>{{ stage.title }}</h3>
            <p>{{ stage.desc }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDevelopmentAnatomyReveal } from "~/composables/landing/useDevelopmentAnatomyReveal";
import { useBackgroundCodeTyping } from "~/composables/landing/useBackgroundCodeTyping";

type DevelopmentStage = { n: string; title: string; desc: string; dur: string };
type DevelopmentAnatomyCopy = { label: string; title: string; text: string };

defineProps<{ stages: DevelopmentStage[]; copy: DevelopmentAnatomyCopy }>();
const emit = defineEmits<{ revealed: [] }>();
const rootRef = ref<HTMLElement | null>(null);
const goCode = [
  `package project

import (
    "context"
    "net/http"
)

type Service struct {
    repo ProjectRepository
}

func (s *Service) Projects(ctx context.Context) ([]Project, error) {
    return s.repo.List(ctx)
}`,
  `func RegisterRoutes(router *http.ServeMux, service *Service) {
    router.HandleFunc("GET /api/projects", func(w http.ResponseWriter, r *http.Request) {
        projects, err := service.Projects(r.Context())
        if err != nil {
            http.Error(w, "service unavailable", http.StatusServiceUnavailable)
            return
        }

        writeJSON(w, http.StatusOK, projects)
    })
}`,
] as const;
const { typedCode, start: startCodeTyping } = useBackgroundCodeTyping(goCode);

useDevelopmentAnatomyReveal(rootRef, () => {
  startCodeTyping();
  emit("revealed");
});
</script>

<style src="~/assets/css/landing-development-anatomy.css"></style>
