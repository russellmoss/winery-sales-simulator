import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { auth } from './firebase';

const functions = getFunctions();

/**
 * Login a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User data and token
 */
export const loginUserWithRole = async (email, password) => {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    // Get the ID token
    const idToken = await user.getIdToken();
    
    // If user document doesn't exist, return basic user info
    if (!userDoc.exists()) {
      console.log('User document not found in loginUserWithRole');
      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0],
          role: 'user' // Default role
        },
        token: idToken
      };
    }
    
    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: userDoc.data().role || 'user'
      },
      token: idToken
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

/**
 * Register a new user with role
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} displayName - User's display name
 * @returns {Promise<Object>} - User data
 */
export const registerUserWithRole = async (email, password, displayName) => {
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      displayName,
      role: 'user', // Default role
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: 'user'
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Get user profile with role
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<Object>} - User profile
 */
export const getUserProfileWithRole = async (userId = null) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const targetUserId = userId || currentUser.uid;
    
    // Check if user is admin or requesting their own profile
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const isAdmin = currentUserDoc.exists() && currentUserDoc.data().role === 'admin';
    
    if (!isAdmin && currentUser.uid !== targetUserId) {
      throw new Error('Forbidden: You can only view your own profile');
    }
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', targetUserId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    return {
      uid: targetUserId,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Update user profile with role check
 * @param {Object} userData - User data to update
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<Object>} - Updated user profile
 */
export const updateUserProfileWithRole = async (userData, userId = null) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const targetUserId = userId || currentUser.uid;
    
    // Check if user is admin or updating their own profile
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const isAdmin = currentUserDoc.exists() && currentUserDoc.data().role === 'admin';
    
    if (!isAdmin && currentUser.uid !== targetUserId) {
      throw new Error('Forbidden: You can only update your own profile');
    }
    
    // Update user in Firebase Auth if it's the current user
    if (currentUser.uid === targetUserId) {
      const updateData = {};
      if (userData.displayName) updateData.displayName = userData.displayName;
      if (userData.email) updateData.email = userData.email;
      
      if (Object.keys(updateData).length > 0) {
        await updateProfile(currentUser, updateData);
      }
    }
    
    // Update user in Firestore
    const firestoreUpdate = {
      updatedAt: new Date().toISOString()
    };
    
    if (userData.displayName) firestoreUpdate.displayName = userData.displayName;
    if (userData.email) firestoreUpdate.email = userData.email;
    
    // Only admins can update roles
    if (isAdmin && userData.role) {
      // Use Firebase Function to update role (which sets custom claims)
      const setUserRole = httpsCallable(functions, 'setUserRole');
      await setUserRole({ userId: targetUserId, role: userData.role });
      firestoreUpdate.role = userData.role;
    }
    
    await updateDoc(doc(db, 'users', targetUserId), firestoreUpdate);
    
    // Get updated user data
    const updatedUserDoc = await getDoc(doc(db, 'users', targetUserId));
    
    return {
      uid: targetUserId,
      ...updatedUserDoc.data()
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Delete user account with role check
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<void>}
 */
export const deleteUserAccountWithRole = async (userId = null) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const targetUserId = userId || currentUser.uid;
    
    // Check if user is admin or deleting their own account
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const isAdmin = currentUserDoc.exists() && currentUserDoc.data().role === 'admin';
    
    if (!isAdmin && currentUser.uid !== targetUserId) {
      throw new Error('Forbidden: You can only delete your own account');
    }
    
    // Don't allow deleting your own account if you're an admin
    if (isAdmin && currentUser.uid === targetUserId) {
      throw new Error('Forbidden: Admins cannot delete their own account');
    }
    
    // Use Firebase Function to delete user
    const deleteUser = httpsCallable(functions, 'deleteUser');
    await deleteUser({ userId: targetUserId });
    
    // If deleting own account, sign out
    if (currentUser.uid === targetUserId) {
      await signOut(auth);
    }
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};

/**
 * Create a new user (admin only)
 * @param {Object} userData - User data including email, password, displayName, and role
 * @returns {Promise<Object>} - Created user data
 */
export const createUser = async (userData) => {
  try {
    // Check if current user is admin
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      throw new Error('Only admins can create new users');
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Ensure admin user has a Firestore document
    const adminDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!adminDoc.exists()) {
      console.log('Admin user document not found, creating one...');
      await setDoc(doc(db, 'users', currentUser.uid), {
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email.split('@')[0],
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    // Update user profile
    await updateProfile(userCredential.user, {
      displayName: userData.displayName
    });

    // Create user document in Firestore
    const userDoc = {
      uid: userCredential.user.uid,
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role || 'user',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);

    // Re-authenticate admin user
    const adminCredential = EmailAuthProvider.credential(
      currentUser.email,
      userData.adminPassword
    );
    await reauthenticateWithCredential(currentUser, adminCredential);

    return userDoc;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Set admin claim for a user
 * This is a temporary function for development purposes
 * @param {string} userId - The ID of the user to make an admin
 * @returns {Promise<Object>} - Result of the operation
 */
export const setAdminClaim = async (userId) => {
  try {
    const setAdminClaimFunction = httpsCallable(functions, 'setAdminClaim');
    const result = await setAdminClaimFunction({ userId });
    return result.data;
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw error;
  }
};

/**
 * Check if the current user is an admin
 * @returns {Promise<boolean>} - Whether the user is an admin
 */
export const isUserAdmin = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return false;
    }

    // Check if user has admin custom claim
    const idTokenResult = await currentUser.getIdTokenResult();
    if (idTokenResult.claims.admin === true) {
      return true;
    }

    // Fallback to checking Firestore role
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    
    // If user document doesn't exist, create it
    if (!userDoc.exists()) {
      console.log('User document not found in isUserAdmin, creating one...');
      await setDoc(doc(db, 'users', currentUser.uid), {
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email.split('@')[0],
        role: 'user', // Default role
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return false; // New users are not admins by default
    }
    
    return userDoc.data().role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get all users (admin only)
 * @returns {Promise<Array>} - List of users
 */
export const getAllUsers = async () => {
  try {
    // Check if user is admin
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      throw new Error('Only admins can get all users');
    }

    // Get all users from Firestore
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    
    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    // Return an empty array instead of throwing an error
    return [];
  }
}; 