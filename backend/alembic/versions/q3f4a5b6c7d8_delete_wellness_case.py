"""Delete the wellness case entirely, without a backup.

Revision ID: q3f4a5b6c7d8
Revises: p2e3f4a5b6c7
"""

import sqlalchemy as sa

from alembic import op

revision = "q3f4a5b6c7d8"
down_revision = "p2e3f4a5b6c7"
branch_labels = None
depends_on = None

SLUG = "wellness-app"


def upgrade():
    # All case child tables have ON DELETE CASCADE.
    op.get_bind().execute(sa.text("DELETE FROM projects WHERE slug = :slug"), {"slug": SLUG})


def downgrade():
    # The case was deleted on request without a backup; there is nothing to restore.
    pass
