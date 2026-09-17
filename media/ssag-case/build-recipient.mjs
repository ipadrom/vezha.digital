import { readFile, writeFile } from 'node:fs/promises';

// Staged recipient view, with fictional contact and example location/time.
// SMS wording follows AlertMessageFormatter + LocationResult (MANUAL).
// Keep screen lettering as editable SVG text rather than generated pixels.
const assets = new URL('../../frontend/public/cases/ssag/2026-09/', import.meta.url);
const photo = (await readFile(new URL('recipient-photo.png', assets))).toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024" role="img" aria-labelledby="title desc">
  <title id="title">SMS от близкого человека</title>
  <desc id="desc">Постановочный пример: телефон в руке, сообщение о проблемах со здоровьем и ссылка на выбранное вручную место.</desc>
  <image width="1536" height="1024" href="data:image/png;base64,${photo}"/>
  <g id="sms-interface" font-family="Arial, Helvetica, sans-serif" fill="#253333">
    <text x="627" y="111" font-size="13" font-weight="600">14:32</text>
    <path d="M870 110v-5m5 5v-8m5 8V99" stroke="#253333" stroke-width="3"/>
    <rect x="892" y="100" width="18" height="10" rx="2" fill="none" stroke="#253333" stroke-width="1.5"/>
    <rect x="894" y="102" width="13" height="6" rx="1" fill="#253333"/>
    <path d="M912 103v4" stroke="#253333" stroke-width="2"/>
    <g id="conversation-header">
      <path d="m638 151-8 8 8 8m-8-8h18" fill="none" stroke="#253333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="676" cy="160" r="20" fill="#e0eae6"/>
      <text x="676" y="167" text-anchor="middle" font-size="21" fill="#175b59">М</text>
      <text x="707" y="166" font-size="22" font-weight="600">Мама</text>
      <path d="M876 152c-3 8 3 16 11 17l4-5-6-4-3 3-5-6 2-3-3-2Z" fill="none" stroke="#253333" stroke-width="1.7" stroke-linejoin="round"/>
      <circle cx="909" cy="153" r="1.6"/><circle cx="909" cy="160" r="1.6"/><circle cx="909" cy="167" r="1.6"/>
    </g>
    <path d="M607 196H929" stroke="#e1e3df"/>
    <text x="768" y="230" text-anchor="middle" font-size="13" fill="#697471">Сегодня, 14:32</text>
    <rect id="received-message" x="622" y="252" width="283" height="350" rx="20" fill="#e8ede8"/>
    <text id="message-body" x="639" y="283" font-size="19">
      <tspan x="639" dy="0">Тревога! Проблемы</tspan>
      <tspan x="639" dy="27">со здоровьем.</tspan>
      <tspan x="639" dy="38">Место указано вручную:</tspan>
      <tspan x="639" dy="27">17.09.2026 14:32:08 +03:00.</tspan>
    </text>
    <text id="location-link" x="639" y="432" font-size="17" fill="#12656d" text-decoration="underline">
      <tspan x="639" dy="0">https://yandex.ru/maps/</tspan>
      <tspan x="639" dy="26">?ll=49.1064,55.7961</tspan>
      <tspan x="639" dy="26">&amp;z=17&amp;pt=49.1064,55.7961</tspan>
    </text>
    <text x="639" y="575" font-size="12" fill="#697471">SMS · 14:32</text>
    <g id="message-input">
      <path d="M630 753h16m-8-8v16" stroke="#58635f" stroke-width="2" stroke-linecap="round"/>
      <rect x="659" y="731" width="247" height="45" rx="23" fill="none" stroke="#d1d8d1"/>
      <text x="676" y="759" font-size="16" fill="#77817b">Сообщение</text>
      <path d="m875 745 15 8-15 8 3-8Z" fill="none" stroke="#63776f" stroke-width="1.5" stroke-linejoin="round"/>
    </g>
    <rect x="729" y="798" width="78" height="4" rx="2" fill="#4f5753"/>
  </g>
</svg>`;
await writeFile(new URL('recipient-message.svg', assets), svg);
console.log('Built recipient-message.svg with separate SMS text elements.');
