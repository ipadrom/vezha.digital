import { readFile, writeFile } from 'node:fs/promises';

// Separate, editable SVG elements: artwork, original logo, title and subtitle.
// Only the phone/background artwork is generated; the brand lettering is real text.
const assets = new URL('../../frontend/public/cases/ssag/2026-09/', import.meta.url);
const png = async name => `data:image/png;base64,${(await readFile(new URL(name, assets))).toString('base64')}`;
const artwork = await png('cover-phones.png');
const logo = await png('logo-transparent.png');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941" role="img" aria-labelledby="title description">
  <title id="title">SSAG — Android MVP</title>
  <desc id="description">Логотип SSAG и два телефона с картой мест помощи и кнопкой SOS.</desc>
  <image id="phone-artwork" width="1672" height="941" href="${artwork}"/>
  <image id="original-logo" x="66" y="273" width="274" height="274" href="${logo}"/>
  <g id="brand-type" fill="#004e54" font-family="Arial, Helvetica, sans-serif">
    <text id="brand-name" x="358" y="461" font-size="148" font-weight="700" letter-spacing="-5">SSAG</text>
    <text id="project-format" x="366" y="522" font-size="31" font-weight="400" letter-spacing="3">ANDROID MVP</text>
  </g>
</svg>`;
await writeFile(new URL('cover-editorial.svg', assets), svg);
console.log('Built cover-editorial.svg with the original logo and SVG text elements.');
