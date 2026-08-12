"""Publish the source-backed WELLNESS APP / Training case story.

Revision ID: n4c5d6e7f8g9
Revises: m3b4c5d6e7f8

The compressed payload is a regular CaseDocument snapshot assembled from the
existing admin block types. Keeping the snapshot in the migration makes fresh
environments match the case published through the local admin API.
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

revision: str = "n4c5d6e7f8g9"
down_revision: str = "m3b4c5d6e7f8"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SLUG = "wellness-app"
DOCUMENT_GZIP_B64 = (
    "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"
    "+/B/AOqDovM7YgAA"
)


def _document() -> dict[str, object]:
    raw = gzip.decompress(base64.b64decode(DOCUMENT_GZIP_B64))
    return json.loads(raw.decode("utf-8"))


def _uuid(name: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#training-{name}")


def upgrade() -> None:
    document = _document()
    meta = document["meta"]
    blocks = document["blocks"]
    now = datetime.utcnow()
    connection = op.get_bind()

    projects = sa.table(
        "projects",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("slug", sa.String()),
        sa.column("type_ru", sa.String()),
        sa.column("type_en", sa.String()),
        sa.column("name_ru", sa.String()),
        sa.column("name_en", sa.String()),
        sa.column("description_ru", sa.Text()),
        sa.column("description_en", sa.Text()),
        sa.column("subtitle_ru", sa.String()),
        sa.column("subtitle_en", sa.String()),
        sa.column("industry_ru", sa.String()),
        sa.column("industry_en", sa.String()),
        sa.column("year", sa.String()),
        sa.column("timeline_ru", sa.String()),
        sa.column("timeline_en", sa.String()),
        sa.column("challenge_ru", sa.Text()),
        sa.column("challenge_en", sa.Text()),
        sa.column("solution_ru", sa.Text()),
        sa.column("solution_en", sa.Text()),
        sa.column("result_summary_ru", sa.Text()),
        sa.column("result_summary_en", sa.Text()),
        sa.column("image_url", sa.String()),
        sa.column("cover_image_url", sa.String()),
        sa.column("project_url", sa.String()),
        sa.column("hero_metric_value", sa.String()),
        sa.column("hero_metric_label_ru", sa.String()),
        sa.column("hero_metric_label_en", sa.String()),
        sa.column("sort_order", sa.Integer()),
        sa.column("is_active", sa.Boolean()),
        sa.column("is_featured", sa.Boolean()),
        sa.column("status", sa.String()),
        sa.column("draft_data", postgresql.JSONB()),
        sa.column("published_data", postgresql.JSONB()),
        sa.column("published_at", sa.DateTime()),
        sa.column("updated_at", sa.DateTime()),
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

    project_id = connection.execute(
        sa.select(projects.c.id).where(projects.c.slug == SLUG)
    ).scalar_one_or_none()
    if project_id is None:
        return

    challenge = next(block for block in blocks if block["type"] == "challenge_solution")
    result = next(block for block in blocks if block["type"] == "results")
    connection.execute(
        projects.update().where(projects.c.id == project_id).values(
            type_ru=meta["type_ru"],
            type_en=meta["type_en"],
            name_ru=meta["name_ru"],
            name_en=meta["name_en"],
            description_ru=meta["description_ru"],
            description_en=meta["description_en"],
            subtitle_ru=meta["subtitle_ru"],
            subtitle_en=meta["subtitle_en"],
            industry_ru=meta["industry_ru"],
            industry_en=meta["industry_en"],
            year=meta["year"],
            timeline_ru=meta["timeline_ru"],
            timeline_en=meta["timeline_en"],
            challenge_ru=challenge["content_ru"]["challenge"],
            challenge_en=challenge["content_en"]["challenge"],
            solution_ru=challenge["content_ru"]["solution"],
            solution_en=challenge["content_en"]["solution"],
            result_summary_ru=result["content_ru"]["body"],
            result_summary_en=result["content_en"]["body"],
            image_url=meta["image_url"],
            cover_image_url=meta["cover_image_url"],
            project_url=meta["project_url"],
            hero_metric_value=meta["hero_metric_value"],
            hero_metric_label_ru=meta["hero_metric_label_ru"],
            hero_metric_label_en=meta["hero_metric_label_en"],
            sort_order=meta["sort_order"],
            is_active=True,
            is_featured=meta["is_featured"],
            status="published",
            draft_data=meta,
            published_data=document,
            published_at=now,
            updated_at=now,
        )
    )
    connection.execute(project_blocks.delete().where(project_blocks.c.project_id == project_id))
    connection.execute(
        project_blocks.insert(),
        [
            {
                "id": UUID(block["id"]),
                "project_id": project_id,
                "type": block["type"],
                "content_ru": block["content_ru"],
                "content_en": block["content_en"],
                "settings": block["settings"],
                "sort_order": block["sort_order"],
                "is_visible": block["is_visible"],
            }
            for block in blocks
        ],
    )
    previous_version = connection.execute(
        sa.select(sa.func.max(revisions.c.version)).where(revisions.c.project_id == project_id)
    ).scalar_one_or_none() or 0
    version = previous_version + 1
    connection.execute(
        revisions.insert().values(
            id=_uuid(f"revision-{version}"),
            project_id=project_id,
            version=version,
            snapshot=document,
            created_at=now,
        )
    )


def downgrade() -> None:
    # Content may be edited after deployment; downgrading must not overwrite it.
    pass
