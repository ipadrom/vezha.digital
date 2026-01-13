import os
import uuid

import aiofiles
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.config import settings
from app.core.deps import CurrentAdmin
from app.schemas import UploadResponse

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}


@router.post("", response_model=UploadResponse)
async def upload_file(
    admin: CurrentAdmin,
    file: UploadFile = File(...),
):
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE // 1024 // 1024}MB",
        )

    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    return UploadResponse(
        url=f"/uploads/{unique_filename}",
        filename=unique_filename,
    )
