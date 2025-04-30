/**
 * API configuration for the winery sales simulator
 */

// Get the base URL from environment variable or use the current origin
const API_BASE_URL = process.env.REACT_APP_API_URL || `${window.location.origin}/api`;

// Function to get API endpoints
export const getEndpoint = (endpoint) => {
  const ENDPOINTS = {
    message: `${API_BASE_URL}/claude/message`,
    'narrative-to-scenario': `${API_BASE_URL}/claude/narrative-to-scenario`,
    'cleanup-transcription': `${API_BASE_URL}/claude/cleanup-transcription`
  };
  return ENDPOINTS[endpoint] || `${API_BASE_URL}/${endpoint}`;
};

export { API_BASE_URL };

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
  getEndpoint,
  ENDPOINTS
}; 