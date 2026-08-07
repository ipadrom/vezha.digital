<template>
  <div class="studio-shell">
    <aside class="studio-rail">
      <NuxtLink class="studio-brand" to="/admin/cases" aria-label="VEZHA Studio">
        <span>V</span>
        <small>STUDIO</small>
      </NuxtLink>

      <nav class="studio-nav" aria-label="Навигация админки">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          :class="{ active: route.path.startsWith(item.to) }"
        >
          <span aria-hidden="true">{{ item.mark }}</span>
          <small>{{ item.label }}</small>
        </NuxtLink>
      </nav>

      <div class="studio-account">
        <span>{{ admin?.first_name?.[0] || 'A' }}</span>
        <button type="button" title="Выйти" @click="logout">↪</button>
      </div>
    </aside>

    <header class="studio-mobile-header">
      <NuxtLink to="/admin/cases"><b>VEZHA</b> STUDIO</NuxtLink>
      <button type="button" @click="mobileOpen = !mobileOpen">{{ mobileOpen ? 'Закрыть' : 'Меню' }}</button>
    </header>

    <div v-if="mobileOpen" class="studio-mobile-menu">
      <NuxtLink v-for="item in menuItems" :key="item.to" :to="item.to" @click="mobileOpen = false">
        {{ item.label }}
      </NuxtLink>
      <button type="button" @click="logout">Выйти</button>
    </div>

    <main class="studio-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { admin, logout, isAuthenticated, initAuth } = useAuth()
const mobileOpen = ref(false)

const menuItems = [
  { to: '/admin/cases', label: 'Кейсы', mark: '□' },
  { to: '/admin/media', label: 'Медиа', mark: '◫' },
]

onMounted(() => {
  initAuth()
  if (!isAuthenticated.value && route.path !== '/admin/login') navigateTo('/admin/login')
})
</script>

<style>
:root {
  --studio-ink: #121722;
  --studio-ink-2: #1c2330;
  --studio-paper: #f4f6f8;
  --studio-white: #ffffff;
  --studio-line: #dbe0e7;
  --studio-muted: #697386;
  --studio-blue: #2864f0;
  --studio-blue-soft: #eaf0ff;
  --studio-green: #1f9d68;
  --studio-danger: #d74242;
}

body:has(.studio-shell) {
  background: var(--studio-paper);
  color: var(--studio-ink);
  overflow: hidden;
}

.studio-shell {
  min-height: 100vh;
  background: var(--studio-paper);
  color: var(--studio-ink);
  font-family: var(--font-ui);
  color-scheme: light;
}

.studio-rail {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 80;
  width: 84px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--studio-ink);
  color: white;
}

.studio-brand {
  width: 100%;
  height: 92px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 2px;
  border-bottom: 1px solid rgba(255,255,255,.12);
  color: white;
  text-decoration: none;
}

.studio-brand span {
  font-family: var(--font-epilepsy);
  font-size: 30px;
  line-height: 1;
}

.studio-brand small,
.studio-nav small {
  font: 500 8px/1 var(--font-mono);
  letter-spacing: .14em;
}

.studio-nav {
  width: 100%;
  padding: 18px 8px;
  display: grid;
  gap: 7px;
}

.studio-nav a {
  min-height: 62px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: 10px;
  color: #aeb7c6;
  text-decoration: none;
  transition: .18s ease;
}

.studio-nav a > span { font: 600 17px/1 var(--font-mono); }
.studio-nav a:hover { color: white; background: rgba(255,255,255,.06); }
.studio-nav a.active { color: white; border-color: rgba(255,255,255,.18); background: var(--studio-ink-2); }

.studio-account {
  margin-top: auto;
  width: 100%;
  padding: 18px 10px;
  display: grid;
  place-items: center;
  gap: 10px;
  border-top: 1px solid rgba(255,255,255,.12);
}

.studio-account > span {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--studio-blue);
  font-weight: 700;
}

.studio-account button { color: #aeb7c6; border: 0; background: none; cursor: pointer; }
.studio-main { height: 100vh; min-height: 0; margin-left: 84px; overflow: auto; overscroll-behavior: contain; }
.studio-mobile-header, .studio-mobile-menu { display: none; }

@media (max-width: 760px) {
  body:has(.studio-shell) { overflow: auto; }
  .studio-rail { display: none; }
  .studio-main { height: auto; min-height: 100vh; margin-left: 0; padding-top: 58px; overflow: visible; }
  .studio-mobile-header {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 90;
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    color: white;
    background: var(--studio-ink);
  }
  .studio-mobile-header a { color: white; text-decoration: none; font: 500 12px var(--font-mono); letter-spacing: .1em; }
  .studio-mobile-header button { border: 0; color: white; background: none; }
  .studio-mobile-menu {
    position: fixed;
    inset: 58px 0 0 0;
    z-index: 85;
    display: grid;
    align-content: start;
    gap: 1px;
    padding: 12px;
    background: var(--studio-ink);
  }
  .studio-mobile-menu a, .studio-mobile-menu button {
    padding: 18px;
    border: 0;
    border-radius: 8px;
    color: white;
    background: var(--studio-ink-2);
    text-align: left;
    text-decoration: none;
  }
}
</style>
