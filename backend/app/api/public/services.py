from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select

from app.core.deps import DbSession
from app.models import Service, ServiceExample, ServiceItem
from app.schemas import ServiceDetailPublic, ServiceExamplePublic, ServiceItemPublic, ServicePublic

router = APIRouter()


@router.get("", response_model=list[ServicePublic])
async def get_services(
    db: DbSession,
    lang: str = Query("ru", regex="^(ru|en)$"),
):
    result = await db.execute(select(Service).where(Service.is_active).order_by(Service.sort_order))
    services = result.scalars().all()

    return [
        ServicePublic(
            id=s.id,
            icon=s.icon,
            name=s.name_ru if lang == "ru" else s.name_en,
            description=s.description_ru if lang == "ru" else s.description_en,
            examples=s.examples_ru if lang == "ru" else s.examples_en,
            deadline=s.deadline_ru if lang == "ru" else s.deadline_en,
            about=s.about_ru if lang == "ru" else s.about_en,
            price_from=s.price_from,
            price_currency=s.price_currency,
        )
        for s in services
    ]


@router.get("/{service_id}", response_model=ServiceDetailPublic)
async def get_service_id(
    db: DbSession,
    service_id: UUID,
    lang: str = Query("ru", pattern="^(ru|en)$"),
):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    items_result = await db.execute(
        select(ServiceItem)
        .where(ServiceItem.service_id == service.id, ServiceItem.is_active)
        .order_by(ServiceItem.sort_order)
    )
    items = items_result.scalars().all()

    examples_result = await db.execute(
        select(ServiceExample)
        .where(ServiceExample.service_id == service.id, ServiceExample.is_active)
        .order_by(ServiceExample.sort_order)
    )
    examples = examples_result.scalars().all()

    return ServiceDetailPublic(
        id=service.id,
        icon=service.icon,
        name=service.name_ru if lang == "ru" else service.name_en,
        description=service.description_ru if lang == "ru" else service.description_en,
        examples=service.examples_ru if lang == "ru" else service.examples_en,
        deadline=service.deadline_ru if lang == "ru" else service.deadline_en,
        about=service.about_ru if lang == "ru" else service.about_en,
        price_from=service.price_from,
        price_currency=service.price_currency,
        items=[
            ServiceItemPublic(
                id=item.id,
                title=item.title_ru if lang == "ru" else item.title_en,
                description=item.description_ru if lang == "ru" else item.description_en,
            )
            for item in items
        ],
        examples_list=[
            ServiceExamplePublic(
                id=ex.id,
                title=ex.title_ru if lang == "ru" else ex.title_en,
                description=ex.description_ru if lang == "ru" else ex.description_en,
                price_from=ex.price_from,
                price_currency=ex.price_currency,
            )
            for ex in examples
        ],
    )
