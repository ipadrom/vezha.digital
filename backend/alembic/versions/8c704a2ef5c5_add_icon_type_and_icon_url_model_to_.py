
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



revision: str = '8c704a2ef5c5'
down_revision: str = 'c3d4e5f6a7b8'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('tech_stack', sa.Column('icon_type', sa.String(length=50), nullable=True))
    op.add_column('tech_stack', sa.Column('icon_url_model', sa.String(length=255), nullable=True))


def downgrade():
    op.drop_column('tech_stack', 'icon_type')
    op.drop_column('tech_stack', 'icon_url_model')