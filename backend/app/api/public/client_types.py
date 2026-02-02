from fastapi import APIRouter, Query
from sqlalchemy import select

from app.core.deps import DbSession
from app.models import ClientType
from app.schemas import ClientTypePublic

router = APIRouter()


@router.get("", response_model=list[ClientTypePublic])
async def get_client_types(
    db: DbSession,
    lang: str = Query("ru", regex="^(ru|en)$"),
):
    result = await db.execute(
        select(ClientType).where(ClientType.is_active).order_by(ClientType.sort_order)
    )
    client_types = result.scalars().all()

    return [
        ClientTypePublic(
            id=ct.id,
            title=ct.title_ru if lang == "ru" else ct.title_en,
            subtitle=ct.subtitle_ru if lang == "ru" else ct.subtitle_en,
            description=ct.description_ru if lang == "ru" else ct.description_en,
        )
        for ct in client_types
    ]
