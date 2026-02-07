from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ServiceItemBase(BaseModel):
    service_id: UUID
    title_ru: str
    title_en: str
    description_ru: str | None = None
    description_en: str | None = None
    sort_order: int = 0
    is_active: bool = True


class ServiceItemCreate(ServiceItemBase):
    pass


class ServiceItemUpdate(BaseModel):
    title_ru: str | None = None
    title_en: str | None = None
    description_ru: str | None = None
    description_en: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class ServiceItemResponse(ServiceItemBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ServiceItemPublic(BaseModel):
    id: UUID
    title: str
    description: str | None

    class Config:
        from_attributes = True