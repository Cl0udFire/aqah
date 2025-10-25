import logging
import random
from typing import Optional

from firebase_functions import firestore_fn, options
from firebase_admin import initialize_app, firestore, messaging

initialize_app()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_user_fcm_token(user_id: str) -> Optional[str]:
    db = firestore.client()
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()

    if user_doc.exists:
        user_data = user_doc.to_dict()
        return user_data.get('fcmToken')

    return None


def send_notification(
    user_id: str,
    title: str,
    body: str,
    data: dict
):
    fcm_token = get_user_fcm_token(user_id)

    if not fcm_token:
        logger.warning(f"User {user_id} does not have an FCM token registered")
        return

    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=data,
        token=fcm_token,
    )

    try:
        response = messaging.send(message)
        logger.info(f"Notification sent to user {user_id}: {response}")
    except Exception as e:
        logger.error(f"Failed to send notification to user {user_id}: {e}")


def get_available_users(exclude_user_id: str = None, exclude_users: list[str] = None) -> list[str]:
    db = firestore.client()
    users_ref = db.collection('users')
    users = users_ref.stream()

    excluded = set()
    if exclude_user_id:
        excluded.add(exclude_user_id)
    if exclude_users:
        excluded.update(exclude_users)

    user_ids = [user.id for user in users if user.id not in excluded]

    logger.info(f"Found {len(user_ids)} available users (excluded {len(excluded)} users)")
    return user_ids


@firestore_fn.on_document_created(
    document="questions/{questionId}",
    region="us-central1"
)
def assign_question_on_create(
    event: firestore_fn.Event[firestore_fn.DocumentSnapshot]
) -> None:
    question_data = event.data.to_dict()
    question_id = event.params["questionId"]

    if question_data.get('assignee'):
        logger.info(f"Question {question_id} already has an assignee")
        return

    questioner_id = question_data.get('questioner')
    question_title = question_data.get('title', 'Untitled Question')
    declined_by = question_data.get('declinedBy', [])

    available_users = get_available_users(
        exclude_user_id=questioner_id,
        exclude_users=declined_by
    )

    if not available_users:
        logger.warning(f"No available users to assign question {question_id}")
        return

    assignee_id = random.choice(available_users)

    db = firestore.client()
    question_ref = db.collection('questions').document(question_id)
    question_ref.update({
        'assignee': assignee_id,
        'updatedAt': firestore.SERVER_TIMESTAMP
    })

    logger.info(f"Question {question_id} assigned to user {assignee_id}")

    send_notification(
        user_id=assignee_id,
        title='질문이 배정되었습니다!',
        body=f'{question_title}',
        data={
            'questionId': question_id,
            'type': 'question_assigned',
        }
    )


@firestore_fn.on_document_updated(
    document="questions/{questionId}",
    region="us-central1"
)
def notify_on_answer_added(
    event: firestore_fn.Event[firestore_fn.Change[firestore_fn.DocumentSnapshot]]
) -> None:
    before_data = event.data.before.to_dict() if event.data.before else {}
    after_data = event.data.after.to_dict() if event.data.after else {}
    question_id = event.params["questionId"]

    # Handle question decline and reassignment
    before_assignee = before_data.get('assignee')
    after_assignee = after_data.get('assignee')
    before_declined_by = before_data.get('declinedBy', [])
    after_declined_by = after_data.get('declinedBy', [])

    # Check if assignee was removed and declinedBy was updated
    if before_assignee and not after_assignee and len(after_declined_by) > len(before_declined_by):
        logger.info(f"Question {question_id} was declined, triggering reassignment")
        
        questioner_id = after_data.get('questioner')
        question_title = after_data.get('title', 'Untitled Question')
        
        available_users = get_available_users(
            exclude_user_id=questioner_id,
            exclude_users=after_declined_by
        )
        
        if not available_users:
            logger.warning(f"No available users to reassign question {question_id}")
            return
        
        new_assignee_id = random.choice(available_users)
        
        db = firestore.client()
        question_ref = db.collection('questions').document(question_id)
        question_ref.update({
            'assignee': new_assignee_id,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        
        logger.info(f"Question {question_id} reassigned to user {new_assignee_id}")
        
        send_notification(
            user_id=new_assignee_id,
            title='질문이 배정되었습니다!',
            body=f'{question_title}',
            data={
                'questionId': question_id,
                'type': 'question_assigned',
            }
        )
        return

    before_answers = before_data.get('answers', [])
    after_answers = after_data.get('answers', [])

    if len(after_answers) <= len(before_answers):
        return

    new_answers = after_answers[len(before_answers):]

    questioner_id = after_data.get('questioner')
    assignee_id = after_data.get('assignee')
    question_title = after_data.get('title', 'Untitled Question')

    for answer in new_answers:
        sender = answer.get('sender')
        content = answer.get('content', '')

        if sender == 'answerer':
            if questioner_id:
                send_notification(
                    user_id=questioner_id,
                    title='답변이 도착했습니다!',
                    body=f'{question_title}: {content[:50]}...' if len(content) > 50 else f'{question_title}: {content}',
                    data={
                        'questionId': question_id,
                        'type': 'answer_added',
                    }
                )
                logger.info(f"Notified questioner {questioner_id} about answer on question {question_id}")

        elif sender == 'questioner':
            if assignee_id:
                send_notification(
                    user_id=assignee_id,
                    title='추가 질문이 있습니다!',
                    body=f'{question_title}: {content[:50]}...' if len(content) > 50 else f'{question_title}: {content}',
                    data={
                        'questionId': question_id,
                        'type': 'extra_question_added',
                    }
                )
                logger.info(f"Notified answerer {assignee_id} about extra question on question {question_id}")
