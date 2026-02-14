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
        // Dark theme colors (maket style)
        dark: {
          bg: '#0a0a0a',
          'bg-secondary': '#111111',
          'bg-tertiary': '#1a1a1a',
          card: '#111111',
          border: '#2a2a2a',
        },
        // Light theme colors
        light: {
          bg: '#ffffff',
          'bg-secondary': '#f5f5f5',
          card: '#ffffff',
          border: '#e5e5e5',
        },
        // Accent colors (cyan)
        accent: {
          DEFAULT: '#00E5FF',
          dark: '#00E5FF',
          'dark-hover': '#00b8cc',
          light: '#00E5FF',
          'light-hover': '#00b8cc',
        },
        // Text colors
        'text-dim': '#a0a0a0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        pixel: ['Pixelify Sans', 'monospace'],
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
