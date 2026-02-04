import enum
import uuid

from sqlalchemy import Boolean, Integer, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TechCategory(str, enum.Enum):
    FRONTEND = "frontend"
    BACKEND = "backend"


class TechStack(Base):
    __tablename__ = "tech_stack"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category: Mapped[TechCategory] = mapped_column(SQLEnum(TechCategory), nullable=False)
    icon: Mapped[str] = mapped_column(String(500), nullable=False)
    icon_format: Mapped[str] = mapped_column(String(500), nullable=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    subtitle_ru: Mapped[str] = mapped_column(String(255), nullable=True)
    subtitle_en: Mapped[str] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
