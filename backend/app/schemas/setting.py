from uuid import UUID
from typing import Optional, Dict
from pydantic import BaseModel


class SettingBase(BaseModel):
    key: str
    value_ru: Optional[str] = None
    value_en: Optional[str] = None


class SettingCreate(SettingBase):
    pass


class SettingUpdate(BaseModel):
    value_ru: Optional[str] = None
    value_en: Optional[str] = None


class SettingResponse(SettingBase):
    id: UUID

    class Config:
        from_attributes = True


class SettingsPublic(BaseModel):
    settings: Dict[str, str]
