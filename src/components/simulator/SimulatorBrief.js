import React from 'react';
import { useSimulator } from '../../contexts/SimulatorContext';
import './SimulatorBrief.css';

const SimulatorBrief = () => {
  const { currentScenario, metrics } = useSimulator();

  if (!currentScenario) {
    return null;
  }

  return (
    <div className="simulator-brief">
      <div className="brief-header">
        <h2>{currentScenario.title}</h2>
        <div className="difficulty-badge">
          {currentScenario.difficulty}
        </div>
      </div>

      <div className="brief-content">
        <section className="scenario-description">
          <h3>Scenario Description</h3>
          <p>{currentScenario.description}</p>
        </section>

        <section className="client-profile">
          <h3>Client Profile</h3>
          <div className="profile-details">
            <div className="profile-trait">
              <span className="trait-label">Knowledge Level:</span>
              <span className="trait-value">{currentScenario.clientPersonality.knowledgeLevel}</span>
            </div>
            <div className="profile-trait">
              <span className="trait-label">Budget:</span>
              <span className="trait-value">{currentScenario.clientPersonality.budget}</span>
            </div>
            <div className="profile-trait">
              <span className="trait-label">Traits:</span>
              <div className="trait-tags">
                {currentScenario.clientPersonality.traits.map((trait, index) => (
                  <span key={index} className="trait-tag">{trait}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="objectives">
          <h3>Objectives</h3>
          <ul>
            {currentScenario.objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </section>

        <section className="evaluation-criteria">
          <h3>Evaluation Criteria</h3>
          <ul>
            {currentScenario.evaluationCriteria.map((criterion, index) => (
              <li key={index}>{criterion}</li>
            ))}
          </ul>
        </section>

        <section className="funnel-stage">
          <h3>Sales Funnel Stage</h3>
          <p>{currentScenario.funnelStage}</p>
        </section>

        <section className="key-documents">
          <h3>Key Documents</h3>
          <ul>
            {currentScenario.keyDocuments.map((doc, index) => (
              <li key={index}>
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  {doc.title}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="current-metrics">
          <h3>Current Performance</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-value">{metrics.totalInteractions}</span>
              <span className="metric-label">Total Interactions</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{metrics.successfulSales}</span>
              <span className="metric-label">Successful Sales</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{metrics.averageResponseTime.toFixed(1)}s</span>
              <span className="metric-label">Avg Response Time</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{metrics.customerSatisfaction.toFixed(1)}</span>
              <span className="metric-label">Customer Satisfaction</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SimulatorBrief; 