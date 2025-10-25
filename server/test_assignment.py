#!/usr/bin/env python3
"""
Test script to verify the assignment server logic without Firebase.

This script demonstrates how the assignment logic works using mock data.
"""

import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MockAssignmentServer:
    """Mock version of the assignment server for testing."""
    
    def __init__(self):
        """Initialize the mock server with sample data."""
        # Sample unassigned questions
        self.questions = [
            {
                'id': 'q1',
                'data': {
                    'title': 'How to use Python?',
                    'content': 'I need help with Python basics',
                    'questioner': 'user1',
                    'assignee': None,
                    'createdAt': datetime.now()
                }
            },
            {
                'id': 'q2',
                'data': {
                    'title': 'What is Firebase?',
                    'content': 'Can someone explain Firebase?',
                    'questioner': 'user2',
                    'assignee': '',
                    'createdAt': datetime.now()
                }
            },
            {
                'id': 'q3',
                'data': {
                    'title': 'Help with JavaScript',
                    'content': 'Need assistance with async/await',
                    'questioner': 'user3',
                    'createdAt': datetime.now()
                }
            },
            {
                'id': 'q4',
                'data': {
                    'title': 'Database design question',
                    'content': 'What is the best way to structure my data?',
                    'questioner': 'user1',
                    'assignee': None,
                    'createdAt': datetime.now()
                }
            },
            {
                'id': 'q5',
                'data': {
                    'title': 'Already assigned question',
                    'content': 'This should be skipped',
                    'questioner': 'user2',
                    'assignee': 'expert1',
                    'createdAt': datetime.now()
                }
            }
        ]
        
        # Sample available users with FCM tokens
        self.users = ['expert1', 'expert2', 'expert3']
        
        # Mock user data with FCM tokens
        self.user_data = {
            'expert1': {'fcmToken': 'fcm_token_expert1', 'name': 'Expert 1'},
            'expert2': {'fcmToken': 'fcm_token_expert2', 'name': 'Expert 2'},
            'expert3': {'fcmToken': None, 'name': 'Expert 3'},  # No FCM token
        }
        
    def get_unassigned_questions(self):
        """Get questions without assignees."""
        unassigned = [
            q for q in self.questions 
            if 'assignee' not in q['data'] 
            or q['data'].get('assignee') is None 
            or q['data'].get('assignee') == ''
        ]
        logger.info(f"Found {len(unassigned)} unassigned questions")
        return unassigned
    
    def get_available_users(self):
        """Get available users."""
        logger.info(f"Found {len(self.users)} available users")
        return self.users
    
    def get_user_fcm_token(self, user_id):
        """Get FCM token for a user."""
        return self.user_data.get(user_id, {}).get('fcmToken')
    
    def send_push_notification(self, user_id, question_id, question_title):
        """Send a push notification to a user (mocked)."""
        fcm_token = self.get_user_fcm_token(user_id)
        
        if fcm_token:
            logger.info(f"  📱 Sending push notification to {user_id} (token: {fcm_token[:20]}...)")
            logger.info(f"     Title: 'New Question Assigned'")
            logger.info(f"     Body: 'You have been assigned: {question_title}'")
            logger.info(f"     Data: questionId={question_id}, type=question_assigned")
        else:
            logger.warning(f"  ⚠️  No FCM token for {user_id}, skipping notification")
    
    def assign_question(self, question_id, assignee_id, question_title="Untitled Question"):
        """Assign a question to a user."""
        for q in self.questions:
            if q['id'] == question_id:
                q['data']['assignee'] = assignee_id
                q['data']['updatedAt'] = datetime.now()
                logger.info(f"Assigned question '{question_title}' (ID: {question_id}) to user {assignee_id}")
                
                # Send push notification
                self.send_push_notification(assignee_id, question_id, question_title)
                return
    
    def assign_questions_round_robin(self):
        """Assign questions using round-robin."""
        logger.info("=" * 60)
        logger.info("Starting question assignment cycle...")
        logger.info("=" * 60)
        
        # Get unassigned questions
        unassigned_questions = self.get_unassigned_questions()
        
        if not unassigned_questions:
            logger.info("No unassigned questions found")
            return
        
        # Get available users
        available_users = self.get_available_users()
        
        if not available_users:
            logger.warning("No available users to assign questions to")
            return
        
        # Show questions before assignment
        logger.info("\nQuestions before assignment:")
        for q in self.questions:
            assignee = q['data'].get('assignee', 'None')
            logger.info(f"  - {q['id']}: '{q['data']['title']}' -> Assignee: {assignee}")
        
        # Assign questions using round-robin
        logger.info("\nAssigning questions...")
        user_index = 0
        for question in unassigned_questions:
            assignee_id = available_users[user_index % len(available_users)]
            question_title = question['data'].get('title', 'Untitled Question')
            self.assign_question(question['id'], assignee_id, question_title)
            user_index += 1
        
        # Show questions after assignment
        logger.info("\nQuestions after assignment:")
        for q in self.questions:
            assignee = q['data'].get('assignee', 'None')
            logger.info(f"  - {q['id']}: '{q['data']['title']}' -> Assignee: {assignee}")
        
        logger.info("=" * 60)
        logger.info(f"Assignment cycle completed. Assigned {len(unassigned_questions)} questions")
        logger.info("=" * 60)


def main():
    """Run the test."""
    logger.info("Question Assignment Server - Test Mode")
    logger.info("This demonstrates how the assignment logic works\n")
    
    server = MockAssignmentServer()
    server.assign_questions_round_robin()
    
    logger.info("\n✓ Test completed successfully!")
    logger.info("\nTo run the actual server:")
    logger.info("1. Set up Firebase credentials (see README.md)")
    logger.info("2. Install dependencies: pip install -r requirements.txt")
    logger.info("3. Run: python assignment_server.py")


if __name__ == "__main__":
    main()
