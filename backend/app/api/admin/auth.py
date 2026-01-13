from datetime import datetime
from fastapi import APIRouter, HTTPException, status

from sqlalchemy import select

from app.core.deps import DbSession, CurrentAdmin
from app.core.security import verify_telegram_auth, create_access_token
from app.config import settings
from app.models import Admin
from app.schemas import TelegramAuth, Token, AdminInfo

router = APIRouter()


@router.post("/telegram", response_model=Token)
async def telegram_auth(
    data: TelegramAuth,
    db: DbSession,
):


    auth_dict = data.model_dump()
    if not verify_telegram_auth(auth_dict):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram auth data",
        )


    if data.id not in settings.admin_telegram_ids_list:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized as admin",
        )


    result = await db.execute(
        select(Admin).where(Admin.telegram_id == data.id)
    )
    admin = result.scalar_one_or_none()

    if admin:
        admin.username = data.username
        admin.first_name = data.first_name
        admin.last_name = data.last_name
        admin.photo_url = data.photo_url
        admin.last_login = datetime.utcnow()
    else:
        admin = Admin(
            telegram_id=data.id,
            username=data.username,
            first_name=data.first_name,
            last_name=data.last_name,
            photo_url=data.photo_url,
            last_login=datetime.utcnow(),
        )
        db.add(admin)

    await db.commit()


    access_token = create_access_token(data.id)

    return Token(access_token=access_token)


@router.get("/me", response_model=AdminInfo)
async def get_current_admin_info(
    admin_id: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(Admin).where(Admin.telegram_id == admin_id)
    )
    admin = result.scalar_one_or_none()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )

    return AdminInfo(
        telegram_id=admin.telegram_id,
        username=admin.username,
        first_name=admin.first_name,
        last_name=admin.last_name,
        photo_url=admin.photo_url,
    )
