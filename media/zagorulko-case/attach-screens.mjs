import fs from 'node:fs/promises';
const output=new URL('./outputs/demo/',import.meta.url);
const destination=new URL('../../frontend/public/cases/gbu-process-automation/2026-09/',import.meta.url);
await fs.mkdir(destination,{recursive:true});
const screens=[['app-orders.png','app-edit.png'],['app-crews.png','app-locks.png','app-people.png'],['app-messages.png',null,null],['max-elite.png','sheet-totals.png','sheet-checks.png','sheet-export.png']];
for(const file of screens.flat().filter(Boolean))await fs.copyFile(new URL(file,output),new URL(file,destination));
const source=new URL('./content.json',import.meta.url);const c=JSON.parse(await fs.readFile(source,'utf8'));
for(const lang of ['ru','en'])c[lang].sections.forEach((s,index)=>s.items.forEach((item,i)=>{
 const file=screens[index][i];if(file){item[4]='/cases/gbu-process-automation/2026-09/'+file;item[5]=index===3?(lang==='ru'?(i===0?'Сообщения MAX — исходные данные для выгрузки.':'Пример выгрузки по заказам «Элит».'):(i===0?'MAX messages — input for the export.':'Sample export for Elite orders.')) : '';}
}));
c.ru.sections[2].items[1][2]='Здесь будет скриншот демонстрационной беседы MAX с участниками и заказами. Тексты подготовлены в MAX-orders.md.';
c.ru.sections[2].items[2][2]='Нужен скриншот статуса задания в рабочем центре. Пока оставлено место под кадр; реальные сообщения для съёмки не отправлялись.';
c.en.sections[2].items[1][2]='Reserved for the user’s screenshot of a demo MAX chat. Message text is prepared in MAX-orders.md.';
c.en.sections[2].items[2][2]='Reserved for a job status screenshot. No real messages were sent for this capture.';
await fs.writeFile(source,JSON.stringify(c,null,2)+'\n');
console.log('Attached 9 static screenshots; reserved MAX chat and queue status slots.');
