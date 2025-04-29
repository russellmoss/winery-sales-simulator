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
import { getAllUsers } from '../firebase/userService';
import { setUserRole } from '../firebase/firestoreService';
import { createUser } from '../firebase/userService';
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
      const users = await getAllUsers();
      setUsers(users);
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
      
      // Store admin credentials for re-authentication
      const adminEmail = currentUser.email;
      const adminPassword = prompt('Please enter your password to confirm this action:');
      
      if (!adminPassword) {
        setSnackbar({
          open: true,
          message: 'Operation cancelled',
          severity: 'info',
        });
        return;
      }
      
      // Create the user
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