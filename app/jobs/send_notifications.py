from datetime import timedelta as td
from typing import Any

from fastapi.encoders import jsonable_encoder
from requests import Session

from app import logger, on_shutdown, scheduler
from app.config import settings
from app.db import GetDB
from app.db.models import NotificationReminder
from app.utils.helpers import utcnow
from app.utils.notification import queue

session = Session()

headers = {"x-webhook-secret": settings.webhook_secret} if settings.webhook_secret else None


def send(data: list[dict[Any, Any]]) -> bool:
    """Send the notification to the webhook address provided by WEBHOOK_ADDRESS

    Args:
        data (List[Dict[Any, Any]]): list of json encoded notifications

    Returns:
        bool: returns True if an ok response received
    """

    result_list = []
    for webhook in settings.webhook_address:
        result = send_req(w_address=webhook, data=data)
        result_list.append(result)
    return True in result_list


def send_req(w_address: str, data):
    try:
        logger.debug(f"Sending {len(data)} webhook updates to {w_address}")
        r = session.post(w_address, json=data, headers=headers)
        if r.ok:
            return True
        logger.error(r)
    except Exception as err:
        logger.error(err)
    return False


def send_notifications():
    if not queue:
        return

    notifications_to_send = []
    try:
        while notification := queue.popleft():
            if notification.tries > settings.number_of_recurrent_notifications:
                continue
            if notification.send_at > utcnow().timestamp():
                queue.append(notification)  # add it to the queue again for the next check
                continue
            notifications_to_send.append(notification)
    except IndexError:  # if the queue is empty
        pass

    if not notifications_to_send:
        return
    if not send([jsonable_encoder(notif) for notif in notifications_to_send]):
        for notification in notifications_to_send:
            if (notification.tries + 1) > settings.number_of_recurrent_notifications:
                continue
            notification.tries += 1
            notification.send_at = (  # schedule notification for n seconds later
                utcnow() + td(seconds=settings.recurrent_notifications_timeout)
            ).timestamp()
            queue.append(notification)


def delete_expired_reminders() -> None:
    with GetDB() as db:
        db.query(NotificationReminder).filter(NotificationReminder.expires_at < utcnow()).delete()
        db.commit()


if settings.webhook_address:

    @on_shutdown
    def app_shutdown():
        logger.info("Sending pending notifications before shutdown...")
        send_notifications()

    logger.info("Send webhook job started")
    scheduler.add_job(
        send_notifications, "interval", seconds=settings.job_send_notifications_interval, replace_existing=True
    )
    scheduler.add_job(delete_expired_reminders, "interval", hours=2, start_date=utcnow() + td(minutes=1))
