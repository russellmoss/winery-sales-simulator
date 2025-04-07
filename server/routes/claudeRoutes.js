const express = require('express');
const router = express.Router();
const { sendMessage, analyzeResponse } = require('../controllers/claudeController');

// Route to send a message to Claude
router.post('/message', sendMessage);

// Route to analyze a response
router.post('/analyze', analyzeResponse);

module.exports = router; 