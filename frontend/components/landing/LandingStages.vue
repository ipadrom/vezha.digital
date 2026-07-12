<template>
  <section id="stages" class="vz-stages">
    <div class="vz-wrap">
      <div class="vz-stages__head">
        <div class="vz-section-label">
          <span>Этапы работы</span>
          <i>/</i>
          <span data-secnum>05</span>
        </div>
        <h2><span><span data-reveal>Полный контроль на каждом шаге</span></span></h2>
        <p>Фиксированные сроки, регулярные отчёты и согласование на каждом этапе. Никаких сюрпризов — только предсказуемый результат.</p>
      </div>
      <div class="vz-stage-list">
        <article v-for="stage in stages" :key="stage.n" data-stages-row class="vz-stage-row">
          <span>{{ stage.n }}</span>
          <h3>{{ stage.title }}</h3>
          <p>{{ stage.desc }}</p>
          <span>{{ stage.dur }}</span>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  stages: Array<{
    n: string;
    title: string;
    desc: string;
    dur: string;
  }>;
}>();
</script>
