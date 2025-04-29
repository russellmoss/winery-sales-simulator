const admin = require('firebase-admin');

// Initialize Firebase Admin with project configuration
admin.initializeApp({
  projectId: 'winery-sales-simulator',
  authDomain: 'winery-sales-simulator.firebaseapp.com',
  storageBucket: 'winery-sales-simulator.firebasestorage.app',
  messagingSenderId: '1003376854901',
  appId: '1:1003376854901:web:053269d1035fc3d32ab53c'
});

const db = admin.firestore();

async function createFirstAdmin() {
  const adminEmail = 'russell@mileaestatevineyard.com';
  const adminPassword = 'Eric9437!';
  const adminDisplayName = 'Russell Hearn';
  
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