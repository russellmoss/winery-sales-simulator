const express = require('express');
const router = express.Router();
const axios = require('axios');

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
    elevenLabs: !!process.env.ELEVENLABS_API_KEY
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

    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('[ElevenLabsRoutes] ELEVENLABS_API_KEY is not set');
      return res.status(500).json({
        error: 'Server Error',
        message: 'ElevenLabs API key is not configured'
      });
    }

    console.log('[ElevenLabsRoutes] Making request to ElevenLabs API:', {
      voiceId,
      textLength: text.length
    });

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    // Convert the audio buffer to base64
    const audioBase64 = Buffer.from(response.data).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    console.log('[ElevenLabsRoutes] Successfully generated audio');
    
    res.json({
      success: true,
      audioUrl
    });
  } catch (error) {
    console.error('[ElevenLabsRoutes] Error generating audio:', error.message);
    next(error);
  }
});

module.exports = router; 