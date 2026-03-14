<template>
  <header class="header" id="header">
    <div class="container-main">
      <div class="header__wrap">
        <!-- Logo -->
        <a href="/#hero" class="logo">
          <span class="logo__script glitch" data-text="Vezha">Vezha</span>
          <span class="logo__digital glitch" data-text="DIGITAL">DIGITAL</span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="nav">
          <a v-for="item in navItems" :key="item.href" :href="item.href" :class="{ active: activeSection === item.id }">
            {{ item.label }}
          </a>
        </nav>

        <!-- Actions -->
        <div class="header__actions">
          <button
              @click="$emit('openModal')"
              class="btn btn-primary header-cta"
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

const navItems = computed(() => [
  { href: '/#hero', id: 'hero', label: t('nav.home') },
  { href: '/#stack', id: 'stack', label: t('nav.stack') },
  { href: '/#tech-stack', id: 'tech-stack', label: t('nav.tech_stack') },
  { href: '/#services', id: 'services', label: t('nav.services') },
  { href: '/#advantages', id: 'advantages', label: t('nav.why_us') },
  { href: '/#stages', id: 'stages', label: t('nav.stages') },
  { href: '/#contacts', id: 'contacts', label: t('nav.contacts') },
])

const activeSection = ref('hero')

// Sticky header effect + active section tracking
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

  const sectionIds = navItems.value.map(i => i.id)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeSection.value = entry.target.id
      }
    })
  }, { threshold: 0.3 })

  sectionIds.forEach(id => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
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
  padding: 1vw 0;
  gap: 2vw;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  text-decoration: none;
  line-height: 1;
  white-space: nowrap;
}

.logo__script {
  font-family: 'Brush Script MT', 'Lucida Handwriting', cursive;
  font-size: 1.7vw;
  font-weight: 400;
  color: #ffffff;
  font-style: italic;
  letter-spacing: 2px;
  line-height: 1;
}

.logo__digital {
  font-family: 'Pixelify Sans', 'Press Start 2P', monospace;
  font-size: 0.65vw;
  font-weight: 700;
  letter-spacing: 6px;
  color: #ffffff;
  text-transform: uppercase;
  line-height: 1;
}

.nav {
  display: flex;
  gap: 1.6vw;
  flex: 1;
  justify-content: center;
}

.nav a {
  font-family: var(--font-inter);
  color: var(--text-dim);
  text-decoration: none;
  font-size: 1.2vw;
  font-weight: 400;
  position: relative;
  transition: all 0.3s;
  white-space: nowrap;
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

.nav a:hover,
.nav a.active {
  color: var(--accent);
}

.nav a:hover::after,
.nav a.active::after {
  width: 100%;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 0.5vw;
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


@media (max-width: 1024px) {
  .nav {
    display: none;
  }
}

@media (max-width: 640px) {
  .header__wrap {
    gap: 8px;
  }

  .logo__script {
    font-size: 1.4rem;
  }

  .logo__digital {
    font-size: 0.45rem;
    letter-spacing: 4px;
  }

  .header-cta {
    padding: 6px 12px !important;
    font-size: 0.75rem !important;
    letter-spacing: 0;
    min-width: auto;
    white-space: nowrap;
  }
}
</style>
