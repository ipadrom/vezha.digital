<template>
  <section id="advantages" class="section">
    <div class="container-main">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>{{ $t('advantages.title') }}<span class="bracket">/&gt;</span>
      </h2>

      <div class="advantages">
        <div v-for="advantage in advantages" :key="advantage.id" class="advantage">
          <div class="advantage__main">
            <h3>{{ advantage.title }}</h3>
            <p>{{ advantage.subtitle || advantage.description.substring(0, 50) + '...' }}</p>
          </div>
          <div class="advantage__details">
            <p>{{ advantage.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  advantages: any[]
}>()
</script>

<style scoped>
.advantages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.advantage {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 30px;
  transition: all 0.3s;
  cursor: pointer;
  min-height: 180px;
}

.advantage:hover {
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--shadow);
}

.advantage__main h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--text);
}

.advantage__main p {
  color: var(--text-dim);
}

.advantage__details {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: all 0.4s;
}

.advantage:hover .advantage__details {
  max-height: 500px;
  opacity: 1;
  margin-top: 20px;
}

.advantage__details p {
  color: var(--text-dim);
  line-height: 1.8;
}

@media (max-width: 768px) {
  .advantages {
    grid-template-columns: 1fr;
  }
}
</style>
