from uuid import UUID

from pydantic import BaseModel


class SettingBase(BaseModel):
    key: str
    value_ru: str | None = None
    value_en: str | None = None


class SettingCreate(SettingBase):
    pass


class SettingUpdate(BaseModel):
    value_ru: str | None = None
    value_en: str | None = None


class SettingResponse(SettingBase):
    id: UUID

    class Config:
        from_attributes = True


class SettingsPublic(BaseModel):
    settings: dict[str, str]
