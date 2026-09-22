import json
from copy import deepcopy
from datetime import datetime
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import sqlalchemy as sa
from test_mymit_case_release import migration as release_migration


def migration():
    path = Path(__file__).parents[1] / "alembic/versions/o1d2e3f4a5b6_mymit_client_block.py"
    spec = spec_from_file_location("mymit_client_block", path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def authored():
    root = Path(__file__).parents[2]
    return json.loads((root / "media/mymit-case/case.json").read_text())


def test_shipped_block_matches_authored_case():
    block = migration().load_block()
    expected = next(
        item
        for item in authored()["blocks"]
        if item["type"] == "image_text" and item["settings"]["layout"] == "client"
    )
    assert block == expected
    assert block["is_visible"] is False


def test_patch_matches_authored_order_and_is_idempotent():
    module = migration()
    document = release_migration().load_document()
    before = deepcopy(document)
    before["meta"]["name_ru"] = "Editorial title"
    before["blocks"][3]["content_ru"]["title"] = "Editorial overview"
    after = module.patch_document(before)

    assert after["meta"] == before["meta"]
    assert [block["type"] for block in after["blocks"]] == [
        block["type"] for block in authored()["blocks"]
    ]
    assert after["blocks"][2] == module.load_block()
    assert after["blocks"][2]["is_visible"] is False
    assert after["blocks"][0]["settings"]["show_project_name"] is False
    assert after["blocks"][4]["content_ru"]["title"] == "Editorial overview"
    assert [block["sort_order"] for block in after["blocks"]] == list(range(len(after["blocks"])))
    assert module.patch_document(after) == after
    assert before != after


def test_database_update_inserts_block_preserves_other_cases_and_history():
    module = migration()
    metadata = sa.MetaData()
    projects = sa.Table(
        "projects",
        metadata,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("slug", sa.String, unique=True),
        sa.Column("name_ru", sa.String),
        sa.Column("draft_data", sa.JSON),
        sa.Column("published_data", sa.JSON),
        *[sa.Column(name, sa.DateTime) for name in ("published_at", "updated_at")],
    )
    blocks = sa.Table(
        "project_blocks",
        metadata,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("project_id", sa.String),
        sa.Column("type", sa.String),
        *[sa.Column(name, sa.JSON) for name in ("content_ru", "content_en", "settings")],
        sa.Column("sort_order", sa.Integer),
        sa.Column("is_visible", sa.Boolean),
    )
    revisions = sa.Table(
        "project_revisions",
        metadata,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("project_id", sa.String),
        sa.Column("version", sa.Integer),
        sa.Column("snapshot", sa.JSON),
        sa.Column("created_at", sa.DateTime),
    )
    engine = sa.create_engine("sqlite://")
    metadata.create_all(engine)

    document = release_migration().load_document()
    published = {"meta": document["meta"], "blocks": deepcopy(document["blocks"])}
    with engine.begin() as db:
        db.execute(
            projects.insert().values(
                id="mymit",
                slug="mymit",
                name_ru="МИТ",
                draft_data=document["meta"],
                published_data=published,
            )
        )
        db.execute(projects.insert().values(id="other", slug="other", name_ru="Untouched"))
        for index, block in enumerate(document["blocks"]):
            db.execute(
                blocks.insert().values(
                    project_id="mymit",
                    id=f"block-{index}",
                    sort_order=index,
                    **{key: block[key] for key in ("type", "content_ru", "content_en", "settings")},
                    is_visible=block.get("is_visible", True),
                )
            )
        db.execute(
            revisions.insert().values(
                id="initial",
                project_id="mymit",
                version=1,
                snapshot=published,
                created_at=datetime(2026, 9, 21),
            )
        )

        module.upgrade_cases(db)

        rows = list(
            db.execute(
                sa.select(blocks)
                .where(blocks.c.project_id == "mymit")
                .order_by(blocks.c.sort_order)
            ).mappings()
        )
        assert len(rows) == len(document["blocks"]) + 1
        client = rows[2]
        assert client["id"] == module.load_block()["id"]
        assert client["settings"]["layout"] == "client"
        assert client["is_visible"] is False
        assert client["content_ru"]["title"] == "Константин Снегов"
        assert [row["sort_order"] for row in rows] == list(range(len(rows)))
        assert rows[0]["settings"]["show_project_name"] is False
        assert rows[3]["type"] == "text"

        project = db.execute(sa.select(projects).where(projects.c.id == "mymit")).mappings().one()
        assert len(project["published_data"]["blocks"]) == len(document["blocks"]) + 1
        assert project["published_at"] is not None
        assert (
            db.execute(
                sa.select(sa.func.count()).select_from(revisions).where(revisions.c.version > 1)
            ).scalar()
            > 0
        )

        history = db.execute(sa.select(sa.func.count()).select_from(revisions)).scalar()
        module.upgrade_cases(db)
        assert (
            db.execute(
                sa.select(sa.func.count()).select_from(blocks).where(blocks.c.project_id == "mymit")
            ).scalar()
            == len(document["blocks"]) + 1
        )
        assert db.execute(sa.select(sa.func.count()).select_from(revisions)).scalar() == history
        assert (
            db.execute(sa.select(projects.c.name_ru).where(projects.c.id == "other")).scalar()
            == "Untouched"
        )
