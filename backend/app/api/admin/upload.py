import os
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.config import settings
from app.core.deps import CurrentAdmin
from app.core.storage import storage
from app.schemas import UploadResponse

router = APIRouter()

ALLOWED_EXTENSIONS = {
    # Images
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
    # 3D models
    ".gltf", ".glb", ".obj",
    # Other
    ".palette",
}

# Content type mapping
CONTENT_TYPE_MAP = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".gltf": "model/gltf+json",
    ".glb": "model/gltf-binary",
    ".obj": "model/obj",
    ".palette": "application/octet-stream",
}


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
    content_type = CONTENT_TYPE_MAP.get(ext, "application/octet-stream")

    try:
        # Upload to MinIO
        url = storage.upload_file(
            file_data=content,
            filename=unique_filename,
            content_type=content_type,
        )

        return UploadResponse(
            url=url,
            filename=unique_filename,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}",
        )
