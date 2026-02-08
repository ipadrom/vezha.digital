<template>
  <section v-if="service" class="about-service">
    <div
        v-for="service in service"
        class="container"
    >
      <h1>
        <span class="bracket">&lt;</span>
          Об услуге
        <span class="bracket">/&gt;</span></h1>
      <p>
        {{service.about}}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {IServices} from "~/utils/interfaces/IServices";
defineProps<{
  service: IServices[]
}>()
</script>

<style scoped>
.about-service {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  max-width: 1300px;
  margin: 0 auto;
}

.about-service h1 {
  text-align: center;
  font-weight: bold;
  font-size: clamp(2.5rem, 5vw, 3rem);
  margin-bottom: 30px;
  font-family: var(--font-epilepsy), monospace;
}

.about-service h1:hover {
  animation: glitch 0.3s infinite;
}

.about-service p {
  color: #e0e0e0;
  line-height: 1.8;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

@media (max-width: 768px){
  .about-service {
    padding: 20px 20px;
    align-items: flex-start;
    justify-content: flex-start;
  }

  .about-service h1 {
    font-size: clamp(1.8rem, 6vw, 2.2rem);
    margin-bottom: 20px;
    text-align: center;
  }

  .about-service p {
    font-size: 1.1rem;
    line-height: 1.6;
  }

  .about-service h1:hover {
    animation: none;
  }
}
</style>