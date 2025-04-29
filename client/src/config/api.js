/**
 * API configuration for the winery sales simulator
 */

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';

// API Endpoints
export const getEndpoint = (endpoint) => {
  const endpoints = {
    message: `${API_BASE_URL}/api/message`,
    'narrative-to-scenario': `${API_BASE_URL}/api/narrative-to-scenario`,
    'cleanup-transcription': `${API_BASE_URL}/api/cleanup-transcription`
  };
  return endpoints[endpoint] || `${API_BASE_URL}/api/${endpoint}`;
};

// API endpoints
export const ENDPOINTS = {
  CLAUDE_MESSAGE: getEndpoint('message'),
  CLAUDE_ANALYZE: getEndpoint('analyze'),
  CLAUDE_EVALUATE: getEndpoint('evaluate'),
  CLAUDE_NARRATIVE_TO_SCENARIO: getEndpoint('narrative-to-scenario'),
  CLAUDE_CLEANUP_TRANSCRIPTION: getEndpoint('cleanup-transcription'),
  CLAUDE_TRANSCRIBE_AUDIO: getEndpoint('transcribe-audio')
};

export default {
  API_BASE_URL,
  getEndpoint,
  ENDPOINTS
}; 