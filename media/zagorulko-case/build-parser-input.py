from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys

out = Path(__file__).parent / 'outputs/demo'
out.mkdir(parents=True, exist_ok=True)
names = ['Примеров','Образцов','Макетов','Эскизов','Ладов','Миров','Яснов','Лучев','Кленов','Листов','Речной','Ветров','Зорин','Светов','Тихов','Полев','Снежов','Росин','Берестов','Соколов','Орлов','Грачев','Дроздов','Зайцев','Белов','Чернов','Серов','Руднев','Луговой','Дубров','Соснов','Ельцов','Озернов','Ручьев','Камнев','Песков','Горин','Долин','Туманов','Звездов','Зарев','Майский','Осенев']
heights = [192,190,188,186,191,189,187,185,190,188,186,184,189,187,185,183,182,181,194,193,191,190,188,187,186,185,184,183,182,181,180,179,178,177,176,175,174,192,189,186,183,180,178]
assert len(names) == len(heights) == 43
(out/'employees-43.txt').write_text('\n'.join(f'{n} ({h})' for n,h in zip(names,heights))+'\n',encoding='utf-8')
headers = ['', '№ п/п', 'Счет', 'Количество человек', 'Время прибытия', 'Маршрут следования', 'Умерший', 'Агент', 'Примечание']
widths = [55,80,140,225,180,450,240,230,180]
rows = []
for i,(time,name) in enumerate([('9:40:00','ПРИМЕРОВА'),('12:40:00','ДЕМОНОВА'),('11:40:00','УЧЕБНОВА')],1):
    rows.append([str(i),str(i*2),f'10000{i}-100','4 ЭЛИТ;\nС/А .',time,'ГОРОДСКАЯ БОЛЬНИЦА № 00;\nЗАЛ ПРОЩАНИЯ «ТИХИЙ САД»;\nМЕМОРИАЛЬНЫЙ ПАРК «СОСНЫ».',f'{name} АННА\nАЛЕКСЕЕВНА','Образцова Анна\nАлександровна','ДЕМО'])
W=sum(widths); title_h=42; head_h=40; row_h=112
img=Image.new('RGB',(W,title_h+head_h+len(rows)*row_h),'#fbd49b')
d=ImageDraw.Draw(img); font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',21); bold=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',27)
d.text((W/2,20),'ИП Образцов — демонстрационные заказы',font=bold,fill='#373b38',anchor='mm')
d.rectangle((0,title_h,W,title_h+head_h),fill='white')
cells=[]
for r,vals in enumerate([headers]+rows):
    y=title_h if r==0 else title_h+head_h+(r-1)*row_h
    h=head_h if r==0 else row_h
    x=0
    for c,(value,w) in enumerate(zip(vals,widths)):
        d.rectangle((x,y,x+w,y+h),outline='#77776b',width=1)
        if r==0 or c<5:
            box=d.multiline_textbbox((0,0),value,font=font,spacing=3,align='center')
            d.multiline_text((x+(w-(box[2]-box[0]))/2,y+7),value,font=font,fill='#383b37',spacing=3,align='center')
        else:
            d.multiline_text((x+6,y+9),value,font=font,fill='#383b37',spacing=5)
        cells.append({'rowIndex':r,'columnIndex':c,'text':value,'boundingBox':{'vertices':[{'x':x,'y':y},{'x':x+w,'y':y+h}]}})
        x+=w
    d.line((0,y+h,W,y+h),fill='#77776b',width=2)
img.save(out/'orders-parser-input.png')
# Verify table-to-order parsing locally; no OCR request or external service.
sys.path.insert(0,str(Path(__file__).resolve().parents[4]/'GBU/gbu-work-center'))
from workcenter.modules.ocr.parser import parse_table_from_ocr
orders=parse_table_from_ocr({'result':{'textAnnotation':{'tables':[{'rowCount':4,'columnCount':9,'cells':cells}]}}},(out/'orders-parser-input.png').read_bytes())
assert len(orders)==3, len(orders)
assert all(o.get('row_image') for o in orders)
print('Created input PNG and 43 employees. Local structured parser: 3 orders with image fragments. OCR not called.')
