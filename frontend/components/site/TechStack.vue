<template>
  <section id="stack" class="py-20">
    <div class="container-main">
      <h2 class="section-title">
        <UiGlitchText :text="$t('tech_stack.title')">{{ $t('tech_stack.title') }}</UiGlitchText>
      </h2>

      <!-- Frontend -->
      <div class="mb-12">
        <h3 class="text-xl font-semibold text-center mb-8 text-gray-600 dark:text-gray-400">
          {{ $t('tech_stack.frontend') }}
        </h3>
        <div class="flex flex-wrap justify-center gap-8">
          <div v-for="tech in frontendStack" :key="tech.id" class="text-center">
            <div class="w-16 h-16 mx-auto mb-3 text-gray-700 dark:text-gray-300 flex items-center justify-center">
              <img v-if="tech.icon && tech.icon.startsWith('/')" :src="getImageUrl(tech.icon)" :alt="tech.name" class="w-full h-full object-contain" />
              <span v-else-if="isEmoji(tech.icon)" class="text-4xl">{{ tech.icon }}</span>
              <TechIcon v-else :name="tech.icon" />
            </div>
            <p class="font-semibold">{{ tech.name }}</p>
            <p class="text-sm text-gray-500">{{ tech.subtitle }}</p>
          </div>
        </div>
      </div>

      <!-- Backend -->
      <div>
        <h3 class="text-xl font-semibold text-center mb-8 text-gray-600 dark:text-gray-400">
          {{ $t('tech_stack.backend') }}
        </h3>
        <div class="flex flex-wrap justify-center gap-8">
          <div v-for="tech in backendStack" :key="tech.id" class="text-center">
            <div class="w-16 h-16 mx-auto mb-3 text-gray-700 dark:text-gray-300 flex items-center justify-center">
              <img v-if="tech.icon && tech.icon.startsWith('/')" :src="getImageUrl(tech.icon)" :alt="tech.name" class="w-full h-full object-contain" />
              <span v-else-if="isEmoji(tech.icon)" class="text-4xl">{{ tech.icon }}</span>
              <TechIcon v-else :name="tech.icon" />
            </div>
            <p class="font-semibold">{{ tech.name }}</p>
            <p class="text-sm text-gray-500">{{ tech.subtitle }}</p>
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

// Tech icons component
const TechIcon = defineComponent({
  props: { name: String },
  setup(props) {
    const icons: Record<string, string> = {
      react: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c4.42 0 8 3.58 8 8s-3.58 8-8 8-8-3.58-8-8 3.58-8 8-8zm0 3a5 5 0 100 10 5 5 0 000-10z',
      vue: 'M2 3h3.5L12 13.5 18.5 3H22L12 21 2 3zm4.5 0L12 11.5 17.5 3h-3L12 7.5 9.5 3h-3z',
      nextjs: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.67 0 1.33-.07 1.97-.19l-5.47-7.3V18h-2V6h2v3.5L14.03 18c3.47-1.17 6-4.42 6-8.27C20.03 5.28 16.5 2 12 2z',
      typescript: 'M3 3h18v18H3V3zm9.5 9v6h-2v-6H8v-1.5h7V12h-2.5zm5.5 3.5c0 1.38-1.12 2.5-2.5 2.5s-2.5-1.12-2.5-2.5h1.5c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1h-.5v-1.5h.5c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1H13c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 .59-.2 1.13-.54 1.55.34.43.54.97.54 1.55z',
      tailwind: 'M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.11 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C15.61 7.15 14.48 6 12 6zM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35C8.39 16.85 9.52 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C10.61 13.15 9.48 12 7 12z',
      python: 'M12 2c-1.66 0-3 1.34-3 3v1H7c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4H7c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2v1c0 1.66 1.34 3 3 3s3-1.34 3-3v-1h2c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2h-1v-4h1c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-2V5c0-1.66-1.34-3-3-3zm-1 4h2v2h-2V6zm0 10h2v2h-2v-2z',
      fastapi: 'M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7 3.5v7.64l-7 3.5-7-3.5V7.68l7-3.5zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z',
      postgresql: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-13v6h4V7h-4zm0 8v2h4v-2h-4z',
      docker: 'M20.54 8.76c-.24-.16-.76-.32-1.66-.32-.37 0-.77.03-1.18.1-.26-1.56-1.43-2.31-1.5-2.35l-.3-.18-.2.28c-.25.36-.43.76-.54 1.18-.21.85-.08 1.65.37 2.33-.55.31-1.44.39-1.62.39H2.46c-.29 0-.52.23-.52.52 0 1.94.31 3.45.93 4.48.68 1.14 1.67 1.83 2.94 2.06.62.11 1.31.16 2.02.16 1.3 0 2.51-.2 3.6-.6.93-.34 1.75-.83 2.45-1.46.95-.85 1.52-1.88 1.94-2.78h.17c1.04 0 1.68-.42 2.03-.77.24-.23.42-.5.53-.8l.07-.22-.2-.13zM3.87 11.36h1.75c.08 0 .15-.07.15-.15V9.7c0-.08-.07-.15-.15-.15H3.87c-.08 0-.15.07-.15.15v1.51c0 .08.07.15.15.15zm2.51 0h1.75c.08 0 .15-.07.15-.15V9.7c0-.08-.07-.15-.15-.15H6.38c-.08 0-.15.07-.15.15v1.51c0 .08.07.15.15.15zm2.52 0h1.75c.08 0 .15-.07.15-.15V9.7c0-.08-.07-.15-.15-.15H8.9c-.08 0-.15.07-.15.15v1.51c0 .08.07.15.15.15zm2.51 0h1.75c.08 0 .15-.07.15-.15V9.7c0-.08-.07-.15-.15-.15h-1.75c-.08 0-.15.07-.15.15v1.51c0 .08.07.15.15.15zM6.38 9.05h1.75c.08 0 .15-.07.15-.15V7.39c0-.08-.07-.15-.15-.15H6.38c-.08 0-.15.07-.15.15V8.9c0 .08.07.15.15.15zm2.52 0h1.75c.08 0 .15-.07.15-.15V7.39c0-.08-.07-.15-.15-.15H8.9c-.08 0-.15.07-.15.15V8.9c0 .08.07.15.15.15zm2.51 0h1.75c.08 0 .15-.07.15-.15V7.39c0-.08-.07-.15-.15-.15h-1.75c-.08 0-.15.07-.15.15V8.9c0 .08.07.15.15.15zm0-2.31h1.75c.08 0 .15-.07.15-.15V5.08c0-.08-.07-.15-.15-.15h-1.75c-.08 0-.15.07-.15.15v1.51c0 .08.07.15.15.15z',
    }
    return () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      class: 'w-full h-full'
    }, [
      h('path', { d: icons[props.name || ''] || icons.react })
    ])
  }
})
</script>
