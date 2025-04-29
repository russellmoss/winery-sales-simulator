# Setting Up Firebase Admin SDK

This guide will help you set up the Firebase Admin SDK for your Winery Sales Simulator application.

## Prerequisites

- A Firebase project (already set up)
- Node.js installed
- npm installed

## Step 1: Generate a Service Account Key

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project "winery-sales-simulator"
3. Click on the gear icon (⚙️) next to "Project Overview" to open Project Settings
4. Go to the "Service accounts" tab
5. Click "Generate new private key" button
6. Save the downloaded JSON file as `serviceAccountKey.json` in your project root directory

## Step 2: Install Required Dependencies

Run the following command in your project root:

```bash
npm install firebase-admin dotenv
```

## Step 3: Create the First Admin User

Run the following command to create the first admin user:

```bash
node scripts/setup-firebase-admin.js
```

This script will:
1. Initialize the Firebase Admin SDK with your service account key
2. Create a user with email "russell@mileaestatevineyard.com" and password "Eric9437!"
3. Set the user's role to "admin" in Firestore

## Step 4: Test the User API Endpoints

You can test the user API endpoints using curl or Postman:

### Create a User (Admin only)

```bash
curl -X POST http://localhost:3001/api/users/create \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
-d '{
  "email": "test@example.com",
  "password": "password123",
  "displayName": "Test User",
  "role": "user"
}'
```

### Login

```bash
curl -X POST http://localhost:3001/api/users/login \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "password123"
}'
```

### Get User Profile

```bash
curl -X GET http://localhost:3001/api/users/profile \
-H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

### Update User Profile

```bash
curl -X PUT http://localhost:3001/api/users/profile \
-H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "displayName": "Updated Name",
  "email": "updated@example.com"
}'
```

### Delete User

```bash
curl -X DELETE http://localhost:3001/api/users/profile \
-H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

## Troubleshooting

### Error: Cannot find module 'firebase-admin'

Make sure you've installed the required dependencies:

```bash
npm install firebase-admin dotenv
```

### Error: Cannot find module '../serviceAccountKey.json'

Make sure you've placed the `serviceAccountKey.json` file in your project root directory.

### Error: Firebase App '[DEFAULT]' already exists

This error occurs when the Firebase Admin SDK is initialized multiple times. The code in `userController.js` includes a check to prevent this, but if you're still seeing this error, make sure you're not initializing Firebase Admin SDK elsewhere in your application.

## Security Considerations

- Keep your `serviceAccountKey.json` file secure and never commit it to version control
- Add `serviceAccountKey.json` to your `.gitignore` file
- Use environment variables for sensitive information in production
- Implement proper authentication and authorization checks in your API endpoints 