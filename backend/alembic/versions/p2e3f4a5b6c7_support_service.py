"""Add the support-of-existing-products service as the last landing service.

Revision ID: p2e3f4a5b6c7
Revises: o1d2e3f4a5b6
"""

from datetime import datetime
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "p2e3f4a5b6c7"
down_revision = "o1d2e3f4a5b6"
branch_labels = None
depends_on = None

NAME_RU = "Поддержка существующих решений"

SERVICE = {
    "icon": "code",
    "name_ru": NAME_RU,
    "name_en": "Support for existing products",
    "description_ru": (
        "Берём на поддержку продукт, который уже работает: разбираемся в коде, "
        "исправляем ошибки, дорабатываем функции и следим за стабильностью."
    ),
    "description_en": (
        "We take over a product that is already live: get to know the code, fix bugs, "
        "extend features and keep it stable."
    ),
    "examples_ru": None,
    "examples_en": None,
    "deadline_ru": "Бессрочно",
    "deadline_en": "Ongoing",
    "about_ru": None,
    "about_en": None,
    "price_from": 0,
    "price_currency": "₽",
    "is_active": True,
}


def upgrade():
    bind = op.get_bind()
    if bind.execute(sa.text("SELECT 1 FROM services WHERE name_ru = :name"), {"name": NAME_RU}).first():
        return
    sort_order = bind.execute(sa.text("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM services")).scalar_one()
    now = datetime.utcnow()
    columns = ["id", *SERVICE, "sort_order", "created_at", "updated_at"]
    bind.execute(
        sa.text(f"INSERT INTO services ({', '.join(columns)}) VALUES ({', '.join(f':{c}' for c in columns)})"),
        {"id": str(uuid4()), **SERVICE, "sort_order": sort_order, "created_at": now, "updated_at": now},
    )


def downgrade():
    op.get_bind().execute(sa.text("DELETE FROM services WHERE name_ru = :name"), {"name": NAME_RU})
