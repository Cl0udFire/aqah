# Firebase Deployment Setup

This repository uses GitHub Actions to automatically deploy Firebase Functions and Firestore rules to Firebase.

## Prerequisites

Before the automatic deployment can work, you need to set up the following:

### 1. Required GitHub Secrets

The deployment workflow requires the following GitHub secrets to be configured:

#### FIREBASE_TOKEN (Required)

The deployment workflow requires a Firebase token to authenticate with Firebase.

1. Install Firebase CLI locally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase and generate a CI token:
   ```bash
   firebase login:ci
   ```

3. Copy the generated token.

4. Add the token as a GitHub secret:
   - Go to your repository on GitHub
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_TOKEN`
   - Value: Paste the token from step 3
   - Click "Add secret"

#### FIREBASE_PROJECT_ID (Required)

The Firebase project ID is needed to configure which project to deploy to.

1. Get your Firebase project ID:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - The project ID is shown in the project settings

2. Add the project ID as a GitHub secret:
   - Go to your repository on GitHub
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_PROJECT_ID`
   - Value: Your Firebase project ID (e.g., `my-project-12345`)
   - Click "Add secret"

### 2. Alternative: Using Service Account (Optional)

For enhanced security in production environments, you can use a service account instead of a CI token:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Save the JSON file securely
6. Add it as a GitHub secret named `FIREBASE_SERVICE_ACCOUNT`
7. Update the workflow to use the service account (see advanced configuration below)

## Deployment Trigger

The workflow is configured to run:
- Automatically on every push to the `main` branch
- Manually via the GitHub Actions "workflow_dispatch" trigger

## What Gets Deployed

The current workflow deploys:
- **Firestore Rules**: Security rules for Firestore database
- **Firebase Functions**: Python Cloud Functions

## Testing the Deployment

After setting up the secret:
1. Push a commit to the `main` branch
2. Go to the "Actions" tab in your GitHub repository
3. Click on the "Deploy to Firebase" workflow
4. Monitor the deployment progress

## Troubleshooting

### Authentication Error
- Verify that the `FIREBASE_TOKEN` secret is correctly set
- Ensure the token hasn't expired (regenerate if needed)
- Check that the Firebase CLI version is compatible

### Deployment Failed
- Check the GitHub Actions logs for specific error messages
- Ensure your `firebase.json` configuration is correct
- Verify that the Firebase project exists and you have proper permissions

### Functions Deployment Issues
- Ensure Python dependencies in `functions/requirements.txt` are up to date
- Check that the Python runtime version in `firebase.json` matches available runtimes
- Review Firebase Functions logs in the Firebase Console

## Manual Deployment

If you need to deploy manually from your local machine:

```bash
# Install dependencies
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
firebase deploy
```

## Additional Resources

- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase Functions Python Documentation](https://firebase.google.com/docs/functions/beta)
