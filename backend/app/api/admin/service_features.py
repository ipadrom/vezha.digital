from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import CurrentAdmin, DbSession
from app.models import Service, ServiceFeature
from app.schemas import (
    MessageResponse,
    ReorderRequest,
    ServiceFeatureCreate,
    ServiceFeatureResponse,
    ServiceFeatureUpdate,
)

router = APIRouter()


async def _get_service_or_404(service_id: UUID, db: DbSession) -> Service:
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service


@router.get("/{service_id}/features", response_model=list[ServiceFeatureResponse])
async def get_service_features(service_id: UUID, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    result = await db.execute(
        select(ServiceFeature).where(ServiceFeature.service_id == service_id).order_by(ServiceFeature.sort_order)
    )
    return result.scalars().all()


@router.post("/{service_id}/features", response_model=ServiceFeatureResponse, status_code=status.HTTP_201_CREATED)
async def create_service_feature(service_id: UUID, data: ServiceFeatureCreate, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    feature = ServiceFeature(**data.model_dump())
    feature.service_id = service_id
    db.add(feature)
    await db.commit()
    await db.refresh(feature)
    return feature


@router.get("/{service_id}/features/{feature_id}", response_model=ServiceFeatureResponse)
async def get_service_feature(service_id: UUID, feature_id: UUID, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    result = await db.execute(
        select(ServiceFeature).where(ServiceFeature.id == feature_id, ServiceFeature.service_id == service_id)
    )
    feature = result.scalar_one_or_none()
    if not feature:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service feature not found")
    return feature


@router.put("/{service_id}/features/{feature_id}", response_model=ServiceFeatureResponse)
async def update_service_feature(
    service_id: UUID, feature_id: UUID, data: ServiceFeatureUpdate, admin: CurrentAdmin, db: DbSession
):
    await _get_service_or_404(service_id, db)
    result = await db.execute(
        select(ServiceFeature).where(ServiceFeature.id == feature_id, ServiceFeature.service_id == service_id)
    )
    feature = result.scalar_one_or_none()
    if not feature:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service feature not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(feature, key, value)

    await db.commit()
    await db.refresh(feature)
    return feature


@router.delete("/{service_id}/features/{feature_id}", response_model=MessageResponse)
async def delete_service_feature(service_id: UUID, feature_id: UUID, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    result = await db.execute(
        select(ServiceFeature).where(ServiceFeature.id == feature_id, ServiceFeature.service_id == service_id)
    )
    feature = result.scalar_one_or_none()
    if not feature:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service feature not found")

    await db.delete(feature)
    await db.commit()
    return MessageResponse(message="Service feature deleted successfully")


@router.patch("/{service_id}/features/reorder", response_model=MessageResponse)
async def reorder_service_features(service_id: UUID, data: ReorderRequest, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    for reorder_item in data.items:
        result = await db.execute(
            select(ServiceFeature).where(ServiceFeature.id == reorder_item.id, ServiceFeature.service_id == service_id)
        )
        feature = result.scalar_one_or_none()
        if feature:
            feature.sort_order = reorder_item.sort_order

    await db.commit()
    return MessageResponse(message="Service features reordered successfully")
