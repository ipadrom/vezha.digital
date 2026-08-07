"""Add the block case builder and draft/published snapshots."""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "h8c9d0e1f2a3"
down_revision: str = "g7b8c9d0e1f2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "projects",
        sa.Column("status", sa.String(length=20), nullable=False, server_default="draft"),
    )
    op.add_column(
        "projects", sa.Column("draft_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True)
    )
    op.add_column(
        "projects",
        sa.Column("published_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column("projects", sa.Column("published_at", sa.DateTime(), nullable=True))
    op.execute(
        "UPDATE projects SET status = CASE WHEN is_active THEN 'published' ELSE 'hidden' END"
    )
    op.execute("UPDATE projects SET published_at = updated_at WHERE is_active")

    op.create_table(
        "project_blocks",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("project_id", sa.UUID(), nullable=False),
        sa.Column("type", sa.String(length=40), nullable=False),
        sa.Column(
            "content_ru",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "content_en",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "settings",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_visible", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_project_blocks_project_id", "project_blocks", ["project_id"])

    op.create_table(
        "project_revisions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("project_id", sa.UUID(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column(
            "snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=False
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("project_id", "version", name="uq_project_revision_version"),
    )
    op.create_index("ix_project_revisions_project_id", "project_revisions", ["project_id"])

    op.create_table(
        "media_assets",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=120), nullable=False),
        sa.Column("size", sa.Integer(), nullable=False),
        sa.Column("alt_ru", sa.String(length=255), nullable=True),
        sa.Column("alt_en", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("url"),
    )


def downgrade() -> None:
    op.drop_table("media_assets")
    op.drop_index("ix_project_revisions_project_id", table_name="project_revisions")
    op.drop_table("project_revisions")
    op.drop_index("ix_project_blocks_project_id", table_name="project_blocks")
    op.drop_table("project_blocks")
    op.drop_column("projects", "published_at")
    op.drop_column("projects", "published_data")
    op.drop_column("projects", "draft_data")
    op.drop_column("projects", "status")
