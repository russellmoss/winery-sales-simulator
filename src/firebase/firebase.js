import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA16MWIAudcNe3r7ae0y2OR90GLmfxCqCw",
  authDomain: "winery-sales-simulator.firebaseapp.com",
  projectId: "winery-sales-simulator",
  storageBucket: "winery-sales-simulator.appspot.com",
  messagingSenderId: "1003376854901",
  appId: "1:1003376854901:web:053269d1035fc3d32ab53c",
  databaseURL: `https://winery-sales-simulator.firebaseio.com`
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// If running locally, connect to emulators
if (window.location.hostname === "localhost") {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}

export { db, auth };
export default app; 