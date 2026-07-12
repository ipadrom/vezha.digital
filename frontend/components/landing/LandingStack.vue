<template>
  <section id="stack" data-stack-section class="vz-stack">
    <div class="vz-sticky">
      <div class="vz-sticky__inner">
        <div class="vz-sec-head" data-sec-head>
          <div>
            <div class="vz-section-label">
              <span>Стек</span>
              <i>/</i>
              <span data-secnum>02</span>
            </div>
            <h2>Стек подбирается под задачу, а не по трендам</h2>
          </div>
          <div class="vz-sec-meta" data-sec-meta>
            <div><span data-stack-counter>01</span><i> / {{ total }}</i></div>
            <p>Каждый инструмент проверен в реальных проектах и предсказуем в поддержке.</p>
          </div>
        </div>

        <div
          ref="sphereRef"
          class="vz-stack__sphere"
          :data-layer="activeLayer"
          aria-hidden="true"
        ></div>

        <div class="vz-stack__timeline">
          <div class="vz-stack__line" data-stack-line><span data-line-fill></span></div>
          <article
            v-for="(group, index) in groups"
            :key="group.title"
            :aria-current="activeIndex === index ? 'step' : undefined"
            :class="{ 'is-active': activeIndex === index, 'is-past': index < activeIndex }"
            data-stack-item
            class="vz-stack-item"
            role="button"
            tabindex="0"
            @click="$emit('select', index)"
            @keydown.enter.prevent="$emit('select', index)"
            @keydown.space.prevent="$emit('select', index)"
          >
            <div data-label>{{ group.title }}</div>
            <div>
              <span data-halo></span>
              <span data-dot></span>
            </div>
            <div>
              <p>{{ group.description }}</p>
              <div>
                <span v-for="item in group.items" :key="item">{{ item }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  groups: Array<{
    title: string;
    description: string;
    items: string[];
  }>;
  activeIndex: number;
  activeLayer: string;
  total: string;
}>();

const emit = defineEmits<{
  select: [index: number];
  sphereReady: [element: HTMLElement | null];
}>();

const sphereRef = ref<HTMLElement | null>(null);

onMounted(() => emit("sphereReady", sphereRef.value));
onBeforeUnmount(() => emit("sphereReady", null));
</script>
