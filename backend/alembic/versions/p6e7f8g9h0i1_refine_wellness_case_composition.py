"""Publish the refined WELLNESS APP composition and motion story.

Revision ID: p6e7f8g9h0i1
Revises: o5d6e7f8g9h0

The payload contains only existing case-builder block types. It keeps fresh
environments aligned with the bilingual case published through the admin API.
"""

from __future__ import annotations

import base64
import gzip
import json
from collections.abc import Sequence
from datetime import datetime
from uuid import NAMESPACE_URL, UUID, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "p6e7f8g9h0i1"
down_revision: str = "o5d6e7f8g9h0"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SLUG = "wellness-app"
BLOCKS_GZIP_B64 = (
    "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"
)


def _blocks() -> list[dict[str, object]]:
    raw = gzip.decompress(base64.b64decode(BLOCKS_GZIP_B64))
    return json.loads(raw.decode("utf-8"))


def _uuid(name: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#refined-{name}")


def upgrade() -> None:
    connection = op.get_bind()
    now = datetime.utcnow()
    blocks = _blocks()

    projects = sa.table(
        "projects",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("slug", sa.String()),
        sa.column("draft_data", postgresql.JSONB()),
        sa.column("published_data", postgresql.JSONB()),
        sa.column("published_at", sa.DateTime()),
        sa.column("updated_at", sa.DateTime()),
        sa.column("status", sa.String()),
        sa.column("is_active", sa.Boolean()),
    )
    project_blocks = sa.table(
        "project_blocks",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("project_id", postgresql.UUID(as_uuid=True)),
        sa.column("type", sa.String()),
        sa.column("content_ru", postgresql.JSONB()),
        sa.column("content_en", postgresql.JSONB()),
        sa.column("settings", postgresql.JSONB()),
        sa.column("sort_order", sa.Integer()),
        sa.column("is_visible", sa.Boolean()),
    )
    revisions = sa.table(
        "project_revisions",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("project_id", postgresql.UUID(as_uuid=True)),
        sa.column("version", sa.Integer()),
        sa.column("snapshot", postgresql.JSONB()),
        sa.column("created_at", sa.DateTime()),
    )

    project = connection.execute(
        sa.select(
            projects.c.id,
            projects.c.draft_data,
            projects.c.published_data,
        ).where(projects.c.slug == SLUG)
    ).mappings().one_or_none()
    if project is None:
        return

    published = project["published_data"] or {}
    meta = dict(project["draft_data"] or published.get("meta") or {})
    normalized: list[dict[str, object]] = []
    for block in blocks:
        block_id = _uuid(str(block["key"]))
        normalized.append(
            {
                "id": block_id,
                "project_id": project["id"],
                "type": block["type"],
                "content_ru": block["content_ru"],
                "content_en": block["content_en"],
                "settings": block["settings"],
                "sort_order": block["sort_order"],
                "is_visible": block["is_visible"],
            }
        )

    connection.execute(
        project_blocks.delete().where(project_blocks.c.project_id == project["id"])
    )
    connection.execute(project_blocks.insert(), normalized)

    snapshot = {
        "meta": meta,
        "blocks": [
            {
                "id": str(block["id"]),
                "type": block["type"],
                "content_ru": block["content_ru"],
                "content_en": block["content_en"],
                "settings": block["settings"],
                "sort_order": block["sort_order"],
                "is_visible": block["is_visible"],
            }
            for block in normalized
        ],
    }
    connection.execute(
        projects.update().where(projects.c.id == project["id"]).values(
            draft_data=meta,
            published_data=snapshot,
            published_at=now,
            updated_at=now,
            status="published",
            is_active=True,
        )
    )

    previous_version = connection.execute(
        sa.select(sa.func.max(revisions.c.version)).where(
            revisions.c.project_id == project["id"]
        )
    ).scalar_one_or_none() or 0
    version = previous_version + 1
    connection.execute(
        revisions.insert().values(
            id=_uuid(f"revision-{version}"),
            project_id=project["id"],
            version=version,
            snapshot=snapshot,
            created_at=now,
        )
    )


def downgrade() -> None:
    # Content may be edited after deployment; downgrading must not overwrite it.
    pass
