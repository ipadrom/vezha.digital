<template>
  <footer class="vz-footer">
    <div class="vz-footer__top" data-footer-top>
      <span>Всё по проекту. В одном месте. Спокойно.</span>
      <a href="#hero">Конец полотна ↑ В начало</a>
    </div>
    <div class="vz-footer__cols" data-footer-cols>
      <div>
        <span>Year</span>
        <strong>2026</strong>
      </div>
      <div>
        <span>Base</span>
        <p>Москва<br />Россия</p>
      </div>
      <div>
        <span>Contact</span>
        <nav>
          <a :href="`mailto:${contactEmail}`">{{ contactEmail }} →</a>
          <a href="#hero">vezha.digital ↗</a>
        </nav>
      </div>
      <div>
        <span>Навигация</span>
        <nav>
          <a href="#about">Кто мы</a>
          <a href="#stack">Стек</a>
          <a href="#services">Услуги</a>
          <a href="#stages">Этапы</a>
        </nav>
      </div>
    </div>
    <div class="vz-footer__sign" data-footer-sign>
      <div>
        <span>2026 / Sign-off</span>
        <span>vezha.digital</span>
      </div>
      <strong data-clip-reveal><span data-footer-word>VEZHA</span></strong>
    </div>
    <div class="vz-footer__legal" data-footer-legal>
      <span>© 2026 · VEZHA DIGITAL</span>
      <span>ИП Анищенко Д. А. · ОГРНИП 326774600075626 · ИНН 773421830976</span>
    </div>
    <div
      ref="gameRef"
      class="vz-footer-game"
      :class="{
        'is-running': game.running,
        'is-paused': !game.running && !game.crashed,
        'is-crashed': game.crashed,
      }"
      @pointerdown.prevent="$emit('jump')"
    >
      <div class="vz-footer-game__hud">
        <span>VEZHA RUN</span>
        <span>{{ gameStatus }}</span>
        <span>{{ gameScore }}</span>
      </div>
      <div class="vz-footer-game__track" data-footer-game-track>
        <div
          class="vz-footer-game__dino"
          :style="{ transform: `translateY(${-game.dinoY}px)` }"
          aria-hidden="true"
        >
          <span></span>
          <i></i>
          <b></b>
        </div>
        <span
          v-for="obstacle in obstacles"
          :key="obstacle.id"
          class="vz-footer-game__letter"
          :style="{ transform: `translateX(${obstacle.x}px)` }"
          aria-hidden="true"
        >
          {{ obstacle.letter }}
        </span>
        <div class="vz-footer-game__ground" aria-hidden="true"></div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineProps<{
  contactEmail: string;
  game: {
    crashed: boolean;
    dinoY: number;
    running: boolean;
  };
  gameStatus: string;
  gameScore: string;
  obstacles: Array<{
    id: number;
    letter: string;
    x: number;
  }>;
}>();

const emit = defineEmits<{
  jump: [];
  gameReady: [element: HTMLElement | null];
}>();

const gameRef = ref<HTMLElement | null>(null);

onMounted(() => emit("gameReady", gameRef.value));
onBeforeUnmount(() => emit("gameReady", null));
</script>
