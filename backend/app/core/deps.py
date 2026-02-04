from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.database import get_session
from app.core.security import decode_access_token

security = HTTPBearer()


async def get_db() -> AsyncSession:
    async for session in get_session():
        yield session


DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> int:
    token = credentials.credentials
    token_data = decode_access_token(token)

    if not token_data or not token_data.telegram_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    # В dev-режиме разрешаем dev_telegram_id
    dev_telegram_id = 999999999
    is_dev_admin = settings.DOCS_ENABLED and token_data.telegram_id == dev_telegram_id

    if not is_dev_admin and token_data.telegram_id not in settings.admin_telegram_ids_list:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as admin",
        )

    return token_data.telegram_id


CurrentAdmin = Annotated[int, Depends(get_current_admin)]
