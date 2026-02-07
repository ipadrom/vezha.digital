
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



revision: str = 'e294429ffd46'
down_revision: Union[str, None] = '4e30cf80cf90'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("services", sa.Column("deadline_ru", sa.Text(), nullable=True))
    op.add_column("services", sa.Column("deadline_en", sa.Text(), nullable=True))
    op.add_column("services", sa.Column("about_ru", sa.Text(), nullable=True))
    op.add_column("services", sa.Column("about_en", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("services", "about_en")
    op.drop_column("services", "about_ru")
    op.drop_column("services", "deadline_en")
    op.drop_column("services", "deadline_ru")
