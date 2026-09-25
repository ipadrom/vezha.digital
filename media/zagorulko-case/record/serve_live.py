"""Live work-center stand for split-screen recordings: real GREEN-API instance, local storage only.

Reads gbu-center/.env for the MAX connection, but keeps every write local: S3 is disabled,
crews and browser state live in a temporary directory, the durable queue stays off.
Only the three demo groups are configured as targets; the stand password is generated per run
and stored next to the scripts (git-ignored) for the recorder's own sign-in.
"""
import json
import secrets
import sys
import tempfile
from pathlib import Path

from werkzeug.security import generate_password_hash

ROOT = Path(__file__).resolve().parents[4] / 'gbu-center'
sys.path.insert(0, str(ROOT))
from workcenter import create_app  # noqa: E402

# Demo group links live in git-ignored live-groups.json ({ elite, final, photo_control }).
GROUPS = json.loads(Path(__file__).with_name('live-groups.json').read_text(encoding='utf-8'))
chat_id = lambda link: link.rstrip('/').rsplit('/', 1)[-1]  # noqa: E731
DEMO = {
    'GREENAPI_CHAT_ID': chat_id(GROUPS['photo_control']),      # drivers chat used by add/remove = photo control demo
    'GREENAPI_ORDERS_CHAT_ID': chat_id(GROUPS['final']),        # ФОТО СБОРА ФИНАЛ демо
    'GREENAPI_PHOTO_CONTROL_CHAT_ID': chat_id(GROUPS['photo_control']),
}
data = Path(tempfile.mkdtemp(prefix='gbu-live-demo-'))
password = secrets.token_urlsafe(18)
overrides = {
    **DEMO,
    'S3_BUCKET': '', 'S3_KEY_ID': '', 'S3_SECRET': '',
    'CREWS_S3_BUCKET': '', 'CREWS_S3_KEY_ID': '', 'CREWS_S3_SECRET': '',
    'CREWS_DATA_DIR': str(data / 'crews'), 'LOCAL_STATE_DIR': str(data / 'state'),
    'DURABLE_OPERATIONS': False,
    'GBU_PASSWORD_HASH': generate_password_hash(password, method='scrypt:32768:8:1'),
    'GBU_SESSION_SECRET': secrets.token_urlsafe(48),
}
(data / 'crews').mkdir()
app = create_app(overrides, offline=False)
if not (app.config['GREENAPI_ID_INSTANCE'] and app.config['GREENAPI_API_TOKEN']):
    raise SystemExit('GREEN-API is not configured in gbu-center/.env')
Path(__file__).with_name('live-auth.json').write_text(json.dumps({'password': password, 'data': str(data)}), encoding='utf-8')
print(f'live stand: data in {data}, S3 off, targets={DEMO}', flush=True)
app.run(host='127.0.0.1', port=8098, use_reloader=False)
