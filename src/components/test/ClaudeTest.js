import React, { useState } from 'react';
import { sendMessageToClaude } from '../../services/claudeService';

const ClaudeTest = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testScenario = {
    id: 'test-scenario',
    title: 'Wine Tasting Room Visit',
    description: 'A couple visiting the tasting room for the first time, interested in learning about your wines and potentially joining the wine club.',
    clientPersonality: {
      knowledgeLevel: 'Beginner',
      budget: 'Moderate',
      traits: ['Wine enthusiast', 'Social', 'Curious']
    },
    objectives: ['Learn about wines', 'Join wine club', 'Purchase bottles'],
    evaluationCriteria: ['Wine club signup', 'Bottle purchases', 'Positive experience'],
    funnelStage: 'Awareness',
    keyDocuments: [
      { title: 'Wine List', url: 'https://example.com/wine-list' },
      { title: 'Wine Club Benefits', url: 'https://example.com/wine-club-benefits' }
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await sendMessageToClaude(testScenario, [
        { role: 'user', content: input }
      ]);
      setResponse(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="claude-test">
      <h1>Claude API Test</h1>
      <p>This component tests the connection to the Claude API.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            rows={4}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send to Claude'}
        </button>
      </form>

      {error && (
        <div className="error">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="response">
          <h3>Claude's Response:</h3>
          <div className="response-content">
            {response}
          </div>
        </div>
      )}

      <style jsx>{`
        .claude-test {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
        }
        button {
          padding: 10px 20px;
          background-color: #722f37;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .error {
          margin-top: 20px;
          padding: 10px;
          background-color: #fee2e2;
          color: #991b1b;
          border-radius: 4px;
        }
        .response {
          margin-top: 20px;
          padding: 20px;
          background-color: #f9fafb;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }
        .response-content {
          white-space: pre-wrap;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default ClaudeTest; 