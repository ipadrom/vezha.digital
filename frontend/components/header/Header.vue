<template>
  <header id="header" class="vz-header">
    <div class="vz-header__inner">
      <a class="vz-header__logo" href="/#hero" aria-label="VEZHA Digital">
        <span>VEZHA</span>
        <small>DIGITAL</small>
      </a>

      <nav class="vz-header__nav" aria-label="Основная навигация">
        <a v-for="item in navItems" :key="item.href" :href="item.href">{{ item.label }}</a>
      </nav>

      <div class="vz-header__actions">
        <button
          class="vz-header__icon"
          type="button"
          :aria-label="isDark ? 'Включить светлую тему' : 'Включить тёмную тему'"
          @click="toggleTheme"
        >
          {{ isDark ? "☀" : "☾" }}
        </button>
        <button class="vz-header__cta" type="button" @click="$emit('openModal')">
          Обсудить проект
        </button>
        <button
          class="vz-header__menu"
          type="button"
          :aria-expanded="isMenuOpen"
          aria-label="Открыть меню"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <Transition name="vz-menu">
      <nav v-if="isMenuOpen" class="vz-mobile-nav" aria-label="Мобильная навигация">
        <a v-for="item in navItems" :key="item.href" :href="item.href" @click="isMenuOpen = false">
          {{ item.label }}
        </a>
        <button
          type="button"
          @click="$emit('openModal'); isMenuOpen = false"
        >
          Обсудить проект →
        </button>
      </nav>
    </Transition>
  </header>
</template>

<script setup lang="ts">
defineEmits(["openModal"]);

const isMenuOpen = ref(false);
const isDark = ref(false);

const navItems = [
  { href: "/#stack", label: "Стек" },
  { href: "/#services", label: "Услуги" },
  { href: "/#stages", label: "Этапы" },
  { href: "/#contacts", label: "Контакты" },
];

function applyTheme(value: boolean) {
  isDark.value = value;
  document.documentElement.setAttribute("data-vezha-theme", value ? "dark" : "light");
  localStorage.setItem("vz_theme", value ? "dark" : "light");
}

function toggleTheme() {
  applyTheme(!isDark.value);
}

onMounted(() => {
  const saved = localStorage.getItem("vz_theme");
  applyTheme(saved === "dark");
});
</script>

<style scoped>
.vz-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1000;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
}

.vz-header__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 30px;
  max-width: 1240px;
  margin: 0 auto;
  padding: 18px 40px;
}

.vz-header__logo {
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  color: var(--text);
  text-decoration: none;
}

.vz-header__logo span {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 0;
}

.vz-header__logo small {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  color: var(--muted);
}

.vz-header__nav {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.vz-header__nav a {
  color: var(--text-2);
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s ease;
}

.vz-header__nav a:hover {
  color: var(--text);
}

.vz-header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vz-header__icon,
.vz-header__cta,
.vz-header__menu {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.vz-header__icon {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 15px;
  line-height: 1;
}

.vz-header__cta {
  min-height: 38px;
  padding: 0 18px;
  background: var(--text);
  color: var(--bg);
  border-color: var(--text);
  font: 500 14px/1 var(--font-ui);
}

.vz-header__cta:hover {
  background: var(--btn-hover);
}

.vz-header__icon:hover,
.vz-header__menu:hover {
  border-color: var(--text);
  background: var(--hover);
}

.vz-header__menu {
  display: none;
  width: 38px;
  height: 38px;
  padding: 0 9px;
}

.vz-header__menu span {
  display: block;
  width: 100%;
  height: 1px;
  background: var(--text);
  transition: transform 0.2s ease;
}

.vz-header__menu span + span {
  margin-top: 7px;
}

.vz-header__menu[aria-expanded="true"] span:first-child {
  transform: translateY(4px) rotate(45deg);
}

.vz-header__menu[aria-expanded="true"] span:last-child {
  transform: translateY(-4px) rotate(-45deg);
}

.vz-mobile-nav {
  position: fixed;
  top: 69px;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  display: grid;
  gap: 0;
  align-content: start;
  overflow-y: auto;
  padding: 30px 22px 34px;
  border-top: 1px solid var(--border);
  background: var(--bg);
}

.vz-mobile-nav a {
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0;
  text-decoration: none;
  text-transform: uppercase;
}

.vz-mobile-nav button {
  margin-top: 26px;
  padding: 17px;
  border: 0;
  border-radius: 10px;
  background: var(--text);
  color: var(--bg);
  font: 600 16px/1 var(--font-ui);
}

.vz-menu-enter-active,
.vz-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.vz-menu-enter-from,
.vz-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 900px) {
  .vz-header__inner {
    grid-template-columns: auto auto;
    justify-content: space-between;
    padding: 15px 22px;
  }

  .vz-header__nav,
  .vz-header__cta {
    display: none;
  }

  .vz-header__menu {
    display: block;
  }
}
</style>
