import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const out=new URL('./outputs/demo/',import.meta.url);
const report=JSON.parse(await fs.readFile(new URL('calculation-result.json',out),'utf8'));
const data=JSON.parse(await fs.readFile(new URL('demo-data.json',out),'utf8'));
const wb=Workbook.create();
function sheet(name,title,subtitle,headers,widths){
 const s=wb.worksheets.add(name);s.showGridLines=false;
 const end=String.fromCharCode(64+headers.length);
 s.getRange(`A1:${end}24`).format.font.name='Calibri';s.getRange(`A1:${end}24`).format.font.size=12;
 s.getRange(`A1:${end}1`).merge();s.getRange('A1').values=[[title]];
 s.getRange(`A1:${end}1`).format.fill='#183E37';s.getRange(`A1:${end}1`).format.font.color='#FFFFFF';s.getRange(`A1:${end}1`).format.font.size=21;s.getRange('A1').format.rowHeight=46;
 s.getRange(`A2:${end}2`).merge();s.getRange('A2').values=[[subtitle]];s.getRange('A2').format.rowHeight=32;s.getRange('A2').format.font.color='#536860';
 s.getRange(`A4:${end}4`).values=[headers];s.getRange(`A4:${end}4`).format.fill='#DFEBE4';s.getRange(`A4:${end}4`).format.font.bold=true;s.getRange(`A4:${end}4`).format.wrapText=true;s.getRange('A4').format.rowHeight=40;
 for(let i=0;i<widths.length;i++)s.getRange(`${String.fromCharCode(65+i)}1:${String.fromCharCode(65+i)}24`).format.columnWidth=widths[i];
 s.freezePanes.freezeRows(4);return s;
}
function body(s,rows){const end=String.fromCharCode(64+rows[0].length);s.getRange(`A5:${end}${4+rows.length}`).values=rows;s.getRange(`A5:${end}${4+rows.length}`).format.rowHeight=31;s.getRange(`A5:${end}${4+rows.length}`).format.verticalAlignment='center';for(let i=0;i<rows.length;i++)if(i%2===1)s.getRange(`A${i+5}:${end}${i+5}`).format.fill='#F1F5F2';}
const totals=sheet('Начисления','Элит · Начисления по заказам','1–15 сентября 2026 · единицы заказов · демонстрационный пример',['Сотрудник','Бригадир','Участник','Всего'],[32,24,24,20]);
const rows=Object.entries(report.employeeTotals).map(([name,t])=>[name,t.eliteLead||0,t.elite||0,null]);body(totals,rows);
for(let i=0;i<rows.length;i++)totals.getRange(`D${i+5}`).formulas=[[`=SUM(B${i+5}:C${i+5})`]];
const last=5+rows.length;totals.getRange(`A${last}`).values=[['ИТОГО']];for(const col of ['B','C','D'])totals.getRange(`${col}${last}`).formulas=[[`=SUM(${col}5:${col}${last-1})`]];totals.getRange(`A${last}:D${last}`).format.fill='#DFEBE4';totals.getRange(`A${last}:D${last}`).format.font.bold=true;
const check=sheet('Контроль','Элит · Проверка заказов','2 заказа учтены · 1 требует проверки · вымышленные имена и места',['Дата','Время','Категория','Заказ / фамилия','Начисление','Причина'],[16,12,16,25,22,45]);
body(check,data.orders.map(o=>[o.day+'.2026',o.collection_time,o.tariff,o.deceased_surname,o.missingControl?'НЕ ПРИБАВЛЕН':'УЧТЁН',o.missingControl?'Нет исходного заказа без списка людей':o.half.length?'Проверено · две половинные доли':'Основа и заполненный заказ совпали']));
check.getRange('A7:F7').format.fill='#FFF0D6';check.getRange('E7').format.font.color='#9A5215';check.getRange('F5:F7').format.wrapText=true;check.getRange('A5:F7').format.rowHeight=52;
check.getRange('A11:F11').merge();check.getRange('A11').values=[['Заказ без основы исключён из начислений до отдельного подтверждения.']];check.getRange('A11').format.font.color='#536860';
const source=sheet('Выгрузка','Заказы из MAX · пример выгрузки','Синтетический набор · те же заказы в MAX-orders.md и sample-export.json',['Дата','Время','Тариф','Фамилия в заказе','Бригада','Пол заказа'],[16,12,16,25,52,25]);body(source,data.orders.map(o=>[o.day+'.2026',o.collection_time,o.tariff,o.deceased_surname,o.members.join(', '),o.half.join(', ')||'—']));source.getRange('E5:F8').format.wrapText=true;source.getRange('A5:F8').format.rowHeight=52;
const notes=sheet('Как проверить','Как устроен пример','Все данные вымышлены. Реальные чаты и внешние API не использовались.',['Проверка','Ожидаемый результат'],[35,112]);body(notes,[['Источник расчёта','Расчёт выполнен существующим Core.gs проекта таблиц на синтетической истории MAX.'],['Обычные заказы','Первый участник получает единицу как бригадир, остальные — как участники.'],['Половинные доли','Тихов и Полев получают по 0,5 за третий заказ.'],['Заказ без основы','Четвёртый заказ не включён в начисления; показан в контрольном листе.'],['Итог','3 бригадирские единицы + 9 единиц участников = 12.'],['Формулы','Столбец «Всего» и итоговая строка рассчитываются формулами SUM.'],['Формат','Демонстрационная книга для кейса; это не рабочая таблица и не файл с подключённым Apps Script.']]);notes.getRange('B5:B11').format.wrapText=true;notes.getRange('A5:B11').format.rowHeight=45;
notes.getRange('B7').values=[['Тихов и Полев получают по 0,5 за второй заказ «Элит».']];
notes.getRange('B8').values=[['Третий заказ «Элит» не включён в начисления; показан в контрольном листе.']];
notes.getRange('B9').values=[['2 бригадирские единицы + 6 единиц участников = 8.']];
totals.getRange(`B5:D${last}`).setNumberFormat('General');
const f=await SpreadsheetFile.exportXlsx(wb);await f.save(fileURLToPath(new URL('zagorulko-sample.xlsx',out)));
for(const [name,file] of [['Начисления','sheet-totals.png'],['Контроль','sheet-checks.png'],['Выгрузка','sheet-export.png']]){const image=await wb.render({sheetName:name,range:name==='Начисления'?`A1:D${last}`:'A1:F11',scale:1.5,format:'png'});await fs.writeFile(new URL(file,out),new Uint8Array(await image.arrayBuffer()));}
console.log(JSON.stringify({employees:rows.length,creditedOrders:report.orders.length,heldOrders:report.ordersWithoutControl.length,total:totals.getRange(`D${last}`).values}));
