/**
 * API configuration for the winery sales simulator
 */

const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: process.env.NODE_ENV === 'production'
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api',

  // Claude API endpoints
  CLAUDE: {
    SEND_MESSAGE: '/claude/message',
    HEALTH_CHECK: '/claude/health',
    TEST: '/claude/test'
  },

  // ElevenLabs API endpoints
  ELEVENLABS: {
    TEXT_TO_SPEECH: '/elevenlabs/text-to-speech',
    HEALTH_CHECK: '/elevenlabs/health'
  },

  // Headers for API requests
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },

  // Timeout for API requests (in milliseconds)
  TIMEOUT: 30000,

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000
  }
};

console.log('[API] Configuration:', {
  baseUrl: API_CONFIG.BASE_URL,
  environment: process.env.NODE_ENV,
  customUrl: process.env.REACT_APP_API_URL,
});

const getEndpoint = (endpoint) => {
  const endpoints = {
    message: `${API_CONFIG.BASE_URL}/claude/message`,
    analyze: `${API_CONFIG.BASE_URL}/claude/analyze`,
    'narrative-to-scenario': `${API_CONFIG.BASE_URL}/claude/narrative-to-scenario`,
    'cleanup-transcription': `${API_CONFIG.BASE_URL}/claude/cleanup-transcription`,
    'transcribe-audio': `${API_CONFIG.BASE_URL}/claude/transcribe-audio`,
    'evaluate': `${API_CONFIG.BASE_URL}/claude/evaluate`
  };

  return endpoints[endpoint] || `${API_CONFIG.BASE_URL}/${endpoint}`;
};

export { API_CONFIG, getEndpoint };

// API endpoints
export const ENDPOINTS = {
  CLAUDE_MESSAGE: getEndpoint('message'),
  CLAUDE_ANALYZE: getEndpoint('analyze'),
  CLAUDE_EVALUATE: getEndpoint('evaluate'),
  CLAUDE_NARRATIVE_TO_SCENARIO: getEndpoint('narrative-to-scenario'),
  CLAUDE_CLEANUP_TRANSCRIPTION: getEndpoint('cleanup-transcription'),
  CLAUDE_TRANSCRIBE_AUDIO: getEndpoint('transcribe-audio')
};

export default API_CONFIG; 