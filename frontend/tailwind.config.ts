import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        dark: {
          bg: '#0a0a0a',
          'bg-secondary': '#121212',
          card: '#1a1a1a',
          border: '#2a2a2a',
        },
        // Light theme colors
        light: {
          bg: '#ffffff',
          'bg-secondary': '#f5f5f5',
          card: '#ffffff',
          border: '#e5e5e5',
        },
        // Accent colors
        accent: {
          dark: '#00ff66',
          'dark-hover': '#00cc52',
          light: '#ff3333',
          'light-hover': '#cc2929',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 0.3s linear',
        'glitch-1': 'glitch-1 0.3s linear',
        'glitch-2': 'glitch-2 0.3s linear',
      },
      keyframes: {
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'glitch-1': {
          '0%, 100%': { clipPath: 'inset(0 0 0 0)', transform: 'translate(0)' },
          '20%': { clipPath: 'inset(20% 0 60% 0)', transform: 'translate(-2px, 2px)' },
          '40%': { clipPath: 'inset(40% 0 40% 0)', transform: 'translate(2px, -2px)' },
          '60%': { clipPath: 'inset(60% 0 20% 0)', transform: 'translate(-2px, 2px)' },
          '80%': { clipPath: 'inset(80% 0 0 0)', transform: 'translate(2px, -2px)' },
        },
        'glitch-2': {
          '0%, 100%': { clipPath: 'inset(0 0 0 0)', transform: 'translate(0)' },
          '20%': { clipPath: 'inset(60% 0 20% 0)', transform: 'translate(2px, -2px)' },
          '40%': { clipPath: 'inset(20% 0 60% 0)', transform: 'translate(-2px, 2px)' },
          '60%': { clipPath: 'inset(80% 0 0 0)', transform: 'translate(2px, -2px)' },
          '80%': { clipPath: 'inset(40% 0 40% 0)', transform: 'translate(-2px, 2px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
