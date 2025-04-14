import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA16MWIAudcNe3r7ae0y2OR90GLmfxCqCw",
  authDomain: "winery-sales-simulator.firebaseapp.com",
  projectId: "winery-sales-simulator",
  storageBucket: "winery-sales-simulator.appspot.com",
  messagingSenderId: "1003376854901",
  appId: "1:1003376854901:web:053269d1035fc3d32ab53c"
};

console.log('Initializing Firebase with config:', {
  ...firebaseConfig,
  apiKey: '***'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Connect to emulators if in development and emulator flag is true
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATOR === 'true') {
  const [host, port] = process.env.REACT_APP_FIRESTORE_EMULATOR_HOST.split(':');
  connectFirestoreEmulator(db, host, parseInt(port, 10));
  connectAuthEmulator(auth, 'http://localhost:9099');
  console.log('Connected to Firebase emulators');
}

export { db, auth };
export default app; 