const { auth, db } = require('../config/firebase');
const { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} = require('firebase/auth');
const { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc 
} = require('firebase/firestore');

exports.createUser = async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      displayName,
      role: role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Return user without sensitive data
    res.status(201).json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: role || 'user'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    // Get the ID token
    const idToken = await user.getIdToken();

    res.json({
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: userDoc.data().role
      },
      token: idToken
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      uid: userId,
      ...userDoc.data()
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { displayName, email, role } = req.body;

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user in Firebase Auth
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName,
        email
      });
    }

    // Update user in Firestore
    const updateData = {
      updatedAt: new Date().toISOString()
    };
    if (displayName) updateData.displayName = displayName;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    await updateDoc(userRef, updateData);

    res.json({
      uid: userId,
      ...userDoc.data(),
      ...updateData
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user document from Firestore
    await deleteDoc(doc(db, 'users', userId));

    // Sign out the user if they're the current user
    if (auth.currentUser && auth.currentUser.uid === userId) {
      await signOut(auth);
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}; 