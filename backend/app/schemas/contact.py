from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class ContactCreate(BaseModel):
    name: str
    contact: str
    message: str

    @field_validator("name", "contact", "message")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class ContactResponse(BaseModel):
    success: bool
    message: str


class ContactRequestResponse(BaseModel):
    id: UUID
    name: str
    contact: str
    message: str
    ip_address: Optional[str]
    is_processed: bool
    created_at: datetime

    class Config:
        from_attributes = True
