const express = require('express');
const router = express.Router();
const { 
  createUser, 
  loginUser, 
  updateUser, 
  deleteUser, 
  getUserProfile 
} = require('../controllers/userController');

// Admin routes
router.post('/create', createUser);

// User routes
router.post('/login', loginUser);
router.get('/profile', getUserProfile);
router.get('/profile/:userId', getUserProfile);
router.put('/profile', updateUser);
router.put('/profile/:userId', updateUser);
router.delete('/profile', deleteUser);
router.delete('/profile/:userId', deleteUser);

module.exports = router; 