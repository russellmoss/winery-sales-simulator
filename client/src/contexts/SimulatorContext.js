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
    if (!scenarioId) {
      console.error('No scenarioId provided to addInteraction');
      setError('Scenario ID is required');
      return;
    }

    if (!message || !role) {
      console.error('Missing required fields:', { message: !!message, role: !!role });
      setError('Message and role are required');
      return;
    }

    const newInteraction = {
      message,
      role,
      timestamp: new Date().toISOString(),
    };

    try {
      console.log('Adding new interaction:', { scenarioId, role, messageLength: message.length });
      
      // Save to Firestore first
      const interactionId = await saveInteraction(scenarioId, newInteraction);
      console.log('Interaction saved successfully with ID:', interactionId);
      
      // Update state once with the complete interaction including ID
      setInteractions(prev => [...prev, { ...newInteraction, id: interactionId }]);

      return interactionId;
    } catch (err) {
      console.error('Error adding interaction:', err);
      setError(err.message || 'Failed to save interaction');
      throw err; // Re-throw to allow handling by the caller
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
    setInteractions
  };

  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
} 