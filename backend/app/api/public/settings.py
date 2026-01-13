from fastapi import APIRouter, Query

from sqlalchemy import select

from app.core.deps import DbSession
from app.models import SiteSetting
from app.schemas import SettingsPublic

router = APIRouter()


@router.get("", response_model=SettingsPublic)
async def get_settings(
    db: DbSession,
    lang: str = Query("ru", regex="^(ru|en)$"),
):

    result = await db.execute(select(SiteSetting))
    settings = result.scalars().all()

    return SettingsPublic(
        settings={
            s.key: (s.value_ru if lang == "ru" else s.value_en) or ""
            for s in settings
        }
    )
