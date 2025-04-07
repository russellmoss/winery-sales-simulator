import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getScenarios } from '../../firebase/firestoreService';

function SimulatorHome() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        console.log('Starting to load scenarios...');
        setLoading(true);
        const scenariosData = await getScenarios();
        console.log('Scenarios loaded:', scenariosData);
        setScenarios(scenariosData);
      } catch (err) {
        console.error('Error in SimulatorHome:', err);
        setError(err.message);
      } finally {
        console.log('Finished loading scenarios, setting loading to false');
        setLoading(false);
      }
    };

    loadScenarios();
  }, []);

  const filteredScenarios = scenarios.filter(scenario => {
    if (difficultyFilter === 'all') return true;
    return scenario.difficulty?.trim().toLowerCase() === difficultyFilter.toLowerCase();
  });

  if (loading) {
    return <div className="loading">Loading scenarios...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="simulator-home">
      <h1>Wine Sales Simulator</h1>
      <p>Practice your wine sales skills with AI-powered scenarios</p>

      {loading ? (
        <div className="loading">Loading scenarios...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : scenarios.length === 0 ? (
        <div className="no-scenarios">No scenarios available</div>
      ) : (
        scenarios.map((scenario) => (
          <div key={scenario.id} className="scenario-card">
            <div className="scenario-card-content">
              <h2 className="scenario-title">{scenario.title}</h2>
              <p className="scenario-description">{scenario.description}</p>
              
              <div className="scenario-meta">
                <div className="scenario-details">
                  <div className="scenario-detail">
                    <i className="fas fa-signal"></i>
                    <span>{scenario.difficulty || 'Beginner'}</span>
                  </div>
                  <div className="scenario-detail">
                    <i className="fas fa-clock"></i>
                    <span>{scenario.estimatedDuration || '30'} minutes</span>
                  </div>
                </div>
              </div>
              
              <div className="scenario-actions">
                <Link 
                  to={`/simulator/${scenario.id}/brief`} 
                  className="start-button"
                >
                  Start Scenario
                </Link>
              </div>
            </div>
          </div>
        ))
      )}

      <style jsx>{`
        .scenario-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
        }
        .scenario-title {
          font-size: 1.5rem;
          margin-bottom: 10px;
          color: #333;
        }
        .scenario-description {
          color: #666;
          margin-bottom: 15px;
        }
        .scenario-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .scenario-details {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .scenario-detail {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #666;
        }
        .scenario-detail i {
          color: #007bff;
        }
        .start-button {
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.2s;
          margin-top: 10px;
          align-self: flex-start;
        }
        .start-button:hover {
          background-color: #0056b3;
        }
        .start-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .loading {
          text-align: center;
          padding: 20px;
          color: #666;
        }
        .error {
          color: #dc3545;
          padding: 10px;
          background-color: #f8d7da;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .no-scenarios {
          text-align: center;
          padding: 20px;
          color: #666;
        }
        .scenario-card-content {
          display: flex;
          flex-direction: column;
        }
        .scenario-actions {
          margin-top: 15px;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}

export default SimulatorHome; 