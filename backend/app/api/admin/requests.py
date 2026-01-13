from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import CurrentAdmin, DbSession
from app.models import ContactRequest
from app.schemas import ContactRequestResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=list[ContactRequestResponse])
async def get_requests(
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(
        select(ContactRequest).order_by(ContactRequest.created_at.desc())
    )
    return result.scalars().all()


@router.put("/{request_id}/process", response_model=MessageResponse)
async def process_request(
    request_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(
        select(ContactRequest).where(ContactRequest.id == request_id)
    )
    request = result.scalar_one_or_none()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    request.is_processed = True
    await db.commit()
    return MessageResponse(message="Request marked as processed")


@router.delete("/{request_id}", response_model=MessageResponse)
async def delete_request(
    request_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(
        select(ContactRequest).where(ContactRequest.id == request_id)
    )
    request = result.scalar_one_or_none()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    await db.delete(request)
    await db.commit()
    return MessageResponse(message="Request deleted successfully")
