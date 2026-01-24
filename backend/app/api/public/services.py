from uuid import UUID

from fastapi import APIRouter, Query, HTTPException, status
from sqlalchemy import select

from app.core.deps import DbSession
from app.models import Service
from app.schemas import ServicePublic

router = APIRouter()


@router.get("", response_model=list[ServicePublic])
async def get_services(
    db: DbSession,
    lang: str = Query("ru", regex="^(ru|en)$"),
):
    result = await db.execute(
        select(Service).where(Service.is_active == True).order_by(Service.sort_order)
    )
    services = result.scalars().all()

    return [
        ServicePublic(
            id=s.id,
            icon=s.icon,
            name=s.name_ru if lang == "ru" else s.name_en,
            description=s.description_ru if lang == "ru" else s.description_en,
            examples=s.examples_ru if lang == "ru" else s.examples_en,
            price_from=s.price_from,
            price_currency=s.price_currency,
        )
        for s in services
    ]

@router.get("/{service_id}", response_model=ServicePublic)
async def get_service_id(
        db: DbSession,
        service_id: UUID,
        lang: str = Query("ru", pattern="^(ru|en)$"),
):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service_id = result.scalar_one_or_none()
    if not service_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    return ServicePublic(
        id=service_id.id,
        icon=service_id.icon,
        name=service_id.name_ru if lang == "ru" else service_id.name_en,
        description=service_id.description_ru if lang == "ru" else service_id.description_en,
        examples=service_id.examples_ru if lang == "ru" else service_id.examples_en,
        price_from=service_id.price_from,
        price_currency=service_id.price_currency
    )