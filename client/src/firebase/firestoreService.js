import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './firebase';

// Scenarios
export const getScenarios = async () => {
  try {
    console.log('Attempting to fetch scenarios from Firestore...');
    console.log('Database instance:', db);
    
    const scenariosRef = collection(db, 'scenarios');
    console.log('Collection reference created:', {
      path: scenariosRef.path,
      id: scenariosRef.id
    });
    
    const scenariosQuery = query(scenariosRef);
    console.log('Query created:', scenariosQuery);
    
    const snapshot = await getDocs(scenariosQuery);
    console.log('Snapshot received:', {
      empty: snapshot.empty,
      size: snapshot.size,
      metadata: snapshot.metadata
    });
    
    if (snapshot.empty) {
      console.log('No scenarios found in the database');
      return [];
    }
    
    const scenarios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Successfully fetched scenarios:', scenarios);
    return scenarios;
    
  } catch (error) {
    console.error('Error getting scenarios:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return an empty array instead of throwing to prevent app crashes
    return [];
  }
};

export const getScenarioById = async (scenarioId) => {
  try {
    const scenarioRef = doc(db, 'scenarios', scenarioId);
    const scenarioDoc = await getDoc(scenarioRef);
    
    if (!scenarioDoc.exists()) {
      throw new Error('Scenario not found');
    }

    return {
      id: scenarioDoc.id,
      ...scenarioDoc.data()
    };
  } catch (error) {
    console.error('Error getting scenario:', error);
    throw error;
  }
};

// Interactions
export const saveInteraction = async (scenarioId, interaction) => {
  try {
    const interactionsRef = collection(db, 'interactions');
    await addDoc(interactionsRef, {
      scenarioId,
      ...interaction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving interaction:', error);
    throw error;
  }
};

export const getInteractions = async (scenarioId) => {
  try {
    const interactionsRef = collection(db, 'interactions');
    const interactionsQuery = query(interactionsRef, where('scenarioId', '==', scenarioId));
    const snapshot = await getDocs(interactionsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting interactions:', error);
    throw error;
  }
};

// Evaluations
export const saveEvaluation = async (scenarioId, evaluation) => {
  try {
    const evaluationsRef = collection(db, 'scenarios', scenarioId, 'evaluations');
    await addDoc(evaluationsRef, {
      ...evaluation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving evaluation:', error);
    throw error;
  }
};

export const getEvaluations = async (scenarioId) => {
  try {
    const evaluationsRef = collection(db, 'scenarios', scenarioId, 'evaluations');
    const snapshot = await getDocs(evaluationsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting evaluations:', error);
    throw error;
  }
};

// User Progress
export const saveUserProgress = async (userId, scenarioId, progress) => {
  try {
    const progressRef = doc(db, 'users', userId, 'progress', scenarioId);
    await updateDoc(progressRef, {
      ...progress,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving user progress:', error);
    throw error;
  }
};

export const getUserProgress = async (userId, scenarioId) => {
  try {
    const progressRef = doc(db, 'users', userId, 'progress', scenarioId);
    const progressDoc = await getDoc(progressRef);
    
    if (!progressDoc.exists()) {
      return null;
    }

    return {
      id: progressDoc.id,
      ...progressDoc.data()
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
};

// Scenario Statistics
export const getScenarioStatistics = async (scenarioId) => {
  try {
    const statsRef = doc(db, 'statistics', scenarioId);
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        completionRate: 0
      };
    }

    return statsDoc.data();
  } catch (error) {
    console.error('Error getting scenario statistics:', error);
    throw error;
  }
};

export const updateScenarioStatistics = async (scenarioId, newStats) => {
  try {
    const statsRef = doc(db, 'statistics', scenarioId);
    await updateDoc(statsRef, {
      ...newStats,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating scenario statistics:', error);
    throw error;
  }
}; 