import os
import sys
import time
import logging
from datetime import datetime
from typing import List, Optional
import schedule
import firebase_admin
from firebase_admin import credentials, firestore, messaging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('assignment_server.log')
    ]
)
logger = logging.getLogger(__name__)


class QuestionAssignmentServer:
    def __init__(self):
        cred = credentials.Certificate('./firebase-credentials.json')
        firebase_admin.initialize_app(cred)

        self.db = firestore.client()
        logger.info("SDK 초기화 완료")

    def get_unassigned_questions(self) -> List[dict]:
        questions_ref = self.db.collection('questions')

        all_questions = questions_ref.stream()

        unassigned_questions = []
        processed_ids = set()

        for doc in all_questions:
            doc_dict = doc.to_dict()
            if 'assignee' not in doc_dict or doc_dict.get('assignee') is None or doc_dict.get('assignee') == '':
                if doc.id not in processed_ids:
                    unassigned_questions.append({
                        'id': doc.id,
                        'data': doc_dict
                    })
                    processed_ids.add(doc.id)

        logger.info(f"{len(unassigned_questions)}개의 미배정 질문 발견됨")
        return unassigned_questions

    def get_available_users(self) -> List[str]:
        users_ref = self.db.collection('users')
        users = users_ref.stream()

        user_ids = [user.id for user in users]

        if user_ids:
            logger.info(f"{len(user_ids)}명의 유저 발견됨")
            return user_ids
        else:
            logger.warning("유저가 없습니다.")
            return []

    def get_user_fcm_token(self, user_id: str) -> Optional[str]:
        user_ref = self.db.collection('users').document(user_id)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            return user_data.get('fcmToken')

        return None

    def send_push_notification(self, user_id: str, question_id: str, question_title: str):
        fcm_token = self.get_user_fcm_token(user_id)

        if not fcm_token:
            logger.warning(f"{user_id}에게 FCM 토큰이 없습니다.")
            return

        message = messaging.Message(
            notification=messaging.Notification(
                title='질문이 배정되었습니다!',
                body=f'{question_title}',
            ),
            data={
                'questionId': question_id,
                'type': 'question_assigned',
            },
            token=fcm_token,
        )

        response = messaging.send(message)
        logger.info(f"{user_id} 유저에게  {question_id} 배정 알림 전송됨: {response}")

    def assign_question(self, question_id: str, assignee_id: str, question_title: str = ""):
        question_ref = self.db.collection('questions').document(question_id)
        question_ref.update({
            'assignee': assignee_id,
            'updatedAt': datetime.now()
        })
        logger.info(f"{question_id} 질문이 유저 {assignee_id}에게 배정됨")

        self.send_push_notification(assignee_id, question_id, question_title)

    def assign_questions_round_robin(self):
        logger.info("배정 시작")

        unassigned_questions = self.get_unassigned_questions()

        if not unassigned_questions:
            logger.info("배정되지 않은 질문 없음")
            return

        available_users = self.get_available_users()

        if not available_users:
            logger.warning("배정할 유저 없음")
            return

        user_index = 0
        for question in unassigned_questions:
            assignee_id = available_users[user_index % len(available_users)]
            question_title = question['data'].get('title', 'Untitled Question')
            self.assign_question(question['id'], assignee_id, question_title)
            user_index += 1

        logger.info(f"{len(unassigned_questions)}개의 질문 배정 완료")

    def run_scheduler(self):
        logger.info(f"서버 시작")

        schedule.every(60).seconds.do(self.assign_questions_round_robin)

        self.assign_questions_round_robin()

        try:
            while True:
                schedule.run_pending()
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("서버 종료")

if __name__ == "__main__":
    server = QuestionAssignmentServer()
    server.run_scheduler()
