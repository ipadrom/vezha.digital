<template>
  <footer class="vz-footer">
    <div class="vz-footer__top">
      <span>Всё по проекту. В одном месте. Спокойно.</span>
      <a href="/#hero">Конец полотна ↑ В начало</a>
    </div>

    <div class="vz-footer__cols">
      <div>
        <span class="vz-footer__label">Year</span>
        <strong>2026</strong>
      </div>
      <div>
        <span class="vz-footer__label">Base</span>
        <p>Москва<br />Россия</p>
      </div>
      <div>
        <span class="vz-footer__label">Contact</span>
        <nav>
          <a :href="`mailto:${contactEmail}`">{{ contactEmail }} →</a>
          <a v-if="contactTelegram" :href="telegramHref" target="_blank" rel="noreferrer">
            {{ contactTelegram }} ↗
          </a>
          <a v-else href="/#contacts">vezha.digital ↗</a>
        </nav>
      </div>
      <div>
        <span class="vz-footer__label">Навигация</span>
        <nav>
          <a href="/#about">Кто мы</a>
          <a href="/#stack">Стек</a>
          <a href="/#services">Услуги</a>
          <a href="/#stages">Этапы</a>
        </nav>
      </div>
    </div>

    <div class="vz-footer__sign">
      <div>
        <span>2026 / Sign-off</span>
        <span>vezha.digital</span>
      </div>
      <strong>VEZHA</strong>
    </div>

    <div class="vz-footer__legal">
      <span>© 2026 · VEZHA DIGITAL</span>
      <span>ИП Анищенко Д. А. · ОГРНИП 326774600075626 · ИНН 773421830976</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
const props = defineProps<{
  settings?: Record<string, string>
}>();

const contactEmail = computed(() => props.settings?.contact_email || "contact@vezha.digital");
const contactTelegram = computed(() => props.settings?.contact_telegram || "");
const telegramHref = computed(() => `https://t.me/${contactTelegram.value.replace("@", "")}`);
</script>

<style scoped>
.vz-footer {
  border-top: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
}

.vz-footer__top,
.vz-footer__cols,
.vz-footer__sign,
.vz-footer__legal {
  max-width: 1240px;
  margin: 0 auto;
  padding-inline: 40px;
}

.vz-footer__top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-top: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.vz-footer a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.vz-footer a:hover {
  color: var(--text);
}

.vz-footer__cols {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  padding-top: 64px;
  padding-bottom: 52px;
}

.vz-footer__label {
  display: block;
  margin-bottom: 14px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted-2);
}

.vz-footer__cols strong {
  display: block;
  font-size: 30px;
  line-height: 1;
}

.vz-footer__cols p,
.vz-footer__cols nav {
  display: grid;
  gap: 10px;
  margin: 0;
  color: var(--text-2);
  font-size: 15px;
  line-height: 1.6;
}

.vz-footer__cols nav a:first-child {
  color: var(--text);
}

.vz-footer__sign {
  padding-top: 22px;
  border-top: 1px solid var(--border);
}

.vz-footer__sign > div {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted-2);
}

.vz-footer__sign strong {
  display: block;
  overflow: hidden;
  font-size: clamp(64px, 14vw, 210px);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1;
}

.vz-footer__legal {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 18px;
  padding-bottom: 44px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted-2);
}

@media (max-width: 760px) {
  .vz-footer__top,
  .vz-footer__cols,
  .vz-footer__sign,
  .vz-footer__legal {
    padding-left: 22px;
    padding-right: 22px;
  }

  .vz-footer__top,
  .vz-footer__legal {
    display: grid;
    gap: 8px;
  }

  .vz-footer__cols {
    grid-template-columns: 1fr 1fr;
    gap: 28px 20px;
    padding-top: 44px;
    padding-bottom: 36px;
  }
}
</style>
