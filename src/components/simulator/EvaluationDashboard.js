import React from 'react';
import './EvaluationDashboard.css';

const EvaluationDashboard = ({ evaluation, conversationMarkdown, onClose }) => {
  if (!evaluation) {
    return (
      <div className="evaluation-dashboard">
        <div className="evaluation-error">
          <p>No evaluation data available</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluation-dashboard">
      <div className="evaluation-content">
        <h2>Evaluation Results</h2>
        
        <div className="evaluation-section">
          <h3>Overall Score</h3>
          <div className="score">{evaluation.overallScore || 'N/A'}</div>
        </div>

        <div className="evaluation-section">
          <h3>Key Strengths</h3>
          <ul>
            {evaluation.strengths?.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>

        <div className="evaluation-section">
          <h3>Areas for Improvement</h3>
          <ul>
            {evaluation.improvements?.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>

        <div className="evaluation-section">
          <h3>Recommendations</h3>
          <ul>
            {evaluation.recommendations?.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </div>

        <div className="evaluation-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationDashboard; 