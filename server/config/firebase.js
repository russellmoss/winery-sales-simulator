// This file is kept for compatibility with existing imports
// but we're not using Firebase Admin SDK anymore

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
require('dotenv').config();

// Debug logging - More detailed
console.log('\n=== Detailed Environment Variable Debug ===');
console.log('All environment variables:', Object.keys(process.env));
console.log('\nFirebase Environment Variables:');
console.log('FIREBASE_API_KEY length:', process.env.FIREBASE_API_KEY ? process.env.FIREBASE_API_KEY.length : 0);
console.log('FIREBASE_AUTH_DOMAIN:', process.env.FIREBASE_AUTH_DOMAIN);
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET);
console.log('FIREBASE_MESSAGING_SENDER_ID:', process.env.FIREBASE_MESSAGING_SENDER_ID);
console.log('FIREBASE_APP_ID:', process.env.FIREBASE_APP_ID);
console.log('==========================================\n');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Debug logging for config
console.log('Firebase Config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? '***' : undefined // Hide actual API key in logs
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

module.exports = { auth, db }; 