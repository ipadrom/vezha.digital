from typing import List
from fastapi import APIRouter, HTTPException, status

from sqlalchemy import select

from app.core.deps import DbSession, CurrentAdmin
from app.models import SiteSetting
from app.schemas import (
    SettingCreate, SettingUpdate, SettingResponse, MessageResponse
)

router = APIRouter()


@router.get("", response_model=List[SettingResponse])
async def get_settings(
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(select(SiteSetting))
    return result.scalars().all()


@router.post("", response_model=SettingResponse, status_code=status.HTTP_201_CREATED)
async def create_setting(
    data: SettingCreate,
    admin: CurrentAdmin,
    db: DbSession,
):


    result = await db.execute(
        select(SiteSetting).where(SiteSetting.key == data.key)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Setting with this key already exists",
        )

    setting = SiteSetting(**data.model_dump())
    db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return setting


@router.put("/{key}", response_model=SettingResponse)
async def update_setting(
    key: str,
    data: SettingUpdate,
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(SiteSetting).where(SiteSetting.key == key)
    )
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for k, value in update_data.items():
        setattr(setting, k, value)

    await db.commit()
    await db.refresh(setting)
    return setting


@router.delete("/{key}", response_model=MessageResponse)
async def delete_setting(
    key: str,
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(SiteSetting).where(SiteSetting.key == key)
    )
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found",
        )

    await db.delete(setting)
    await db.commit()
    return MessageResponse(message="Setting deleted successfully")
