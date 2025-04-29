const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA16MWIAudcNe3r7ae0y2OR90GLmfxCqCw",
  authDomain: "winery-sales-simulator.firebaseapp.com",
  projectId: "winery-sales-simulator",
  storageBucket: "winery-sales-simulator.firebasestorage.app",
  messagingSenderId: "1003376854901",
  appId: "1:1003376854901:web:053269d1035fc3d32ab53c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function setupAdminFirestore() {
  const adminEmail = 'russell@mileaestatevineyard.com';
  const adminPassword = 'Eric9437!';
  
  try {
    // Sign in with the admin account
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    console.log(`Signed in as: ${user.email}`);
    
    // Create the users collection and add the admin document
    await setDoc(doc(db, 'users', user.uid), {
      email: adminEmail,
      displayName: user.displayName || 'Russell Hearn',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Successfully created admin document in Firestore for: ${adminEmail}`);
  } catch (error) {
    console.error('Error setting up admin in Firestore:', error);
  } finally {
    process.exit();
  }
}

setupAdminFirestore(); 