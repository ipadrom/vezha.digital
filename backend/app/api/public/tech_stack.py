from fastapi import APIRouter, Query
from sqlalchemy import select

from app.core.deps import DbSession
from app.models import TechStack
from app.schemas import TechStackPublic

router = APIRouter()


@router.get("", response_model=list[TechStackPublic])
async def get_tech_stack(
    db: DbSession,
    lang: str = Query("ru", regex="^(ru|en)$"),
):
    result = await db.execute(
        select(TechStack)
        .where(TechStack.is_active)
        .order_by(TechStack.category, TechStack.sort_order)
    )
    items = result.scalars().all()

    return [
        TechStackPublic(
            id=t.id,
            category=t.category,
            icon=t.icon,
            icon_format=t.icon_format,
            name=t.name,
            subtitle=t.subtitle_ru if lang == "ru" else t.subtitle_en,
        )
        for t in items
    ]
