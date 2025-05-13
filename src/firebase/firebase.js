import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Debug environment variables
console.log('Environment variables:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? '***' : 'undefined',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
});

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate required environment variables
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required Firebase environment variables:', missingVars);
  throw new Error('Missing required Firebase environment variables');
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully with config:', {
    ...firebaseConfig,
    apiKey: '***'
  });
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Initialize Firestore and Auth
let db, auth;
try {
  db = getFirestore(app);
  auth = getAuth(app);
  console.log('Firestore and Auth initialized successfully');
} catch (error) {
  console.error('Error initializing Firestore or Auth:', error);
  throw error;
}

// Export the initialized instances
export { db, auth };
export default app; 