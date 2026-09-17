import { readFile, writeFile } from 'node:fs/promises';

// Separate, editable SVG elements: artwork, original logo, title and subtitle.
// User-provided renders, clipped to the device outlines without resampling screens.
const assets = new URL('../../frontend/public/cases/ssag/2026-09/', import.meta.url);
const png = async name => `data:image/png;base64,${(await readFile(new URL(name, assets))).toString('base64')}`;
const map = await png('mockup-map.png');
const sos = await png('mockup-sos.png');
const logo = await png('logo-transparent.png');
const background = await png('cover-background.png');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941" role="img" aria-labelledby="title description">
  <title id="title">SSAG — Android MVP</title>
  <desc id="description">Логотип SSAG и два телефона с картой мест помощи и кнопкой SOS.</desc>
  <defs>
    <filter id="shadow" x="-20%" y="-10%" width="150%" height="135%"><feDropShadow dx="10" dy="20" stdDeviation="18" flood-color="#26302b" flood-opacity=".22"/></filter>
    <clipPath id="map-device"><path d="M724 41 Q679 39 670 94 L571 1194 Q566 1240 598 1253 L1070 1297 Q1120 1300 1129 1240 L1224 117 Q1227 76 1179 73 Z"/></clipPath>
    <clipPath id="sos-device"><path d="M808 159 L1182 174 Q1226 176 1234 220 L1082 1239 Q1077 1283 1032 1280 L605 1205 Q566 1194 580 1151 L759 204 Q768 157 808 159 Z"/></clipPath>
  </defs>
  <image id="original-background" width="1672" height="941" href="${background}"/>
  <g id="map-mockup" transform="translate(885 75) scale(.6)" filter="url(#shadow)">
    <image width="1824" height="1368" clip-path="url(#map-device)" href="${map}"/>
  </g>
  <g id="sos-mockup" transform="translate(376 -81) scale(.75)" filter="url(#shadow)">
    <image width="1824" height="1368" clip-path="url(#sos-device)" href="${sos}"/>
  </g>
  <image id="original-logo" x="66" y="273" width="274" height="274" href="${logo}"/>
  <g id="brand-type" fill="#004e54" font-family="Arial, Helvetica, sans-serif">
    <text id="brand-name" x="358" y="461" font-size="148" font-weight="700" letter-spacing="-5">SSAG</text>
    <text id="project-format" x="366" y="522" font-size="31" font-weight="400" letter-spacing="3">ANDROID MVP</text>
  </g>
</svg>`;
await writeFile(new URL('cover-editorial.svg', assets), svg);
console.log('Built cover-editorial.svg with the original logo and SVG text elements.');
