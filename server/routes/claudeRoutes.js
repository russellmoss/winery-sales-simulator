const express = require('express');
const router = express.Router();
const { sendMessage, analyzeResponse, convertNarrativeToScenario, testClaude } = require('../controllers/claudeController');
const { evaluateConversation } = require('../controllers/evaluationController');
const speechController = require('../controllers/speechController');
const upload = require('../middleware/upload');

// Debug middleware for all routes in this router
router.use((req, res, next) => {
  console.log(`[ClaudeRoutes] ${req.method} ${req.path} - Request received`);
  console.log('[ClaudeRoutes] Headers:', req.headers);
  console.log('[ClaudeRoutes] Body:', req.body);
  next();
});

// Test route
router.get('/test', (req, res) => {
  console.log('[ClaudeRoutes] Test route hit');
  res.json({ message: 'Claude routes are working!' });
});

// Test Claude API connectivity
router.get('/test-claude', testClaude);

// Route to send a message to Claude
router.post('/message', sendMessage);

// Route to analyze a response
router.post('/analyze', (req, res, next) => {
  console.log('[ClaudeRoutes] Analyze route hit');
  analyzeResponse(req, res, next);
});

// GET handler for narrative-to-scenario (returns 405 Method Not Allowed)
router.get('/narrative-to-scenario', (req, res) => {
  console.log('[ClaudeRoutes] GET narrative-to-scenario route hit');
  res.status(405).json({
    error: 'Method Not Allowed',
    message: 'This endpoint only accepts POST requests. Please use the application interface to submit narratives.'
  });
});

// Route to convert narrative to scenario
router.post('/narrative-to-scenario', (req, res, next) => {
  console.log('[ClaudeRoutes] POST narrative-to-scenario route hit');
  console.log('[ClaudeRoutes] Request body:', req.body);
  console.log('[ClaudeRoutes] Request headers:', req.headers);
  convertNarrativeToScenario(req, res, next);
});

// Route to evaluate conversation
router.post('/evaluate', evaluateConversation);

// Speech-related routes
router.post('/cleanup-transcription', speechController.cleanupTranscription);
router.post('/transcribe-audio', upload.single('audio'), speechController.transcribeAudio);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('[ClaudeRoutes] Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = router; 