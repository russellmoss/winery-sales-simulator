import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  setDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { debugScenarioStructure, validateScenario, debugFirestoreOperations } from '../utils/debugUtils';

const SCENARIOS_COLLECTION = 'scenarios';

// Scenarios
export const getScenarios = async () => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.error('No authenticated user found');
      throw new Error('You must be logged in to view scenarios');
    }

    await debugFirestoreOperations('read', { collection: SCENARIOS_COLLECTION });
    
    console.log('Attempting to fetch scenarios from Firestore...');
    console.log('Database instance:', db);
    console.log('Current user:', auth.currentUser.uid);
    
    const scenariosRef = collection(db, SCENARIOS_COLLECTION);
    console.log('Collection reference created:', {
      path: scenariosRef.path,
      id: scenariosRef.id
    });
    
    const scenariosQuery = query(scenariosRef, orderBy('title'));
    console.log('Query created with orderBy title:', scenariosQuery);
    
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
    
    const scenarios = snapshot.docs.map(doc => {
      const data = doc.data();
      // Log each scenario for debugging
      console.log('Processing scenario:', doc.id, data);
      
      // Ensure all required fields are present
      return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        difficulty: data.difficulty || 'Beginner',
        clientPersonality: data.clientPersonality || {
          knowledgeLevel: 'Beginner',
          budget: 'Moderate',
          traits: []
        },
        objectives: data.objectives || [],
        evaluationCriteria: data.evaluationCriteria || [],
        keyDocuments: data.keyDocuments || [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        ...data
      };
    });
    
    console.log('Successfully fetched scenarios:', scenarios);
    return scenarios;
    
  } catch (error) {
    console.error('Error getting scenarios:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
      name: error.name,
      user: auth.currentUser?.uid || 'no user'
    });
    throw error; // Let the component handle the error
  }
};

export const addScenario = async (scenarioData) => {
  try {
    console.log('Adding new scenario:', scenarioData);
    const scenariosRef = collection(db, SCENARIOS_COLLECTION);
    const docRef = await addDoc(scenariosRef, {
      ...scenarioData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('Successfully added scenario with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding scenario:', error);
    throw error;
  }
};

export const updateScenario = async (scenarioId, scenarioData) => {
  try {
    console.log('Updating scenario:', scenarioId);
    const scenarioRef = doc(db, SCENARIOS_COLLECTION, scenarioId);
    await updateDoc(scenarioRef, {
      ...scenarioData,
      updatedAt: new Date().toISOString()
    });
    console.log('Successfully updated scenario:', scenarioId);
    return scenarioId;
  } catch (error) {
    console.error('Error updating scenario:', error);
    throw error;
  }
};

export const deleteScenario = async (scenarioId) => {
  try {
    console.log('Deleting scenario:', scenarioId);
    const scenarioRef = doc(db, SCENARIOS_COLLECTION, scenarioId);
    await deleteDoc(scenarioRef);
    console.log('Successfully deleted scenario:', scenarioId);
  } catch (error) {
    console.error('Error deleting scenario:', error);
    throw error;
  }
};

export const getScenarioById = async (scenarioId) => {
  try {
    const scenarioRef = doc(db, SCENARIOS_COLLECTION, scenarioId);
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
    console.log('Saving interaction for scenario:', scenarioId);
    const interactionsRef = collection(db, SCENARIOS_COLLECTION, scenarioId, 'interactions');
    const docRef = await addDoc(interactionsRef, {
      ...interaction,
      timestamp: new Date().toISOString()
    });
    console.log('Interaction saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving interaction:', error, error.stack);
    throw error;
  }
};

export const getInteractions = async (scenarioId) => {
  try {
    console.log('Fetching interactions for scenario:', scenarioId);
    const interactionsRef = collection(db, SCENARIOS_COLLECTION, scenarioId, 'interactions');
    const interactionsQuery = query(interactionsRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(interactionsQuery);
    const interactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`Found ${interactions.length} interactions`);
    return interactions;
  } catch (error) {
    console.error('Error getting interactions:', error);
    throw error;
  }
};

// Evaluations
export const saveEvaluation = async (scenarioId, evaluation) => {
  try {
    const evaluationsRef = collection(db, SCENARIOS_COLLECTION, scenarioId, 'evaluations');
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
    const evaluationsRef = collection(db, SCENARIOS_COLLECTION, scenarioId, 'evaluations');
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