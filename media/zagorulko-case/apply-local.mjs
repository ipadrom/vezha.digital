import { readFile } from 'node:fs/promises';

// Local-only save/publish through the admin builder API. Never deploys.
const api = 'http://localhost:8000/api';
const copy = JSON.parse(await readFile(new URL('./content.json', import.meta.url), 'utf8'));
let token;
async function request(path, method = 'GET', body) {
  const response = await fetch(api + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${await response.text()}`);
  return response.json();
}
token = (await request('/admin/auth/dev-login', 'POST')).access_token;
const matches = (await request('/admin/cases')).filter(c => c.slug === 'gbu-process-automation');
if (matches.length !== 1) throw new Error('Expected one local Zagorulko case');
const path = `/admin/cases/${matches[0].id}`;
const doc = await request(path);
const existing = id => {
  const block = doc.blocks.find(b => b.id === id);
  if (!block) throw new Error(`Missing expected builder block ${id}`);
  return structuredClone(block);
};
const hero = existing('e595e51e-e2e6-561a-bb8c-aa0787d2c891');
const cover = existing('d38a1d06-ff06-5ec9-a709-b59397d2af90');
const overview = existing('d2cece1e-6971-50ea-82ac-40320801c432');
const process = existing('3f1d741c-0ab2-5a56-add0-a84c8b23f40e');
const results = existing('dcf5e358-4fed-5be2-8e18-44cff96dc5b4');
const tech = existing('c37cc306-0673-5d07-9035-4a684efcaeec');
const ids = [process.id, '1cddfd62-8bdd-5d6e-a4c4-67e51a1aa760', '9d26ca37-4d86-4d74-b3a5-e618c202b260', '3fa94194-abcb-5ac8-b786-b155cb1bf16c'];
const sections = ids.map(id => ({ ...structuredClone(process), id,
  settings: { ...process.settings, layout: 'chapter', disclosure_mode: 'single', open_first: true } }));
const stack = [
  ['python','Python','python','На Python написали серверную логику рабочего центра: разбор распознанных таблиц, подготовку сообщений и подбор бригад. Правила обработки заказов вынесли в отдельные модули, чтобы проверять их на тестовых данных без обращения к рабочим чатам.','Python powers table parsing, message preparation and crew selection. Order-processing rules live in separate modules so they can be tested without accessing live chats.'],
  ['flask','Flask','flask','Объединили распознавание, работу с MAX и подбор бригад в одном Flask-приложении. Сервер принимает запросы интерфейса и связывает их с нужным модулем; сотрудник переключается между разделами в одном рабочем центре.','Flask brings recognition, MAX operations and crew selection into one app. It routes interface requests to the appropriate module while staff work in a single interface.'],
  ['ocr','Yandex Vision OCR','scan-text','Сервис распознаёт текст и таблицы на фотографиях заказов. Его ответ обрабатывает наш парсер: связывает поля с заказами, а для коротких фрагментов восстанавливает недостающую структуру по сетке и координатам текста.','The service recognizes text and tables in order photos. Our parser associates fields with orders and reconstructs missing structures in short fragments using grid lines and text coordinates.'],
  ['green','GREEN-API','plug','Через GREEN-API подключили чтение истории MAX, отправку заказов и обновление состава бесед. Эту же интеграцию использует скрипт расчётов: получает сообщения из двух чатов и передаёт их на сверку и начисление.','GREEN-API connects MAX chat history, order delivery and membership updates. The calculation script also uses it to retrieve two chat histories for reconciliation and employee credits.'],
  ['storage','Object Storage','cloud','В Yandex Object Storage хранятся состояние приложения и очередь заданий MAX. Выполненные шаги записываются по мере обработки, а облачный Timer запускает продолжение работы независимо от открытой страницы. Если результат отправки неизвестен, задание останавливается для проверки.','Yandex Object Storage holds app state and MAX jobs. Progress is saved as steps complete, and a cloud Timer triggers processing independently of the browser. Unknown delivery outcomes pause the job for review.'],
  ['apps-script','Google Apps Script','googleappsscript','Написали скрипт, который запускается из меню Google Таблицы: загружает сообщения, сопоставляет заказы и обновляет начисления. Добавили блокировку параллельного запуска и отдельную команду для подтверждения заказов без контрольной основы.','A script launched from the Google Sheets menu retrieves messages, reconciles orders and updates credits. A document lock prevents concurrent updates, and a separate command approves orders without a matching source record.'],
  ['ortools','OR-Tools','code','Использовали решатель CP-SAT для совместного выбора бригад, бригадиров и резерва. Он ищет сочетание с высокой суммарной оценкой среди подготовленных вариантов, учитывая историю выездов, размеры групп, запреты и ручные закрепления.','The CP-SAT solver selects crews, leaders and reserves together. It searches generated candidates for a high-scoring combination while respecting history-based scores, group sizes, forbidden combinations and manual locks.'],
  ['pillow','Pillow','image','С помощью Pillow приложение подготавливает фотографии к распознаванию: преобразует их в RGB и JPEG и при необходимости увеличивает изображение с ограничением ширины. Это даёт OCR единый формат входных данных при загрузке снимков из разных источников.','The app uses Pillow to convert photos to RGB and JPEG and upscale them when needed within a width limit. OCR receives a consistent input format from different image sources.'],
  ['interface','HTML / CSS / JavaScript','monitor','Собрали адаптивный интерфейс с редактируемыми карточками заказов, ручными переносами сотрудников и статусами заданий. Поддержали установку рабочего центра как PWA; для серверных операций требуется интернет.','The responsive interface provides editable order cards, manual crew changes and job statuses. The work center can be installed as a PWA; server operations require an internet connection.'],
  ['sheets','Google Sheets','table','Сохранили привычную для заказчика среду расчётов. На листе периода собираются начисления, на контрольном — расхождения и спорные заказы. Повторное обновление сохраняет ручные данные вне служебных областей.','We retained the client’s familiar calculation environment. Period sheets hold employee credits, review sheets show discrepancies, and repeat updates preserve manual data outside managed areas.'],
  ['docker','Docker','docker','Упаковали рабочий центр и его зависимости в один контейнер для запуска в Yandex Cloud. Рабочие данные и секреты хранятся отдельно от образа, поэтому обновление приложения не требует включать их в сборку.','The work center and its dependencies are packaged in one container for Yandex Cloud. Operational data and secrets remain outside the image rather than being included in application builds.'],
  ['gunicorn','Gunicorn','gunicorn','Запускает Flask-приложение в рабочем контейнере и обслуживает HTTP-запросы. Настроили один процесс с несколькими потоками — такая конфигурация соответствует модели блокировок приложения при работе с состоянием.','Gunicorn serves the Flask app inside the production container. One process with multiple threads preserves the app’s in-process state-locking model while handling HTTP requests.'],
];
const relatedFor = {"python": ["flask", "ortools", "pillow"], "flask": ["python", "gunicorn", "interface"], "ocr": ["pillow", "python"], "green": ["apps-script", "storage", "flask"], "storage": ["green", "docker"], "apps-script": ["sheets", "green"], "ortools": ["python"], "pillow": ["ocr"], "interface": ["flask"], "sheets": ["apps-script"], "docker": ["gunicorn", "storage"], "gunicorn": ["flask", "docker"]};
const groupFor = id => ['python','flask','interface'].includes(id) ? ['Рабочий центр','Work center']
  : ['ocr','pillow','ortools'].includes(id) ? ['Распознавание и подбор','Recognition and selection']
  : ['green','apps-script','sheets'].includes(id) ? ['MAX и расчёты','MAX and calculations']
  : ['Инфраструктура','Infrastructure'];
for (const locale of ['ru', 'en']) {
  const c = copy[locale], key = `content_${locale}`;
  hero[key] = { ...hero[key], subtitle: c.hero, timeline: '' };
  cover[key] = { ...cover[key], image_url: c.coverImage || '', alt: c.coverAlt || '', video_url: '', poster_url: '', caption: c.coverImage ? '' : c.coverNote };
  overview[key] = { ...overview[key], title: c.overview, body: c.body, tags: [] };
  sections.forEach((block, index) => {
    const s = c.sections[index];
    block[key] = { eyebrow: s.title, title: '', summary: s.summary, items: s.items.map(([title, description, media_note, media_type, image_url = '', media_caption = '', video_url = '']) => ({
      title, description, media_note, media_type, image_url: video_url ? '' : image_url, image_alt: title, media_caption, video_url, poster_url: video_url ? image_url : '',
      secondary_image_url: '', media_layout: 'default', media_size: 'full', tags: [],
    })) };
  });
  results[key] = { ...results[key], eyebrow: locale === 'ru' ? 'Что изменилось в работе' : 'What changed for the team', title: '',
    body: c.resultsIntro,
    items: c.results.map(([title, text]) => ({ title, text })), tags: [], link_url: '', link_label: '' };
  tech[key] = { eyebrow: locale === 'ru' ? 'Стек проекта' : 'Technology stack', title: '', summary: c.techSummary,
    items: stack.map(([id, label, icon, ru, en], index) => ({ id, label, icon,
      category: '',
      group: groupFor(id)[locale === 'ru' ? 0 : 1], description: locale === 'ru' ? ru : en,
      related_ids: relatedFor[id] || [], x: 10 + (index % 3) * 35, y: 10 + Math.floor(index / 3) * 25 })) };
}
const blocks = [hero, cover, overview, ...sections, results, tech].map((b, sort_order) => ({ ...b, sort_order, is_visible: true }));
const meta = { ...doc.meta, timeline_ru: '', timeline_en: '',
  subtitle_ru: 'Обработка заказов, подбор бригад и начисления', subtitle_en: 'Order processing, crew selection and credits',
  description_ru: 'Автоматизация работы ИП Загорулько: от фотографий заказов и подбора бригад до сообщений в MAX и начислений в Google Таблицах.',
  description_en: 'Workflow automation for Zagorulko: order photos, crew selection, MAX messages and Google Sheets calculations.' };
meta.seo_description_ru = meta.description_ru;
meta.seo_description_en = meta.description_en;
if (copy.ru.coverImage) {
  meta.image_url = copy.ru.coverImage;
  meta.cover_image_url = copy.ru.coverImage;
}
await request(path, 'PUT', { meta, blocks });
await request(path + '/publish', 'POST');
const saved = await request(path);
if (saved.blocks.length !== 9 || saved.blocks.filter(b => b.type === 'technologies').length !== 1) throw new Error('Unexpected saved structure');
if (saved.blocks.filter(b => b.type === 'process').some(b => b.content_ru.items.some(i => i.media_type === 'video' && !i.video_url))) throw new Error('Missing process video');
const briefCount = sections.reduce((sum, block) => sum + block.content_ru.items.length, 0);
console.log(`Updated local case: 9 builder blocks, 4 scenarios, ${briefCount} media briefs, one technology stack.`);
console.log('http://localhost:3000/cases/gbu-process-automation');
