"""Remove seeded portfolio examples and feature Zagorulko first.

Revision ID: c9r0s1t2u3v4
Revises: b8q9r0s1t2u3
"""

from copy import deepcopy
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "c9r0s1t2u3v4"
down_revision = "b8q9r0s1t2u3"
branch_labels = None
depends_on = None

# Match both fields so a renamed, real project is never treated as seed data.
DEMO_CASES = {
    "restaurant-menu": "Меню ресторана",
    "corporate-website": "Корпоративный сайт",
    "service-booking-bot": "Бот записи на услуги",
    "electronics-store": "Магазин электроники",
    "ai-support-assistant": "AI-ассистент для поддержки",
    "crm-system": "CRM-система",
}
CHILD_TABLES = (
    "project_blocks", "project_revisions", "project_metrics",
    "project_gallery_items", "project_technologies",
)


def upgrade():
    connection = op.get_bind()
    archive = op.create_table(
        "retired_demo_case_backups",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("retired_at", sa.DateTime(), nullable=False),
    )
    projects = sa.Table("projects", sa.MetaData(), autoload_with=connection)
    now = datetime.utcnow()
    for slug, name in DEMO_CASES.items():
        candidates = connection.execute(
            sa.select(projects.c.id).where(
                projects.c.name_ru == name,
                sa.or_(projects.c.slug == slug, projects.c.slug.is_(None), projects.c.slug == ""),
            )
        ).scalars().all()
        for project_id in candidates:
            payload = {"projects": connection.execute(
                sa.text("SELECT to_jsonb(p) FROM projects p WHERE id = :id"),
                {"id": project_id},
            ).scalar_one()}
            for table in CHILD_TABLES:
                payload[table] = connection.execute(
                    sa.text(f"SELECT to_jsonb(c) FROM {table} c WHERE project_id = :id"),
                    {"id": project_id},
                ).scalars().all()
            connection.execute(archive.insert().values(
                id=project_id, payload=payload, retired_at=now,
            ))
            # All case child tables have ON DELETE CASCADE. Media files are kept.
            connection.execute(projects.delete().where(projects.c.id == project_id))

    target = connection.execute(sa.select(projects).where(
        projects.c.slug == "gbu-process-automation",
    )).mappings().one_or_none()
    if target is None:
        raise RuntimeError("Zagorulko case must exist before catalog promotion")
    first_order = (connection.execute(sa.select(sa.func.min(projects.c.sort_order))).scalar() or 0) - 1
    draft = {**deepcopy(target["draft_data"] or {}), "is_featured": True, "sort_order": first_order}
    published = deepcopy(target["published_data"] or {})
    published["meta"] = {**published.get("meta", {}), "is_featured": True, "sort_order": first_order}
    connection.execute(projects.update().where(projects.c.id == target["id"]).values(
        is_featured=True, sort_order=first_order, draft_data=draft,
        published_data=published, updated_at=now,
    ))


def downgrade():
    # Deliberate content removal is not undone automatically. Full original rows
    # and child records remain in retired_demo_case_backups for manual recovery.
    pass
