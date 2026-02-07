from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class WorkStagePointBase(BaseModel):
    stage_id: UUID
    text_ru: str
    text_en: str
    sort_order: int = 0
    is_active: bool = True


class WorkStagePointCreate(WorkStagePointBase):
    pass


class WorkStagePointUpdate(BaseModel):
    text_ru: str | None = None
    text_en: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class WorkStagePointResponse(WorkStagePointBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
