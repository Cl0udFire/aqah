# AQAH - Ask Question, Answer Here

A Flutter application for Q&A with automatic question assignment and push notifications.

## Features

- **User Authentication**: Google Sign-In integration
- **Question Management**: Create, view, and answer questions
- **Automatic Assignment**: Server-side automatic question assignment
- **Push Notifications**: Real-time FCM notifications when questions are assigned

## Push Notifications

The app uses Firebase Cloud Messaging (FCM) to receive push notifications when questions are assigned to users.

### How It Works

1. **Automatic Registration**: When a user logs in, the app automatically:
   - Requests notification permissions
   - Obtains an FCM token from Firebase
   - Saves the token to the user's Firestore document under the `fcmToken` field

2. **Token Management**: The app handles:
   - Token refresh (updates Firestore when FCM token changes)
   - Token deletion on logout

3. **Notification Handling**:
   - **Foreground**: Notifications are logged when app is in foreground
   - **Background**: Opens app and logs notification details
   - **Terminated**: Gets initial message and handles it on app start

### Implementation Details

The FCM service is implemented in `lib/services/fcm_service.dart` and:
- Initialized automatically when users log in (in `AuthWrapper`)
- Saves FCM tokens to Firestore `users/{userId}` collection
- Handles notification permissions and token refresh
- Processes incoming notifications with question assignment data

### Notification Payload

Notifications from the server include:
```json
{
  "notification": {
    "title": "New Question Assigned",
    "body": "You have been assigned: [Question Title]"
  },
  "data": {
    "questionId": "question_id_here",
    "type": "question_assigned"
  }
}
```

## Getting Started

### Prerequisites

- Flutter SDK (^3.9.2)
- Firebase project with:
  - Authentication enabled
  - Firestore database
  - Cloud Messaging enabled

### Setup

1. **Install Dependencies**
   ```bash
   flutter pub get
   ```

2. **Firebase Configuration**
   - Ensure `firebase_options.dart` is properly configured
   - Make sure FCM is enabled in Firebase Console

3. **Run the App**
   ```bash
   flutter run
   ```

### Required Permissions

- **Android**: Push notification permissions are requested at runtime
- **iOS**: Notification permissions are requested when user logs in

## Dependencies

- `firebase_core`: Firebase SDK initialization
- `firebase_auth`: User authentication
- `firebase_messaging`: Push notifications
- `cloud_firestore`: Database
- `google_sign_in`: Google authentication

## Development

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
