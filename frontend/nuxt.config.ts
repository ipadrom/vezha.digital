export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
  ],

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
  },

  i18n: {
    locales: [
      { code: 'ru', iso: 'ru-RU', name: 'Русский', file: 'ru.json' },
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'ru',
    lazy: true,
    langDir: 'locales',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'ru',
    },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000',
      telegramBotUsername: process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME || '',
    },
  },

  app: {
    head: {
      title: 'VEZHA Digital - Веб-разработка под ключ',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Разработка Telegram Mini Apps, ботов, веб-сайтов и интернет-магазинов. От 50 000 ₽. Запуск за 1-4 недели.' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2024-01-01',
})
