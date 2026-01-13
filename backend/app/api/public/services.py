from fastapi import APIRouter, Query
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
