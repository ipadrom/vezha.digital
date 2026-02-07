from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import CurrentAdmin, DbSession
from app.models import WorkStage
from app.models.work_stage_point import WorkStagePoint
from app.schemas import (
    MessageResponse,
    ReorderRequest,
)
from app.schemas.work_stage_point import (
    WorkStagePointCreate,
    WorkStagePointResponse,
    WorkStagePointUpdate,
)

router = APIRouter()


async def _get_stage_or_404(stage_id: UUID, db: DbSession) -> WorkStage:
    result = await db.execute(select(WorkStage).where(WorkStage.id == stage_id))
    stage = result.scalar_one_or_none()
    if not stage:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work stage not found")
    return stage


@router.get("/{stage_id}/points", response_model=list[WorkStagePointResponse])
async def get_stage_points(stage_id: UUID, admin: CurrentAdmin, db: DbSession):
    await _get_stage_or_404(stage_id, db)
    result = await db.execute(
        select(WorkStagePoint).where(WorkStagePoint.stage_id == stage_id).order_by(WorkStagePoint.sort_order)
    )
    return result.scalars().all()


@router.post("/{stage_id}/points", response_model=WorkStagePointResponse, status_code=status.HTTP_201_CREATED)
async def create_stage_point(stage_id: UUID, data: WorkStagePointCreate, admin: CurrentAdmin, db: DbSession):
    await _get_stage_or_404(stage_id, db)
    point = WorkStagePoint(**data.model_dump())
    point.stage_id = stage_id
    db.add(point)
    await db.commit()
    await db.refresh(point)
    return point


@router.get("/{stage_id}/points/{point_id}", response_model=WorkStagePointResponse)
async def get_stage_point(stage_id: UUID, point_id: UUID, admin: CurrentAdmin, db: DbSession):
    await _get_stage_or_404(stage_id, db)
    result = await db.execute(
        select(WorkStagePoint).where(WorkStagePoint.id == point_id, WorkStagePoint.stage_id == stage_id)
    )
    point = result.scalar_one_or_none()
    if not point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work stage point not found")
    return point


@router.put("/{stage_id}/points/{point_id}", response_model=WorkStagePointResponse)
async def update_stage_point(
    stage_id: UUID, point_id: UUID, data: WorkStagePointUpdate, admin: CurrentAdmin, db: DbSession
):
    await _get_stage_or_404(stage_id, db)
    result = await db.execute(
        select(WorkStagePoint).where(WorkStagePoint.id == point_id, WorkStagePoint.stage_id == stage_id)
    )
    point = result.scalar_one_or_none()
    if not point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work stage point not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(point, key, value)

    await db.commit()
    await db.refresh(point)
    return point


@router.delete("/{stage_id}/points/{point_id}", response_model=MessageResponse)
async def delete_stage_point(stage_id: UUID, point_id: UUID, admin: CurrentAdmin, db: DbSession):
    await _get_stage_or_404(stage_id, db)
    result = await db.execute(
        select(WorkStagePoint).where(WorkStagePoint.id == point_id, WorkStagePoint.stage_id == stage_id)
    )
    point = result.scalar_one_or_none()
    if not point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work stage point not found")

    await db.delete(point)
    await db.commit()
    return MessageResponse(message="Work stage point deleted successfully")


@router.patch("/{stage_id}/points/reorder", response_model=MessageResponse)
async def reorder_stage_points(stage_id: UUID, data: ReorderRequest, admin: CurrentAdmin, db: DbSession):
    await _get_stage_or_404(stage_id, db)
    for reorder_item in data.items:
        result = await db.execute(
            select(WorkStagePoint).where(WorkStagePoint.id == reorder_item.id, WorkStagePoint.stage_id == stage_id)
        )
        point = result.scalar_one_or_none()
        if point:
            point.sort_order = reorder_item.sort_order

    await db.commit()
    return MessageResponse(message="Work stage points reordered successfully")
