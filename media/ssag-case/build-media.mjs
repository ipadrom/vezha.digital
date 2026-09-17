import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Keep emulator pixels intact; the SVG only supplies a background and device frames.
const output = new URL('../../frontend/public/cases/ssag/2026-09/', import.meta.url);
async function phone(name, x, y, id) {
  const bytes = await readFile(new URL(`screens/${name}.png`, output));
  if (bytes.readUInt32BE(16) !== 1440 || bytes.readUInt32BE(20) !== 3200) {
    throw new Error(`Expected a native 1440 × 3200 capture: ${name}`);
  }
  return `<g transform="translate(${x} ${y})">
    <rect x="-12" y="-12" width="420" height="904" rx="54" fill="url(#frame)" stroke="#575954" stroke-width="2" filter="url(#shadow)"/>
    <rect x="-6" y="-6" width="408" height="892" rx="49" fill="#151815"/>
    <clipPath id="${id}"><rect width="396" height="880" rx="43"/></clipPath>
    <image width="396" height="880" clip-path="url(#${id})" href="data:image/png;base64,${bytes.toString('base64')}"/>
  </g>`;
}

for (const [filename, left, right, title] of [
  ['overview.svg', 'map', 'sos', 'SSAG — карта и SOS'],
  ['location.svg', 'location-picker', 'location-selected', 'SSAG — выбор местоположения'],
]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1067" viewBox="0 0 1600 1067" role="img">
  <title>${title}</title>
  <defs>
    <linearGradient id="frame" x2="1" y2="0"><stop stop-color="#242823"/><stop offset=".06" stop-color="#85867d"/><stop offset=".11" stop-color="#252923"/><stop offset=".92" stop-color="#171b17"/><stop offset="1" stop-color="#73766b"/></linearGradient>
    <filter id="shadow" x="-30%" y="-20%" width="160%" height="150%"><feDropShadow dx="0" dy="22" stdDeviation="18" flood-color="#343c2f" flood-opacity=".22"/></filter>
  </defs>
  <rect width="1600" height="1067" fill="#eeecdf"/>
  ${await phone(left, 325, 70, 'left-screen')}
  ${await phone(right, 870, 113, 'right-screen')}
</svg>`;
  await writeFile(new URL(filename, output), svg);
  console.log(`Created ${fileURLToPath(new URL(filename, output))}`);
}
