from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c4d5e6f7a8b9"
down_revision: Union[str, None] = "b2c3d4e5f6a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("service_examples", sa.Column("deadline_ru", sa.String(255), nullable=True))
    op.add_column("service_examples", sa.Column("deadline_en", sa.String(255), nullable=True))


def downgrade() -> None:
    op.drop_column("service_examples", "deadline_en")
    op.drop_column("service_examples", "deadline_ru")
