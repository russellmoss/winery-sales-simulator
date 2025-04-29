import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { winerySalesSimulatorScenarios } from '../data/winerySalesSimulatorScenarios';
import { firestoreService, authService } from '../firebase';

const SimulatorContext = createContext();

export const useSimulator = () => {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
};

export const SimulatorProvider = ({ children }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [currentInteraction, setCurrentInteraction] = useState(null);
  const [scenarios, setScenarios] = useState(winerySalesSimulatorScenarios);
  const [metrics, setMetrics] = useState({
    totalInteractions: 0,
    successfulSales: 0,
    averageResponseTime: 0,
    customerSatisfaction: 0,
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load scenarios from Firestore if available
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setLoading(true);
        setError(null);
        const firestoreScenarios = await firestoreService.getAllScenarios();
        if (firestoreScenarios && firestoreScenarios.length > 0) {
          setScenarios(firestoreScenarios);
        }
      } catch (error) {
        console.error('Error loading scenarios from Firestore:', error);
        setError('Failed to load scenarios from Firestore');
        // Fall back to local scenarios
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadScenarios();
    }
  }, [user]);

  const startNewSimulation = useCallback(async (scenarioId) => {
    try {
      setLoading(true);
      setError(null);
      
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (!scenario) {
        throw new Error('Invalid scenario ID');
      }

      setIsSimulating(true);
      setCurrentScenario(scenario);
      setMessages([]);
      setMetrics({
        totalInteractions: 0,
        successfulSales: 0,
        averageResponseTime: 0,
        customerSatisfaction: 0,
      });

      // Create a new interaction in Firestore
      if (user) {
        const interaction = {
          userId: user.uid,
          scenarioId: scenario.id,
          startTime: new Date().toISOString(),
          messages: [],
          metrics: {
            totalInteractions: 0,
            successfulSales: 0,
            averageResponseTime: 0,
            customerSatisfaction: 0,
          }
        };

        const interactionId = await firestoreService.saveInteraction(interaction);
        setCurrentInteraction({
          id: interactionId,
          ...interaction
        });
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
      setError(error.message || 'Failed to start simulation');
    } finally {
      setLoading(false);
    }
  }, [scenarios, user]);

  const endSimulation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (currentInteraction && user) {
        // Update the interaction in Firestore
        const updatedInteraction = {
          ...currentInteraction,
          endTime: new Date().toISOString(),
          messages,
          metrics
        };

        await firestoreService.saveInteraction(updatedInteraction);
      }

      setIsSimulating(false);
      setCurrentScenario(null);
      setCurrentInteraction(null);
    } catch (error) {
      console.error('Error ending simulation:', error);
      setError(error.message || 'Failed to end simulation');
    } finally {
      setLoading(false);
    }
  }, [currentInteraction, messages, metrics, user]);

  const resetSimulation = useCallback(() => {
    setMessages([]);
    setMetrics({
      totalInteractions: 0,
      successfulSales: 0,
      averageResponseTime: 0,
      customerSatisfaction: 0,
    });
  }, []);

  const addMessage = useCallback(async (message) => {
    try {
      const newMessage = {
        ...message,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, newMessage]);

      // Update the interaction in Firestore
      if (currentInteraction && user) {
        const updatedInteraction = {
          ...currentInteraction,
          messages: [...messages, newMessage]
        };

        await firestoreService.saveInteraction(updatedInteraction);
      }
    } catch (error) {
      console.error('Error adding message:', error);
      setError(error.message || 'Failed to add message');
    }
  }, [messages, currentInteraction, user]);

  const analyzeInteraction = useCallback(async (interaction) => {
    try {
      const updatedMetrics = {
        ...metrics,
        totalInteractions: metrics.totalInteractions + 1,
        successfulSales: interaction.successful ? metrics.successfulSales + 1 : metrics.successfulSales,
        averageResponseTime: (metrics.averageResponseTime * metrics.totalInteractions + interaction.responseTime) / (metrics.totalInteractions + 1),
        customerSatisfaction: (metrics.customerSatisfaction * metrics.totalInteractions + interaction.satisfaction) / (metrics.totalInteractions + 1),
      };

      setMetrics(updatedMetrics);

      // Update the interaction in Firestore
      if (currentInteraction && user) {
        const updatedInteraction = {
          ...currentInteraction,
          metrics: updatedMetrics
        };

        await firestoreService.saveInteraction(updatedInteraction);
      }
    } catch (error) {
      console.error('Error analyzing interaction:', error);
      setError(error.message || 'Failed to analyze interaction');
    }
  }, [metrics, currentInteraction, user]);

  const analyzeAssistantResponseImpact = useCallback((response, context) => {
    // Analyze how the assistant's response aligns with the scenario goals
    const impact = {
      relevance: 0,
      helpfulness: 0,
      salesPotential: 0,
      suggestions: []
    };

    if (currentScenario) {
      // Check response against scenario goals
      currentScenario.objectives.forEach(goal => {
        if (response.toLowerCase().includes(goal.toLowerCase())) {
          impact.relevance += 1;
        }
      });

      // Analyze sales potential based on customer profile
      if (currentScenario.clientPersonality && currentScenario.clientPersonality.traits) {
        if (currentScenario.clientPersonality.traits.includes('Budget-conscious')) {
          impact.salesPotential = response.toLowerCase().includes('value') ? 0.8 : 0.5;
        } else {
          impact.salesPotential = response.toLowerCase().includes('premium') ? 0.8 : 0.5;
        }
      }

      // Generate suggestions for improvement
      if (impact.relevance < currentScenario.objectives.length) {
        impact.suggestions.push("Consider addressing more of the customer's goals");
      }
      if (!response.includes("visit") && currentScenario.clientPersonality && currentScenario.clientPersonality.traits.includes('Wine enthusiast')) {
        impact.suggestions.push("Suggest a visit to the tasting room");
      }
    }

    return impact;
  }, [currentScenario]);

  const value = {
    isSimulating,
    messages,
    currentScenario,
    currentInteraction,
    metrics,
    scenarios,
    user,
    loading,
    error,
    startNewSimulation,
    endSimulation,
    resetSimulation,
    addMessage,
    analyzeInteraction,
    analyzeAssistantResponseImpact,
  };

  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
};

export default SimulatorContext; 