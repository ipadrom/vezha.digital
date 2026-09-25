import { readFile, writeFile, copyFile, mkdir, access } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const assets = new URL('../../frontend/public/cases/mymit/2026-09/', import.meta.url);
// Public MyMIT brand assets from the app checkout; override with MYMIT_LANDING_ASSETS. Already copied files are kept when the source is absent.
const source = new URL(process.env.MYMIT_LANDING_ASSETS || '../../../mymit/mymit-pwa-dev/frontend-mini-app/public/images/landing/', import.meta.url);
await mkdir(assets, { recursive: true });
for (const [from, to] of [['logo-mit.svg', 'logo.svg'], ['cabin_inside.jpg', 'cabin.jpg']]) {
  await copyFile(new URL(from, source), new URL(to, assets)).catch(async (error) => { await access(new URL(to, assets)).catch(() => { throw error; }); });
}
const data = async (name, mime) => `data:${mime};base64,${(await readFile(new URL(name, assets))).toString('base64')}`;
const [logo,cabin,booking,bookings] = await Promise.all([data('logo.svg','image/svg+xml'),data('cabin.jpg','image/jpeg'),data('booking.png','image/png'),data('bookings.png','image/png')]);
await writeFile(new URL('cover.svg', assets), `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><defs><clipPath id="photo"><rect x="60" y="255" width="655" height="650" rx="16"/></clipPath><clipPath id="screen1"><rect x="799" y="95" width="330" height="714" rx="28"/></clipPath><clipPath id="screen2"><rect x="1189" y="225" width="330" height="714" rx="28"/></clipPath></defs><rect width="1600" height="1000" fill="#eeeae4"/><image href="${logo}" x="74" y="90" width="235" height="107"/><image href="${cabin}" x="60" y="255" width="655" height="650" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo)"/><rect x="790" y="86" width="348" height="732" rx="37" fill="#242526"/><image href="${booking}" x="799" y="95" width="330" height="714" clip-path="url(#screen1)"/><rect x="1180" y="216" width="348" height="732" rx="37" fill="#242526"/><image href="${bookings}" x="1189" y="225" width="330" height="714" clip-path="url(#screen2)"/></svg>`);

const base = '/cases/mymit/2026-09/';
const previous = JSON.parse(await readFile(new URL('case.json',import.meta.url),'utf8').catch(()=>'{}'));
const blocks = [];
function block(type,layout,ru,en,extra={}) {
  blocks.push({id:previous.blocks?.find(b=>b.type===type && b.settings.layout===layout && b.content_ru.eyebrow===ru.eyebrow)?.id || randomUUID(),type,sort_order:blocks.length,is_visible:true,
    settings:{theme:'paper',surface:'plain',width:'wide',spacing:'large',layout,alignment:'left',...extra},content_ru:ru,content_en:en});
}
const wide=['analytics.mp4','admin-bookings.mp4','push-mailings.png','return-visits-admin.png'];
// A `.mp4` fragment becomes a muted looping video with a poster of the same name; other names are images.
const item=(title,description,media='')=>({title,description,...(media.endsWith('.mp4')?{media_type:'video',video_url:base+media,poster_url:base+media.replace(/\.mp4$/,'.jpg'),image_alt:title}:media?{media_type:'image',image_url:base+media,image_alt:title}:{media_type:'none'}),...(media?{media_size:wide.includes(media)?'full':'medium',media_layout:'default'}:{})});
block('hero','case-header',
 {title:'МИТ',subtitle:'Доработали приложение для бронирования и управления кабинками.',industry:'Развитие существующего продукта',logo_url:base+'logo.svg'},
 {title:'MIT',subtitle:'Evolving an existing booth booking and control app.',industry:'Existing product development',logo_url:base+'logo.svg'},
 {width:'full',hero_background:'#eeeae4',hero_text:'#242526',show_project_name:false});
block('media_hero','media-natural',
 {image_url:base+'cover.svg',alt:'МИТ: фирменная визуализация кабинки и настоящие экраны бронирования на тестовых данных'},
 {image_url:base+'cover.svg',alt:'MIT booth artwork and actual booking screens with sandbox data'},
 {width:'full',spacing:'compact'});
block('image_text','client',
 {"eyebrow": "Заказчик", "title": "Константин Снегов", "caption": "Предприниматель · МИТ", "image_url": "/cases/mymit/2026-09/konstantin-snegov.jpg", "alt": "Константин Снегов", "body": "МИТ — сервис аренды переговорных кабинок в Москве. Тихое пространство для звонка, встречи или работы можно забронировать и оплатить через приложение.\n\nДля проекта Константина мы развивали существующее приложение: дорабатывали путь от выбора кабинки до управления сеансом, инструменты команды и связь с оборудованием.", "logo_url": "/cases/mymit/2026-09/logo.svg", "logo_label": "МИТ", "contact_url": "https://t.me/kostyasnegov", "contact_label": "Написать", "project_url": "https://mymit.ru/", "project_label": "Открыть", "show_contact": false},
 {"eyebrow": "Client", "title": "Konstantin Snegov", "caption": "Entrepreneur · MIT", "image_url": "/cases/mymit/2026-09/konstantin-snegov.jpg", "alt": "Konstantin Snegov", "body": "MIT is a meeting-booth rental service in Moscow. Users can book and pay for a quiet space for calls, meetings or focused work through the app.\n\nFor Konstantin’s project, we developed the existing application: improving the journey from booth selection to session controls, team tools and device integration.", "logo_url": "/cases/mymit/2026-09/logo.svg", "logo_label": "MIT", "contact_url": "https://t.me/kostyasnegov", "contact_label": "Message", "project_url": "https://mymit.ru/", "project_label": "Visit the project", "show_contact": false},
 {spacing:'normal'});
blocks.at(-1).is_visible = false;
block('text','overview',
 {eyebrow:'О проекте',title:'Подключились к существующему приложению и взяли на себя его дальнейшую доработку.',body:'МИТ — сервис аренды переговорных кабинок. Пользователь выбирает место и время, оплачивает бронь и управляет сеансом из приложения. За этим сценарием стоят расписания, платежи, уведомления и связь с физическим оборудованием.\n\nПриложение было разработано до нашего участия. Вежа Диджитал занималась его развитием: дорабатывала пользовательские сценарии, серверную логику и инструменты администрирования.\n\nРабота затронула весь путь пользователя: вход, знакомство с сервисом, выбор кабинки, оплату и управление сеансом. Параллельно развивали административную часть, аналитику, уведомления и связь приложения с оборудованием.'},
 {eyebrow:'About the project',title:'We joined an existing application to develop it further.',body:'MIT is a meeting-booth rental service. Users select a location and time, pay for a booking and manage their session in the app. Schedules, payments, notifications and physical devices support that experience.\n\nThe application was built before our involvement. VEZHA Digital worked on subsequent improvements to user journeys, backend logic and administration tools.\n\nThe work covered sign-in, onboarding, booth discovery, payments and session management. In parallel, we extended administration, analytics, notifications and the connection to physical equipment.'},
 {anchor:'story'});
const chapters = [
  ['Веб-версия и вход', 'Web app and sign-in',
   'Развивали самостоятельное приложение: от первого входа до подсказок во время бронирования.',
   'Developed the standalone experience, from first sign-in to guidance during booking.', [
    ['Вход без обязательного Telegram', 'Sign-in beyond Telegram',
     'Объединили пользовательские маршруты в самостоятельной веб-версии и сохранили Telegram как дополнительный канал. Доработали вход по телефону: получение кода звонком, по СМС и через MAX, переключение между способами и повторную отправку. Добавили Яндекс ID и доступ к поддержке из сценариев входа.',
     'Unified user routes in a standalone web app, retaining Telegram as an optional channel. Improved phone sign-in with call, SMS and MAX codes, channel switching and retries. Added Yandex ID and access to support during authentication.', 'auth.mp4'],
    ['Обучение внутри приложения', 'Guided onboarding',
     'Добавили последовательный тур по основным действиям: выбор кабинки, календарь, проверка брони и управление сеансом. Подсказки привязаны к нужным элементам интерфейса, в том числе на мобильном экране. Сохраняем прохождение обучения и пропускаем уже выполненные шаги, например разрешение уведомлений.',
     'Added a guided tour through booth selection, the calendar, booking review and session controls. Tips point to the relevant UI elements, including on mobile. Completion is saved, and resolved steps such as notification permission are skipped.', 'onboarding.mp4'],
  ]],
  ['Поиск кабинки', 'Finding a booth',
   'Доработали выбор места: знакомые точки, поиск по городу и условия посещения.',
   'Improved location discovery, saved places and access information.', [
    ['Избранные кабинки', 'Favorite booths',
     'Добавили избранное и отдельную вкладку для сохранённых кабинок. Сердце на карточке показывает, сохранена ли точка, а счётчик во вкладке помогает ориентироваться в списке. Привычную кабинку можно найти без повторного поиска по всем адресам.',
     'Added favorites and a dedicated saved-booth tab. A heart marks saved locations, and the tab count reflects the list. Users can return to a familiar booth without searching all addresses again.', 'favorites.mp4'],
    ['Поиск по адресу и метро', 'Address and metro search',
     'Добавили поиск по адресам, станциям метро и ключевым словам, учли написание через «е» и «ё». Доработали определение ближайшей кабинки на карте и поведение геолокации в мобильном браузере. На скрине — отфильтрованный результат запроса «Парк культуры».',
     'Added address, metro and keyword search, including Russian spelling normalization. Improved nearest-booth discovery and mobile-browser geolocation. The screenshot shows the filtered result for Park Kultury.', 'search.mp4'],
    ['Расписание и условия доступа', 'Hours and access conditions',
     'Добавили управление часами работы кабинок и недельное расписание в карточке. Текущий день выделен, чтобы время работы можно было проверить с первого взгляда. Для точек с ограниченным доступом доработали отдельную отметку и пояснение условий посещения.',
     'Added booth working-hours controls and a weekly schedule in the booth details. Today is highlighted for quick reference. Restricted-access locations received a dedicated badge and an explanation of access conditions.', 'working-hours.png'],
  ]],
  ['Бронирование и сеанс', 'Booking and sessions',
   'Переработали выбор времени и ситуации, когда у пользователя меняются планы.',
   'Reworked time selection and the flows users need when plans change.', [
    ['Проверка интервала перед оплатой', 'Reviewing time before payment',
     'Переработали сценарий бронирования с календарём, тарифами и доступными временными слотами. Выбранный интервал и стоимость подтверждаются отдельно, до перехода к оплате. Пользователь видит время начала и окончания, а доступность рассчитывается с учётом расписания и других броней.',
     'Reworked booking with a calendar, tariffs and available time slots. The chosen interval and price are confirmed before checkout. Users see both start and end times, with availability based on working hours and other bookings.', 'interval.mp4'],
    ['Несколько броней и ранний старт', 'Multiple bookings and early starts',
     'Доработали отображение параллельных бронирований и переход к управлению конкретным сеансом. Добавили явное действие «Начать раньше»: оно появляется за 15 минут до начала подходящей брони. При раннем старте сервер проверяет, что кабинка свободна, и сдвигает начало и окончание с сохранением оплаченной длительности; то же окно в 15 минут используют приложение и доступ к оборудованию. Приложение не запускает сеанс без действия пользователя.',
     'Improved concurrent booking display and navigation to the selected session. Added an explicit Start early action that appears 15 minutes before an eligible booking. On early activation the backend checks that the booth is free and shifts the start and end while preserving the paid duration; the app and device access use the same 15-minute window. The session never starts without user action.', 'earlystart.mp4'],
    ['Перенос без повторной оплаты', 'Rescheduling without another payment',
     'Добавили перенос существующей брони на другую дату и время. Пользователь выбирает доступный интервал, сохраняя длительность и стоимость исходного тарифа. Новые параметры видны на кнопке подтверждения, поэтому перенос не требует отмены и повторной оплаты бронирования.',
     'Added rescheduling to another date and available time interval while preserving the original duration and tariff. The confirmation shows the new details, without requiring cancellation and a second payment.', 'reschedule.mp4'],
  ]],
  ['Оплата и время', 'Payments and time',
   'Доработали сохранённую оплату, продление, остаток минут и правила после окончания сеанса.',
   'Improved saved payments, extensions, minute balances and end-of-session rules.', [
    ['Несколько способов оплаты', 'Multiple payment methods',
     'Расширили интеграцию с ЮKassa: несколько сохранённых способов, выбор основного и отдельная отвязка. Доработали возврат в оплату после привязки карты или СБП и восстановление незавершённого сценария. В профиле видны доступные способы и текущий основной.',
     'Extended YooKassa integration with multiple saved methods, a preferred method and individual removal. Improved the return to checkout after card or SBP binding and recovery of interrupted flows. The profile shows available methods and the default.', 'payment-methods.png'],
    ['Стоимость продления до подтверждения', 'Extension cost before confirmation',
     'Связали расчёт дополнительного времени с тарифом конкретного бронирования. Доработали продление активных и запланированных сеансов, отображение нового окончания и ожидающего платежа. Пользователь проверяет итог до подтверждения; сервер применяет оплаченное продление к нужной брони.',
     'Linked additional-time pricing to the specific booking tariff. Improved extensions for active and scheduled sessions, new end-time display and pending-payment handling. Users review the total before confirming, and the backend applies paid extensions to the correct booking.', 'extension.mp4'],
    ['Баланс неиспользованных минут', 'Unused-minute balance',
     'Добавили баланс минут после раннего завершения и историю его изменений в профиле. При продлении пользователь выбирает, сколько минут использовать: интерфейс показывает доступный остаток, ограничение для выбранного интервала и уменьшение суммы к оплате. На фрагменте применены 15 минут с баланса.',
     'Added a balance for unused minutes after early completion and a history in the profile. During an extension, users choose how many minutes to use and see the available balance, interval limit and resulting discount. The fragment shows 15 minutes applied.', 'minutes.mp4'],
    ['Правила дополнительного времени', 'Overstay rules',
     'Доработали платное время после завершения основного сеанса: бесплатное окно выхода, стоимость минуты, резерв и расчёт фактического использования. Перед оплатой показываем условия для выбранного способа. Отдельно обработали неуспешный резерв и ограничение, которое не позволяет дополнительному времени мешать следующей брони.',
     'Improved overstay handling: the free exit window, per-minute rate, payment reservation and actual usage calculation. Terms are shown before payment for the selected method. Also handled failed reservations and limits that protect the next booking.', 'overstay-rules.png'],
    ['Скидка за повторное посещение', 'Return-visit discount',
     'Добавили кампании повторных визитов: после завершённого и оплаченного посещения по промокоду кампании пользователь получает бонус на следующую бронь до конца месяца. Баннер на главной показывает размер скидки и срок, а при выборе времени приложение само пересчитывает стоимость: цена без скидки, скидка и итог видны до оплаты. Бонус не суммируется с промокодами и минутами; сервер повторно проверяет цену при создании брони и оплате.',
     'Added return-visit campaigns: after a completed, paid visit with a campaign promo code, the user receives a bonus for the next booking until the end of the month. A banner on the home screen shows the discount and deadline, and the price is recalculated automatically when a time is chosen, with the original price, discount and total visible before payment. The bonus does not stack with promo codes or minutes; the backend re-checks the price when the booking is created and paid.', 'returnvisit.mp4'],
    ['Суммы с копейками и точная длительность', 'Exact amounts and durations',
     'Скидки за повторный визит и промокоды дают суммы вроде 517,5 ₽. Часть экранов округляла их до рубля, и в разных местах пользователь видел разные цифры. Ввели общий формат денежных сумм с копейками для баннера ожидающей оплаты, страницы оплаты, экрана брони, продления, выбора тарифа и карточек кабинок. В карточке брони показываем фактически оплаченную длительность, а не округление до ближайшего тарифа.',
     'Return-visit discounts and promo codes produce amounts such as 517.5 ₽. Some screens rounded them to whole rubles, so users saw different figures in different places. Introduced one shared money format with kopecks for the pending-payment banner, payment page, booking screen, extensions, tariff picker and booth cards. Booking cards now show the actual paid duration instead of rounding to the nearest tariff.'],
  ]],
  ['Управление сервисом', 'Service operations',
   'Расширили административные инструменты для работы с бронированиями, показателями и скидками.',
   'Extended administration for bookings, reporting and discounts.', [
    ['Аналитика по кабинкам и периодам', 'Analytics by booth and period',
     'Добавили показатели выручки, броней, новых и повторных пользователей, популярности тарифов и загрузки. Доработали расчёт доступного времени: учитываем расписание, дату появления кабинки и данные за завершённые дни. Период и локация выбираются в фильтрах; график в кейсе построен на демонстрационных данных.',
     'Added revenue, bookings, new and returning users, tariff popularity and utilization metrics. Improved capacity calculations using schedules, booth creation dates and completed-day snapshots. Reports filter by period and location; case figures use demonstration data.', 'analytics.mp4'],
    ['Поиск и управление бронированиями', 'Booking search and management',
     'Добавили поиск, фильтры по кабинке и серверную пагинацию в административных списках. Доработали управление завершением брони и работу с платежами. Администратор может сузить список до нужной точки и проверить статус, интервал и стоимость конкретного посещения.',
     'Added search, booth filters and server-side pagination to admin lists. Improved booking completion controls and payment handling. Administrators can narrow the list to a location and inspect a visit’s status, interval and cost.', 'admin-bookings.mp4'],
    ['Промокоды с персональными лимитами', 'Per-user promo limits',
     'Доработали промокоды для бронирования и продления: ограничения по кабинкам, срок действия и повторное применение. Лимит использований и бюджет скидки считаются отдельно для каждого пользователя. Это позволяет задавать условия многоразового предложения, не расходуя общий лимит всеми клиентами сразу.',
     'Improved promo codes for bookings and extensions with booth restrictions, validity periods and repeated use. Usage count and discount budget are tracked per user, allowing repeat offers without treating all customers as one shared allowance.', 'promo-limits.png'],
    ['Кампании повторных визитов', 'Return-visit campaigns',
     'В административной части добавили раздел кампаний: название, процент бонуса, период действия, промокоды −50% и включение. Условия фиксируются в момент выдачи бонуса, поэтому изменение настроек не затрагивает уже обещанные скидки. По каждой кампании видны выданные бонусы, оплаченные и завершённые повторные визиты и конверсия; показы и клики по баннеру сохраняются для аналитики. Возвраты, переносы с доплатой и конкурирующие брони обрабатываются на сервере.',
     'Added a campaign section to the admin panel: name, bonus percentage, validity period, −50% promo codes and an on/off switch. Terms are fixed when a bonus is issued, so later setting changes do not affect promised discounts. Each campaign shows issued bonuses, paid and completed repeat visits and the conversion rate; banner impressions and clicks are recorded for analytics. Refunds, paid rescheduling and concurrent bookings are handled on the backend.', 'return-visits-admin.png'],
  ]],
  ['Уведомления', 'Notifications',
   'Развивали сообщения в браузере и голосовые подсказки внутри кабинки.',
   'Developed browser notifications and spoken announcements in booths.', [
    ['Push-рассылки и оповещения', 'Push mailings and alerts',
     'Добавили Web Push в рассылки и административные оповещения, а также отображение результата доставки по получателям. Доработали приглашение включить уведомления. На сервере отсекаем устаревшие напоминания после перерыва в работе, чтобы пользователю не приходили уже неактуальные сообщения.',
     'Added Web Push to mailings and admin alerts, plus per-recipient delivery results. Improved the notification-permission prompt. The backend discards stale reminders after downtime so users do not receive obsolete messages.', 'push-mailings.png'],
    ['Интеграция с Алисой', 'Alice integration',
     'Интегрировали приложение с Яндекс-колонками с Алисой: голосовые объявления сопровождают начало сеанса, предупреждают о скором окончании и сообщают о завершении брони. В административной части настраиваются события и время их срабатывания, а для конкретной колонки используется проверенный сценарий.',
     'Integrated the app with Yandex speakers powered by Alice. Spoken announcements mark the start of a session, warn that it is ending soon and announce booking completion. Administrators configure events and their timing, with a verified scenario for each speaker.', 'speaker-events.png'],
  ]],
  ['Кабинка и приложение', 'Booth and application',
   'Дорабатывали серверную связь с оборудованием и поведение при изменении состояния устройств.',
   'Improved backend equipment integration and device-state handling.', [
    ['Свой MQTT-сервис вместо Yandex IoT Core', 'Our MQTT service to replace Yandex IoT Core',
     'Разработали собственный MQTT-сервис — аналог Yandex IoT Core для задач МИТ: обмен командами и состояниями устройств, управление подключениями и доступом. Это подготовило основу для перехода с сервиса Яндекса: 1 ноября 2026 года он переходит в режим только для чтения, а 1 декабря прекращает работу. Добавили выбор провайдера для каждого устройства, чтобы переводить кабинки постепенно, сохраняя прежнюю интеграцию на время перехода.',
     'Built our own MQTT service as an alternative to Yandex IoT Core for MIT: exchanging device commands and states, managing connections and controlling access. This provides a migration path as Yandex IoT Core becomes read-only on November 1, 2026 and shuts down on December 1. Per-device provider selection enables a gradual transition while retaining the previous integration.', 'device-provider.png'],
    ['Состояние кабинки после перезапуска', 'Booth state after restart',
     'Доработали обработку состояния устройств, контроль связи и сверку реле после перезагрузки. Исправили сценарий продления около конца брони, чтобы отложенное выключение не гасило свет во время продлённого сеанса. В административной карточке видны связь, последнее сообщение устройства и версия прошивки; здесь показан локальный симулятор.',
     'Improved device-state handling, connectivity monitoring and relay reconciliation after reboot. Fixed extensions near session end so a delayed shutoff does not turn lights off during extended time. The admin card shows connectivity, heartbeat and firmware version; this example uses the local simulator.', 'device-status.png'],
    ["Готовые контроллеры T Relay", "Ready-made T Relay controllers",
     "Заменили сборки из обычной ESP32 и отдельного релейного модуля на готовые решения T Relay. Под новое оборудование переписали прошивку, сохранив связь с приложением и управление реле в сценариях работы кабинки.",
     "Replaced assemblies built from a standard ESP32 and a separate relay module with ready-made T Relay controllers. Rewrote the firmware for the new hardware, retaining app connectivity and relay control throughout booth operation."],
    ["OTA: обновление прошивки по сети", "OTA: firmware updates over the network",
     "Добавили OTA — обновление прошивки контроллеров по сети. Новую версию можно передать устройству удалённо, без подключения компьютера к каждой кабинке. Это упрощает доставку исправлений и развитие прошивки после установки оборудования.",
     "Added OTA firmware updates over the network. A new version can be delivered remotely without connecting a computer to each booth, making fixes and firmware improvements easier to distribute after installation."],
  ]],
];
for (const [ruHeading, enHeading, ruSummary, enSummary, entries] of chapters) {
  block('process', 'chapter',
    {eyebrow:ruHeading, summary:ruSummary, items:entries.map(([ruTitle,enTitle,ruText,enText,image])=>item(ruTitle,ruText,image))},
    {eyebrow:enHeading, summary:enSummary, items:entries.map(([ruTitle,enTitle,ruText,enText,image])=>item(enTitle,enText,image))},
    {open_first:true,disclosure_mode:'single'});
}
block('results','air',
 {eyebrow:'Что изменилось',body:'Развили существующий продукт сразу на нескольких уровнях — от пользовательского сценария до серверной связи с оборудованием.',items:[
  {title:'Самостоятельная веб-версия.',text:' Пользовательские сценарии доступны без обязательного запуска приложения внутри Telegram.'},
  {title:'Больше возможностей для бронирования.',text:' Поиск, избранное, перенос, продление и скидка за повторное посещение дополнены доработками оплаты и промокодов.'},
  {title:'Понятные расчёты времени.',text:' Продление, баланс минут и условия после окончания сеанса связаны с тарифом конкретной брони.'},
  {title:'Управление сервисом.',text:' Команда может анализировать загрузку, находить брони и задавать персональные лимиты промокодов.'},
  {title:'Уведомления по событиям.',text:' Push и голосовые объявления дополняют сценарии бронирования; каналы и события настраиваются в административной части.'},
  {title:'Связь с оборудованием.',text:' Добавлены настройки подключения устройств, контроль связи и восстановление состояния после перезапуска.'}],tags:[]},
 {eyebrow:'What changed',body:'Developed the existing product across the user experience, backend logic and equipment integration.',items:[
  {title:'Standalone web experience.',text:' User journeys no longer require opening the app inside Telegram.'},
  {title:'More booking options.',text:' Search, favorites, rescheduling, extensions and a return-visit discount are supported by payment and promo-code improvements.'},
  {title:'Clear time calculations.',text:' Extensions, minute balances and overstay terms follow the tariff of each booking.'},
  {title:'Service management.',text:' The team can analyse occupancy, find bookings and set per-user promo-code limits.'},
  {title:'Event-based notifications.',text:' Push and voice announcements support booking flows, with channels and events configured in the admin interface.'},
  {title:'Equipment integration.',text:' Added device connection settings, connectivity monitoring and state recovery after restarts.'}],tags:[]},
 {anchor:'evidence'});
const technologies=[
 ["next", "Next.js / React", "nextdotjs", "Приложение", "Application", "Клиентское приложение и административный интерфейс существующего продукта. В нём дорабатывали вход, обучение, выбор кабинки, бронирование и экраны управления сеансом; состояние на клиенте держит небольшой стор без тяжёлых зависимостей.", "The client app and the existing admin interface. Sign-in, onboarding, booth discovery, booking and session screens were reworked here; client state lives in a small store without heavy dependencies.", ["charts", "push", "fastapi", "payments"], "Next.js / React"],
 ["charts", "Recharts", "chart-column", "Приложение", "Application", "Графики выручки и аналитика бронирований с фильтрами в административной части. Данные считает сервер, клиент только рисует и переключает периоды.", "Revenue charts and booking analytics with filters in the admin area. The server does the counting; the client renders and switches periods.", ["next", "fastapi"], "Recharts"],
 ["fastapi", "FastAPI / Python", "fastapi", "Сервер", "Backend", "Сервер приложения: бронирования, проверка интервалов, расчёт стоимости с копейками, авторизация и все интеграции. Для внешних сервисов используется httpx, схемы данных описаны на Pydantic.", "The application server: bookings, interval checks, kopeck-accurate pricing, authentication and every integration. External services are called through httpx; data schemas are Pydantic models.", ["postgres", "celery", "payments", "mqtt", "alice", "push"], "FastAPI / Python"],
 ["postgres", "PostgreSQL / SQLAlchemy", "postgresql", "Сервер", "Backend", "Пользователи, кабинки, расписания, бронирования, платежи и история операций. Доступ через асинхронный SQLAlchemy, изменения схемы идут миграциями Alembic.", "Users, booths, schedules, bookings, payments and operation history. Accessed through async SQLAlchemy; schema changes ship as Alembic migrations.", ["fastapi", "celery"], "PostgreSQL / SQLAlchemy"],
 ["celery", "Celery / Redis", "celery", "Сервер", "Backend", "Фоновые задачи: напоминания перед сеансом, завершение и продление броней, рассылки и обработка событий устройств. Redis служит брокером, периодические задания ставит планировщик.", "Background jobs: session reminders, booking completion and extension, mailings and device-event processing. Redis is the broker; periodic jobs are scheduled.", ["fastapi", "postgres", "push"], "Celery / Redis"],
 ["payments", "ЮKassa", "credit-card", "Интеграции", "Integrations", "Оплата бронирований, сохранённые способы оплаты, СБП, списание за дополнительное время и возвраты по правилам отмены. Статусы платежей приходят через уведомления провайдера.", "Booking payments, saved payment methods, instant bank transfers, charges for extra time and refunds under the cancellation rules. Payment statuses arrive as provider callbacks.", ["fastapi", "next"], "YooKassa"],
 ["push", "Web Push / WebSocket", "bell", "Интеграции", "Integrations", "Оповещения о сеансах и рассылки по сегментам через Web Push; состояние кабинки и брони обновляется в интерфейсе по WebSocket без перезагрузки.", "Session alerts and segment mailings through Web Push; booth and booking state updates in the interface over WebSocket without a reload.", ["next", "celery", "fastapi"], "Web Push / WebSocket"],
 ["alice", "Яндекс Алиса", "mic", "Интеграции", "Integrations", "Голосовые объявления в кабинке через Яндекс-колонки: начало сеанса, напоминание за пять минут и завершение. Сервер выбирает событие и текст, колонка озвучивает.", "Voice announcements in the booth through Yandex speakers: session start, a five-minute reminder and the end. The server picks the event and text; the speaker voices it.", ["fastapi", "mqtt"], "Yandex Alice"],
 ["mqtt", "MQTT-сервис", "radio-tower", "Оборудование", "Equipment", "Собственный MQTT-сервис вместо Yandex IoT Core: команды замкам и реле, события от устройств и сверка состояния кабинок. Сервер общается с брокером через paho-mqtt.", "An in-house MQTT service replacing Yandex IoT Core: commands to locks and relays, device events and booth-state reconciliation. The server talks to the broker through paho-mqtt.", ["fastapi", "firmware", "alice", "ota"], "MQTT service"],
 ["firmware", "ESP32 / T Relay", "cpu", "Оборудование", "Equipment", "Прошивка контроллеров в кабинках: сборки из ESP32 с релейным модулем заменили на готовые платы T Relay. Устройство держит связь с MQTT, исполняет команды и сообщает о своём состоянии.", "Firmware for the booth controllers: ESP32 boards with a separate relay module were replaced by ready-made T Relay boards. The device keeps an MQTT connection, executes commands and reports its state.", ["mqtt", "ota"], "ESP32 / T Relay"],
 ["ota", "OTA-обновления", "refresh-cw", "Оборудование", "Equipment", "Обновление прошивки по сети без выезда к кабинке: устройство получает новую версию и перезапускается, состояние устройств видно в административной части.", "Firmware updates over the network without visiting the booth: the device fetches the new version and restarts, and device status is visible in the admin area.", ["firmware", "mqtt"], "OTA updates"]
];
const tech=(en)=>({eyebrow:en?'Technology stack':'Стек проекта',title:'',summary:en?"We worked within the existing architecture: the client app, the server, integrations and the link to the booth hardware.":"Работали в существующей архитектуре приложения: развивали клиентскую часть, сервер, интеграции и связь с оборудованием кабинок.",items:technologies.map(([id,label,icon,ruGroup,enGroup,ru,enText,related,enLabel])=>({id,label:en?enLabel:label,icon,group:en?enGroup:ruGroup,category:'',description:en?enText:ru,related_ids:related}))});
block('technologies','contours',tech(false),tech(true),{anchor:'technical'});
const meta={slug:'mymit',name_ru:'МИТ — развитие приложения для бронирования кабинок',name_en:'MIT — evolving a booth booking application',type_ru:'Развитие приложения',type_en:'Application development',description_ru:'Доработка существующего приложения МИТ: бронирование, оплата, аналитика и взаимодействие с оборудованием.',description_en:'Improvements to the existing MIT application: booking, payments, analytics and device integration.',subtitle_ru:'Доработка и развитие существующего продукта',subtitle_en:'Developing an existing product',industry_ru:'Аренда переговорных кабинок',industry_en:'Meeting booth rental',year:'2026',image_url:base+'cover.svg',cover_image_url:base+'cover.svg',is_featured:true,sort_order:3,seo_noindex:true};
await writeFile(new URL('case.json',import.meta.url),JSON.stringify({meta,blocks},null,2)+'\n');
console.log(`Built MyMIT case: ${blocks.length} bilingual blocks and cover.`);
