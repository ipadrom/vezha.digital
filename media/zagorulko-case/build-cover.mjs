import {readFile,writeFile} from 'node:fs/promises';

const assets=new URL('../../frontend/public/cases/gbu-process-automation/2026-09/',import.meta.url);
const png=async name=>'data:image/png;base64,'+(await readFile(new URL(name,assets))).toString('base64');
const phone=await png('cover-phone-source.png');
const laptop=await png('cover-laptop-source.png');
const screen=await png('cover-orders-source.png');
const logo=(await readFile(new URL('../../frontend/public/cases/gbu-process-automation/mobile/work-center-logo.svg',import.meta.url),'utf8')).replace(/<\/?svg[^>]*>/g,'').replace(/<title>.*?<\/title>/,'');

// Both device images keep their source pixels. The desktop screenshot is
// cropped horizontally to the display aspect ratio, never stretched.
const laptopMarkup=`
  <defs>
    <linearGradient id="center-background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#edf8ff"/><stop offset=".62" stop-color="#eaf5ff"/><stop offset="1" stop-color="#edf0ff"/></linearGradient>
    <clipPath id="laptop-outline"><path d="M363 210 H1458 Q1498 211 1503 252 L1514 1013 Q1514 1028 1500 1036 L1518 1038 L1653 1117 V1135 Q1652 1155 1608 1156 H215 Q171 1155 171 1134 V1117 L304 1038 L325 1035 Q309 1026 311 999 L320 252 Q321 212 363 210Z"/></clipPath>
    <clipPath id="laptop-display"><path d="M362 234 H842 V250 Q842 260 854 260 H968 Q981 260 981 249 V234 H1462 Q1478 234 1479 252 L1490 990 H334 L346 252 Q346 234 362 234Z"/></clipPath>
  </defs>
  <image width="1824" height="1368" clip-path="url(#laptop-outline)" href="${laptop}"/>
  <path d="M1478 535 L1507 535 L1510 711 L1483 711Z" fill="#080a0a"/>
  <path d="M1505 535 L1508 711" stroke="#535653" stroke-width="2"/>
  <g clip-path="url(#laptop-display)">
    <svg x="334" y="234" width="1156" height="756" viewBox="257 0 1390 909" preserveAspectRatio="xMidYMid slice">
      <image width="1904" height="909" href="${screen}"/>
    </svg>
  </g>`;

const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941" role="img" aria-labelledby="title description">
  <title id="title">ГБУ — Рабочий центр</title>
  <desc id="description">Распознавание заказов на ноутбуке и подбор бригад на телефоне.</desc>
  <defs>
    <filter id="device-shadow" x="-15%" y="-15%" width="145%" height="150%"><feDropShadow dx="12" dy="20" stdDeviation="18" flood-color="#272329" flood-opacity=".20"/></filter>
    <clipPath id="phone-outline"><rect x="644" y="132" width="537" height="1107" rx="110"/></clipPath>
  </defs>
  <rect width="1672" height="941" fill="url(#center-background)"/>
  <g id="work-center-logo" transform="translate(82 232) scale(.39)">${logo}</g>
  <g id="cover-type" font-family="Arial, Helvetica, sans-serif" fill="#101214">
    <text x="82" y="503" font-size="36" letter-spacing="-1">ИП Загорулько</text>
    <text x="77" y="638" font-size="120" font-weight="700" letter-spacing="-5">Рабочий</text>
    <text x="77" y="750" font-size="120" font-weight="700" letter-spacing="-5">центр</text>
    <text x="83" y="828" font-size="28" letter-spacing="-.5">Заказы / Бригады / Сообщения</text>
  </g>
  <g id="laptop-mockup" transform="translate(560 86) scale(.64)" filter="url(#device-shadow)">${laptopMarkup}</g>
  <g id="phone-mockup" transform="translate(1040 332) scale(.44)" filter="url(#device-shadow)">
    <image width="1824" height="1368" clip-path="url(#phone-outline)" href="${phone}"/>
  </g>
</svg>`;
await writeFile(new URL('cover-work-center.svg',assets),svg);
await writeFile(new URL('laptop-fitted.svg',assets),`<svg xmlns="http://www.w3.org/2000/svg" width="1824" height="1368" viewBox="0 0 1824 1368">${laptopMarkup}</svg>`);
console.log('Built work-center cover and fitted laptop with the original screenshot.');
