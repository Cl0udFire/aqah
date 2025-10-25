import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'login_screen.dart';
import 'questions_screen.dart';
import '../services/fcm_service.dart';

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  final FCMService _fcmService = FCMService();

  @override
  void initState() {
    super.initState();
    // Listen to auth state changes and initialize FCM when user logs in
    FirebaseAuth.instance.authStateChanges().listen((User? user) {
      if (user != null) {
        // User is logged in, initialize FCM
        _fcmService.initialize();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        // Show loading indicator while checking auth state
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        // If user is logged in, show questions screen
        if (snapshot.hasData && snapshot.data != null) {
          return const QuestionsScreen();
        }

        // Otherwise, show login screen
        return const LoginScreen();
      },
    );
  }
}
