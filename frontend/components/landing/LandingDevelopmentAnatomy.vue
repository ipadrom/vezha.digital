<template>
  <section id="stages" ref="rootRef" class="vz-stages" data-stages-dark>
    <div class="vz-code-layer" data-code-layer aria-hidden="true">
      <pre>import SwiftUI
import Observation

@Observable
final class ProjectStore {
    private(set) var projects: [Project] = []
    private let api: ProjectAPI

    init(api: ProjectAPI = .live) {
        self.api = api
    }

    func refresh() async throws {
        projects = try await api.projects()
    }
}</pre>
      <pre>struct ProjectBoard: View {
    @State private var store = ProjectStore()

    var body: some View {
        ScrollView {
            LazyVGrid(columns: [.adaptive(minimum: 280)]) {
                ForEach(store.projects) { project in
                    ProjectCard(project: project)
                }
            }
            .padding(24)
        }
        .task {
            try? await store.refresh()
        }
    }
}</pre>
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

type DevelopmentStage = { n: string; title: string; desc: string; dur: string };
type DevelopmentAnatomyCopy = { label: string; title: string; text: string };

defineProps<{ stages: DevelopmentStage[]; copy: DevelopmentAnatomyCopy }>();
const emit = defineEmits<{ revealed: [] }>();
const rootRef = ref<HTMLElement | null>(null);

useDevelopmentAnatomyReveal(rootRef, () => emit("revealed"));
</script>

<style src="~/assets/css/landing-development-anatomy.css"></style>
