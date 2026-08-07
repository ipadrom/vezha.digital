import os
import uuid
from uuid import UUID

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from sqlalchemy import select

from app.config import settings
from app.core.deps import CurrentAdmin, DbSession
from app.core.storage import storage
from app.models import MediaAsset
from app.schemas import MediaAssetResponse, MediaAssetUpdate, MessageResponse

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".mp4", ".webm"}
CONTENT_TYPE_MAP = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
}


@router.get("", response_model=list[MediaAssetResponse])
async def list_media(admin: CurrentAdmin, db: DbSession):
    result = await db.execute(select(MediaAsset).order_by(MediaAsset.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=MediaAssetResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    admin: CurrentAdmin,
    db: DbSession,
    file: UploadFile = File(...),
):
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE // 1024 // 1024}MB",
        )

    filename = f"{uuid.uuid4()}{ext}"
    content_type = CONTENT_TYPE_MAP[ext]
    try:
        url = storage.upload_file(
            file_data=content,
            filename=filename,
            content_type=content_type,
            prefix="cases/",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {exc}",
        ) from exc

    asset = MediaAsset(
        url=url,
        filename=f"cases/{filename}",
        content_type=content_type,
        size=len(content),
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset


@router.patch("/{asset_id}", response_model=MediaAssetResponse)
async def update_media(
    asset_id: UUID,
    data: MediaAssetUpdate,
    admin: CurrentAdmin,
    db: DbSession,
):
    asset = await db.get(MediaAsset, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(asset, field, value)
    await db.commit()
    await db.refresh(asset)
    return asset


@router.delete("/{asset_id}", response_model=MessageResponse)
async def delete_media(asset_id: UUID, admin: CurrentAdmin, db: DbSession):
    asset = await db.get(MediaAsset, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    storage.delete_file(asset.filename)
    await db.delete(asset)
    await db.commit()
    return MessageResponse(message="Media deleted")
