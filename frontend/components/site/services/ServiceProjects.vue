<template>
  <section class="section" id="projects">
    <div class="container">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>
        Кейсы
        <span class="bracket">/&gt;</span>
      </h2>
      <div class="projects">
        <div class="project" onclick="openProjectModal(1)">
          <div class="project__image"></div>
          <div class="project__info">
            <h3>Название проекта</h3>
            <p>Тип проекта</p>
          </div>
          <div class="project__hover">
            <h3>Название проекта</h3>
            <p class="type">Тип проекта</p>
            <p class="desc">Подробное описание проекта Telegram Mini App</p>
            <div class="tags">
              <span>React</span>
              <span>Telegram</span>
              <span>FastAPI</span>
            </div>
            <button class="btn btn--small" onclick="event.stopPropagation()">Смотреть проект</button>
          </div>
        </div>

        <div class="project" onclick="openProjectModal(2)">
          <div class="project__image"></div>
          <div class="project__info">
            <h3>Название проекта</h3>
            <p>Тип проекта</p>
          </div>
          <div class="project__hover">
            <h3>Название проекта</h3>
            <p class="type">Тип проекта</p>
            <p class="desc">Подробное описание проекта Telegram Mini App</p>
            <div class="tags">
              <span>Vue.js</span>
              <span>Telegram</span>
              <span>Python</span>
            </div>
            <button class="btn btn--small" onclick="event.stopPropagation()">Смотреть проект</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type {IService} from "~/utils/interfaces/IService";

  defineProps<{
    service: IService | null
  }>()
</script>

<style scoped>
/* Projects */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 30px;
}

.project {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 1160px;
  background: var(--bg-secondary);
  border: 3px solid var(--border);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  color: #e0e0e0;
  border-radius: 0;
  margin: auto;
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
</style>