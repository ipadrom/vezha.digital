from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import sqlalchemy as sa


def migration():
    path = Path(__file__).parents[1] / "alembic/versions/b1s2t3u4v5w6_service_descriptions_copy.py"
    spec = spec_from_file_location("service_descriptions_copy", path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def descriptions(db):
    rows = db.execute(sa.text("SELECT name_ru, description_ru, description_en FROM services"))
    return {name: (ru, en) for name, ru, en in rows}


def test_rewrites_seeded_texts_keeps_admin_edits_and_reverts():
    module = migration()
    engine = sa.create_engine("sqlite://")
    with engine.begin() as db:
        db.execute(
            sa.text(
                "CREATE TABLE services (name_ru TEXT, description_ru TEXT, description_en TEXT)"
            )
        )
        seeded = {}
        for name, column, old, _ in module.CHANGES:
            seeded.setdefault(name, {"description_ru": "", "description_en": "Untouched"})[
                column
            ] = old
        seeded["Интернет-магазины"]["description_ru"] = "Edited in the admin"
        for name, values in seeded.items():
            db.execute(
                sa.text("INSERT INTO services VALUES (:name, :description_ru, :description_en)"),
                {"name": name, **values},
            )
        before = descriptions(db)

        module.apply(db)
        after = descriptions(db)
        assert after["Мобильные приложения"][0].startswith(
            "Разрабатываем нативные приложения для iOS и Android"
        )
        assert "native iOS and Android" in after["Мобильные приложения"][1]
        assert after["Интернет-магазины"][0] == "Edited in the admin"
        assert after["Веб-сайты"][1] == "Untouched"
        for name, (ru, _) in after.items():
            if name != "Интернет-магазины":
                assert "котор" not in ru and ":" not in ru

        module.apply(db)
        assert descriptions(db) == after
        module.apply(db, reverse=True)
        assert descriptions(db) == before
