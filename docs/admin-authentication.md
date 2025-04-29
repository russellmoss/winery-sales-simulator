# Adding User Role-Based Authentication to Winery Sales Simulator

This guide will walk you through adding admin and regular user roles to your existing Firebase authentication in the Winery Sales Simulator application.

## Table of Contents

1. [Understanding the Current Setup](#understanding-the-current-setup)
2. [Updating Firestore Rules](#updating-firestore-rules)
3. [Creating User Roles Schema](#creating-user-roles-schema)
4. [Updating AuthContext](#updating-authcontext)
5. [Implementing Role-Based Routes](#implementing-role-based-routes)
6. [Creating Admin User Interface](#creating-admin-user-interface)
7. [Setting Up the First Admin](#setting-up-the-first-admin)
8. [Testing Role-Based Access](#testing-role-based-access)

## Understanding the Current Setup

Your application currently uses Firebase Authentication with email/password. The `AuthContext.js` provides user context throughout the app, and `PrivateRoute.js` restricts access to authenticated users.

## Updating Firestore Rules

First, update your Firestore security rules to enforce role-based access control.

### Cursor.ai Prompt:
```
Update the Firestore security rules in firestore.rules to add role-based access. Users should be able to read their own data, admins should be able to read and write all user data, and only admins should be able to modify user roles.
```

### Expected Code:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Function to check if the user is an admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /scenarios/{scenarioId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
      
      match /interactions/{interactionId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
      
      match /evaluations/{evaluationId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
    }
    
    match /users/{userId} {
      // Allow users to read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Allow admins to read and write all user data
      allow read, write: if isAdmin();
      
      // Allow users to update their own data except for role field
      allow update: if request.auth != null && 
                     request.auth.uid == userId && 
                     !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']);
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Creating User Roles Schema

Next, update your database schema to include user roles.

### Cursor.ai Prompt:
```
Create functions in firestoreService.js to add a role field to user documents, update a user's role, and create new users from the admin panel.
```

### Expected Code:
```javascript
// Add to client/src/firebase/firestoreService.js

/**
 * Set a user's role
 * @param {string} userId - The user ID
 * @param {string} role - The role to set ('admin' or 'user')
 * @returns {Promise<void>}
 */
export const setUserRole = async (userId, role) => {
  try {
    if (role !== 'admin' && role !== 'user') {
      throw new Error('Invalid role: must be either "admin" or "user"');
    }
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Role updated for user ${userId} to ${role}`);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Get user role
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - The user's role
 */
export const getUserRole = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    // Default to 'user' if no role is specified
    return userDoc.data().role || 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
};

/**
 * Get all users (admin only)
 * @returns {Promise<Array>} - Array of user objects
 */
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Create a new user (admin only)
 * @param {Object} userData - User data including email, password, displayName, and role
 * @returns {Promise<Object>} - The created user
 */
export const createUser = async (userData) => {
  try {
    // Create a new Firebase Auth user through a server function
    // This is typically done through a serverless function since client-side
    // code can't directly create users with Firebase Auth
    const response = await fetch('/api/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        role: userData.role || 'user'
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user');
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
```

### Cursor.ai Prompt:
```
Now modify the registerUser function in authService.js to set the default role to 'user'.
```

### Expected Code:
```javascript
// Update in client/src/firebase/authService.js

export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, { displayName });

    // Create user document in Firestore with 'user' role
    await setDoc(doc(db, 'users', user.uid), {
      email,
      displayName,
      role: 'user', // Set default role
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });

    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};
```

## Updating AuthContext

Now, update the AuthContext to include the user's role.

### Cursor.ai Prompt:
```
Update the AuthContext.js to fetch and include the user's role in the context.
```

### Expected Code:
```javascript
// Update in client/src/contexts/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserRole } from '../firebase/firestoreService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // If user exists, fetch their role
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          setUserRole(role);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user'); // Default to user role if there's an error
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };
  
  // Function to check if user is admin
  const isAdmin = () => {
    return userRole === 'admin';
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
```

## Implementing Role-Based Routes

Let's create a new component for admin-only routes.

### Cursor.ai Prompt:
```
Create an AdminRoute component similar to PrivateRoute but with admin role check.
```

### Expected Code:
```javascript
// Create file: client/src/components/AdminRoute.js

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return currentUser && isAdmin() ? 
    children : 
    <Navigate to="/" />;
}
```

### Cursor.ai Prompt:
```
Now update App.js to use the AdminRoute component for admin-only routes.
```

### Expected Code:
```javascript
// Update in client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SimulatorProvider } from './contexts/SimulatorContext';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute'; // Import the new component
import Login from './pages/Login';
import Header from './components/Header';
import Home from './pages/Home';
import SimulatorHome from './components/simulator/SimulatorHome';
import SimulatorBrief from './components/simulator/SimulatorBrief';
import SimulatorChat from './components/simulator/SimulatorChat';
import Evaluator from './components/Evaluator';
import ScenarioManagement from './pages/ScenarioManagement';
import UserManagement from './pages/UserManagement'; // We'll create this next
import './App.css';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="/simulator" element={
            <PrivateRoute>
              <SimulatorHome />
            </PrivateRoute>
          } />
          <Route path="/scenario/:scenarioId/chat" element={
            <PrivateRoute>
              <SimulatorChat />
            </PrivateRoute>
          } />
          <Route path="/scenario/:scenarioId/brief" element={
            <PrivateRoute>
              <SimulatorBrief />
            </PrivateRoute>
          } />
          <Route path="/evaluator" element={
            <PrivateRoute>
              <Evaluator />
            </PrivateRoute>
          } />
          {/* Admin Routes */}
          <Route path="/scenarios/manage" element={
            <AdminRoute>
              <ScenarioManagement />
            </AdminRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } />
          <Route path="*" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SimulatorProvider>
          <AppContent />
        </SimulatorProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

## Creating Admin User Interface

Let's create a user management page for admins that allows adding new users and changing roles.

### Cursor.ai Prompt:
```
Create a UserManagement.js page where admins can see all users, add new users, and change user roles.
```

### Expected Code:
```javascript
// Create file: client/src/pages/UserManagement.js

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { getAllUsers, setUserRole, createUser } from '../firebase/firestoreService';
import { useAuth } from '../contexts/AuthContext';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'user'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Don't allow changing your own role
      if (userId === currentUser.uid) {
        setSnackbar({
          open: true,
          message: 'You cannot change your own role',
          severity: 'error',
        });
        return;
      }

      await setUserRole(userId, newRole);
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      setSnackbar({
        open: true,
        message: 'User role updated successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error updating user role:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update user role',
        severity: 'error',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserData({
      ...newUserData,
      [name]: value
    });
  };

  const handleCreateUser = async () => {
    try {
      // Validate input
      if (!newUserData.email || !newUserData.password || !newUserData.displayName) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error',
        });
        return;
      }

      setLoading(true);
      const createdUser = await createUser(newUserData);
      
      // Add new user to the list
      setUsers([...users, {
        id: createdUser.uid,
        email: newUserData.email,
        displayName: newUserData.displayName,
        role: newUserData.role,
        createdAt: new Date().toISOString()
      }]);
      
      setSnackbar({
        open: true,
        message: 'User created successfully',
        severity: 'success',
      });
      
      // Reset form and close dialog
      setNewUserData({
        email: '',
        password: '',
        displayName: '',
        role: 'user'
      });
      setOpenDialog(false);
    } catch (err) {
      console.error('Error creating user:', err);
      setSnackbar({
        open: true,
        message: `Failed to create user: ${err.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>Loading users...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            variant="contained"
            onClick={loadUsers}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Panel
        </Typography>
        
        <Grid container spacing={3}>
          {/* Admin Dashboard */}
          <Grid item xs={12}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  User Management
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Manage users and their access levels.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => setOpenDialog(true)}
                >
                  Add New User
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          {/* User List */}
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.displayName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role || 'user'}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <FormControl variant="standard" sx={{ minWidth: 120 }}>
                          <Select
                            value={user.role || 'user'}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={user.id === currentUser.uid}
                          >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
        
        {/* New User Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={newUserData.email}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={newUserData.password}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="displayName"
              label="Full Name"
              fullWidth
              variant="outlined"
              value={newUserData.displayName}
              onChange={handleInputChange}
            />
            <FormControl fullWidth variant="outlined" margin="dense">
              <Select
                name="role"
                value={newUserData.role}
                onChange={handleInputChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateUser} color="primary">
              Create User
            </Button>
          </DialogActions>
        </Dialog>
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default UserManagement;
```

### Cursor.ai Prompt:
```
Update the Header component to show different menu items based on user role.
```

### Expected Code:
```javascript
// Update in client/src/components/Header.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Don't show header on login page
  if (!currentUser) return null;

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">Winery Sales Simulator</Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/evaluator" className="nav-link">Evaluator</Link>
          
          {/* Admin-only links */}
          {isAdmin() && (
            <>
              <Link to="/scenarios/manage" className="nav-link">Edit Scenarios</Link>
              <Link to="/admin" className="nav-link">Admin Panel</Link>
            </>
          )}
          
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
```

## Setting Up the First Admin

Now, let's create a script to set up the initial admin user.

### Cursor.ai Prompt:
```
Create a script to set up the first admin user (russell@mileaestatevineyard.com) with password Eric9437!
```

### Expected Code:
```javascript
// Create file: scripts/create-first-admin.js

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Initialize Firebase Admin with environment variables
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
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
```

### Cursor.ai Prompt:
```
Create a script that will serve as an API endpoint for creating new users from the admin panel.
```

### Expected Code:
```javascript
// Create file: server/controllers/userController.js

const admin = require('firebase-admin');

exports.createUser = async (req, res) => {
  try {
    // Verify that the request is from an admin
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized, no token provided' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const requestingUserRecord = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    
    if (!requestingUserRecord.exists || requestingUserRecord.data().role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden, admin access required' });
    }
    
    // Get user data from request
    const { email, password, displayName, role } = req.body;
    
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create new user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName
    });
    
    // Create user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      role: role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Return user data (excluding password)
    return res.status(201).json({
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ 
      error: 'Failed to create user',
      message: error.message
    });
  }
};

// Create file: server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/userController');

router.post('/create', createUser);

module.exports = router;

// Update file: server/server.js
// Add this line after other routes

app.use('/api/users', require('./routes/userRoutes'));
```

## Testing Role-Based Access

Let's create a comprehensive testing plan for our role-based authentication.

### Test Plan:

```markdown
# Role-Based Access Testing Plan

## Setup Testing
1. Run the admin script to create the first admin user:
   ```
   node scripts/create-first-admin.js
   ```

2. Verify in the Firebase console that the user russell@mileaestatevineyard.com has:
   - A user account in Firebase Authentication
   - A document in the users collection with role: "admin"

3. Register a regular user account through the app for testing

## Authentication Tests
1. Log in as russell@mileaestatevineyard.com (admin)
   - Verify that userRole is set to "admin" in the AuthContext
   - Verify that isAdmin() returns true

2. Log in as the regular user
   - Verify that userRole is set to "user" in the AuthContext
   - Verify that isAdmin() returns false

## UI Tests
1. Log in as russell@mileaestatevineyard.com (admin)
   - Verify that "Edit Scenarios" link is visible in the header
   - Verify that "Admin Panel" link is visible in the header

2. Log in as the regular user
   - Verify that "Edit Scenarios" link is NOT visible in the header
   - Verify that "Admin Panel" link is NOT visible in the header
   - Verify that only "Home", "Evaluator", and "Logout" are visible

## Route Access Tests
1. Log in as russell@mileaestatevineyard.com (admin)
   - Verify that you can access /scenarios/manage
   - Verify that you can access /admin

2. Log in as the regular user
   - Verify that you are redirected away when trying to access /scenarios/manage
   - Verify that you are redirected away when trying to access /admin

## Admin Panel Tests
1. Log in as russell@mileaestatevineyard.com (admin)
   - Go to /admin
   - Verify that you can see the user list
   - Try to create a new user through the "Add New User" button
   - Verify that the new user appears in the list
   - Try to change a user's role from "user" to "admin"
   - Verify that the role updates in the UI

2. Log in as the regular user
   - Verify that attempting to navigate to /admin redirects you away

## Firestore Rules Tests
1. Create a tool to test Firestore rules:

```javascript
// Create file: scripts/test-firestore-rules.js
const firebase = require('@firebase/rules-unit-testing');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'winery-sales-simulator';

async function testUserRules() {
  const adminApp = firebase.initializeTestApp({
    projectId: PROJECT_ID,
    auth: { uid: 'admin-uid', email: 'russell@mileaestatevineyard.com' }
  });
  
  const userApp = firebase.initializeTestApp({
    projectId: PROJECT_ID, 
    auth: { uid: 'user-uid', email: 'regular@example.com' }
  });

  const adminDb = adminApp.firestore();
  const userDb = userApp.firestore();
  
  console.log('Testing admin access to user data...');
  try {
    // Admin should be able to read all user data
    await firebase.assertSucceeds(adminDb.collection('users').doc('user-uid').get());
    console.log('✅ Admin can read user data');
    
    // Admin should be able to update user roles
    await firebase.assertSucceeds(adminDb.collection('users').doc('user-uid').update({ role: 'admin' }));
    console.log('✅ Admin can update user roles');
  } catch (error) {
    console.error('❌ Admin access test failed:', error);
  }
  
  console.log('Testing user access restrictions...');
  try {
    // Users should be able to read their own data
    await firebase.assertSucceeds(userDb.collection('users').doc('user-uid').get());
    console.log('✅ User can read their own data');
    
    // Users should not be able to read other users' data
    await firebase.assertFails(userDb.collection('users').doc('admin-uid').get());
    console.log('✅ User cannot read other users data');
    
    // Users should not be able to update their role
    await firebase.assertFails(userDb.collection('users').doc('user-uid').update({ role: 'admin' }));
    console.log('✅ User cannot update their role');
  } catch (error) {
    console.error('❌ User access test failed:', error);
  }
  
  // Clean up
  await Promise.all([
    adminApp.delete(),
    userApp.delete()
  ]);
}

testUserRules();
```

2. Run the Firestore rules test:
   ```
   node scripts/test-firestore-rules.js
   ```

## Debugging Tips

- If role assignments aren't working, check the Firestore database to ensure roles are being stored correctly
- Use the Firebase Authentication console to verify user accounts exist
- Check browser console for any errors related to permissions
- Verify that Firestore security rules are properly deployed
```

## Final Steps and Troubleshooting

### 1. Setting Up the First Admin User

After implementing all the code:

1. Run the admin script to set up the initial admin user:
   ```
   node scripts/create-first-admin.js
   ```

2. Verify in the Firebase console that russell@mileaestatevineyard.com:
   - Has an account in Firebase Authentication
   - Has a document in the Firestore "users" collection with `role: "admin"`

3. Deploy your Firestore security rules:
   ```
   firebase deploy --only firestore:rules
   ```

### 2. Common Issues and Solutions

- **Problem**: Users not showing correct role after login
  **Solution**: Check that `getUserRole` is being called in the AuthContext effect and returning the correct role

- **Problem**: Admin routes not working
  **Solution**: Verify that the `isAdmin()` function returns true for users with the admin role

- **Problem**: Cannot create new users from admin panel
  **Solution**: Verify the API endpoint is properly configured and receiving valid authentication tokens

- **Problem**: Regular users can see admin links
  **Solution**: Make sure the conditional rendering in the Header component is working correctly

- **Problem**: Firestore rules not enforcing role checks
  **Solution**: Redeploy the updated security rules with `firebase deploy --only firestore:rules`

By following this guide, you will have successfully implemented role-based authentication in your Winery Sales Simulator application, with russell@mileaestatevineyard.com set up as the initial admin user.