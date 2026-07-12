<template>
  <section
    id="services"
    data-services-pin
    class="vz-services"
    :style="{ '--services-count': services.length }"
  >
    <div class="vz-sticky">
      <div class="vz-sticky__inner">
        <div class="vz-sec-head" data-sec-head>
          <div>
            <div class="vz-section-label">
              <span>Услуги</span>
              <i>/</i>
              <span data-secnum>03</span>
            </div>
            <h2><span><span data-reveal>Что мы делаем</span></span></h2>
          </div>
          <div class="vz-services__counter"><span data-serv-counter>01 / 07</span></div>
        </div>

        <div class="vz-services__grid" data-serv-grid>
          <div class="vz-services__nav" data-serv-list>
            <button
              v-for="(service, index) in services"
              :key="service.title"
              data-serv-nav
              type="button"
              @click="$emit('select', index)"
            >
              <span data-serv-nav-num>{{ service.n }}</span>
              <span data-serv-nav-label>{{ service.title }}</span>
            </button>
          </div>

          <div class="vz-services__stage" data-serv-stage>
            <article
              v-for="service in services"
              :key="service.n"
              data-serv-panel
              class="vz-service-panel"
            >
              <div>{{ service.n }}</div>
              <div>
                <h3>{{ service.title }}</h3>
                <p>{{ service.desc }}</p>
                <div data-serv-metawrap>
                  <span v-for="meta in service.meta" :key="meta">{{ meta }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div class="vz-services__bar"><span data-serv-bar></span></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  services: Array<{
    n: string;
    title: string;
    desc: string;
    meta: string[];
  }>;
}>();

defineEmits<{
  select: [index: number];
}>();
</script>
