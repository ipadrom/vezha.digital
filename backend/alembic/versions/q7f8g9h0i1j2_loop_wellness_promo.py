"""Keep the WELLNESS APP promo looping silently.

Revision ID: q7f8g9h0i1j2
Revises: p6e7f8g9h0i1
"""

from collections.abc import Sequence
from datetime import datetime
from uuid import NAMESPACE_URL, UUID, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "q7f8g9h0i1j2"
down_revision: str = "p6e7f8g9h0i1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SLUG = "wellness-app"


def _uuid(name: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#loop-promo-{name}")


def _with_loop(document: dict[str, object] | None) -> dict[str, object]:
    updated = dict(document or {})
    blocks = []
    for source in updated.get("blocks", []):
        block = dict(source)
        if block.get("type") == "media_hero":
            content_ru = dict(block.get("content_ru") or {})
            content_en = dict(block.get("content_en") or {})
            for content in (content_ru, content_en):
                content.update(autoplay=True, loop=True, muted=True, controls=False)
            block["content_ru"] = content_ru
            block["content_en"] = content_en
        blocks.append(block)
    updated["blocks"] = blocks
    return updated


def upgrade() -> None:
    connection = op.get_bind()
    now = datetime.utcnow()
    projects = sa.table(
        "projects",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("slug", sa.String()),
        sa.column("draft_data", postgresql.JSONB()),
        sa.column("published_data", postgresql.JSONB()),
        sa.column("published_at", sa.DateTime()),
        sa.column("updated_at", sa.DateTime()),
    )
    blocks = sa.table(
        "project_blocks",
        sa.column("project_id", postgresql.UUID(as_uuid=True)),
        sa.column("type", sa.String()),
        sa.column("content_ru", postgresql.JSONB()),
        sa.column("content_en", postgresql.JSONB()),
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

    media = connection.execute(
        sa.select(blocks.c.content_ru, blocks.c.content_en).where(
            blocks.c.project_id == project["id"],
            blocks.c.type == "media_hero",
        )
    ).mappings().one_or_none()
    if media is not None:
        content_ru = dict(media["content_ru"] or {})
        content_en = dict(media["content_en"] or {})
        for content in (content_ru, content_en):
            content.update(autoplay=True, loop=True, muted=True, controls=False)
        connection.execute(
            blocks.update().where(
                blocks.c.project_id == project["id"],
                blocks.c.type == "media_hero",
            ).values(content_ru=content_ru, content_en=content_en)
        )

    snapshot = _with_loop(project["published_data"])
    connection.execute(
        projects.update().where(projects.c.id == project["id"]).values(
            published_data=snapshot,
            published_at=now,
            updated_at=now,
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
