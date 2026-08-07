"""Backfill stable slugs for published legacy projects."""

from collections.abc import Sequence

from alembic import op

revision: str = "j0e1f2a3b4c5"
down_revision: str = "i9d0e1f2a3b4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        WITH candidates AS (
            SELECT
                id,
                COALESCE(
                    NULLIF(
                        TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(name_en), '[^a-z0-9]+', '-', 'g')),
                        ''
                    ),
                    'case-' || LEFT(id::text, 8)
                ) AS base_slug
            FROM projects
            WHERE status = 'published' AND COALESCE(slug, '') = ''
        ),
        ranked AS (
            SELECT
                id,
                base_slug,
                ROW_NUMBER() OVER (PARTITION BY base_slug ORDER BY id) AS slug_number
            FROM candidates
        ),
        resolved AS (
            SELECT
                ranked.id,
                CASE
                    WHEN ranked.slug_number > 1 OR EXISTS (
                        SELECT 1
                        FROM projects existing
                        WHERE existing.slug = ranked.base_slug AND existing.id != ranked.id
                    )
                    THEN ranked.base_slug || '-' || LEFT(ranked.id::text, 8)
                    ELSE ranked.base_slug
                END AS generated_slug
            FROM ranked
        )
        UPDATE projects AS project
        SET
            slug = resolved.generated_slug,
            draft_data = CASE
                WHEN project.draft_data IS NULL THEN NULL
                ELSE jsonb_set(
                    project.draft_data,
                    '{slug}',
                    to_jsonb(resolved.generated_slug),
                    true
                )
            END,
            published_data = CASE
                WHEN project.published_data IS NULL THEN NULL
                ELSE jsonb_set(
                    project.published_data,
                    '{meta,slug}',
                    to_jsonb(resolved.generated_slug),
                    true
                )
            END
        FROM resolved
        WHERE project.id = resolved.id
        """
    )


def downgrade() -> None:
    # Generated slugs become editable content after the migration, so a downgrade
    # must not erase values that may already have been changed by an administrator.
    pass
