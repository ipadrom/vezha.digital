import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from pydantic import BaseModel

from app.config import settings


class TokenData(BaseModel):
    telegram_id: Optional[int] = None


class TelegramAuthData(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int
    hash: str


def verify_telegram_auth(data: dict) -> bool:

    check_hash = data.pop("hash", None)
    if not check_hash:
        return False


    data_check_arr = sorted([f"{k}={v}" for k, v in data.items() if v is not None])
    data_check_string = "\n".join(data_check_arr)


    secret_key = hashlib.sha256(settings.TELEGRAM_BOT_TOKEN.encode()).digest()


    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()


    data["hash"] = check_hash

    return hmac.compare_digest(calculated_hash, check_hash)


def create_access_token(telegram_id: int) -> str:

    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": str(telegram_id),
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[TokenData]:

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        telegram_id = int(payload.get("sub"))
        return TokenData(telegram_id=telegram_id)
    except (JWTError, ValueError):
        return None
