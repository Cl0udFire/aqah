# Firebase Functions (Python)

This directory contains Firebase Cloud Functions for the AQAH question assignment system, implemented using Python.

## Overview

The Firebase Functions automatically handle:

1. **Question Assignment**: When a new question is created, it is automatically assigned to a random available user (excluding the questioner)
2. **Answer Notifications**: When an answerer adds an answer, the questioner receives a push notification
3. **Extra Question Notifications**: When a questioner adds additional questions/clarifications, the answerer receives a push notification

## Migration from Server

This replaces the previous `assignment_server.py` which ran as a continuous process. The Firebase Functions approach is:
- **Event-driven**: Responds to Firestore document changes in real-time
- **Serverless**: No need to maintain a running server
- **Scalable**: Automatically scales with demand
- **Cost-effective**: Only runs when triggered by events

## Functions

### 1. `assign_question_on_create`
- **Trigger**: Firestore document created in `questions/{questionId}`
- **Action**: 
  - Assigns the question to a random available user (excluding the questioner)
  - Sends FCM push notification to the assignee
- **Notification**: "질문이 배정되었습니다!" (Question assigned!)

### 2. `notify_on_answer_added`
- **Trigger**: Firestore document updated in `questions/{questionId}`
- **Action**: 
  - Detects when new answers are added to the `answers` array
  - Sends appropriate notifications based on who sent the answer:
    - If `sender == "answerer"`: Notifies the questioner about the answer
    - If `sender == "questioner"`: Notifies the answerer about the extra question
- **Notifications**:
  - For answerer's response: "답변이 도착했습니다!" (Answer received!)
  - For questioner's follow-up: "추가 질문이 있습니다!" (Additional question!)

## Data Structure

### Question Document
```json
{
  "title": "string",
  "content": "string",
  "questioner": "userId",
  "assignee": "userId",
  "answers": [
    {
      "content": "string",
      "sender": "questioner | answerer",
      "timestamp": "Timestamp"
    }
  ],
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### User Document
```json
{
  "fcmToken": "string",
  // other user fields...
}
```

## Setup

### Prerequisites
- Firebase project with Firestore database
- Firebase CLI installed: `npm install -g firebase-tools`
- Python 3.12+ installed

### Installation

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Initialize Firebase** (if not already done):
```bash
cd /path/to/aqah
firebase init functions
# Select Python as the language
# Select "us-central1" as the region
# Choose to use an existing project or create a new one
```

4. **Install dependencies**:
```bash
cd server/functions
pip install -r requirements.txt
```

### Deployment

Deploy all functions:
```bash
firebase deploy --only functions
```

Deploy a specific function:
```bash
firebase deploy --only functions:assign_question_on_create
firebase deploy --only functions:notify_on_answer_added
```

### Local Testing

You can test the functions locally using the Firebase Emulator Suite:

1. **Install emulators**:
```bash
firebase init emulators
# Select Firestore and Functions emulators
```

2. **Start emulators**:
```bash
firebase emulators:start
```

3. **Test with emulator UI**:
- Open the Emulator UI (usually at http://localhost:4000)
- Create test documents in Firestore
- Monitor function logs and execution

## Environment Variables

Firebase Functions automatically have access to Firebase Admin SDK credentials when deployed. For local development with emulators, you may need to set:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

## Monitoring

### View Logs

View real-time logs:
```bash
firebase functions:log
```

View logs for a specific function:
```bash
firebase functions:log --only assign_question_on_create
```

### Firebase Console

Monitor function execution, errors, and performance in the Firebase Console:
- Navigate to Functions section
- View invocation counts, execution times, and error rates
- Set up alerts for function failures

## Differences from Previous Implementation

| Feature | Old (assignment_server.py) | New (Firebase Functions) |
|---------|---------------------------|--------------------------|
| Execution | Continuous polling (every 60s) | Event-driven (instant) |
| Infrastructure | Requires dedicated server | Serverless |
| Scaling | Manual | Automatic |
| Assignment | Batch processing | Real-time on creation |
| Notifications | On assignment only | On assignment + answers |
| Maintenance | Requires monitoring/restart | Managed by Firebase |

## Cost Considerations

Firebase Functions pricing is based on:
- Number of invocations
- Compute time
- Memory usage
- Outbound network traffic

For this application:
- `assign_question_on_create`: Runs once per new question
- `notify_on_answer_added`: Runs once per question update (when answers added)

Both functions are lightweight and should fall within Firebase's free tier for low to moderate usage.

## Troubleshooting

### Function not triggering
- Verify function is deployed: `firebase functions:list`
- Check Firestore rules allow the operation
- Review function logs: `firebase functions:log`

### Notifications not received
- Verify user has `fcmToken` field in Firestore
- Check FCM token is valid and not expired
- Ensure mobile app properly registers FCM token

### Permission errors
- Ensure Firebase Admin SDK has necessary permissions
- Verify Firestore security rules allow function access

## Additional Resources

- [Firebase Functions Python Documentation](https://firebase.google.com/docs/functions/python/overview)
- [Cloud Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
