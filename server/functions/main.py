"""
Firebase Functions for AQAH Question Assignment System

This module contains Firebase Cloud Functions for:
1. Assigning questions to answerers when questions are created
2. Sending notifications when answers are added (to questioners)
3. Sending notifications when extra answers are added (to answerers)
"""

import logging
import random
from typing import Optional

from firebase_functions import firestore_fn, options
from firebase_admin import initialize_app, firestore, messaging

# Initialize Firebase Admin SDK
initialize_app()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_user_fcm_token(user_id: str) -> Optional[str]:
    """
    Retrieve FCM token for a user.
    
    Args:
        user_id: The user ID to get the token for
        
    Returns:
        The FCM token if found, None otherwise
    """
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
    """
    Send a push notification to a user via FCM.
    
    Args:
        user_id: The user ID to send notification to
        title: Notification title
        body: Notification body
        data: Additional data to send with the notification
    """
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


def get_available_users(exclude_user_id: str = None) -> list[str]:
    """
    Get list of available users from Firestore.
    
    Args:
        exclude_user_id: User ID to exclude from the list (e.g., the questioner)
        
    Returns:
        List of user IDs
    """
    db = firestore.client()
    users_ref = db.collection('users')
    users = users_ref.stream()
    
    user_ids = [user.id for user in users if user.id != exclude_user_id]
    
    logger.info(f"Found {len(user_ids)} available users")
    return user_ids


@firestore_fn.on_document_created(
    document="questions/{questionId}",
    region="us-central1"
)
def assign_question_on_create(
    event: firestore_fn.Event[firestore_fn.DocumentSnapshot]
) -> None:
    """
    Automatically assign a newly created question to an available user.
    
    This function triggers when a new question document is created in Firestore.
    It assigns the question to a random available user (excluding the questioner)
    and sends a push notification to the assignee.
    """
    question_data = event.data.to_dict()
    question_id = event.params["questionId"]
    
    # Skip if already assigned
    if question_data.get('assignee'):
        logger.info(f"Question {question_id} already has an assignee")
        return
    
    questioner_id = question_data.get('questioner')
    question_title = question_data.get('title', 'Untitled Question')
    
    # Get available users (excluding the questioner)
    available_users = get_available_users(exclude_user_id=questioner_id)
    
    if not available_users:
        logger.warning(f"No available users to assign question {question_id}")
        return
    
    # Randomly select a user
    assignee_id = random.choice(available_users)
    
    # Update the question with the assignee
    db = firestore.client()
    question_ref = db.collection('questions').document(question_id)
    question_ref.update({
        'assignee': assignee_id,
        'updatedAt': firestore.SERVER_TIMESTAMP
    })
    
    logger.info(f"Question {question_id} assigned to user {assignee_id}")
    
    # Send notification to the assignee
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
    """
    Send notifications when answers are added to a question.
    
    This function triggers when a question document is updated.
    It checks if new answers were added and sends notifications:
    - To the questioner when an answer is added by the answerer
    - To the answerer when an additional answer/question is added by the questioner
    """
    before_data = event.data.before.to_dict() if event.data.before else {}
    after_data = event.data.after.to_dict() if event.data.after else {}
    question_id = event.params["questionId"]
    
    before_answers = before_data.get('answers', [])
    after_answers = after_data.get('answers', [])
    
    # Check if answers were added
    if len(after_answers) <= len(before_answers):
        return
    
    # Get the new answers
    new_answers = after_answers[len(before_answers):]
    
    questioner_id = after_data.get('questioner')
    assignee_id = after_data.get('assignee')
    question_title = after_data.get('title', 'Untitled Question')
    
    for answer in new_answers:
        sender = answer.get('sender')
        content = answer.get('content', '')
        
        # Determine who to notify based on who sent the answer
        if sender == 'answerer':
            # Answer from answerer -> notify questioner
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
            # Additional question from questioner -> notify answerer
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
