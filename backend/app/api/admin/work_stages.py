from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException, status

from sqlalchemy import select

from app.core.deps import DbSession, CurrentAdmin
from app.models import WorkStage
from app.schemas import (
    WorkStageCreate, WorkStageUpdate, WorkStageResponse,
    MessageResponse
)

router = APIRouter()


@router.get("", response_model=List[WorkStageResponse])
async def get_work_stages(
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(WorkStage).order_by(WorkStage.step_number)
    )
    return result.scalars().all()


@router.post("", response_model=WorkStageResponse, status_code=status.HTTP_201_CREATED)
async def create_work_stage(
    data: WorkStageCreate,
    admin: CurrentAdmin,
    db: DbSession,
):

    stage = WorkStage(**data.model_dump())
    db.add(stage)
    await db.commit()
    await db.refresh(stage)
    return stage


@router.put("/{stage_id}", response_model=WorkStageResponse)
async def update_work_stage(
    stage_id: UUID,
    data: WorkStageUpdate,
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(WorkStage).where(WorkStage.id == stage_id)
    )
    stage = result.scalar_one_or_none()
    if not stage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work stage not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(stage, key, value)

    await db.commit()
    await db.refresh(stage)
    return stage


@router.delete("/{stage_id}", response_model=MessageResponse)
async def delete_work_stage(
    stage_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(WorkStage).where(WorkStage.id == stage_id)
    )
    stage = result.scalar_one_or_none()
    if not stage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work stage not found",
        )

    await db.delete(stage)
    await db.commit()
    return MessageResponse(message="Work stage deleted successfully")
