# Question Assignment Server

This Python server automatically assigns questions to available users every one minute. It queries the Firestore database for questions that don't have an assignee or have an empty string assignee, and distributes them to available users using a round-robin algorithm.

## Features

- **Automatic Assignment**: Assigns questions every 60 seconds (configurable)
- **Round-Robin Distribution**: Fairly distributes questions among available users
- **Firebase Integration**: Uses Firebase Admin SDK to interact with Firestore
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
