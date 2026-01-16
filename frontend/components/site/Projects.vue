<template>
  <section id="projects" class="section">
    <div class="container-main">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>{{ $t('projects.title') }}<span class="bracket">/&gt;</span>
      </h2>

      <div class="projects-grid">
        <div
          v-for="project in projects"
          :key="project.id"
          class="project"
          @click="project.project_url && openProject(project.project_url)"
        >
          <div class="project__image">
            <img
              v-if="project.image_url"
              :src="getImageUrl(project.image_url)"
              :alt="project.name"
            />
          </div>
          <div class="project__info">
            <h3>{{ project.name }}</h3>
            <p>{{ project.type }}</p>
          </div>
          <div class="project__hover">
            <h3>{{ project.name }}</h3>
            <p class="type">{{ project.type }}</p>
            <p class="desc">{{ project.description }}</p>
            <div v-if="project.technologies && project.technologies.length" class="tags">
              <span v-for="(tech, idx) in project.technologies" :key="idx">{{ tech }}</span>
            </div>
            <a
              v-if="project.project_url"
              :href="project.project_url"
              target="_blank"
              class="btn btn-small"
              @click.stop
            >
              Смотреть проект
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

defineProps<{
  projects: any[]
}>()

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${config.public.apiUrl}${url}`
}

const openProject = (url: string) => {
  window.open(url, '_blank')
}
</script>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 30px;
}

.project {
  background: var(--bg-secondary);
  border: 3px solid var(--border);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  color: #e0e0e0;
  border-radius: 0;
}

.project:hover {
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--shadow);
}

.project__image {
  width: 100%;
  height: 250px;
  background: repeating-linear-gradient(
    45deg,
    var(--bg-tertiary),
    var(--bg-tertiary) 10px,
    var(--bg-secondary) 10px,
    var(--bg-secondary) 20px
  );
  overflow: hidden;
}

.project__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.project:hover .project__image img {
  transform: scale(1.05);
}

.project__info {
  padding: 20px;
}

.project__info h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.3rem;
  margin-bottom: 10px;
}

.project__info p {
  color: #e0e0e0;
}

.project__hover {
  position: absolute;
  inset: 0;
  background: var(--bg-secondary);
  padding: 30px;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transition: all 0.3s;
  pointer-events: none;
}

.project:hover .project__hover {
  opacity: 1;
  pointer-events: auto;
}

.project__hover h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.3rem;
  margin-bottom: 10px;
}

.project__hover .type {
  color: #e0e0e0;
  margin-bottom: 15px;
}

.project__hover .desc {
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 20px;
  flex: 1;
}

.project__hover .tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.project__hover .tags span {
  padding: 5px 12px;
  border: 1px solid var(--accent);
  color: var(--accent);
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .project__image {
    height: 200px;
  }
}
</style>
