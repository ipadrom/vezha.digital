
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



revision: str = '4e30cf80cf90'
down_revision: Union[str, None] = ('d4e5f6a7b8c9', 'f6a7b8c9d0e1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
