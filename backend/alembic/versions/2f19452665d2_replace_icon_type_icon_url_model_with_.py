
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



revision: str = '2f19452665d2'
down_revision: str = '8c704a2ef5c5'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('tech_stack') as batch_op:
        batch_op.drop_column('icon_type')
        batch_op.drop_column('icon_url_model')
        batch_op.add_column(sa.Column('icon_format', sa.String(length=255), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('tech_stack') as batch_op:
        batch_op.drop_column('icon_format')
        batch_op.add_column(sa.Column('icon_type', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('icon_url_model', sa.String(length=255), nullable=True))
