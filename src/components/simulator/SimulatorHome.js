import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getScenarios } from '../../firebase/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import './SimulatorHome.css';

const SimulatorHome = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        if (!currentUser) {
          setError('Please log in to view scenarios');
          setLoading(false);
          return;
        }

        console.log('Fetching scenarios...');
        const fetchedScenarios = await getScenarios();
        console.log('Fetched scenarios:', fetchedScenarios);
        setScenarios(fetchedScenarios);
        setError(null);
      } catch (err) {
        console.error('Error loading scenarios:', err);
        setError('Failed to load scenarios. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadScenarios();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="simulator-home">
        <div className="loading-container">
          <h2>Loading Scenarios</h2>
          <p>Please wait while we fetch available scenarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="simulator-home">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          {!currentUser && (
            <Link to="/login" className="login-link">
              Log In
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="simulator-home">
        <div className="no-scenarios">
          <h2>No Scenarios Available</h2>
          <p>There are currently no scenarios available. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="simulator-home">
      <h1>Available Scenarios</h1>
      <div className="scenarios-grid">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="scenario-card">
            <h3>{scenario.title}</h3>
            <p>{scenario.description}</p>
            <div className="scenario-details">
              <span className="difficulty">{scenario.difficulty}</span>
            </div>
            <Link
              to={`/scenario/${scenario.id}/brief`}
              className="start-button"
            >
              Start Scenario
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulatorHome; 