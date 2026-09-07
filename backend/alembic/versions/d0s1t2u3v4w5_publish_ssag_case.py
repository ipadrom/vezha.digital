"""Publish the reviewed SSAG case without replacing an existing case.

Revision ID: d0s1t2u3v4w5
Revises: c9r0s1t2u3v4
"""

import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5

import sqlalchemy as sa

from alembic import op

revision = "d0s1t2u3v4w5"
down_revision = "c9r0s1t2u3v4"
branch_labels = None
depends_on = None


def load_document():
    path = Path(__file__).parents[1] / "data" / "ssag_case_20260907.json"
    return json.loads(path.read_text(encoding="utf-8-sig"))


def seed_case(connection, document):
    """Only insert SSAG; an already-authored copy is never overwritten."""
    meta = deepcopy(document["meta"])
    if meta["slug"] != "ssag":
        raise ValueError("This migration only publishes the SSAG case")
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=connection)
    existing = connection.execute(
        sa.select(projects.c.id).where(projects.c.slug == meta["slug"])
    ).scalar_one_or_none()
    if existing is not None:
        return existing

    blocks = sa.Table("project_blocks", schema, autoload_with=connection)
    revisions = sa.Table("project_revisions", schema, autoload_with=connection)
    project_id = str(uuid5(NAMESPACE_URL, "https://vezha.digital/cases/ssag"))
    authored_blocks = []
    for index, source in enumerate(document["blocks"]):
        item = deepcopy(source)
        item["id"] = str(uuid5(NAMESPACE_URL, f"ssag-case-20260907-block-{index}"))
        item["sort_order"] = index
        item.setdefault("is_visible", True)
        authored_blocks.append(item)
    snapshot = {"meta": meta, "blocks": authored_blocks}
    now = datetime.utcnow()
    values = {key: value for key, value in meta.items() if key in projects.c}
    values.update(
        id=project_id,
        is_active=True,
        status="published",
        draft_data=meta,
        published_data=snapshot,
        published_at=now,
        created_at=now,
        updated_at=now,
    )
    connection.execute(projects.insert().values(**values))
    for item in authored_blocks:
        connection.execute(blocks.insert().values(project_id=project_id, **item))
    connection.execute(
        revisions.insert().values(
            id=str(uuid5(NAMESPACE_URL, "ssag-case-20260907-initial-revision")),
            project_id=project_id,
            version=1,
            snapshot=snapshot,
            created_at=now,
        )
    )
    return project_id


def upgrade():
    seed_case(op.get_bind(), load_document())


def downgrade():
    # Keep authored content and any subsequent studio edits on schema rollback.
    pass
