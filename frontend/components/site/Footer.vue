<template>
  <footer class="py-12 bg-light-bg-secondary dark:bg-dark-bg-secondary border-t border-light-border dark:border-dark-border">
    <div class="container-main">
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <!-- Logo & Description -->
        <div class="sm:col-span-2 lg:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg bg-accent-light dark:bg-accent-dark flex items-center justify-center">
              <span class="text-white dark:text-dark-bg font-bold text-lg">V</span>
            </div>
            <span class="font-bold text-lg">VEZHA Digital</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Веб-разработка под ключ. Telegram Mini Apps, боты, сайты и интернет-магазины.
          </p>
        </div>

        <!-- Services -->
        <div>
          <h4 class="font-semibold mb-4">{{ $t('footer.services_title') }}</h4>
          <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>Telegram Mini Apps</li>
            <li>Telegram боты</li>
            <li>Веб-сайты</li>
            <li>Интернет-магазины</li>
            <li>AI и автоматизация</li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h4 class="font-semibold mb-4">{{ $t('footer.company_title') }}</h4>
          <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="#services" class="hover:text-accent-light dark:hover:text-accent-dark">{{ $t('nav.services') }}</a></li>
            <li><a href="#projects" class="hover:text-accent-light dark:hover:text-accent-dark">{{ $t('nav.projects') }}</a></li>
            <li><a href="#advantages" class="hover:text-accent-light dark:hover:text-accent-dark">{{ $t('nav.why_us') }}</a></li>
            <li><a href="#contacts" class="hover:text-accent-light dark:hover:text-accent-dark">{{ $t('nav.contacts') }}</a></li>
          </ul>
        </div>

        <!-- Contacts -->
        <div>
          <h4 class="font-semibold mb-4">{{ $t('footer.contacts_title') }}</h4>
          <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <a :href="`https://t.me/${(settings?.contact_telegram || '').replace('@', '')}`" target="_blank" class="hover:text-accent-light dark:hover:text-accent-dark">
                {{ settings?.contact_telegram }}
              </a>
            </li>
            <li>
              <a :href="`mailto:${settings?.contact_email}`" class="hover:text-accent-light dark:hover:text-accent-dark">
                {{ settings?.contact_email }}
              </a>
            </li>
            <li>
              <a :href="`tel:${settings?.contact_phone?.replace(/\D/g, '')}`" class="hover:text-accent-light dark:hover:text-accent-dark">
                {{ settings?.contact_phone }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Copyright -->
      <div class="pt-8 border-t border-light-border dark:border-dark-border text-center text-sm text-gray-500">
        <p>&copy; {{ new Date().getFullYear() }} {{ settings?.footer_copyright || 'VEZHA Digital. ' + $t('footer.rights') + '.' }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineProps<{
  settings?: Record<string, string>
}>()
</script>
