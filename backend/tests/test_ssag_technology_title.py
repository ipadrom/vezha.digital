import json
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from types import SimpleNamespace

import sqlalchemy as sa


def migration():
    path = Path(__file__).parents[1] / "alembic/versions/r4a5b6c7d8e9_ssag_technology_title.py"
    spec = spec_from_file_location("ssag_technology_title", path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


TECH = {
    "id": "b1", "type": "technologies",
    "content_ru": {"eyebrow": "Разработка", "title": "Kotlin и Jetpack Compose", "summary": "Карта"},
    "content_en": {"eyebrow": "Development", "title": "Kotlin and Jetpack Compose", "summary": "Map"},
}


def test_clears_only_the_technology_title_in_blocks_and_published_snapshot():
    module = migration()
    with sa.create_engine("sqlite://").connect() as db:
        db.execute(sa.text("CREATE TABLE projects (id TEXT PRIMARY KEY, slug TEXT, published_data JSON, published_at TIMESTAMP, updated_at TIMESTAMP)"))
        db.execute(sa.text("CREATE TABLE project_blocks (id TEXT PRIMARY KEY, project_id TEXT, type TEXT, content_ru JSON, content_en JSON)"))
        db.execute(sa.text("CREATE TABLE project_revisions (id TEXT PRIMARY KEY, project_id TEXT, version INTEGER, snapshot JSON, created_at TIMESTAMP)"))
        text_block = {"id": "b0", "type": "text", "content_ru": {"title": "О проекте"}, "content_en": {"title": "About"}}
        published = {"meta": {"slug": "ssag"}, "blocks": [text_block, TECH]}
        db.execute(sa.text("INSERT INTO projects (id, slug, published_data) VALUES ('p', 'ssag', :data)"), {"data": json.dumps(published)})
        for block in (text_block, TECH):
            db.execute(
                sa.text("INSERT INTO project_blocks VALUES (:id, 'p', :type, :ru, :en)"),
                {"id": block["id"], "type": block["type"], "ru": json.dumps(block["content_ru"]), "en": json.dumps(block["content_en"])},
            )
        module.op = SimpleNamespace(get_bind=lambda: db)
        module.upgrade()
        module.upgrade()

        rows = {r.id: (json.loads(r.content_ru), json.loads(r.content_en)) for r in db.execute(sa.text("SELECT * FROM project_blocks"))}
        assert rows["b1"][0] == {"eyebrow": "Разработка", "title": "", "summary": "Карта"}
        assert rows["b1"][1]["title"] == ""
        assert rows["b0"][0]["title"] == "О проекте"
        snapshot = json.loads(db.execute(sa.text("SELECT published_data FROM projects")).scalar_one())
        assert snapshot["blocks"][1]["content_ru"]["title"] == ""
        assert snapshot["blocks"][0]["content_ru"]["title"] == "О проекте"
        assert db.execute(sa.text("SELECT COUNT(*) FROM project_revisions")).scalar_one() == 1
