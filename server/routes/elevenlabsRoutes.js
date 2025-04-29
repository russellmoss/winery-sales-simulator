const express = require('express');
const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`[ElevenLabsRoutes] ${req.method} ${req.path} - Request received`);
  console.log('[ElevenLabsRoutes] Headers:', req.headers);
  console.log('[ElevenLabsRoutes] Body:', req.body);
  next();
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'elevenlabs',
    timestamp: new Date().toISOString()
  });
});

// Text to speech endpoint
router.post('/text-to-speech', async (req, res, next) => {
  try {
    const { text, voiceId } = req.body;
    
    if (!text || !voiceId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Text and voiceId are required'
      });
    }

    // For now, just return a mock response
    res.json({
      success: true,
      message: 'Text to speech conversion would happen here'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 