<template>
  <div class="page-wrapper bg-light-bg-secondary dark:bg-dark-bg-secondary">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-64 bg-light-bg dark:bg-dark-bg border-r border-light-border dark:border-dark-border hidden lg:block">
      <div class="p-4">
        <NuxtLink to="/admin" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-accent-light dark:bg-accent-dark flex items-center justify-center">
            <span class="text-white dark:text-dark-bg font-bold text-lg">V</span>
          </div>
          <span class="font-bold">Admin Panel</span>
        </NuxtLink>
      </div>

      <nav class="mt-4 px-2">
        <NuxtLink v-for="item in menuItems" :key="item.to" :to="item.to" :class="['flex items-center gap-3 px-4 py-3 rounded-lg transition-colors', route.path === item.to ? 'bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark' : 'text-gray-600 dark:text-gray-400 hover:bg-light-bg-secondary dark:hover:bg-dark-card']">
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-light-border dark:border-dark-border">
        <div class="flex items-center gap-3 mb-3">
          <img v-if="admin?.photo_url" :src="admin.photo_url" class="w-10 h-10 rounded-full" />
          <div v-else class="w-10 h-10 rounded-full bg-accent-light/20 dark:bg-accent-dark/20 flex items-center justify-center">
            {{ admin?.first_name?.[0] || 'A' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium truncate">{{ admin?.first_name }}</p>
            <p class="text-xs text-gray-500 truncate">@{{ admin?.username }}</p>
          </div>
        </div>
        <button @click="logout" class="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
          Выйти
        </button>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header class="lg:hidden fixed top-0 left-0 right-0 h-16 bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border z-50">
      <div class="flex items-center justify-between h-full px-4">
        <NuxtLink to="/admin" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-accent-light dark:bg-accent-dark flex items-center justify-center">
            <span class="text-white dark:text-dark-bg font-bold text-lg">V</span>
          </div>
          <span class="font-bold">Admin</span>
        </NuxtLink>

        <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="p-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="lg:hidden fixed inset-0 z-40 bg-black/50" @click="isMobileMenuOpen = false">
      <nav class="absolute right-0 top-0 bottom-0 w-64 bg-light-bg dark:bg-dark-bg p-4" @click.stop>
        <NuxtLink v-for="item in menuItems" :key="item.to" :to="item.to" @click="isMobileMenuOpen = false" :class="['flex items-center gap-3 px-4 py-3 rounded-lg transition-colors', route.path === item.to ? 'bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark' : 'text-gray-600 dark:text-gray-400']">
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.label }}
        </NuxtLink>
        <button @click="logout" class="w-full mt-4 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
          Выйти
        </button>
      </nav>
    </div>

    <!-- Main Content -->
    <main class="lg:ml-64 min-h-screen pt-16 lg:pt-0">
      <div class="p-4 lg:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

const route = useRoute()
const { admin, logout } = useAuth()
const isMobileMenuOpen = ref(false)

// Simple icons as components
const HomeIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
])

const BriefcaseIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
])

const FolderIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' })
])

const StarIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' })
])

const CodeIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' })
])

const ClipboardIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' })
])

const CogIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
])

const InboxIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' })
])

const menuItems = [
  { to: '/admin', label: 'Dashboard', icon: HomeIcon },
  { to: '/admin/services', label: 'Услуги', icon: BriefcaseIcon },
  { to: '/admin/projects', label: 'Проекты', icon: FolderIcon },
  { to: '/admin/advantages', label: 'Преимущества', icon: StarIcon },
  { to: '/admin/tech-stack', label: 'Стек', icon: CodeIcon },
  { to: '/admin/stages', label: 'Этапы', icon: ClipboardIcon },
  { to: '/admin/settings', label: 'Настройки', icon: CogIcon },
  { to: '/admin/requests', label: 'Заявки', icon: InboxIcon },
]
</script>
