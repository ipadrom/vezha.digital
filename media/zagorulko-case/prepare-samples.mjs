import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const out = new URL('./outputs/demo/', import.meta.url);
await fs.mkdir(out, {recursive:true});
const root = 'C:/Users/artas/OneDrive/Рабочий стол/Projects/GBU/';
const fixture = JSON.parse(await fs.readFile(root+'gbu-work-center/output/mobile-case-2026-09-07/fixture.json','utf8'));
const orders = fixture.orders.map((o,i)=>({...o,day:'07/09',members:[['Примеров','Ладов','Миров','Яснов'],['Образцов','Кленов','Листов','Речной'],['Макетов','Зорин','Светов']][i],half:i===2?['Тихов','Полев']:[]}));
orders.push({...orders[0],day:'08/09',collection_time:'11:00',deceased_surname:'Учебнова',members:['Эскизов','Лучев','Ветров','Снежов'],half:[],missingControl:true});
const chats={elite:[],standard:[]};let n=0;
const messages=[];
for(const [i,o] of orders.entries()){
 const base=`${o.day} ------${o.tariff}------\n${o.collection_time}______${o.hospital} — ${o.service_place} — ${o.final_dest}\n(Ум. ${o.deceased_surname}) - ${o.num_people} - (Аг. ${o.agent})`;
 const populated=base+'\n'+o.members.join('\n')+(o.half.length?'\nПол заказа:\n'+o.half.join('\n'):'');
 const category=o.tariff==='Элит'?'elite':'standard';
 for(const text of o.missingControl?[populated]:[base,populated])chats[category].push({idMessage:'demo-'+(++n),timestamp:1788732000+n*60,textMessage:text});
 messages.push({number:i+1,category,base,populated,missingControl:!!o.missingControl});
}
const context=vm.createContext({Date,JSON,Math,RegExp,Set,Map});
vm.runInContext(await fs.readFile(root+'gbu-misha-sheets-automation/google-apps-script/Core.gs','utf8'),context);
const report=JSON.parse(JSON.stringify(context.buildPeriodReport(chats.elite,chats.standard,{},2026)));
assert.equal(report.orders.length,3);assert.equal(report.ordersWithoutControl.length,1);assert.equal(report.employeeTotals.Тихов.elite,0.5);
await fs.writeFile(new URL('sample-export.json',out),JSON.stringify({notice:'Синтетическая выгрузка для кейса. Не реальные сообщения MAX.',...chats},null,2));
await fs.writeFile(new URL('calculation-result.json',out),JSON.stringify(report,null,2));
await fs.writeFile(new URL('demo-data.json',out),JSON.stringify({...fixture,orders,messages},null,2));
let md='# Заказы для демонстрационной беседы MAX\n\nВсе имена, места и заказы вымышлены. Создай две демонстрационные беседы: «Элит · Демо» и «Стандарт · Демо». Каждый блок отправляй отдельным сообщением. Сначала версия без людей, затем заполненная. Даты заказов — 7–8 сентября 2026; дата отправки сообщения может быть сегодняшней.\n\n';
for(const m of messages){md+=`## Заказ ${m.number} · ${m.category==='elite'?'Элит':'Стандарт'}\n\n`;if(!m.missingControl)md+='Исходный заказ:\n\n```text\n'+m.base+'\n```\n\n';md+='Заполненный заказ:\n\n```text\n'+m.populated+'\n```\n\n';if(m.missingControl)md+='Для этого примера не отправляй версию без людей: в таблице он должен остаться «НЕ ПРИБАВЛЕН».\n\n';}
md+='## Какие скрины нужны\n\n1. Исходный и заполненный первый заказ рядом в беседе.\n2. Третий заказ с блоком «Пол заказа».\n3. Четвёртый заказ без исходной версии — пример для контрольного листа.\n';
await fs.writeFile(new URL('MAX-orders.md',out),md);
const csv='Дата;Категория;Время;Маршрут;Бригадир;Участники;Половинные доли;Статус\n'+orders.map(o=>[o.day+'/2026',o.tariff,o.collection_time,o.hospital+' — '+o.final_dest,o.members[0],o.members.slice(1).join(', '),o.half.join(', '),o.missingControl?'НЕ ПРИБАВЛЕН':'УЧТЁН'].map(x=>'"'+x.replaceAll('"','""')+'"').join(';')).join('\n');
await fs.writeFile(new URL('sample-export.csv',out),'\uFEFF'+csv);
// Complete the scenario copy before switching every media brief to screenshots.
const file=new URL('./content.json',import.meta.url);const copy=JSON.parse(await fs.readFile(file,'utf8'));
copy.ru.sections[0].items[0][1]='Подключили Yandex Vision OCR и написали парсер на Python. Перед распознаванием подготавливаем изображение через Pillow, затем по координатам текста связываем время, маршрут и количество людей с заказом. Для коротких таблиц восстанавливаем недостающие строки по сетке без дополнительного запроса к OCR.';
copy.en.sections[0].items[0][1]='We integrated Yandex Vision OCR with a Python parser. Pillow prepares images before recognition; text coordinates link times, routes and crew sizes to orders. Missing rows in short tables are reconstructed from the grid without an additional OCR request.';
copy.ru.sections[2].summary='Через GREEN-API подключили загрузку заказов из MAX, обновление состава беседы и отправку сообщений. Сотрудник проверяет список и запускает операцию из рабочего центра.';
copy.en.sections[2].summary='GREEN-API connects MAX chat imports, membership updates and message delivery. Staff review the list and start the operation from the work center.';
copy.ru.sections[2].items[0][1]='Через GREEN-API получаем историю чатов и разбираем сообщения с назначенными бригадами. На сервере формируем список для проверки: повторная загрузка учитывает исправления и не добавляет дубли. Добавили сокращение до принятого у заказчика формата — готовый текст можно проверить, скопировать или передать на отправку.';
copy.en.sections[2].items[0][1]='GREEN-API provides chat histories containing orders with assigned crews. The server prepares a review list; repeat imports account for corrections without adding duplicates. Messages are shortened to the client’s format for review, copying or delivery.';
copy.ru.sections[2].items[1][1]='Через методы GREEN-API реализовали чтение и обновление состава беседы. Программа убирает незащищённых участников и добавляет назначенных бригадиров, сохраняя владельца, администраторов и защищённых участников. Перед отправкой повторно проверяет, что запланированные изменения выполнены.';
copy.en.sections[2].items[1][1]='GREEN-API methods read and update membership. The app removes unprotected members and adds assigned leaders while retaining the owner, administrators and protected participants. Membership changes are verified before delivery.';
copy.ru.sections[2].items[2][1]='Очередь заданий и результаты выполненных шагов сохраняем в Yandex Object Storage. Облачный Timer запускает обработку независимо от открытой страницы, а сообщения отправляются через GREEN-API. Если результат внешнего действия неизвестен, очередь останавливается для проверки без автоматического повтора.';
copy.en.sections[2].items[2][1]='Yandex Object Storage stores jobs and completed steps. A cloud Timer triggers processing independently of the browser, while GREEN-API delivers messages. Unknown external outcomes pause processing for review without automatic retries.';
copy.ru.sections[3].items[0][1]='Разработали Google Apps Script, который запускается из меню таблицы. Через GREEN-API он получает историю двух чатов MAX за половину месяца, сопоставляет версии заказов и считает начисления участникам и бригадирам. В разборе сообщений учли половинные доли и признаки удаления. Результат записывается на лист периода.';
copy.en.sections[3].items[0][1]='A Google Apps Script launched from the spreadsheet menu retrieves two MAX chat histories through GREEN-API. It matches order versions and calculates worker and leader credits, accounting for half shares and deleted messages, then writes the period results.';
for(const lang of ['ru','en'])for(const section of copy[lang].sections)for(const item of section.items){item[3]='image';item[2]=lang==='ru'?'Скриншот: '+item[0]+'. Вымышленные данные, читаемые поля и итог действия.':'Screenshot: '+item[0]+'. Fictional data with readable fields and action results.';}
await fs.writeFile(file,JSON.stringify(copy,null,2)+'\n');
console.log('Prepared four fictional orders, two chat histories, CSV, copyable MAX text and verified calculations: 3 counted, 1 held for review.');
