from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "c3d4e5f6a7b8"
down_revision: str | None = "b2c3d4e5f6a7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Increase icon field size from 50 to 500 to support URL storage
    op.alter_column(
        "tech_stack",
        "icon",
        existing_type=sa.String(50),
        type_=sa.String(500),
        existing_nullable=False,
    )
    op.alter_column(
        "advantages",
        "icon",
        existing_type=sa.String(50),
        type_=sa.String(500),
        existing_nullable=False,
    )
    op.alter_column(
        "services",
        "icon",
        existing_type=sa.String(50),
        type_=sa.String(500),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "tech_stack",
        "icon",
        existing_type=sa.String(500),
        type_=sa.String(50),
        existing_nullable=False,
    )
    op.alter_column(
        "advantages",
        "icon",
        existing_type=sa.String(500),
        type_=sa.String(50),
        existing_nullable=False,
    )
    op.alter_column(
        "services",
        "icon",
        existing_type=sa.String(500),
        type_=sa.String(50),
        existing_nullable=False,
    )