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

async function setupAdminFirestore() {
  const adminEmail = 'russell@mileaestatevineyard.com';
  
  try {
    // Get the user record from Authentication
    const userRecord = await admin.auth().getUserByEmail(adminEmail);
    console.log(`Found user: ${userRecord.uid} (${userRecord.email})`);
    
    // Create the users collection and add the admin document
    await db.collection('users').doc(userRecord.uid).set({
      email: adminEmail,
      displayName: userRecord.displayName || 'Russell Hearn',
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