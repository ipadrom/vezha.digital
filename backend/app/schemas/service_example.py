from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ServiceExampleBase(BaseModel):
    service_id: UUID
    title_ru: str
    title_en: str
    description_ru: str | None = None
    description_en: str | None = None
    price_from: int = 0
    price_currency: str = "₽"
    deadline_ru: str | None = None
    deadline_en: str | None = None
    sort_order: int = 0
    is_active: bool = True


class ServiceExampleCreate(ServiceExampleBase):
    pass


class ServiceExampleUpdate(BaseModel):
    title_ru: str | None = None
    title_en: str | None = None
    description_ru: str | None = None
    description_en: str | None = None
    price_from: int | None = None
    price_currency: str | None = None
    deadline_ru: str | None = None
    deadline_en: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class ServiceExampleResponse(ServiceExampleBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ServiceExamplePublic(BaseModel):
    id: UUID
    title: str
    description: str | None
    price_from: int
    price_currency: str
    deadline: str | None = None

    class Config:
        from_attributes = True
