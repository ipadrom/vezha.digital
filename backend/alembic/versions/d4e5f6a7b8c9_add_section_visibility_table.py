"""Add section_visibility table

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2025-02-04 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "d4e5f6a7b8c9"
down_revision: str | None = "c3d4e5f6a7b8"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Создаем таблицу для управления видимостью секций
    op.create_table(
        "section_visibility",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            primary_key=True,
        ),
        sa.Column("section_key", sa.String(100), nullable=False, unique=True),
        sa.Column("section_name_ru", sa.String(200), nullable=False),
        sa.Column("section_name_en", sa.String(200), nullable=False),
        sa.Column("is_visible", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("section_key"),
    )

    # Создаем индекс для быстрого поиска
    op.create_index(
        "ix_section_visibility_section_key",
        "section_visibility",
        ["section_key"],
        unique=True,
    )

    # Добавляем начальные данные для основных секций сайта
    op.execute(
        """
        INSERT INTO section_visibility (id, section_key, section_name_ru, section_name_en, is_visible)
        VALUES
            (gen_random_uuid(), 'services', 'Услуги', 'Services', true),
            (gen_random_uuid(), 'advantages', 'Преимущества', 'Advantages', true),
            (gen_random_uuid(), 'projects', 'Проекты', 'Projects', true),
            (gen_random_uuid(), 'tech_stack', 'Технологический стек', 'Tech Stack', true),
            (gen_random_uuid(), 'work_stages', 'Этапы работы', 'Work Stages', true),
            (gen_random_uuid(), 'client_types', 'Типы клиентов', 'Client Types', true),
            (gen_random_uuid(), 'about_sections', 'О нас', 'About Us', true)
    """
    )


def downgrade() -> None:
    # Удаляем индекс
    op.drop_index("ix_section_visibility_section_key", table_name="section_visibility")

    # Удаляем таблицу
    op.drop_table("section_visibility")
