<template>
  <footer class="footer">
    <div class="container-main">
      <div class="footer__content">
        <!-- Services Column -->
        <div class="footer__col">
          <h4>Услуги</h4>
          <ul>
            <li><a href="#services">ВЕБ-САЙТЫ</a></li>
            <li><a href="#services">ИНТЕРНЕТ МАГАЗИНЫ</a></li>
            <li><a href="#services">TELEGRAM MINI APPS</a></li>
            <li><a href="#services">TELEGRAM БОТЫ</a></li>
            <li><a href="#services">КОРПОРАТИВНЫЕ СИСТЕМЫ</a></li>
            <li><a href="#services">AI И АВТОМАТИЗАЦИЯ</a></li>
            <li><a href="#services">МОБИЛЬНЫЕ ПРИЛОЖЕНИЯ</a></li>
          </ul>
        </div>

        <!-- Company Column -->
        <div class="footer__col">
          <h4>Компания</h4>
          <ul>
            <li><a href="#hero">Главная</a></li>
            <li><a href="#services">{{ $t('nav.services') }}</a></li>
            <li><a href="#advantages">{{ $t('nav.why_us') }}</a></li>
            <li><a href="#projects">{{ $t('nav.projects') }}</a></li>
            <li><a href="#stack">{{ $t('nav.stack') }}</a></li>
            <li><a href="#stages">{{ $t('nav.stages') }}</a></li>
            <li><a href="#contacts">{{ $t('nav.contacts') }}</a></li>
          </ul>
        </div>

        <!-- Contacts Column -->
        <div class="footer__col">
          <h4>Контакты</h4>
          <ul>
            <li v-if="settings?.contact_telegram">
              <a :href="`https://t.me/${settings.contact_telegram.replace('@', '')}`" target="_blank">
                Telegram: {{ settings.contact_telegram }}
              </a>
            </li>
            <li v-if="settings?.contact_email">
              <a :href="`mailto:${settings.contact_email}`">
                Email: {{ settings.contact_email }}
              </a>
            </li>
            <li v-if="settings?.contact_phone">
              <a :href="`tel:${settings.contact_phone?.replace(/\D/g, '')}`">
                Телефон: {{ settings.contact_phone }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer__bottom">
        <p><span class="bracket">{</span>Vezha Digital<span class="bracket">}</span> · Создано с ♥</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineProps<{
  settings?: Record<string, string>
}>()
</script>

<style scoped>
.footer {
  background: var(--bg-secondary);
  border-top: 2px solid var(--accent);
  padding: 60px 20px 30px;
  z-index: 100;
  position: relative;
  box-shadow: 0 -5px 10px rgba(0, 255, 65, 0.3);
  margin-top: auto;
}

.footer__content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer__col h4 {
  font-family: var(--font-epilepsy);
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.footer__col ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer__col ul li {
  margin-bottom: 12px;
}

.footer__col a {
  color: var(--text-dim);
  text-decoration: none;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.footer__col a:hover {
  color: var(--accent);
  padding-left: 5px;
}

.footer__bottom {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid var(--border);
}

.footer__bottom p {
  color: var(--text-dim);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .footer__content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>
