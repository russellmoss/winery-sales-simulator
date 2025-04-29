// This file is kept for compatibility with existing imports
// but we're not using Firebase Admin SDK anymore

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
require('dotenv').config();

// Debug logging
console.log('Firebase Config Environment Variables:');
console.log('API Key exists:', !!process.env.FIREBASE_API_KEY);
console.log('Auth Domain exists:', !!process.env.FIREBASE_AUTH_DOMAIN);
console.log('Project ID exists:', !!process.env.FIREBASE_PROJECT_ID);
console.log('Storage Bucket exists:', !!process.env.FIREBASE_STORAGE_BUCKET);
console.log('Messaging Sender ID exists:', !!process.env.FIREBASE_MESSAGING_SENDER_ID);
console.log('App ID exists:', !!process.env.FIREBASE_APP_ID);

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