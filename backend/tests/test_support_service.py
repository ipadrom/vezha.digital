from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from types import SimpleNamespace

import sqlalchemy as sa


def migration():
    path = Path(__file__).parents[1] / "alembic/versions/p2e3f4a5b6c7_support_service.py"
    spec = spec_from_file_location("support_service", path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def services_table(connection):
    connection.execute(sa.text(
        "CREATE TABLE services (id TEXT PRIMARY KEY, icon TEXT, name_ru TEXT, name_en TEXT, "
        "description_ru TEXT, description_en TEXT, examples_ru TEXT, examples_en TEXT, "
        "deadline_ru TEXT, deadline_en TEXT, about_ru TEXT, about_en TEXT, price_from INTEGER, "
        "price_currency TEXT, sort_order INTEGER, is_active BOOLEAN, created_at TIMESTAMP, updated_at TIMESTAMP)"
    ))
    connection.execute(sa.text("INSERT INTO services (id, name_ru, sort_order) VALUES ('a', 'Mobile', 6)"))


def test_support_service_is_appended_once_and_removed_on_downgrade():
    module = migration()
    with sa.create_engine("sqlite://").connect() as connection:
        services_table(connection)
        module.op = SimpleNamespace(get_bind=lambda: connection)
        module.upgrade()
        module.upgrade()
        rows = connection.execute(sa.text("SELECT name_ru, sort_order FROM services ORDER BY sort_order")).all()
        assert rows == [("Mobile", 6), (module.NAME_RU, 7)]
        module.downgrade()
        assert connection.execute(sa.text("SELECT COUNT(*) FROM services")).scalar_one() == 1
