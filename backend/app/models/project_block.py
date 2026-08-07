import uuid
from typing import Any

from sqlalchemy import JSON, Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

json_type = JSON().with_variant(JSONB, "postgresql")


class ProjectBlock(Base):
    __tablename__ = "project_blocks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type: Mapped[str] = mapped_column(String(40), nullable=False)
    content_ru: Mapped[dict[str, Any]] = mapped_column(json_type, nullable=False, default=dict)
    content_en: Mapped[dict[str, Any]] = mapped_column(json_type, nullable=False, default=dict)
    settings: Mapped[dict[str, Any]] = mapped_column(json_type, nullable=False, default=dict)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
