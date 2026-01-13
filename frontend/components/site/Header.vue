<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-light-border dark:border-dark-border">
    <div class="container-main">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <a href="#" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-accent-light dark:bg-accent-dark flex items-center justify-center">
            <span class="text-white dark:text-dark-bg font-bold text-lg">V</span>
          </div>
          <span class="font-bold text-lg hidden sm:block">VEZHA</span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-6">
          <a v-for="item in navItems" :key="item.href" :href="item.href" class="text-sm text-gray-600 dark:text-gray-400 hover:text-accent-light dark:hover:text-accent-dark transition-colors">
            {{ item.label }}
          </a>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Lang Switcher -->
          <button
            type="button"
            @click="toggleLang"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-dark-card"
          >
            {{ locale === 'ru' ? 'EN' : 'RU' }}
          </button>

          <!-- Theme Toggle -->
          <button
            type="button"
            @click="toggleTheme"
            class="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-dark-card"
            title="Toggle theme"
          >
            <svg v-if="colorMode.value === 'dark'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <a href="#contacts" class="btn-primary hidden sm:block text-sm py-2">
            {{ $t('header.discuss_project') }}
          </a>

          <!-- Mobile Menu Button -->
          <button @click="isMenuOpen = !isMenuOpen" class="lg:hidden p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <nav v-if="isMenuOpen" class="lg:hidden py-4 border-t border-light-border dark:border-dark-border">
        <div class="flex flex-col gap-2">
          <a v-for="item in navItems" :key="item.href" :href="item.href" @click="isMenuOpen = false" class="py-2 text-gray-600 dark:text-gray-400 hover:text-accent-light dark:hover:text-accent-dark transition-colors">
            {{ item.label }}
          </a>
          <a href="#contacts" @click="isMenuOpen = false" class="btn-primary text-center mt-2">
            {{ $t('header.discuss_project') }}
          </a>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t, locale, setLocale } = useI18n()
const colorMode = useColorMode()
const isMenuOpen = ref(false)

const navItems = computed(() => [
  { href: '#hero', label: t('nav.home') },
  { href: '#services', label: t('nav.services') },
  { href: '#advantages', label: t('nav.why_us') },
  { href: '#projects', label: t('nav.projects') },
  { href: '#stack', label: t('nav.stack') },
  { href: '#stages', label: t('nav.stages') },
  { href: '#contacts', label: t('nav.contacts') },
])

function toggleLang() {
  console.log('toggleLang called')
  const newLang = locale.value === 'ru' ? 'en' : 'ru'
  setLocale(newLang)
}

function toggleTheme() {
  console.log('toggleTheme called')
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
