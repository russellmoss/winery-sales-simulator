const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Set user role using custom claims
 * This function can be called by an admin to set a user's role
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
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
      'Only admins can set user roles.'
    );
  }

  // Get the target user ID and role from the request
  const { userId, role } = data;
  
  if (!userId || !role) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function requires userId and role parameters.'
    );
  }

  // Validate the role
  if (role !== 'admin' && role !== 'user') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Role must be either "admin" or "user".'
    );
  }

  try {
    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(userId, { role });
    
    // Update the user document in Firestore
    await admin.firestore().collection('users').doc(userId).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, message: `User role set to ${role}` };
  } catch (error) {
    console.error('Error setting user role:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while setting the user role.'
    );
  }
});

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

/**
 * Delete a user
 * This function can be called by an admin to delete a user
 */
exports.deleteUser = functions.https.onCall(async (data, context) => {
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
      'Only admins can delete users.'
    );
  }

  // Get the target user ID from the request
  const { userId } = data;
  
  if (!userId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function requires a userId parameter.'
    );
  }

  // Don't allow deleting your own account
  if (userId === callerUid) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'You cannot delete your own account.'
    );
  }

  try {
    // Delete the user from Firebase Auth
    await admin.auth().deleteUser(userId);
    
    // Delete the user document from Firestore
    await admin.firestore().collection('users').doc(userId).delete();
    
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while deleting the user.'
    );
  }
});

/**
 * Set admin claim for a user
 * This function can be called to set the admin claim for a specific user
 * This is a temporary function for development purposes
 */
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // Get the target user ID from the request
  const { userId } = data;
  
  if (!userId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function requires a userId parameter.'
    );
  }

  try {
    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(userId, { admin: true });
    
    // Update the user document in Firestore
    await admin.firestore().collection('users').doc(userId).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, message: `Admin claim set for user ${userId}` };
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while setting the admin claim.'
    );
  }
}); 