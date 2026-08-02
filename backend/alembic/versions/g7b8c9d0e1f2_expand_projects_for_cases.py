from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "g7b8c9d0e1f2"
down_revision: str = "c4d5e6f7a8b9"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    project_columns = [
        sa.Column("slug", sa.String(length=160), nullable=True),
        sa.Column("subtitle_ru", sa.String(length=255), nullable=True),
        sa.Column("subtitle_en", sa.String(length=255), nullable=True),
        sa.Column("industry_ru", sa.String(length=160), nullable=True),
        sa.Column("industry_en", sa.String(length=160), nullable=True),
        sa.Column("year", sa.String(length=20), nullable=True),
        sa.Column("timeline_ru", sa.String(length=120), nullable=True),
        sa.Column("timeline_en", sa.String(length=120), nullable=True),
        sa.Column("challenge_ru", sa.Text(), nullable=True),
        sa.Column("challenge_en", sa.Text(), nullable=True),
        sa.Column("solution_ru", sa.Text(), nullable=True),
        sa.Column("solution_en", sa.Text(), nullable=True),
        sa.Column("result_summary_ru", sa.Text(), nullable=True),
        sa.Column("result_summary_en", sa.Text(), nullable=True),
        sa.Column("cover_image_url", sa.String(length=500), nullable=True),
        sa.Column("hero_metric_value", sa.String(length=80), nullable=True),
        sa.Column("hero_metric_label_ru", sa.String(length=160), nullable=True),
        sa.Column("hero_metric_label_en", sa.String(length=160), nullable=True),
        sa.Column("testimonial_ru", sa.Text(), nullable=True),
        sa.Column("testimonial_en", sa.Text(), nullable=True),
        sa.Column("testimonial_author_ru", sa.String(length=255), nullable=True),
        sa.Column("testimonial_author_en", sa.String(length=255), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()),
    ]
    for column in project_columns:
        op.add_column("projects", column)
    op.create_index("ix_projects_slug", "projects", ["slug"], unique=True)

    op.create_table(
        "project_metrics",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("project_id", sa.UUID(), nullable=False),
        sa.Column("value", sa.String(length=80), nullable=False),
        sa.Column("label_ru", sa.String(length=160), nullable=False),
        sa.Column("label_en", sa.String(length=160), nullable=False),
        sa.Column("context_ru", sa.Text(), nullable=True),
        sa.Column("context_en", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_project_metrics_project_id", "project_metrics", ["project_id"])
    op.create_table(
        "project_gallery_items",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("project_id", sa.UUID(), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=False),
        sa.Column("alt_ru", sa.String(length=255), nullable=False),
        sa.Column("alt_en", sa.String(length=255), nullable=False),
        sa.Column("caption_ru", sa.Text(), nullable=True),
        sa.Column("caption_en", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_project_gallery_items_project_id", "project_gallery_items", ["project_id"]
    )
    op.create_table(
        "project_technologies",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("project_id", sa.UUID(), nullable=False),
        sa.Column("label", sa.String(length=100), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False, server_default="stack"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_project_technologies_project_id", "project_technologies", ["project_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_project_technologies_project_id", table_name="project_technologies")
    op.drop_table("project_technologies")
    op.drop_index("ix_project_gallery_items_project_id", table_name="project_gallery_items")
    op.drop_table("project_gallery_items")
    op.drop_index("ix_project_metrics_project_id", table_name="project_metrics")
    op.drop_table("project_metrics")
    op.drop_index("ix_projects_slug", table_name="projects")
    for column_name in [
        "is_featured",
        "testimonial_author_en",
        "testimonial_author_ru",
        "testimonial_en",
        "testimonial_ru",
        "hero_metric_label_en",
        "hero_metric_label_ru",
        "hero_metric_value",
        "cover_image_url",
        "result_summary_en",
        "result_summary_ru",
        "solution_en",
        "solution_ru",
        "challenge_en",
        "challenge_ru",
        "timeline_en",
        "timeline_ru",
        "year",
        "industry_en",
        "industry_ru",
        "subtitle_en",
        "subtitle_ru",
        "slug",
    ]:
        op.drop_column("projects", column_name)
