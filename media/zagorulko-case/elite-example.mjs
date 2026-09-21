import fs from 'node:fs/promises';
const out=new URL('./outputs/demo/',import.meta.url);
const data=JSON.parse(await fs.readFile(new URL('demo-data.json',out),'utf8'));
data.orders=data.orders.filter(o=>o.tariff==='Элит');data.messages=data.messages.filter(o=>o.category==='elite');
const report=JSON.parse(await fs.readFile(new URL('calculation-result.json',out),'utf8'));
report.orders=report.orders.filter(o=>o.category==='elite');report.controlOrders=report.controlOrders.filter(o=>o.category==='elite');report.checks=report.checks.filter(o=>o.category==='elite');report.mismatches=report.mismatches.filter(o=>o.category==='elite');
report.employeeTotals=Object.fromEntries(Object.entries(report.employeeTotals).filter(([,t])=>t.eliteLead||t.elite).map(([n,t])=>[n,{eliteLead:t.eliteLead||0,elite:t.elite||0}]));
report.notice='Демонстрационный срез Элит из результата Core.gs. Рабочий скрипт обрабатывает обе категории.';
await fs.writeFile(new URL('demo-data.json',out),JSON.stringify(data,null,2));await fs.writeFile(new URL('calculation-result.json',out),JSON.stringify(report,null,2));
const raw=JSON.parse(await fs.readFile(new URL('sample-export.json',out),'utf8'));delete raw.standard;await fs.writeFile(new URL('sample-export.json',out),JSON.stringify(raw,null,2));
const csv='Дата;Время;Заказ;Бригадир;Участники;Половинные доли;Статус\n'+data.orders.map(o=>[o.day+'/2026',o.collection_time,o.deceased_surname,o.members[0],o.members.slice(1).join(', '),o.half.join(', '),o.missingControl?'НЕ ПРИБАВЛЕН':'УЧТЁН'].map(x=>'"'+x+'"').join(';')).join('\n');await fs.writeFile(new URL('sample-export.csv',out),'\uFEFF'+csv);
await fs.writeFile(new URL('MAX-orders.md',out),'# Элит · пример для кейса\n\nТри заполненных заказа совпадают со скриншотом MAX. Для первых двух в расчёте есть исходные версии без людей; третий показан как заказ без основы и остаётся на проверке. Все данные вымышлены.\n\n'+data.messages.map((m,i)=>'## Заказ '+(i+1)+'\n\n```text\n'+m.populated+'\n```').join('\n\n'));
await fs.copyFile('C:/Users/artas/AppData/Local/Temp/codex-clipboard-594d2d81-8067-4428-9705-3edf0172aaf5.png',new URL('max-elite.png',out));
const file=new URL('./content.json',import.meta.url);const c=JSON.parse(await fs.readFile(file,'utf8'));
for(const lang of ['ru','en']){
 const section=c[lang].sections[3];
 section.summary=lang==='ru'?'На примере заказов «Элит»: сообщения из MAX превращаются в строки таблицы, начисления сотрудникам и список расхождений.':'Using Elite orders as an example: MAX messages become spreadsheet rows, employee credits and discrepancy checks.';
 if(!section.items.some(i=>i[0]==='Заказы на входе'||i[0]==='Incoming orders'))section.items.unshift(lang==='ru'?['Заказы на входе','На вход скрипта поступают сообщения с датой, временем, маршрутом и списком сотрудников. Первый человек в списке — бригадир; блок «Пол заказа» обозначает половинные доли. На скриншоте — три заказа «Элит», которые показаны в выгрузке ниже.','Скриншот MAX пользователя.','image']:['Incoming orders','Messages contain the date, time, route and assigned employees. The first person is the crew leader; the half-order section assigns half credits. These three Elite orders appear in the export below.','User-provided MAX screenshot.','image']);
 section.items[1][1]=lang==='ru'?'Разработали Google Apps Script с загрузкой истории MAX через GREEN-API. Скрипт разбирает поля сообщений и сопоставляет заполненные заказы с исходными записями. В этом примере два заказа «Элит» вошли в начисления: по одной единице бригадирам, по одной — участникам и по 0,5 — Тихову и Полеву. Третий заказ вынесен на проверку.':'The Google Apps Script retrieves MAX history through GREEN-API, parses messages and matches filled orders with source records. Two Elite orders are credited here: one unit per leader or regular participant, and 0.5 each for Tikhov and Polev. The third order is held for review.';
}
await fs.writeFile(file,JSON.stringify(c,null,2)+'\n');
console.log('Elite example: 3 orders, 2 credited, 1 held; expected total 8 credits.');
