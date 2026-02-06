<template>
  <section v-if="service" class="about-service">
    <div class="container">
      <h1>
        <span class="bracket">&lt;</span>
          Об услуге
        <span class="bracket">/&gt;</span></h1>
      <p>
        Telegram Mini Apps — это веб-приложения, которые запускаются прямо внутри мессенджера Telegram без установки.
        Они позволяют создать полноценный интернет-магазин, игру, сервис бронирования или любое другое приложение,
        которое ваши пользователи смогут открыть в один клик из Telegram. Удобно, быстро и современно.
      </p>
      <p>
        Мы разрабатываем Mini Apps под ключ: от дизайна интерфейса до запуска в Telegram. Создаем адаптивный дизайн,
        программируем frontend и backend, интегрируем платежные системы и обеспечиваем бесперебойную работу вашего приложения.
      </p>
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
</style>