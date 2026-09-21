"""Real application, isolated synthetic data, mocked OCR; no external services."""
import json
import sys
import tempfile
import time
from pathlib import Path
from flask import request, jsonify, send_file

ROOT = Path('C:/Users/artas/OneDrive/Рабочий стол/Projects/GBU/gbu-work-center')
sys.path.insert(0, str(ROOT))
from workcenter import create_app
from workcenter.modules.ocr.parser import crop_row_image

fixture = json.loads((Path(__file__).parent / 'outputs/demo/demo-data.json').read_text(encoding='utf-8'))
data = Path(tempfile.mkdtemp(prefix='zagorulko-showcase-'))
crews = data / 'crews'
crews.mkdir()
people = {p['name']: {'рост': p['height'], 'бригадир': p['leader'], 'приоритет': 2 if p['leader'] else 0, 'заметка': 'Вымышленный участник'} for p in fixture['people']}
(crews / 'люди.json').write_text(json.dumps(people, ensure_ascii=False), encoding='utf-8')
(crews / 'правила.json').write_text(json.dumps({'иерархия': [], 'приоритетные_бригадиры': [p['name'] for p in fixture['people'] if p['leader']]}, ensure_ascii=False), encoding='utf-8')
app = create_app({'CREWS_DATA_DIR': str(crews), 'LOCAL_STATE_DIR': str(data / 'state')}, offline=True)
source_image = ROOT / 'output/mobile-case-2026-09-07/demo-orders.png'
demo_orders = fixture['orders'][:2]
for order, top in zip(demo_orders, [252, 363]):
    order['row_image'] = crop_row_image(source_image.read_bytes(), [{'rowIndex': 0, 'columnIndex': 3, 'boundingBox': {'vertices': [{'x': 45, 'y': top}, {'x': 1255, 'y': top + 55}]}}], 0)

@app.route('/demo-source.png')
def demo_source():
    return send_file(source_image)

@app.before_request
def synthetic_ocr():
    if request.path == '/ocr' and request.method == 'POST':
        time.sleep(1.4)
        return jsonify({'date': '07/09', 'orders': demo_orders})

@app.after_request
def showcase_brand(response):
    if request.path == '/' and response.mimetype == 'text/html':
        response.set_data(response.get_data(as_text=True).replace('ГБУ · Рабочий центр', 'ИП Загорулько · Рабочий центр').replace('ГБУ <span>', 'ИП Загорулько <span>').replace('Локальный режим', 'Демо'))
        if request.args.get('capture') == 'drag':
            dock = '''<div id="demo-file" draggable="true" style="position:fixed;right:70px;bottom:70px;width:330px;padding:14px;background:#faf9f5;border:1px solid #ccc;border-radius:12px;color:#222;cursor:grab;box-shadow:0 18px 50px #0004;z-index:30"><img src="/demo-source.png" style="width:100%;pointer-events:none"><b>Заказы.png</b><span style="display:block;font-size:13px;margin-top:5px">Перетащите фотографию в приложение</span></div><script>fetch('/demo-source.png').then(r=>r.blob()).then(blob=>{const el=document.getElementById('demo-file');el.addEventListener('dragstart',e=>{e.dataTransfer.items.add(new File([blob],'Заказы.png',{type:'image/png'}));});window.addEventListener('drop',()=>el.remove());});</script>'''
            response.set_data(response.get_data(as_text=True).replace('</body>', dock+'</body>'))
    return response

# Only this fixture endpoint runs before the offline network guard.
app.before_request_funcs[None].remove(synthetic_ocr)
app.before_request_funcs[None].insert(0, synthetic_ocr)
app.run(host='127.0.0.1', port=8098, use_reloader=False)
