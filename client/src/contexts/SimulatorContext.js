import React, { createContext, useContext, useState, useCallback } from 'react';
import { db, auth } from '../firebase/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getScenarioById } from '../firebase/firestoreService';

const SimulatorContext = createContext();

export function useSimulator() {
  return useContext(SimulatorContext);
}

export function SimulatorProvider({ children }) {
  const [currentScenario, setCurrentScenario] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastLoadedScenarioId, setLastLoadedScenarioId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Listen for auth state changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const loadScenario = useCallback(async (scenarioId) => {
    if (!scenarioId) {
      console.log('No scenarioId provided, skipping scenario loading');
      setError('Scenario ID is required');
      return;
    }

    // Prevent reloading the same scenario if we've already tried too many times
    if (scenarioId === lastLoadedScenarioId && retryCount >= MAX_RETRIES) {
      console.log('Max retries reached for scenario:', scenarioId);
      setError('Failed to load scenario after multiple attempts');
      setLoading(false);
      return;
    }

    // Prevent reloading the same scenario if we already have it
    if (scenarioId === lastLoadedScenarioId && currentScenario) {
      console.log('Scenario already loaded, skipping reload');
      return;
    }

    // If we previously failed to load this scenario, don't try again
    if (scenarioId === lastLoadedScenarioId && error === 'Scenario not found') {
      console.log('Previous attempt failed to find scenario, skipping reload');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Loading scenario with ID:', scenarioId);
      setLoading(true);
      setError(null);
      
      const scenario = await getScenarioById(scenarioId);
      console.log('Scenario loaded successfully:', {
        id: scenario.id,
        title: scenario.title
      });
      
      setCurrentScenario(scenario);
      setLastLoadedScenarioId(scenarioId);
      setInteractions([]);
      setEvaluation(null);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error loading scenario:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        scenarioId
      });
      
      // Only update state if this is a new error or we haven't reached max retries
      if (scenarioId !== lastLoadedScenarioId || retryCount < MAX_RETRIES) {
        setError(err.message || 'Failed to load scenario');
        setCurrentScenario(null);
        setLastLoadedScenarioId(scenarioId);
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [lastLoadedScenarioId, error, currentScenario, retryCount]);

  const addInteraction = async (interaction) => {
    if (!currentScenario) {
      console.error('No scenario loaded');
      setError('No scenario loaded');
      return;
    }

    // Handle both old and new parameter structures
    const message = typeof interaction === 'string' ? interaction : interaction.message;
    const role = typeof interaction === 'string' ? 'user' : interaction.role;

    if (!message || !role) {
      console.error('Missing required fields:', { message: !!message, role: !!role });
      setError('Message and role are required');
      return;
    }

    const newInteraction = {
      message,
      role,
      timestamp: new Date().toISOString(),
      scenarioId: currentScenario.id,
      userId: currentUser?.uid
    };

    try {
      console.log('Adding new interaction:', { 
        scenarioId: currentScenario.id, 
        role, 
        messageLength: message.length,
        currentScenario: currentScenario 
      });
      
      // Save to Firestore
      const interactionsRef = collection(db, 'interactions');
      const docRef = await addDoc(interactionsRef, newInteraction);
      console.log('Interaction saved successfully with ID:', docRef.id);
      
      // Update state
      setInteractions(prev => [...prev, { ...newInteraction, id: docRef.id }]);

      return docRef.id;
    } catch (err) {
      console.error('Error adding interaction:', err);
      setError(err.message || 'Failed to save interaction');
      throw err;
    }
  };

  const saveScenarioEvaluation = async (evaluationData) => {
    if (!currentScenario?.id) {
      setError('No scenario loaded');
      return;
    }

    try {
      const evaluationsRef = collection(db, 'evaluations');
      const docRef = await addDoc(evaluationsRef, {
        ...evaluationData,
        scenarioId: currentScenario.id,
        userId: currentUser?.uid,
        timestamp: new Date().toISOString()
      });
      setEvaluation({ ...evaluationData, id: docRef.id });
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
    loadScenario,
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