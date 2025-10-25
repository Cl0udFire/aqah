# Question Assignment Server

> **⚠️ DEPRECATED**: This server has been migrated to Firebase Functions. See the [functions/README.md](functions/README.md) for the new implementation.

This directory previously contained a Python server that automatically assigned questions to available users every one minute. It has been replaced by Firebase Cloud Functions for a more scalable, serverless approach.

## Migration to Firebase Functions

The functionality of this server has been migrated to Firebase Cloud Functions. The new implementation provides:

- **Event-driven processing**: Questions are assigned instantly when created, not on a schedule
- **Serverless architecture**: No need to run and maintain a dedicated server
- **Additional notifications**: 
  - Notify questioners when answers are received
  - Notify answerers when additional questions are asked
- **Better scalability**: Automatically scales with demand
- **Lower operational costs**: Pay only for actual function executions

See [functions/README.md](functions/README.md) for details on the new implementation.

---

## Legacy Documentation

The following documentation is kept for reference. **This server is no longer the recommended approach.**

## Features

- **Automatic Assignment**: Assigns questions every 60 seconds (configurable)
- **Round-Robin Distribution**: Fairly distributes questions among available users
- **Firebase Integration**: Uses Firebase Admin SDK to interact with Firestore
- **Push Notifications**: Sends FCM push notifications to assignees when questions are assigned
- **Logging**: Comprehensive logging to both console and file

## Prerequisites

- Python 3.7 or higher
- Firebase project with Firestore database
- Firebase Admin SDK service account key

## Quick Test

Before setting up Firebase, you can test the assignment logic with the included test script:

```bash
cd server
python3 test_assignment.py
```

This will demonstrate how the assignment algorithm works using mock data.

## Setup

1. **Install Dependencies**

```bash
cd server
pip install -r requirements.txt
```

2. **Configure Firebase Credentials**

   - Go to your Firebase Console
   - Navigate to Project Settings > Service Accounts
   - Generate a new private key (JSON file)
   - Save the JSON file as `firebase-credentials.json` in the `server` directory
   - Or save it elsewhere and update the path in `.env` file

3. **Configure Environment Variables**

```bash
cp .env.example .env
# Edit .env and update the Firebase credentials path if needed
```

The `.env` file contains:
- `FIREBASE_CREDENTIALS_PATH`: Path to your Firebase service account key JSON file
- `FIREBASE_PROJECT_ID`: (Optional) Your Firebase project ID
- `ASSIGNMENT_INTERVAL`: Assignment interval in seconds (default: 60)

## Running the Server

```bash
python assignment_server.py
```

Or make it executable and run directly:

```bash
chmod +x assignment_server.py
./assignment_server.py
```

## How It Works

1. **Initialization**: The server initializes the Firebase Admin SDK with your credentials
2. **Query Unassigned Questions**: Every minute, it queries for questions where:
   - The `assignee` field is `null`
   - The `assignee` field is an empty string `""`
   - The `assignee` field doesn't exist
3. **Get Available Users**: Fetches available users from the Firestore `users` collection
4. **Assignment**: Assigns questions to users using round-robin distribution
5. **Update Database**: Updates each question's `assignee` field and `updatedAt` timestamp
6. **Send Push Notification**: Sends an FCM push notification to the assignee
   - Retrieves the user's FCM token from their user document
   - Sends a notification with the question title and ID
   - Gracefully handles cases where users don't have FCM tokens registered

## Push Notifications

The server automatically sends push notifications to users when questions are assigned to them. For this to work:

1. **Mobile App Setup**: The mobile app must register the user's FCM token in Firestore
   - When a user logs in, store their FCM token in the `users/{userId}` document
   - The token should be stored in the `fcmToken` field

2. **User Document Structure**: Each user document should have:
   ```json
   {
     "fcmToken": "user_fcm_device_token_here",
     // other user fields...
   }
   ```

3. **Notification Format**: Notifications sent to users include:
   - **Title**: "New Question Assigned"
   - **Body**: "You have been assigned: [Question Title]"
   - **Data**: `questionId` and `type: question_assigned` for handling in the app

4. **Graceful Degradation**: If a user doesn't have an FCM token registered, the assignment still succeeds but no notification is sent (logged as a warning)

## Logs

The server logs to two locations:
- **Console**: Real-time output visible in the terminal
- **File**: `assignment_server.log` in the same directory

## Stopping the Server

Press `Ctrl+C` to gracefully stop the server.

## Production Deployment

For production deployment, consider:
- Running the server as a systemd service (Linux)
- Using a process manager like `supervisor` or `pm2`
- Setting up proper monitoring and alerting
- Configuring log rotation
- Using environment variables for all configuration

### Example systemd service file

Create `/etc/systemd/system/question-assignment.service`:

```ini
[Unit]
Description=Question Assignment Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/aqah/server
ExecStart=/usr/bin/python3 /path/to/aqah/server/assignment_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable question-assignment
sudo systemctl start question-assignment
```

## Troubleshooting

- **Firebase credentials not found**: Ensure `firebase-credentials.json` exists and the path in `.env` is correct
- **No users found**: Ensure your Firestore has a `users` collection with user documents
- **Permission errors**: Ensure your Firebase service account has the necessary permissions (Firestore read/write)
