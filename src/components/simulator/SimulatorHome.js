import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulator } from '../../contexts/SimulatorContext';
import { winerySalesSimulatorScenarios, getScenariosByDifficulty } from '../../data/winerySalesSimulatorScenarios';
import './SimulatorHome.css';

/**
 * SimulatorHome Component
 * 
 * This component serves as the landing page for the winery sales simulator.
 * It displays available scenarios and allows users to start a new simulation.
 */
const SimulatorHome = () => {
  const navigate = useNavigate();
  const { startNewSimulation } = useSimulator();
  const [scenarios, setScenarios] = useState([]);
  const [filteredScenarios, setFilteredScenarios] = useState([]);
  const [difficulty, setDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all scenarios
    setScenarios(winerySalesSimulatorScenarios);
    setFilteredScenarios(winerySalesSimulatorScenarios);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Filter scenarios based on selected difficulty
    if (difficulty === 'all') {
      setFilteredScenarios(scenarios);
    } else {
      setFilteredScenarios(getScenariosByDifficulty(difficulty));
    }
  }, [difficulty, scenarios]);

  const handleStartSimulation = (scenarioId) => {
    startNewSimulation(scenarioId);
    navigate('/simulator/brief');
  };

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  if (loading) {
    return (
      <div className="simulator-home loading">
        <div className="loading-spinner"></div>
        <p>Loading scenarios...</p>
      </div>
    );
  }

  return (
    <div className="simulator-home">
      <div className="simulator-header">
        <h1>Winery Sales Simulator</h1>
        <p>Practice your winery sales skills with these interactive scenarios</p>
      </div>

      <div className="difficulty-filter">
        <label htmlFor="difficulty-select">Filter by difficulty:</label>
        <select 
          id="difficulty-select" 
          value={difficulty} 
          onChange={handleDifficultyChange}
        >
          <option value="all">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
      </div>

      <div className="scenarios-grid">
        {filteredScenarios.map(scenario => (
          <div key={scenario.id} className="scenario-card">
            <div className="scenario-header">
              <h2>{scenario.title}</h2>
              <span className={`difficulty-badge ${scenario.difficulty.toLowerCase()}`}>
                {scenario.difficulty}
              </span>
            </div>
            <p className="scenario-description">{scenario.description}</p>
            <div className="scenario-details">
              <p><strong>Context:</strong> {scenario.context}</p>
              <p><strong>Client:</strong> {scenario.clientPersonality.name}</p>
            </div>
            <button 
              className="start-button"
              onClick={() => handleStartSimulation(scenario.id)}
            >
              Start Simulation
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulatorHome; 