from copy import deepcopy
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import pytest
import sqlalchemy as sa

from app.schemas.case_builder import CaseDocumentUpdate


def load(name):
    path = next((Path(__file__).parents[1] / "alembic/versions").glob(name))
    spec = spec_from_file_location(path.stem, path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


refresh = load("j6y7z8a9b0c1_*")
release = load("d0s1t2u3v4w5_*")


def test_refresh_schema_assets_and_idempotence():
    original = release.load_document()
    before = deepcopy(original)
    result = refresh.patch_document(original, refresh.load_patch())
    CaseDocumentUpdate.model_validate(result)
    assert original == before
    assert refresh.patch_document(result, refresh.load_patch()) == result
    process = next(b for b in result["blocks"] if b["type"] == "process")
    assert len(process["content_ru"]["items"]) == 5
    assert process["settings"]["layout"] == "phone-showcase"
    assert result["meta"]["cover_image_url"].endswith("cover-editorial.svg")
    media = next(b for b in result["blocks"] if b["type"] == "media_hero")
    assert media["settings"]["layout"] == "media-16x9"
    assert media["content_ru"]["image_url"] == result["meta"]["cover_image_url"]


def test_ambiguous_structure_is_rejected():
    document = release.load_document()
    document["blocks"].append(deepcopy(document["blocks"][0]))
    with pytest.raises(ValueError, match="exactly one hero"):
        refresh.patch_document(document, refresh.load_patch())


def test_database_scoping_draft_separation_and_revision_backup():
    schema = sa.MetaData()
    projects = sa.Table(
        "projects",
        schema,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("slug", sa.String),
        sa.Column("name_ru", sa.String),
        sa.Column("status", sa.String),
        sa.Column("is_active", sa.Boolean),
        sa.Column("cover_image_url", sa.String),
        sa.Column("draft_data", sa.JSON),
        sa.Column("published_data", sa.JSON),
        *[sa.Column(k, sa.DateTime) for k in ("created_at", "updated_at", "published_at")],
    )
    blocks = sa.Table(
        "project_blocks",
        schema,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("project_id", sa.String),
        sa.Column("type", sa.String),
        sa.Column("sort_order", sa.Integer),
        sa.Column("is_visible", sa.Boolean),
        *[sa.Column(k, sa.JSON) for k in ("settings", "content_ru", "content_en")],
    )
    revisions = sa.Table(
        "project_revisions",
        schema,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("project_id", sa.String),
        sa.Column("version", sa.Integer),
        sa.Column("snapshot", sa.JSON),
        sa.Column("created_at", sa.DateTime),
    )
    engine = sa.create_engine("sqlite://")
    schema.create_all(engine)
    with engine.begin() as db:
        release.seed_case(db, release.load_document())
        project = db.execute(sa.select(projects)).mappings().one()
        public_before = deepcopy(project["published_data"])
        draft = {**project["draft_data"], "project_url": "https://draft.example"}
        db.execute(projects.update().values(draft_data=draft, status="hidden", is_active=False))
        db.execute(projects.insert().values(id="unrelated", slug="other", name_ru="Keep"))
        extra = dict(
            id="draft-extra",
            project_id=project["id"],
            type="custom",
            settings={},
            content_ru={"body": "Draft only"},
            content_en={},
            sort_order=99,
            is_visible=False,
        )
        db.execute(blocks.insert().values(**extra))
        refresh.upgrade_cases(db)
        updated = (
            db.execute(sa.select(projects).where(projects.c.id == project["id"])).mappings().one()
        )
        assert updated["draft_data"]["project_url"] == "https://draft.example"
        assert not updated["published_data"]["meta"].get("project_url")
        assert updated["status"] == "hidden" and not updated["is_active"]
        assert updated["cover_image_url"].endswith("cover-editorial.svg")
        assert len(updated["published_data"]["blocks"]) == 8
        assert db.execute(
            sa.select(blocks.c.content_ru).where(blocks.c.id == "draft-extra")
        ).scalar() == {"body": "Draft only"}
        assert (
            db.execute(sa.select(projects.c.name_ru).where(projects.c.id == "unrelated")).scalar()
            == "Keep"
        )
        snapshots = (
            db.execute(sa.select(revisions.c.snapshot).order_by(revisions.c.version))
            .scalars()
            .all()
        )
        assert snapshots[-2] == public_before
        assert snapshots[-1] == updated["published_data"]
        refresh.upgrade_cases(db)
        assert db.execute(sa.select(sa.func.count()).select_from(revisions)).scalar() == len(
            snapshots
        )
