from uuid import UUID

from pydantic import BaseModel


class AboutSectionBase(BaseModel):
    title_ru: str
    title_en: str
    description_ru: str
    description_en: str
    sort_order: int = 0
    is_active: bool = True


class AboutSectionCreate(AboutSectionBase):
    pass


class AboutSectionUpdate(BaseModel):
    title_ru: str | None = None
    title_en: str | None = None
    description_ru: str | None = None
    description_en: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class AboutSectionResponse(AboutSectionBase):
    id: UUID

    class Config:
        from_attributes = True


class AboutSectionPublic(BaseModel):
    id: UUID
    title: str
    description: str

    class Config:
        from_attributes = True
