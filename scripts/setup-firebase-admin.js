const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Initialize Firebase Admin with service account key file
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseio.com`
  });
  
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.error('Please make sure you have placed the serviceAccountKey.json file in the project root');
  process.exit(1);
}

const db = admin.firestore();

async function createFirstAdmin() {
  // Check for required environment variables
  const requiredEnvVars = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_DISPLAY_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    console.error('Please set these variables in your .env file');
    process.exit(1);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminDisplayName = process.env.ADMIN_DISPLAY_NAME;
  
  try {
    // Check if user already exists
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(adminEmail);
      console.log(`User already exists: ${userRecord.uid} (${userRecord.email})`);
    } catch (error) {
      // User doesn't exist, create the user
      if (error.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: adminDisplayName,
        });
        console.log(`Created new user: ${userRecord.uid} (${userRecord.email})`);
      } else {
        throw error;
      }
    }
    
    // Set user role to admin in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: adminEmail,
      displayName: adminDisplayName,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`Successfully set up first admin user: ${adminEmail}`);
  } catch (error) {
    console.error('Error setting up first admin user:', error);
  } finally {
    process.exit();
  }
}

createFirstAdmin(); 