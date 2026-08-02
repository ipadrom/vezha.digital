import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ProjectMetric(Base):
    __tablename__ = "project_metrics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )
    value: Mapped[str] = mapped_column(String(80), nullable=False)
    label_ru: Mapped[str] = mapped_column(String(160), nullable=False)
    label_en: Mapped[str] = mapped_column(String(160), nullable=False)
    context_ru: Mapped[str | None] = mapped_column(Text, nullable=True)
    context_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
