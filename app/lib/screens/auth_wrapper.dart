import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:expressive_loading_indicator/expressive_loading_indicator.dart';
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
    FirebaseAuth.instance.authStateChanges().listen((User? user) {
      if (user != null) {
        _fcmService.initialize();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: ExpressiveLoadingIndicator()),
          );
        }

        if (snapshot.hasData && snapshot.data != null) {
          return const QuestionsScreen();
        }

        return const LoginScreen();
      },
    );
  }
}
