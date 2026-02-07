from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "b2c3d4e5f6a8"
down_revision: str = "a1b2c3d4e5f7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("work_stages", sa.Column("duration_ru", sa.String(length=100), nullable=True))
    op.add_column("work_stages", sa.Column("duration_en", sa.String(length=100), nullable=True))
    op.add_column("work_stages", sa.Column("full_description_ru", sa.Text(), nullable=True))
    op.add_column("work_stages", sa.Column("full_description_en", sa.Text(), nullable=True))

    op.create_table(
        "work_stage_points",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("stage_id", sa.UUID(), nullable=False),
        sa.Column("text_ru", sa.String(length=500), nullable=False),
        sa.Column("text_en", sa.String(length=500), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["stage_id"], ["work_stages.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_work_stage_points_stage_id", "work_stage_points", ["stage_id"])


def downgrade() -> None:
    op.drop_index("ix_work_stage_points_stage_id", table_name="work_stage_points")
    op.drop_table("work_stage_points")

    op.drop_column("work_stages", "full_description_en")
    op.drop_column("work_stages", "full_description_ru")
    op.drop_column("work_stages", "duration_en")
    op.drop_column("work_stages", "duration_ru")
