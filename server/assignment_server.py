#!/usr/bin/env python3
"""
Question Assignment Server

This server automatically assigns questions to users every minute.
Questions without an assignee or with an empty string assignee will be assigned to available users.
"""

import os
import sys
import time
import logging
from datetime import datetime
from typing import List, Optional
import schedule
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

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
    """Server that handles automatic question assignment."""
    
    def __init__(self):
        """Initialize the assignment server."""
        self.db = None
        self.initialize_firebase()
        
    def initialize_firebase(self):
        """Initialize Firebase Admin SDK."""
        try:
            # Load environment variables
            load_dotenv()
            
            credentials_path = os.getenv('FIREBASE_CREDENTIALS_PATH', './firebase-credentials.json')
            
            if not os.path.exists(credentials_path):
                logger.error(f"Firebase credentials file not found at: {credentials_path}")
                logger.error("Please create a Firebase service account key and update FIREBASE_CREDENTIALS_PATH")
                sys.exit(1)
            
            # Initialize Firebase Admin
            cred = credentials.Certificate(credentials_path)
            firebase_admin.initialize_app(cred)
            
            # Get Firestore client
            self.db = firestore.client()
            logger.info("Firebase Admin SDK initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            sys.exit(1)
    
    def get_unassigned_questions(self) -> List[dict]:
        """
        Get all questions that don't have an assignee or have an empty string assignee.
        
        Returns:
            List of question documents with their IDs
        """
        try:
            questions_ref = self.db.collection('questions')
            
            # Query for questions with no assignee field
            unassigned_1 = questions_ref.where(
                filter=firestore.FieldFilter('assignee', '==', None)
            ).stream()
            
            # Query for questions with empty string assignee
            unassigned_2 = questions_ref.where(
                filter=firestore.FieldFilter('assignee', '==', '')
            ).stream()
            
            # Also get questions where assignee field doesn't exist
            all_questions = questions_ref.stream()
            
            unassigned_questions = []
            processed_ids = set()
            
            # Process questions without assignee field
            for doc in all_questions:
                doc_dict = doc.to_dict()
                if 'assignee' not in doc_dict or doc_dict.get('assignee') is None or doc_dict.get('assignee') == '':
                    if doc.id not in processed_ids:
                        unassigned_questions.append({
                            'id': doc.id,
                            'data': doc_dict
                        })
                        processed_ids.add(doc.id)
            
            logger.info(f"Found {len(unassigned_questions)} unassigned questions")
            return unassigned_questions
            
        except Exception as e:
            logger.error(f"Error getting unassigned questions: {e}")
            return []
    
    def get_available_users(self) -> List[str]:
        """
        Get list of available users who can be assigned questions.
        
        For now, this gets all users from Firebase Auth.
        In a production system, you might want to filter by user role or availability.
        
        Returns:
            List of user IDs
        """
        try:
            # Get users from Firestore users collection if it exists
            users_ref = self.db.collection('users')
            users = users_ref.stream()
            
            user_ids = [user.id for user in users]
            
            if user_ids:
                logger.info(f"Found {len(user_ids)} available users")
                return user_ids
            else:
                # If no users collection exists, log a warning
                logger.warning("No users found in 'users' collection")
                logger.warning("Questions will not be assigned until users are available")
                return []
                
        except Exception as e:
            logger.error(f"Error getting available users: {e}")
            return []
    
    def assign_question(self, question_id: str, assignee_id: str):
        """
        Assign a question to a user.
        
        Args:
            question_id: The ID of the question to assign
            assignee_id: The ID of the user to assign the question to
        """
        try:
            question_ref = self.db.collection('questions').document(question_id)
            question_ref.update({
                'assignee': assignee_id,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
            logger.info(f"Assigned question {question_id} to user {assignee_id}")
            
        except Exception as e:
            logger.error(f"Error assigning question {question_id} to user {assignee_id}: {e}")
    
    def assign_questions_round_robin(self):
        """
        Assign unassigned questions to available users using round-robin distribution.
        """
        try:
            logger.info("Starting question assignment cycle...")
            
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
            
            # Assign questions using round-robin
            user_index = 0
            for question in unassigned_questions:
                assignee_id = available_users[user_index % len(available_users)]
                self.assign_question(question['id'], assignee_id)
                user_index += 1
            
            logger.info(f"Assignment cycle completed. Assigned {len(unassigned_questions)} questions")
            
        except Exception as e:
            logger.error(f"Error in assignment cycle: {e}")
    
    def run_scheduler(self):
        """Run the scheduler to assign questions periodically."""
        # Get assignment interval from environment or use default (60 seconds)
        interval_seconds = int(os.getenv('ASSIGNMENT_INTERVAL', '60'))
        
        logger.info(f"Starting question assignment server (interval: {interval_seconds} seconds)")
        
        # Schedule the assignment task
        schedule.every(interval_seconds).seconds.do(self.assign_questions_round_robin)
        
        # Run the first assignment immediately
        self.assign_questions_round_robin()
        
        # Run the scheduler
        try:
            while True:
                schedule.run_pending()
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Server stopped by user")
        except Exception as e:
            logger.error(f"Server error: {e}")
            raise


def main():
    """Main entry point for the assignment server."""
    try:
        server = QuestionAssignmentServer()
        server.run_scheduler()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
