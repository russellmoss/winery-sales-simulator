/**
 * API configuration for the winery sales simulator
 */

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export { API_BASE_URL };

// API endpoints
export const ENDPOINTS = {
  CLAUDE_MESSAGE: `${API_BASE_URL}/claude/message`,
  CLAUDE_ANALYZE: `${API_BASE_URL}/claude/analyze`,
  CLAUDE_EVALUATE: `${API_BASE_URL}/claude/evaluate`,
  CLAUDE_NARRATIVE_TO_SCENARIO: `${API_BASE_URL}/claude/narrative-to-scenario`,
};

export default {
  API_BASE_URL,
  ENDPOINTS,
}; 