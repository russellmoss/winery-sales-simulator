import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserRole } from '../firebase/firestoreService';
import { isUserAdmin } from '../firebase/userService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // If user exists, fetch their role
      if (user) {
        try {
          // Check if user document exists in Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          // If user document doesn't exist, create it
          if (!userDoc.exists()) {
            console.log('User document not found in AuthContext, creating one...');
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              displayName: user.displayName || user.email.split('@')[0],
              role: 'user', // Default role
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            setUserRole('user');
            setIsAdminUser(false);
          } else {
            // Get user role from Firestore
            const role = await getUserRole(user.uid);
            setUserRole(role);
            
            // Check if user is admin
            const adminStatus = await isUserAdmin();
            setIsAdminUser(adminStatus);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user'); // Default to user role if there's an error
          setIsAdminUser(false);
        }
      } else {
        setUserRole(null);
        setIsAdminUser(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      setIsAdminUser(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };
  
  // Function to check if user is admin
  const isAdmin = () => {
    return isAdminUser;
  };

  const value = {
    currentUser,
    userRole,
    isAdmin,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 