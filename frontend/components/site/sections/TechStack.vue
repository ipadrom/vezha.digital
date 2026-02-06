<template>
  <section
      id="stack"
      class="section"
      ref="techStackRef"
  >
    <div class="container-main">
      <div class="who-we-are" v-if="isSectionVisible">
        <!-- Left Column: About Us -->
        <TransitionGroup
          name="fade-down"
          appear
          tag="div"
          class="who-we-are__left-wrapper"
        >
          <div class="who-we-are__left">
            <h2 class="section-title">
              <span class="bracket">&lt;</span>Кто мы<span class="bracket">/&gt;</span>
            </h2>
            <div class="card fade-item">
              <h3 class="font-bold fade-item" style="--enter-delay: 0.4s">О нашей команде</h3>
              <p class="fade-item" style="--enter-delay: 0.6s">Мы - команда опытных разработчиков, специализирующихся на создании современных веб-решений, Telegram Mini Apps и интеграции искусственного интеллекта. Наша миссия - превращать идеи в надежные цифровые продукты, используя передовые технологии и подходы.</p>
              <p class="fade-item" style="--enter-delay: 0.8s">С 2020 года мы помогли более чем 100 клиентам реализовать их цифровую трансформацию, уделяя особое внимание качеству кода, юзабилити и скорости разработки.</p>
            </div>
          </div>
        </TransitionGroup>

        <!-- Right Column: Tech Stack -->
        <div class="who-we-are__right">
          <h2 class="section-title">
            <span class="bracket">&lt;</span>Стек<span class="bracket">/&gt;</span>
          </h2>
          <div class="tech-stack">
            <!-- Frontend -->
            <div class="stack-group">
              <h3 class="font-bold">Frontend</h3>
              <div class="tech-grid">
                <div
                    v-for="tech in frontendStack"
                    :key="tech.id"
                    @mouseenter="isActivatedIcon = tech.id"
                    @mouseleave="isActivatedIcon = null"
                    class="tech-item"
                >
                  <div class="tech-icon">
                    <TechIcon3D
                      v-if="tech.gltf"
                      :model-url="tech.gltf"
                      :is-active="isActivatedIcon === tech.id"
                      class="tech-icon-3d"
                    />
                    <img
                      v-else-if="tech.icon"
                      :src="tech.icon"
                      :alt="tech.name"
                      class="w-8 h-8 object-contain"
                    />
                    <span v-else-if="isEmoji(tech.icon)">{{ tech.icon }}</span>
                    <span v-else class="text-sm font-bold">{{ tech.icon || tech.name.substring(0, 2).toUpperCase() }}</span>
                  </div>
                  <h4 class="font-bold">{{ tech.name }}</h4>
                </div>
              </div>
            </div>

            <!-- Backend -->
            <div class="stack-group">
              <h3 class="font-bold">Backend</h3>
              <div class="tech-grid">
                <div
                    v-for="tech in backendStack"
                    :key="tech.id"
                    @mouseenter="isActivatedIcon = tech.id"
                    @mouseleave="isActivatedIcon = null"
                    class="tech-item"
                >
                  <div class="tech-icon">
                    <TechIcon3D
                      v-if="tech.icon_format"
                      :model-url="tech.icon_format"
                      :is-active="isActivatedIcon === tech.id"
                      class="tech-icon-3d"
                    />
                    <img
                      v-else-if="tech.icon"
                      :src="tech.icon"
                      :alt="tech.name"
                      class="w-8 h-8 object-contain"
                    />
                    <span v-else-if="isEmoji(tech.icon)">{{ tech.icon }}</span>
                    <span v-else class="text-sm font-bold">{{ tech.icon || tech.name.substring(0, 2).toUpperCase() }}</span>
                  </div>
                  <h4 class="text-sm font-bold">{{ tech.name }}</h4>
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
import TechIcon3D from '~/components/ui/TechIcon3D.vue'
import {useSectionVisible} from "~/composables/useSectionVisible";

const { isSectionVisible, targetRef: techStackRef } = useSectionVisible(0.1)
const config = useRuntimeConfig()

const props = defineProps<{
  techStack: any[]
}>()

const isActivatedIcon = ref<number | null>(null)

const techStackData = [
  {
    id: 1,
    name: "Docker",
    category: "backend",
    icon: "/images/voxel_tech_icons/docker/docker.png",
    icon_format: "/images/voxel_tech_icons/docker/docker.gltf"
  },
  {
    id: 2,
    name: "FastAPI",
    category: "backend",
    icon: "/images/tech_icons/fastapi/palette.png",
    icon_format: "/images/voxel_tech_icons/fastapi/fastapi.gltf"
  },
  {
    id: 3,
    name: "NextJS",
    category: "frontend",
    icon: "/images/voxel_tech_icons/nextjs/palette.png",
    icon_format: "/images/voxel_tech_icons/nextjs/nextjs.gltf"
  },
  {
    id: 4,
    name: "React",
    category: "frontend",
    icon: "/images/voxel_tech_icons/react/palette.png",
    icon_format: "/images/voxel_tech_icons/react/react.gltf"
  }
]

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

.who-we-are__left-wrapper {
  width: 100%;
  display: block;
}

.who-we-are > * {
  min-width: 0;
}

.who-we-are__left {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
}

.fade-down-enter-from{
  opacity: 0;
  transform: translateY(-15px);
}

.fade-down-enter-to{
  opacity: 1;
  transform: translateY(0);
}

.fade-down-enter-active{
  transition: all 0.5s ease-out;
  transition-delay: var(--enter-delay, 0s);
}

.fade-item {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
  animation: cardRevealDown 0.9s ease-out forwards;
  animation-delay: var(--enter-delay, 0s);
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
  border-left: 3px solid var(--accent);
  padding: 30px;
  border-radius: 0;
  flex-grow: 1;

  box-shadow:
      -10px 0 15px -5px
      rgba(0, 255, 65, 0.3);
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
  font-size: 1.8rem;
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
  height: 70px;
}

.tech-icon-3d {
  width: 70px;
  height: 70px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.tech-item:hover .tech-icon {
  filter: grayscale(0);
  transform: scale(1);
}

.tech-item h4 {
  font-family: var(--font-epilepsy);
  font-size: 1rem;
  margin: 0;
  color: var(--text);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardRevealDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
    clip-path: inset(0 0 100% 0);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    clip-path: inset(0 0 0 0);
  }
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

  .stack-group h3 {
    margin-bottom: 15px;
    text-align: center;
  }

  .tech-grid {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    overflow-x: visible;
    gap: 15px;
    padding: 10px 5px 20px;
  }

  .tech-item {
    width: auto; 
    padding: 5px;
  }

  .tech-item h4 {
    white-space: nowrap;
    overflow: hidden;       
    text-overflow: ellipsis; 
    font-size: 0.85rem;
  }

  .tech-icon-3d {
    width: 45px;
    height: 45px;
  }

  .tech-stack {
    gap: 30px;
  }
}

@media (max-width: 480px) {
  .tech-grid {
    grid-template-columns: 1fr;
  }

  .tech-icon-3d {
    width: 45px;
    height: 45px;
  }
}
</style>
