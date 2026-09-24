"""Synthetic case fixtures. Run only inside mymit-local-backend-1 via stdin."""
import asyncio
import os
from datetime import datetime, timedelta, time
from decimal import Decimal
from zoneinfo import ZoneInfo

from sandbox.run import validate_environment
validate_environment(os.environ)
import app.main  # register models; does not start the application lifespan
from sqlalchemy import select
from app.core.database import async_session_maker
from app.auth.models import User, UserMinuteTransaction, MinuteTransactionType
from app.booking.models import Booth, BoothSchedule, BoothPhoto, Booking, BookingStatus, BoothDayCapacity
from app.payments.models import Payment, UserPaymentMethod
from app.favorites.models import UserFavoriteBooth
from app.devices.models import Device
from app.return_visits.models import ReturnCampaign, ReturnBonus

async def seed():
    now = datetime.now(ZoneInfo('Europe/Moscow')).replace(tzinfo=None)
    async with async_session_maker() as db:
        user = await db.scalar(select(User).where(User.phone == '79990000120'))
        if user is None:
            user = User(phone='79990000120', name='Демо-пользователь', role='user', is_verified=True,
                        mailing_consent=False, onboarding_completed=True, balance_minutes=30)
            db.add(user)
            await db.flush()
        user.name = 'Демо-пользователь'
        booths = []
        # Approximate Moscow coordinates so the map renders; demo locations, not client addresses.
        for name, address, metro, image, lat, lng in [
            ('МИТ · У парка', 'Демо-локация · павильон у парка', ['Парк культуры'], 'cabin_inside.jpg', 55.7355, 37.5936),
            ('МИТ · Деловой квартал', 'Демо-локация · деловой центр', ['Деловой центр'], 'office.jpg', 55.7486, 37.5395),
            ('МИТ · На набережной', 'Демо-локация · набережная', ['Киевская'], 'cabin_inside.jpg', 55.7437, 37.5664),
        ]:
            booth = await db.scalar(select(Booth).where(Booth.sort_order == 120+len(booths)))
            if booth is None:
                booth = Booth(name=name,address=address,metro=metro,
                              description='Для созвона, встречи и спокойной работы. Демонстрационная кабинка.',
                              created_at=now-timedelta(days=40),sort_order=120+len(booths))
                db.add(booth)
                await db.flush()
                for day in range(7):
                    db.add(BoothSchedule(booth_id=booth.id,day_of_week=day,open_time=time(0),close_time=time(23,59)))
                db.add(BoothPhoto(booth_id=booth.id,url=f'/images/landing/{image}',caption='Демонстрационная локация'))
            booth.name=name; booth.address=address; booth.metro=metro; booth.latitude=lat; booth.longitude=lng
            booth.description='Для созвона, встречи и спокойной работы. Демонстрационная кабинка.'
            device_key=f'case-demo-board-{booth.id}'
            if not await db.scalar(select(Device.id).where(Device.device_id==device_key)):
                db.add(Device(name=f'Демо · {name}',device_id=device_key,device_type='esp32',
                              mqtt_provider='custom_mqtt',mqtt_access_status='pending',booth_id=booth.id,
                              firmware_version='demo',wifi_mode='esp32'))
            booths.append(booth)
            for days_ago in range(1, 31):
                date = (now-timedelta(days=days_ago)).date()
                if not await db.scalar(select(BoothDayCapacity.id).where(BoothDayCapacity.booth_id==booth.id, BoothDayCapacity.date==date)):
                    db.add(BoothDayCapacity(booth_id=booth.id,date=date,available_minutes=1439,
                                           open_time=time(0),close_time=time(23,59),is_closed=False))
        # Keep the stand's own virtual booth after the demo locations in lists and on the map.
        for local_booth in (await db.scalars(select(Booth).where(Booth.sort_order < 120))).all():
            local_booth.sort_order = 999
        await db.flush()
        if await db.get(UserFavoriteBooth,(user.id,booths[0].id)) is None:
            db.add(UserFavoriteBooth(user_id=user.id,booth_id=booths[0].id))
        for n,last4,card,default in [(1,'4242','Visa',True),(2,'5556','MasterCard',False)]:
            method_id=f'case-demo-method-{n}'
            if not await db.scalar(select(UserPaymentMethod.id).where(UserPaymentMethod.yookassa_payment_method_id==method_id)):
                db.add(UserPaymentMethod(user_id=user.id,yookassa_payment_method_id=method_id,last4=last4,
                                         card_type=card,is_default=default,status='active',is_active=True))
        if not await db.scalar(select(UserMinuteTransaction.id).where(UserMinuteTransaction.idempotency_key=='case-demo-minutes')):
            db.add(UserMinuteTransaction(user_id=user.id,transaction_type=MinuteTransactionType.early_finish_credit,
                   amount_minutes=30,balance_after_minutes=30,idempotency_key='case-demo-minutes',
                   description='Возврат минут после раннего завершения',created_at=now-timedelta(days=2)))
        minutes_entry = await db.scalar(select(UserMinuteTransaction).where(UserMinuteTransaction.idempotency_key=='case-demo-minutes'))
        if minutes_entry:
            minutes_entry.description = 'Возврат минут после раннего завершения'
        # Each fixture is identified by a synthetic local payment key. No provider calls.
        booking_ids = {}
        samples=[('active',now-timedelta(minutes=12),180,booths[1],BookingStatus.active),
                 ('scheduled',now.replace(hour=14,minute=0,second=0,microsecond=0)+timedelta(days=2),60,booths[0],BookingStatus.scheduled),
                 ('early',now+timedelta(minutes=8),60,booths[2],BookingStatus.scheduled)]
        for day in range(1,17):
            for visit in range(1+(day%3)):
                samples.append((f'history-{day}-{visit}',now.replace(hour=9+visit*3,minute=0,second=0,microsecond=0)-timedelta(days=day),
                                [30,60,120][(day+visit)%3],booths[(day+visit)%3],BookingStatus.completed))
        for key,start,minutes,booth,status in samples:
            marker=f'case-demo-{key}'
            payment=await db.scalar(select(Payment).where(Payment.idempotency_key==marker))
            if payment:
                if key in ('active','scheduled','early'):
                    booking=await db.get(Booking,payment.booking_id)
                    booking.start_time=start; booking.end_time=start+timedelta(minutes=minutes);booking.status=status
                    booking_ids[key]=booking.id
                continue
            amount=Decimal({30:375,60:690,120:1200,180:1800}[minutes])
            booking=Booking(user_id=user.id,booth_id=booth.id,start_time=start,end_time=start+timedelta(minutes=minutes),
                            created_at=start-timedelta(hours=4),duration_minutes=minutes,total_cost=amount,status=status)
            db.add(booking); await db.flush()
            db.add(Payment(user_id=user.id,booking_id=booking.id,amount=amount,status='succeeded',purpose='booking',
                           idempotency_key=marker,created_at=start-timedelta(hours=4),paid_at=start-timedelta(hours=4)))
            if key in ('active','scheduled','early'): booking_ids[key]=booking.id
        # Return-visit reward (dev branch): a demo campaign and one available bonus for the demo user.
        campaign = await db.scalar(select(ReturnCampaign).where(ReturnCampaign.name == 'Демо · возвращение в МИТ'))
        if campaign is None:
            campaign = ReturnCampaign(name='Демо · возвращение в МИТ', enabled=True, promo_code_ids=[], discount_percent=Decimal('25'),
                                      starts_at=now-timedelta(days=30), ends_at=now+timedelta(days=60))
            db.add(campaign); await db.flush()
        month_end = (now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)+timedelta(days=32)).replace(day=1)
        bonus = await db.scalar(select(ReturnBonus).where(ReturnBonus.campaign_id==campaign.id, ReturnBonus.user_id==user.id))
        source = await db.scalar(select(Payment.booking_id).where(Payment.idempotency_key=='case-demo-history-1-0'))
        if bonus is None:
            bonus = ReturnBonus(campaign_id=campaign.id, user_id=user.id, source_booking_id=source, discount_percent=Decimal('25'),
                                issued_at=now-timedelta(days=1), expires_at=month_end, status='available')
            db.add(bonus)
        else:
            bonus.status='available'; bonus.booking_id=None; bonus.revoked_at=None; bonus.expires_at=month_end
        await db.commit()
        print('Created isolated case fixtures; no real equipment or payment provider used.')
        print('Demo booth IDs:',[b.id for b in booths],'Booking IDs:',booking_ids)

asyncio.run(seed())
