"""Fix legacy local MinIO media URLs.

Revision ID: m3b4c5d6e7f8
Revises: l2a3b4c5d6e7
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "m3b4c5d6e7f8"
down_revision: str = "l2a3b4c5d6e7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

OLD_PREFIX = "http://localhost:9000/uploads/"
NEW_PREFIX = "http://localhost:9000/vezha-uploads/"


def _replace_text_url(table: str, column: str, old: str, new: str) -> None:
    op.execute(
        sa.text(
            f"""
            UPDATE {table}
            SET {column} = replace({column}, :old, :new)
            WHERE {column} LIKE :pattern
            """
        ).bindparams(old=old, new=new, pattern=f"%{old}%")
    )


def _replace_json_url(table: str, column: str, old: str, new: str) -> None:
    op.execute(
        sa.text(
            f"""
            UPDATE {table}
            SET {column} = replace({column}::text, :old, :new)::jsonb
            WHERE {column}::text LIKE :pattern
            """
        ).bindparams(old=old, new=new, pattern=f"%{old}%")
    )


def _replace_all(old: str, new: str) -> None:
    _replace_text_url("media_assets", "url", old, new)
    _replace_text_url("projects", "image_url", old, new)
    _replace_text_url("projects", "cover_image_url", old, new)
    _replace_json_url("projects", "draft_data", old, new)
    _replace_json_url("projects", "published_data", old, new)
    _replace_json_url("project_blocks", "content_ru", old, new)
    _replace_json_url("project_blocks", "content_en", old, new)
    _replace_json_url("project_revisions", "snapshot", old, new)


def upgrade() -> None:
    _replace_all(OLD_PREFIX, NEW_PREFIX)


def downgrade() -> None:
    _replace_all(NEW_PREFIX, OLD_PREFIX)
