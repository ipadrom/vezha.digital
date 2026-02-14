<template>
  <header class="header" id="header">
    <div class="container-main">
      <div class="header__wrap">
        <!-- Logo -->
        <a href="/#hero" class="logo">
          <span class="bracket">{</span>Vezha Digital<span class="bracket">}</span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="nav">
          <a v-for="item in navItems" :key="item.href" :href="item.href">
            {{ item.label }}
          </a>
        </nav>

        <!-- Actions -->
        <div class="header__actions">
          <!-- Invert toggle -->
          <button @click="toggleInvert" class="invert-btn" :title="isInverted ? 'Выключить инверсию' : 'Включить инверсию'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a10 10 0 0 1 0 20V2z" :fill="isInverted ? 'currentColor' : 'none'"/>
            </svg>
          </button>

          <button
              @click="$emit('openModal')"
              class="btn btn-primary hidden sm:inline-block"
          >
            {{ $t('header.discuss_project') }}
          </button>

          <!-- Mobile Menu Button -->
          <button @click="isMenuOpen = !isMenuOpen" class="mobile-menu-btn lg:hidden">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <nav v-if="isMenuOpen" class="mobile-nav lg:hidden">
        <a v-for="item in navItems" :key="item.href" :href="item.href" @click="isMenuOpen = false">
          {{ item.label }}
        </a>
        <button @click="$emit('openModal'); isMenuOpen = false" class="btn btn-primary w-full text-center mt-4">
          {{ $t('header.discuss_project') }}
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits(['openModal'])

const { t } = useI18n()
const isMenuOpen = ref(false)
const isInverted = ref(false)

const toggleInvert = () => {
  isInverted.value = !isInverted.value
  document.body.classList.toggle('inverted', isInverted.value)
  localStorage.setItem('inverted', isInverted.value ? '1' : '0')
}

const navItems = computed(() => [
  { href: '/#hero', label: t('nav.home') },
  { href: '/#stack', label: t('nav.stack') },
  { href: '/#services', label: t('nav.services') },
  { href: '/#advantages', label: t('nav.why_us') },
  { href: '/#projects', label: t('nav.projects') },
  { href: '/#stages', label: t('nav.stages') },
  { href: '/#contacts', label: t('nav.contacts') },
])

// Restore invert state
onMounted(() => {
  if (localStorage.getItem('inverted') === '1') {
    isInverted.value = true
    document.body.classList.add('inverted')
  }
})

// Sticky header effect
onMounted(() => {
  const header = document.getElementById('header')
  if (!header) return

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.background = 'rgba(10, 10, 10, 0.98)'
      header.style.boxShadow = '0 5px 20px rgba(0, 229, 255, 0.1)'
      header.classList.add('glitch-scroll')
      setTimeout(() => {
        header.classList.remove('glitch-scroll')
      }, 500)
    } else {
      header.style.background = 'rgba(10, 10, 10, 0.95)'
      header.style.boxShadow = 'none'
    }
  })
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  z-index: 1000;
  transition: all 0.3s;
}

.header__wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  gap: 40px;
}

.logo {
  font-family: var(--font-epilepsy);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 30px;
  flex: 1;
  justify-content: center;
}

.nav a {
  font-family: var(--font-epilepsy);
  color: var(--text-dim);
  text-decoration: none;
  font-size: 1rem;
  position: relative;
  transition: all 0.3s;
}

.nav a::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent);
  transition: width 0.3s;
}

.nav a:hover {
  color: var(--accent);
}

.nav a:hover::after {
  width: 100%;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.invert-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  cursor: pointer;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.invert-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.mobile-menu-btn {
  padding: 8px;
  background: transparent;
  border: none;
  color: var(--text);
  cursor: pointer;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
  border-top: 1px solid var(--border);
}

.mobile-nav a {
  padding: 8px 0;
  color: var(--text-dim);
  text-decoration: none;
  transition: all 0.3s;
  font-family: var(--font-epilepsy);
}

.mobile-nav a:hover {
  color: var(--accent);
  padding-left: 10px;
}

/* Header Glitch Effect */
.header:hover .logo {
  animation: glitch 0.3s infinite;
}

@keyframes glitch {
  0% {
    text-shadow: 2px 2px var(--accent), -2px -2px #ff00ff;
  }
  25% {
    text-shadow: -2px 2px var(--accent), 2px -2px #ff00ff;
  }
  50% {
    text-shadow: 2px -2px var(--accent), -2px 2px #ff00ff;
  }
  75% {
    text-shadow: -2px -2px var(--accent), 2px 2px #ff00ff;
  }
  100% {
    text-shadow: 2px 2px var(--accent), -2px -2px #ff00ff;
  }
}

@media (max-width: 1024px) {
  .nav {
    display: none;
  }
}
</style>
