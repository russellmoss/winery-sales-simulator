/**
 * API configuration for the winery sales simulator
 */

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Function to get the correct endpoint based on environment
export const getEndpoint = (path) => {
  // In production, use the Render backend URL
  if (process.env.NODE_ENV === 'production') {
    return `${API_BASE_URL}/api/claude/${path}`;
  }
  
  // In development, use the local Express server
  return `http://localhost:5000/api/claude/${path}`;
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