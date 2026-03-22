<template>
  <footer class="footer">
    <div class="container-main">
      <div class="footer__content">
        <!-- Site Column -->
        <div class="footer__col">
          <h4>Сайт</h4>
          <ul>
            <li><a href="/#hero">Главная</a></li>
            <li><a href="/#stack">{{ $t('nav.stack') }}</a></li>
            <li><a href="/#tech-stack">{{ $t('nav.tech_stack') }}</a></li>
            <li><a href="/#services">{{ $t('nav.services') }}</a></li>
            <li><a href="/#advantages">{{ $t('nav.why_us') }}</a></li>
            <li><a href="/#stages">{{ $t('nav.stages') }}</a></li>
            <li><a href="/#contacts">{{ $t('nav.contacts') }}</a></li>
          </ul>
        </div>

        <!-- Services Column -->
        <div class="footer__col">
          <h4>Услуги</h4>
          <ul>
            <li><NuxtLink :to="{ path: '/', hash: '#services', query: { service: '9f4de2f2-4f22-4ae3-8eaf-34a7cff3196a' } }">Telegram Mini Apps</NuxtLink></li>
            <li><NuxtLink :to="{ path: '/', hash: '#services', query: { service: '57a38935-072c-4351-a7dc-44cb1f6f68e1' } }">Telegram боты</NuxtLink></li>
            <li><NuxtLink :to="{ path: '/', hash: '#services', query: { service: 'fe742571-652f-4545-b675-2df2099b9be8' } }">Веб-сайты</NuxtLink></li>
            <li><NuxtLink :to="{ path: '/', hash: '#services', query: { service: 'e982c9ab-576e-4496-9932-d55075073cd9' } }">Интернет-магазины</NuxtLink></li>
            <li><NuxtLink :to="{ path: '/', hash: '#services', query: { service: 'dfa1fe02-fa60-42de-aae9-cf5127dbf20a' } }">AI и автоматизация</NuxtLink></li>
            <li><NuxtLink :to="{ path: '/', hash: '#services', query: { service: '389d9b7c-0d47-49dc-9eac-aaf257545ccd' } }">Корпоративные системы</NuxtLink></li>
            <li><NuxtLink :to="{ path: '/', hash: '#services', query: { service: '86ca5e9c-7e2c-4351-ae1e-ae900b7e644e' } }">Мобильные приложения</NuxtLink></li>
          </ul>
        </div>

        <!-- Legal Column -->
        <div class="footer__col footer__col--legal">
          <h4>О компании</h4>
          <ul>
            <li>ИП Анищенко Дмитрий Александрович</li>
            <li>ОГРНИП 326774600075626</li>
            <li>ИНН 773421830976</li>
            <li>г. Москва</li>
            <li><a href="mailto:contact@vezha.digital">contact@vezha.digital</a></li>
            <li><a href="/privacy">Политика обработки данных</a></li>
          </ul>
        </div>
      </div>

      <div class="footer__bottom">
        <p>Vezha Digital · Создано с ♥</p>
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
  padding: 3vw 0 1.5vw;
  z-index: 100;
  width: 100%;
  box-shadow: 0 -5px 10px rgba(0, 229, 255, 0.3);
  clear: both;
}

.footer__content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2vw;
  margin-bottom: 2vw;
}

.footer__col h4 {
  font-family: var(--font-inter);
  font-size: 1.1vw;
  font-weight: 700;
  margin-bottom: 1vw;
}

.footer__col ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer__col ul li {
  margin-bottom: 0.6vw;
}

.footer__col a {
  color: var(--text-dim);
  text-decoration: none;
  transition: all 0.3s;
  font-family: var(--font-inter);
  font-size: 0.9vw;
}

.footer__col a:hover {
  color: var(--accent);
  padding-left: 5px;
}

.footer__col--legal ul li {
  color: var(--text-dim);
  font-family: var(--font-inter);
  font-size: 0.9vw;
}

.footer__bottom {
  text-align: center;
  padding-top: 1.5vw;
  border-top: 1px solid var(--border);
}

.footer__bottom p {
  color: var(--text-dim);
  font-family: var(--font-inter);
  font-size: 0.9vw;
}

@media (max-width: 768px) {
  .footer {
    padding: 24px 0 16px;
  }

  .footer .container-main {
    max-width: 100%;
    margin: 0;
    padding-left: 20px;
    padding-right: 20px;
  }

  .footer__content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
  }

  .footer__col h4 {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .footer__col ul {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 12px;
  }

  .footer__col--legal ul {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 6px;
  }

  .footer__col--legal ul li {
    font-size: 0.75rem;
    color: var(--text-dim);
  }

  .footer__col ul li {
    margin-bottom: 0;
  }

  .footer__col a {
    font-size: 0.8rem;
    color: var(--text-dim);
  }

  .footer__col a:hover {
    padding-left: 0;
  }

  .footer__bottom {
    padding-top: 16px;
  }

  .footer__bottom p {
    font-size: 0.8rem;
  }
}
</style>
