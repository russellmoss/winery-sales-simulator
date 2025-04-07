import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScenarioById } from '../../data/winerySalesSimulatorScenarios';
import './RubricEvaluation.css';

/**
 * RubricEvaluation Component
 * 
 * This component displays and allows interaction with the evaluation rubric
 * for a specific sales scenario.
 */
const RubricEvaluation = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load the scenario data
    const loadScenario = () => {
      setLoading(true);
      try {
        const scenarioData = getScenarioById(scenarioId);
        if (scenarioData) {
          setScenario(scenarioData);
          setError(null);
        } else {
          setError('Scenario not found');
        }
      } catch (err) {
        setError('Error loading scenario: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadScenario();
  }, [scenarioId]);

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="rubric-evaluation loading">
        <div className="loading-spinner"></div>
        <p>Loading evaluation rubric...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rubric-evaluation error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleClose} className="btn-primary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="rubric-evaluation">
      <div className="rubric-header">
        <h1>{scenario.title} - Evaluation Rubric</h1>
        <button onClick={handleClose} className="btn-close">×</button>
      </div>
      
      <div className="rubric-content">
        <div className="scenario-info">
          <h2>Scenario Information</h2>
          <p><strong>Difficulty:</strong> {scenario.difficulty}</p>
          <p><strong>Description:</strong> {scenario.description}</p>
          <p><strong>Context:</strong> {scenario.context}</p>
        </div>
        
        <div className="evaluation-criteria">
          <h2>Evaluation Criteria</h2>
          {Object.entries(scenario.evaluationCriteria).map(([key, criterion]) => (
            <div key={key} className="criterion-item">
              <h3>{criterion.description}</h3>
              <p><strong>Weight:</strong> {criterion.weight}%</p>
              {criterion.dealBreaker && (
                <p className="deal-breaker">Deal Breaker</p>
              )}
              {criterion.minimumScore && (
                <p><strong>Minimum Score:</strong> {criterion.minimumScore}%</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RubricEvaluation; 