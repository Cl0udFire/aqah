import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'dart:developer' as developer;

/// Service to handle Firebase Cloud Messaging (FCM) for push notifications
class FCMService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  /// Initialize FCM and request permissions
  Future<void> initialize() async {
    try {
      // Request permission for notifications
      NotificationSettings settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        developer.log('FCM: User granted permission');

        // Get and save FCM token
        await _saveTokenToFirestore();

        // Listen for token refresh
        FirebaseMessaging.instance.onTokenRefresh.listen(_updateToken);

        // Handle foreground messages
        FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

        // Handle background messages (when app is in background but not terminated)
        FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);

        // Handle messages when app is opened from terminated state
        RemoteMessage? initialMessage = await _messaging.getInitialMessage();
        if (initialMessage != null) {
          _handleBackgroundMessage(initialMessage);
        }
      } else if (settings.authorizationStatus ==
          AuthorizationStatus.provisional) {
        developer.log('FCM: User granted provisional permission');
      } else {
        developer.log('FCM: User declined or has not accepted permission');
      }
    } catch (e) {
      developer.log('FCM: Error initializing: $e');
    }
  }

  /// Save FCM token to Firestore user document
  Future<void> _saveTokenToFirestore() async {
    try {
      final user = _auth.currentUser;
      if (user == null) {
        developer.log('FCM: No user logged in, skipping token save');
        return;
      }

      final token = await _messaging.getToken();
      if (token == null) {
        developer.log('FCM: Failed to get FCM token');
        return;
      }

      developer.log('FCM: Got token: ${token.substring(0, 20)}...');

      // Save token to user document in Firestore
      await _firestore.collection('users').doc(user.uid).set({
        'fcmToken': token,
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      developer.log('FCM: Token saved to Firestore');
    } catch (e) {
      developer.log('FCM: Error saving token: $e');
    }
  }

  /// Update FCM token in Firestore when it changes
  Future<void> _updateToken(String token) async {
    try {
      final user = _auth.currentUser;
      if (user == null) return;

      await _firestore.collection('users').doc(user.uid).update({
        'fcmToken': token,
        'updatedAt': FieldValue.serverTimestamp(),
      });

      developer.log('FCM: Token updated in Firestore');
    } catch (e) {
      developer.log('FCM: Error updating token: $e');
    }
  }

  /// Handle foreground messages (when app is in the foreground)
  void _handleForegroundMessage(RemoteMessage message) {
    developer.log('FCM: Foreground message received');
    developer.log('FCM: Title: ${message.notification?.title}');
    developer.log('FCM: Body: ${message.notification?.body}');
    developer.log('FCM: Data: ${message.data}');

    // You can show a local notification or update UI here
    // For now, we just log it
  }

  /// Handle background messages (when app is in background or opened from notification)
  void _handleBackgroundMessage(RemoteMessage message) {
    developer.log('FCM: Background message received');
    developer.log('FCM: Title: ${message.notification?.title}');
    developer.log('FCM: Body: ${message.notification?.body}');
    developer.log('FCM: Data: ${message.data}');

    // Handle navigation based on notification data
    final questionId = message.data['questionId'];
    if (questionId != null) {
      developer.log('FCM: Question assigned: $questionId');
      // You can navigate to the question detail screen here
    }
  }

  /// Delete FCM token from Firestore (call on logout)
  Future<void> deleteToken() async {
    try {
      final user = _auth.currentUser;
      if (user == null) return;

      await _firestore.collection('users').doc(user.uid).update({
        'fcmToken': FieldValue.delete(),
        'updatedAt': FieldValue.serverTimestamp(),
      });

      await _messaging.deleteToken();
      developer.log('FCM: Token deleted');
    } catch (e) {
      developer.log('FCM: Error deleting token: $e');
    }
  }
}

/// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  developer.log('FCM: Handling background message: ${message.messageId}');
  developer.log('FCM: Title: ${message.notification?.title}');
  developer.log('FCM: Body: ${message.notification?.body}');
}
