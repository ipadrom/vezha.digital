<template>
  <!-- Mobile-only layout: 3 rows -->
  <div class="stack-mobile">

    <!-- Row 1: title + description -->
    <div class="stack-mobile-top">
      <h2 class="stack-section-title">Стек <span class="bracket">&gt;</span></h2>
      <div class="stack-description">
        <p>Работаем на проверенном стеке: React, Vue, Next.js на фронте, Python и FastAPI на бэке. Всё упаковываем в Docker, храним в PostgreSQL.</p>
        <p>Не гонимся за хайповыми фреймворками — выбираем то, что надёжно работает и легко поддерживается после сдачи.</p>
      </div>
    </div>

    <!-- Row 2: Frontend orbit canvas (left) + Frontend info (right) -->
    <div class="stack-mobile-row">
      <MiniOrbitsCanvas
          :techs="MINI_FRONTEND_TECHS"
          :reverse="false"
      />
      <div class="stack-mobile-info">
        <h3 class="stack-group-title">Frontend <span class="bracket">&gt;</span></h3>
        <p class="stack-group-desc">Интерфейсы, которые быстро грузятся и удобно работают на любом устройстве.</p>
        <div class="stack-group-tags">
          <span class="stack-group-tag">React</span>
          <span class="stack-group-tag">Vue 3</span>
          <span class="stack-group-tag">Next.js</span>
          <span class="stack-group-tag">TypeScript</span>
          <span class="stack-group-tag">Tailwind</span>
        </div>
      </div>
    </div>

    <!-- Row 3: Backend info (left) + Backend orbit canvas (right) -->
    <div class="stack-mobile-row">
      <div class="stack-mobile-info">
        <h3 class="stack-group-title">Backend <span class="bracket">&gt;</span></h3>
        <p class="stack-group-desc">Серверная часть, API, базы данных и контейнеризация для надёжной работы под нагрузкой.</p>
        <div class="stack-group-tags">
          <span class="stack-group-tag">Python</span>
          <span class="stack-group-tag">FastAPI</span>
          <span class="stack-group-tag">PostgreSQL</span>
          <span class="stack-group-tag">Docker</span>
        </div>
      </div>
      <MiniOrbitsCanvas
        :techs="MINI_BACKEND_TECHS"
        :reverse="true"
      />
    </div>

  </div>
</template>
<script setup lang="ts">
  import MiniOrbitsCanvas from "~/components/ui/3d/canvas/MiniOrbitsCanvas.vue";

  const MINI_FRONTEND_TECHS = [
    { color: 0x61dafb, path: '/models/react/react.obj',           orbit: 0 }, // React
    { color: 0x42b883, path: '/models/vue/vue.obj',               orbit: 0 }, // Vue 3
    { color: 0xdddddd, path: '/models/nextjs/nextjs.obj',         orbit: 1 }, // Next.js
    { color: 0x3178c6, path: '/models/typescript/typescript.obj', orbit: 1 }, // TypeScript
    { color: 0x38bdf8, path: '/models/tailwind/tailwind.obj',     orbit: 2 }, // Tailwind
  ]

  const MINI_BACKEND_TECHS = [
    { color: 0xffd43b, path: '/models/python/python.obj',         orbit: 0 }, // Python
    { color: 0x009688, path: '/models/fastapi/fastapi.obj',       orbit: 1 }, // FastAPI
    { color: 0x336791, path: '/models/postgresql/postgresql.obj', orbit: 1 }, // PostgreSQL
    { color: 0x2496ed, path: '/models/docker/docker.obj',         orbit: 2 }, // Docker
  ]


</script>
<style scoped>

@media (max-width: 768px) {
  .stack-mobile { display: none; }

  .stack-mobile {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .stack-groups {
    position: absolute;
    top: 30px;
    bottom: 50px;
    right: 60px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 280px;
    pointer-events: none;
  }

  .stack-group-title {
    font-family: var(--font-inter);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: bold;
    color: #fff;
    margin: 0 0 16px 0;
  }

  .stack-group-desc {
    color: #e0e0e0;
    font-family: var(--font-inter);
    font-size: 0.85rem;
    line-height: 1.7;
    font-weight: 400;
    margin: 0 0 12px 0;
  }

  .stack-group-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .stack-group-tag {
    display: inline-block;
    padding: 5px 14px;
    border: 2px solid var(--accent);
    background: var(--accent);
    color: var(--bg);
    font-family: var(--font-inter);
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* Row 1: title + description */
  .stack-mobile-top .stack-section-title {
    font-size: clamp(2rem, 4vw, 3rem);
    margin: 16px 0 12px;
  }
  .stack-mobile-top .stack-description {
    gap: 8px;
  }
  .stack-mobile-top .stack-description p {
    font-size: 0.83rem;
    color: #b0b0b0;
    line-height: 1.65;
    margin: 0;
  }

  /* Rows 2 & 3 */
  .stack-mobile-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .stack-mobile-info {
    flex: 1;
    min-width: 0;
  }
  .stack-mobile-info .stack-group-title {
    font-size: 1.3rem;
    margin-bottom: 8px;
  }
  .stack-mobile-info .stack-group-desc {
    font-size: 0.78rem;
    line-height: 1.6;
    margin-bottom: 10px;
  }
  .stack-mobile-info .stack-group-tags {
    gap: 5px;
  }
  .stack-mobile-info .stack-group-tag {
    padding: 3px 10px;
    font-size: 0.68rem;
  }
}
</style>