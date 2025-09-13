import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper, 
  Snackbar, 
  Alert 
} from '@mui/material';
import { setAdminClaim } from '../firebase/userService';
import { useAuth } from '../contexts/AuthContext';

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSetAdminClaim = async () => {
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: 'You must be logged in to set admin claim',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      await setAdminClaim(currentUser.uid);
      setSnackbar({
        open: true,
        message: 'Admin claim set successfully. Please sign out and sign back in.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error setting admin claim:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Setup
          </Typography>
          <Typography variant="body1" paragraph>
            This page allows you to set the admin claim for your user account.
            This is a temporary setup for development purposes.
          </Typography>
          <Typography variant="body1" paragraph>
            Current user ID: {currentUser ? currentUser.uid : 'Not logged in'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSetAdminClaim}
            disabled={loading || !currentUser}
          >
            {loading ? 'Setting Admin Claim...' : 'Set Admin Claim'}
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={() => navigate('/')}
            sx={{ ml: 2 }}
          >
            Back to Home
          </Button>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminSetup; 