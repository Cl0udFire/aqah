import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'dart:developer' as developer;
import 'navigation_service.dart';
import '../screens/question_detail_screen.dart';

class FCMService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  Future<void> initialize() async {
    try {
      NotificationSettings settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        developer.log('FCM: User granted permission');

        await _saveTokenToFirestore();

        FirebaseMessaging.instance.onTokenRefresh.listen(_updateToken);

        FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

        FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);

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

      await _firestore.collection('users').doc(user.uid).set({
        'fcmToken': token,
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      developer.log('FCM: Token saved to Firestore');
    } catch (e) {
      developer.log('FCM: Error saving token: $e');
    }
  }

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

  void _handleForegroundMessage(RemoteMessage message) {
    developer.log('FCM: Foreground message received');
    developer.log('FCM: Title: ${message.notification?.title}');
    developer.log('FCM: Body: ${message.notification?.body}');
    developer.log('FCM: Data: ${message.data}');

    // Show in-app notification
    final context = NavigationService.context;
    if (context != null) {
      final questionId = message.data['questionId'];

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                message.notification?.title ?? '새 알림',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              if (message.notification?.body != null)
                Text(message.notification!.body!),
            ],
          ),
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.only(bottom: 80, left: 16, right: 16),
          action: questionId != null
              ? SnackBarAction(
                  label: '보기',
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) =>
                            QuestionDetailScreen(questionId: questionId),
                      ),
                    );
                  },
                )
              : null,
        ),
      );
    }
  }

  void _handleBackgroundMessage(RemoteMessage message) {
    developer.log('FCM: Background message opened');
    developer.log('FCM: Title: ${message.notification?.title}');
    developer.log('FCM: Body: ${message.notification?.body}');
    developer.log('FCM: Data: ${message.data}');

    final questionId = message.data['questionId'];
    if (questionId != null) {
      developer.log('FCM: Navigating to question: $questionId');

      final context = NavigationService.context;
      if (context != null) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => QuestionDetailScreen(questionId: questionId),
          ),
        );
      }
    }
  }

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

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  developer.log('FCM: Handling background message: ${message.messageId}');
  developer.log('FCM: Title: ${message.notification?.title}');
  developer.log('FCM: Body: ${message.notification?.body}');
}
