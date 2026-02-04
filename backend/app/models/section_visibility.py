import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SectionVisibility(Base):
    """Модель для управления видимостью блоков сайта"""

    __tablename__ = "section_visibility"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    section_key: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True, comment="Уникальный ключ блока"
    )
    section_name_ru: Mapped[str] = mapped_column(
        String(200), nullable=False, comment="Название блока на русском"
    )
    section_name_en: Mapped[str] = mapped_column(
        String(200), nullable=False, comment="Название блока на английском"
    )
    is_visible: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, comment="Видимость блока на сайте"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )