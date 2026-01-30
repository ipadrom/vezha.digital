from uuid import UUID

from pydantic import BaseModel


class ClientTypeBase(BaseModel):
    title_ru: str
    title_en: str
    subtitle_ru: str
    subtitle_en: str
    description_ru: str
    description_en: str
    sort_order: int = 0
    is_active: bool = True


class ClientTypeCreate(ClientTypeBase):
    pass


class ClientTypeUpdate(BaseModel):
    title_ru: str | None = None
    title_en: str | None = None
    subtitle_ru: str | None = None
    subtitle_en: str | None = None
    description_ru: str | None = None
    description_en: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class ClientTypeResponse(ClientTypeBase):
    id: UUID

    class Config:
        from_attributes = True


class ClientTypePublic(BaseModel):
    id: UUID
    title: str
    subtitle: str
    description: str

    class Config:
        from_attributes = True