from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.service_item import ServiceItemPublic


class ServiceBase(BaseModel):
    icon: str = "code"
    name_ru: str
    name_en: str
    description_ru: str
    description_en: str
    examples_ru: str | None = None
    examples_en: str | None = None
    price_from: int = 0
    price_currency: str = "₽"
    sort_order: int = 0
    is_active: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    icon: str | None = None
    name_ru: str | None = None
    name_en: str | None = None
    description_ru: str | None = None
    description_en: str | None = None
    examples_ru: str | None = None
    examples_en: str | None = None
    price_from: int | None = None
    price_currency: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class ServiceResponse(ServiceBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ServicePublic(BaseModel):
    id: UUID
    icon: str
    name: str
    description: str
    examples: str | None
    price_from: int
    price_currency: str

    class Config:
        from_attributes = True


class ServiceDetailPublic(ServicePublic):
    items: list[ServiceItemPublic]

    class Config:
        from_attributes = True