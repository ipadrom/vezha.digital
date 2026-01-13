from pydantic import BaseModel


class TelegramAuth(BaseModel):
    id: int
    first_name: str
    last_name: str | None = None
    username: str | None = None
    photo_url: str | None = None
    auth_date: int
    hash: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminInfo(BaseModel):
    telegram_id: int
    username: str | None
    first_name: str | None
    last_name: str | None
    photo_url: str | None

    class Config:
        from_attributes = True
