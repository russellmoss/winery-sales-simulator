import React, { useState } from 'react';
import { sendMessageToClaude } from '../../services/claudeService';

function ClaudeTest() {
  const [inputMessage, setInputMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Test scenario for Claude
  const testScenario = {
    id: 'test-scenario',
    title: 'Test Scenario',
    description: 'A couple visiting a wine tasting room',
    clientProfile: 'A couple in their 30s visiting a wine tasting room for the first time.',
    clientPersonality: {
      traits: ['Curious', 'Knowledgeable about food', 'Budget-conscious']
    },
    clientObjectives: [
      'Learn about different wine varieties',
      'Find wines that pair well with their favorite foods',
      'Stay within their budget'
    ],
    assistantRole: 'Wine tasting room staff member helping customers discover wines they might enjoy.',
    evaluationCriteria: [
      'Product Knowledge',
      'Customer Engagement',
      'Sales Techniques'
    ],
    tips: [
      'Ask about their food preferences',
      'Suggest wine and food pairings',
      'Be mindful of their budget'
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await sendMessageToClaude(testScenario, [
        { message: inputMessage, role: 'user' }
      ]);
      setResponse(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="claude-test">
      <div className="brief-header">
        <h1 className="brief-title">Claude API Test</h1>
        <p className="brief-subtitle">
          Test the Claude API integration with a simple scenario
        </p>
      </div>

      <div className="test-container">
        <div className="scenario-info">
          <h2>Test Scenario</h2>
          <p><strong>Title:</strong> {testScenario.title}</p>
          <p><strong>Description:</strong> {testScenario.description}</p>
          <p><strong>Client Profile:</strong> {testScenario.clientProfile}</p>
          <h3>Client Personality Traits:</h3>
          <ul>
            {testScenario.clientPersonality.traits.map((trait, index) => (
              <li key={index}>{trait}</li>
            ))}
          </ul>
          <h3>Client Objectives:</h3>
          <ul>
            {testScenario.clientObjectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>

        <div className="test-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="test-message">Your Message:</label>
              <textarea
                id="test-message"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="form-control"
                rows="4"
                placeholder="Type your message to test the Claude API..."
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !inputMessage.trim()}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {response && (
            <div className="response-container">
              <h3>Claude's Response:</h3>
              <div className="response-content">
                {response}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClaudeTest; 