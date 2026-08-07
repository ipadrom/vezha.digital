import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, Boolean, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type_ru: Mapped[str] = mapped_column(String(100), nullable=False)
    type_en: Mapped[str] = mapped_column(String(100), nullable=False)
    name_ru: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    description_ru: Mapped[str] = mapped_column(Text, nullable=True)
    description_en: Mapped[str] = mapped_column(Text, nullable=True)
    slug: Mapped[str | None] = mapped_column(String(160), unique=True, index=True, nullable=True)
    subtitle_ru: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subtitle_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    industry_ru: Mapped[str | None] = mapped_column(String(160), nullable=True)
    industry_en: Mapped[str | None] = mapped_column(String(160), nullable=True)
    year: Mapped[str | None] = mapped_column(String(20), nullable=True)
    timeline_ru: Mapped[str | None] = mapped_column(String(120), nullable=True)
    timeline_en: Mapped[str | None] = mapped_column(String(120), nullable=True)
    challenge_ru: Mapped[str | None] = mapped_column(Text, nullable=True)
    challenge_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    solution_ru: Mapped[str | None] = mapped_column(Text, nullable=True)
    solution_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    result_summary_ru: Mapped[str | None] = mapped_column(Text, nullable=True)
    result_summary_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    project_url: Mapped[str] = mapped_column(String(500), nullable=True)
    hero_metric_value: Mapped[str | None] = mapped_column(String(80), nullable=True)
    hero_metric_label_ru: Mapped[str | None] = mapped_column(String(160), nullable=True)
    hero_metric_label_en: Mapped[str | None] = mapped_column(String(160), nullable=True)
    testimonial_ru: Mapped[str | None] = mapped_column(Text, nullable=True)
    testimonial_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    testimonial_author_ru: Mapped[str | None] = mapped_column(String(255), nullable=True)
    testimonial_author_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")
    draft_data: Mapped[dict[str, Any] | None] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"), nullable=True
    )
    published_data: Mapped[dict[str, Any] | None] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"), nullable=True
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    metrics = relationship(
        "ProjectMetric",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="ProjectMetric.sort_order",
    )
    gallery = relationship(
        "ProjectGalleryItem",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="ProjectGalleryItem.sort_order",
    )
    technologies = relationship(
        "ProjectTechnology",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="ProjectTechnology.sort_order",
    )
    blocks = relationship(
        "ProjectBlock",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="ProjectBlock.sort_order",
    )
    revisions = relationship(
        "ProjectRevision",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="ProjectRevision.version.desc()",
    )
