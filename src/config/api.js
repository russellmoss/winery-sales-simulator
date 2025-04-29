/**
 * API configuration for the winery sales simulator
 */

// API base URL - use environment variable or default to localhost
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// API endpoints
export const ENDPOINTS = {
  CLAUDE_MESSAGE: `${API_BASE_URL}/claude/message`,
  CLAUDE_ANALYZE: `${API_BASE_URL}/claude/analyze`,
  CLAUDE_EVALUATE: `${API_BASE_URL}/claude/evaluate`,
};

export default {
  API_BASE_URL,
  ENDPOINTS,
}; 