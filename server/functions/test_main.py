"""
Unit tests for Firebase Functions

These tests validate the basic logic patterns used in the Firebase Functions.
Full integration testing should be done using Firebase Emulator Suite.
"""

import unittest
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# Add parent directory to path to import main
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Mock Firebase modules before importing main
sys.modules['firebase_functions'] = MagicMock()
sys.modules['firebase_functions.firestore_fn'] = MagicMock()
sys.modules['firebase_functions.options'] = MagicMock()
sys.modules['firebase_admin'] = MagicMock()
sys.modules['firebase_admin.credentials'] = MagicMock()
sys.modules['firebase_admin.firestore'] = MagicMock()
sys.modules['firebase_admin.messaging'] = MagicMock()
sys.modules['google.cloud.firestore_v1.base_query'] = MagicMock()


class TestFirebaseFunctions(unittest.TestCase):
    """Test cases for Firebase Functions"""
    
    @patch('main.firestore.client')
    def test_get_user_fcm_token_exists(self, mock_firestore):
        """Test getting FCM token for a user that has one"""
        from main import get_user_fcm_token
        
        # Mock Firestore response
        mock_db = MagicMock()
        mock_firestore.return_value = mock_db
        
        mock_user_doc = MagicMock()
        mock_user_doc.exists = True
        mock_user_doc.to_dict.return_value = {'fcmToken': 'test_token_123'}
        
        mock_db.collection.return_value.document.return_value.get.return_value = mock_user_doc
        
        # Test
        token = get_user_fcm_token('user123')
        
        # Verify
        self.assertEqual(token, 'test_token_123')
        mock_db.collection.assert_called_once_with('users')
        mock_db.collection.return_value.document.assert_called_once_with('user123')
    
    @patch('main.firestore.client')
    def test_get_user_fcm_token_not_exists(self, mock_firestore):
        """Test getting FCM token for a user that doesn't have one"""
        from main import get_user_fcm_token
        
        # Mock Firestore response
        mock_db = MagicMock()
        mock_firestore.return_value = mock_db
        
        mock_user_doc = MagicMock()
        mock_user_doc.exists = False
        
        mock_db.collection.return_value.document.return_value.get.return_value = mock_user_doc
        
        # Test
        token = get_user_fcm_token('user456')
        
        # Verify
        self.assertIsNone(token)
    
    @patch('main.firestore.client')
    def test_get_available_users(self, mock_firestore):
        """Test getting list of available users"""
        from main import get_available_users
        
        # Mock Firestore response
        mock_db = MagicMock()
        mock_firestore.return_value = mock_db
        
        # Create mock users
        mock_users = [
            MagicMock(id='user1'),
            MagicMock(id='user2'),
            MagicMock(id='user3'),
            MagicMock(id='excluded_user'),
        ]
        
        mock_db.collection.return_value.stream.return_value = mock_users
        
        # Test without exclusion
        users = get_available_users()
        self.assertEqual(len(users), 4)
        self.assertIn('user1', users)
        
        # Test with exclusion
        users = get_available_users(exclude_user_id='excluded_user')
        self.assertEqual(len(users), 3)
        self.assertNotIn('excluded_user', users)
    
    @patch('main.messaging.send')
    @patch('main.get_user_fcm_token')
    def test_send_notification_success(self, mock_get_token, mock_send):
        """Test sending notification successfully"""
        from main import send_notification
        
        # Mock
        mock_get_token.return_value = 'valid_token'
        mock_send.return_value = 'message_id_123'
        
        # Test
        send_notification(
            user_id='user123',
            title='Test Title',
            body='Test Body',
            data={'key': 'value'}
        )
        
        # Verify
        mock_get_token.assert_called_once_with('user123')
        mock_send.assert_called_once()
    
    @patch('main.logger')
    @patch('main.get_user_fcm_token')
    def test_send_notification_no_token(self, mock_get_token, mock_logger):
        """Test sending notification when user has no FCM token"""
        from main import send_notification
        
        # Mock
        mock_get_token.return_value = None
        
        # Test
        send_notification(
            user_id='user_without_token',
            title='Test Title',
            body='Test Body',
            data={'key': 'value'}
        )
        
        # Verify warning was logged
        mock_logger.warning.assert_called()


if __name__ == '__main__':
    unittest.main()
