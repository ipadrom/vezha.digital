from fastapi import APIRouter, Request

from app.core.deps import DbSession
from app.models import ContactRequest
from app.schemas import ContactCreate, ContactResponse
from app.services import send_contact_notification

router = APIRouter()


@router.post("", response_model=ContactResponse)
async def create_contact_request(
    data: ContactCreate,
    request: Request,
    db: DbSession,
):


    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")


    contact_request = ContactRequest(
        name=data.name,
        contact=data.contact,
        message=data.message,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(contact_request)
    await db.commit()


    await send_contact_notification(
        name=data.name,
        contact=data.contact,
        message=data.message,
    )

    return ContactResponse(
        success=True,
        message="Ваша заявка успешно отправлена!",
    )
