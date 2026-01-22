<template>
  <section id="stack" class="section">
    <div class="container-main">
      <div class="who-we-are">
        <!-- Left Column: About Us -->
        <div class="who-we-are__left">
          <h2 class="section-title">
            <span class="bracket">&lt;</span>Кто мы<span class="bracket">/&gt;</span>
          </h2>
          <div class="card">
            <h3>О нашей команде</h3>
            <p>Мы - команда опытных разработчиков, специализирующихся на создании современных веб-решений, Telegram Mini Apps и интеграции искусственного интеллекта. Наша миссия - превращать идеи в надежные цифровые продукты, используя передовые технологии и подходы.</p>
            <p>С 2020 года мы помогли более чем 100 клиентам реализовать их цифровую трансформацию, уделяя особое внимание качеству кода, юзабилити и скорости разработки.</p>
          </div>
        </div>

        <!-- Right Column: Tech Stack -->
        <div class="who-we-are__right">
          <h2 class="section-title">
            <span class="bracket">&lt;</span>Стек<span class="bracket">/&gt;</span>
          </h2>
          <div class="tech-stack">
            <!-- Frontend -->
            <div class="stack-group">
              <h3>Frontend</h3>
              <div class="tech-grid">
                <div v-for="tech in frontendStack" :key="tech.id" class="tech-item">
                  <div class="tech-icon">
                    <img v-if="tech.icon && tech.icon.startsWith('/')" :src="getImageUrl(tech.icon)" :alt="tech.name" class="w-8 h-8 object-contain" />
                    <span v-else-if="isEmoji(tech.icon)">{{ tech.icon }}</span>
                    <span v-else class="text-sm font-bold">{{ tech.icon || tech.name.substring(0, 2).toUpperCase() }}</span>
                  </div>
                  <h4>{{ tech.name }}</h4>
                </div>
              </div>
            </div>

            <!-- Backend -->
            <div class="stack-group">
              <h3>Backend</h3>
              <div class="tech-grid">
                <div v-for="tech in backendStack" :key="tech.id" class="tech-item">
                  <div class="tech-icon">
                    <img v-if="tech.icon && tech.icon.startsWith('/')" :src="getImageUrl(tech.icon)" :alt="tech.name" class="w-8 h-8 object-contain" />
                    <span v-else-if="isEmoji(tech.icon)">{{ tech.icon }}</span>
                    <span v-else class="text-sm font-bold">{{ tech.icon || tech.name.substring(0, 2).toUpperCase() }}</span>
                  </div>
                  <h4>{{ tech.name }}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const props = defineProps<{
  techStack: any[]
}>()

const frontendStack = computed(() =>
  props.techStack.filter(t => t.category === 'frontend')
)

const backendStack = computed(() =>
  props.techStack.filter(t => t.category === 'backend')
)

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${config.public.apiUrl}${url}`
}

const isEmoji = (str: string) => {
  if (!str) return false
  const emojiRegex = /^[\p{Emoji}]+$/u
  return emojiRegex.test(str) && !str.match(/^[a-zA-Z0-9]+$/)
}
</script>

<style scoped>
.who-we-are {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  height: 100%;
}

.who-we-are__left {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
}

.who-we-are__right {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.who-we-are__left .section-title,
.who-we-are__right .section-title {
  text-align: center;
  margin-bottom: 30px;
}

.card {
  background: var(--bg-secondary);
  border: 3px solid var(--border);
  padding: 30px;
  border-radius: 0;
  flex-grow: 1;
}

.card h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: var(--accent);
}

.card p {
  color: #e0e0e0;
  line-height: 1.8;
  margin-bottom: 15px;
}

.card p:last-child {
  margin-bottom: 0;
}

.tech-stack {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 40px;
}

.tech-stack .stack-group:first-child {
  flex-grow: 1;
}

.tech-stack .stack-group:last-child {
  margin-top: auto;
}

.stack-group h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.5rem;
  color: var(--accent);
  margin-bottom: 30px;
  text-align: center;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.tech-item {
  padding: 20px 10px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #e0e0e0;
  border-radius: 0;
}

.tech-item:hover {
  transform: translateY(-5px);
}

.tech-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  filter: grayscale(0.8);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}

.tech-item:hover .tech-icon {
  filter: grayscale(0);
  transform: scale(1.2) rotate(360deg);
}

.tech-item h4 {
  font-family: var(--font-epilepsy);
  font-size: 1rem;
  margin: 0;
  color: var(--text);
}

@media (max-width: 992px) {
  .who-we-are {
    gap: 40px;
  }

  .tech-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .who-we-are {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .who-we-are__left .section-title,
  .who-we-are__right .section-title {
    text-align: center;
  }

  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .tech-grid {
    grid-template-columns: 1fr;
  }
}
</style>
