import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getScenarioById, 
  saveInteraction, 
  saveEvaluation 
} from '../firebase/firestoreService';

const SimulatorContext = createContext();

export function useSimulator() {
  return useContext(SimulatorContext);
}

export function SimulatorProvider({ children }) {
  const [currentScenario, setCurrentScenario] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { scenarioId } = useParams();

  useEffect(() => {
    const loadScenario = async () => {
      if (!scenarioId) {
        console.log('No scenarioId provided, skipping scenario loading');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Loading scenario with ID:', scenarioId);
        setLoading(true);
        const scenario = await getScenarioById(scenarioId);
        console.log('Scenario loaded successfully:', scenario);
        setCurrentScenario(scenario);
        setInteractions([]);
        setEvaluation(null);
      } catch (err) {
        console.error('Error loading scenario:', err);
        setError(err.message);
      } finally {
        console.log('Finished loading scenario, setting loading to false');
        setLoading(false);
      }
    };

    loadScenario();
  }, [scenarioId]);

  const addInteraction = async (message, role) => {
    try {
      const newInteraction = {
        message,
        role,
        timestamp: new Date().toISOString(),
      };

      setInteractions(prev => [...prev, newInteraction]);
      await saveInteraction(scenarioId, newInteraction);
    } catch (err) {
      setError(err.message);
    }
  };

  const saveScenarioEvaluation = async (evaluationData) => {
    try {
      await saveEvaluation(scenarioId, evaluationData);
      setEvaluation(evaluationData);
    } catch (err) {
      setError(err.message);
    }
  };

  const value = {
    currentScenario,
    interactions,
    evaluation,
    loading,
    error,
    addInteraction,
    saveScenarioEvaluation,
  };

  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
} 