import httpx
from datetime import datetime

from app.config import settings


async def send_contact_notification(
    name: str,
    contact: str,
    message: str,
) -> bool:

    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
        return False

    text = f"""📬 Новая заявка с сайта!

👤 Имя: {name}
📞 Контакт: {contact}

💬 Сообщение:
{message}

🕐 {datetime.now().strftime('%d.%m.%Y %H:%M')}"""

    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json={
                    "chat_id": settings.TELEGRAM_CHAT_ID,
                    "text": text,
                    "parse_mode": "HTML",
                },
                timeout=10.0,
            )
            return response.status_code == 200
    except Exception:
        return False
