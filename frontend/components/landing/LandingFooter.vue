<template>
  <footer class="vz-footer">
    <div class="vz-footer__top" data-footer-top>
      <a href="#hero">{{ copy.topLink }}</a>
    </div>
    <div
      class="vz-footer__cols"
      :class="{ 'vz-footer__cols--without-base': !copy.base.some(Boolean) }"
      data-footer-cols
    >
      <div>
        <span>{{ copy.yearLabel }}</span>
        <strong>2026</strong>
      </div>
      <div v-if="copy.base.some(Boolean)">
        <span>{{ copy.baseLabel }}</span>
        <p>
          <template v-for="(item, index) in copy.base.filter(Boolean)" :key="item">
            <br v-if="index" />{{ item }}
          </template>
        </p>
      </div>
      <div>
        <span>{{ copy.contactLabel }}</span>
        <nav>
          <a :href="`mailto:${contactEmail}`">{{ contactEmail }} →</a>
          <a href="#hero">vezha.digital ↗</a>
        </nav>
      </div>
      <div>
        <span>{{ copy.navLabel }}</span>
        <nav>
          <a v-for="item in navItems" :key="item.href" :href="item.href">{{ item.label }}</a>
        </nav>
      </div>
    </div>
    <div class="vz-footer__sign" data-footer-sign>
      <div>
        <span>{{ copy.signOff }}</span>
        <span>vezha.digital</span>
      </div>
      <strong data-clip-reveal><span data-footer-word>VEZHA</span></strong>
    </div>
    <div class="vz-footer__legal" data-footer-legal>
      <span>© 2026 · VEZHA DIGITAL</span>
      <span v-if="copy.legal">{{ copy.legal }}</span>
    </div>
    <div
      ref="gameRef"
      class="vz-footer-game"
      :class="{
        'is-running': game.running,
        'is-paused': !game.running && !game.crashed,
        'is-crashed': game.crashed,
      }"
    >
      <button
        class="vz-footer-game__hitbox"
        type="button"
        :aria-label="copy.game.aria"
        @click="$emit('jump')"
      ></button>
      <div class="vz-footer-game__hud">
        <span>{{ copy.game.name }}</span>
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
  copy: {
    topLink: string;
    base: [string, string];
    yearLabel: string;
    baseLabel: string;
    contactLabel: string;
    signOff: string;
    navLabel: string;
    legal: string;
    game: {
      name: string;
      aria: string;
    };
  };
  contactEmail: string;
  navItems: Array<{ href: string; label: string }>;
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
