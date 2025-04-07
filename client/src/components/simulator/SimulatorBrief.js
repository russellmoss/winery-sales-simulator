import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSimulator } from '../../contexts/SimulatorContext';

function SimulatorBrief() {
  const { currentScenario, loading, error } = useSimulator();
  const { scenarioId } = useParams();

  if (loading) {
    return <div className="loading">Loading scenario...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!currentScenario) {
    return <div className="error-message">Scenario not found</div>;
  }

  return (
    <div className="brief-container">
      <div className="brief-header">
        <h1 className="brief-title">{currentScenario.title}</h1>
        <p className="brief-subtitle">
          Difficulty: {currentScenario.difficulty} | Duration: {currentScenario.estimatedDuration || '30'} minutes
        </p>
      </div>

      <div className="brief-section">
        <h2 className="brief-section-title">Scenario Overview</h2>
        <p>{currentScenario.description}</p>
      </div>

      <div className="brief-section">
        <h2 className="brief-section-title">Client Information</h2>
        <div className="client-info">
          <h3>Client Profile</h3>
          <p>{currentScenario.clientProfile || 'A wine enthusiast visiting the tasting room.'}</p>

          <h3>Client Personality</h3>
          <ul>
            {currentScenario.clientPersonality?.traits?.map((trait, index) => (
              <li key={index}>{trait}</li>
            )) || <li>No personality traits specified</li>}
          </ul>

          <h3>Client Objectives</h3>
          <ul>
            {currentScenario.objectives?.map((objective, index) => (
              <li key={index}>{objective}</li>
            )) || <li>No objectives specified</li>}
          </ul>
        </div>
      </div>

      <div className="brief-section">
        <h2 className="brief-section-title">Your Role</h2>
        <p>{currentScenario.assistantRole || 'Wine tasting room staff member'}</p>
      </div>

      <div className="brief-section">
        <h2 className="brief-section-title">Evaluation Criteria</h2>
        <ul>
          {currentScenario['evaluation criteria']?.map((criterion, index) => (
            <li key={index}>{criterion}</li>
          )) || <li>No evaluation criteria specified</li>}
        </ul>
      </div>

      <div className="brief-section">
        <h2 className="brief-section-title">Tips for Success</h2>
        <ul>
          {currentScenario.tips?.map((tip, index) => (
            <li key={index}>{tip}</li>
          )) || <li>No tips specified</li>}
        </ul>
      </div>

      <div className="brief-actions">
        <Link
          to={`/simulator/${scenarioId}/chat`}
          className="btn btn-primary"
        >
          Start Conversation
        </Link>
      </div>
    </div>
  );
}

export default SimulatorBrief; 