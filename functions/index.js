const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import function modules
const userManagement = require('./userManagement');
const claudeFunctions = require('./claude');

// Export all functions
exports.setUserRole = userManagement.setUserRole;
exports.createUser = userManagement.createUser;
exports.deleteUser = userManagement.deleteUser;
exports.setAdminClaim = userManagement.setAdminClaim;

// Export Claude functions
exports.generateClaudeResponse = claudeFunctions.generateClaudeResponse;
exports.generateClaudeResponseWithAudio = claudeFunctions.generateClaudeResponseWithAudio;

/**
 * Create a new user
 * This function can be called by an admin to create a new user
 */
exports.createUser = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  // Check if the user is an admin
  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  
  if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can create users.'
    );
  }

  // Get user data from the request
  const { email, password, displayName, role } = data;
  
  if (!email || !password || !displayName) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function requires email, password, and displayName parameters.'
    );
  }

  try {
    // Create the user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName
    });
    
    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(userRecord.uid, { 
      role: role || 'user' 
    });
    
    // Create the user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      role: role || 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { 
      success: true, 
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: role || 'user'
      }
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while creating the user.'
    );
  }
}); 