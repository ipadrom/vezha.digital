<template>
  <main class="loader">
    <LandingLoaderPattern :progress="settings.progress" :font-pixels="settings.font" :letter-gap="settings.letters" :word-gap="settings.words" :row-gap="settings.rows" :inset="settings.inset" />
    <div class="counter" :style="{ left: `${settings.countInset}px`, bottom: `${settings.countInset}px` }">{{ Math.round(settings.progress).toString().padStart(2, '0') }}<span>%</span></div>
  </main>
  <aside class="controls">
    <header><b>Экран загрузки</b><button @click="collapsed = !collapsed">{{ collapsed ? 'Настроить' : 'Свернуть' }}</button></header>
    <template v-if="!collapsed">
      <label v-for="control in controls" :key="control.key">
        <span>{{ control.label }}</span>
        <input type="number" :min="control.min" :max="control.max" v-model.number="settings[control.key]" @change="clampValue(control)" />
        <input type="range" :min="control.min" :max="control.max" v-model.number="settings[control.key]" />
      </label>
      <footer><button @click="reset">Сбросить</button><button @click="copy">{{ copied ? 'Скопировано' : 'Копировать настройки' }}</button></footer>
      <small>Настройки сохраняются здесь. На основной сайт не применяются.</small>
    </template>
  </aside>
</template>
<script setup>
import { reactive, ref, watch } from 'vue'
import LandingLoaderPattern from '../../components/landing/LandingLoaderPattern.vue'
const controls = [
  { key: 'progress', label: 'Загрузка, %', min: 0, max: 100 },
  { key: 'font', label: 'Размер букв, px', min: 60, max: 500 },
  { key: 'letters', label: 'Между буквами, px', min: -20, max: 80 },
  { key: 'words', label: 'Между VEZHA, px', min: 0, max: 200 },
  { key: 'rows', label: 'Между рядами, px', min: 0, max: 150 },
  { key: 'inset', label: 'От краёв экрана, px', min: 0, max: 150 },
  { key: 'countInset', label: 'Отступ процентов, px', min: 8, max: 180 },
]
const mobile = window.matchMedia('(max-width: 767px)').matches
const defaults = { progress: 50, font: mobile ? 170 : 250, letters: 12, words: mobile ? 0 : 60, rows: 0, inset: 0, countInset: 8 }
let saved = {}
try { saved = JSON.parse(localStorage.getItem('vezha-loader-preview') || '{}') } catch {}
const settings = reactive({ ...defaults, ...saved })
const collapsed = ref(false)
const copied = ref(false)
function clampValue(control) { settings[control.key] = Math.max(control.min, Math.min(control.max, Number(settings[control.key]) || control.min)) }
controls.forEach(clampValue)
watch(settings, () => localStorage.setItem('vezha-loader-preview', JSON.stringify(settings)))
function reset() { Object.assign(settings, defaults) }
async function copy() { try { await navigator.clipboard.writeText(JSON.stringify(settings, null, 2)); copied.value = true; setTimeout(() => copied.value = false, 1800) } catch { copied.value = false } }
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Onest:wght@400;500;600;700;800&display=swap');
:root { --font-ui: 'Onest', system-ui, sans-serif; font-family: var(--font-ui); color: #1c1d21; }
* { box-sizing: border-box; }
body { margin: 0; }
.loader { position: fixed; inset: 0; overflow: hidden; isolation: isolate; background: #fff; }
.loader-meta, .counter { position: absolute; z-index: 1; color: #fff; mix-blend-mode: difference; font-family: 'JetBrains Mono', monospace; }
.loader-meta { display: flex; justify-content: space-between; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; }
.counter { font-size: clamp(72px, 17vw, 230px); font-weight: 500; line-height: .86; letter-spacing: -.02em; }
.controls { position: fixed; z-index: 10; bottom: 20px; right: 20px; width: min(330px, calc(100vw - 32px)); padding: 18px; border: 1px solid #dadddf; border-radius: 16px; background: #fffffff2; box-shadow: 0 8px 36px #0002; }
.controls header, .controls footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.controls label { display: grid; grid-template-columns: 1fr 65px; align-items: center; gap: 6px; margin-top: 12px; font-size: 12px; }
.controls input[type=range] { grid-column: 1 / -1; width: 100%; margin: 0; accent-color: #24262b; }
.controls input[type=number] { width: 65px; padding: 5px; border: 1px solid #dadddf; border-radius: 5px; font: inherit; }
.controls button { border: 1px solid #ddd; border-radius: 8px; background: #f5f5f7; padding: 8px; color: inherit; font: 500 11px var(--font-ui); cursor: pointer; }
.controls footer { margin-top: 16px; }
.controls small { display: block; margin-top: 10px; font-size: 10px; line-height: 1.5; color: #656970; }
@media(max-width:600px) { .controls { bottom: 12px; right: 12px; } }
</style>
