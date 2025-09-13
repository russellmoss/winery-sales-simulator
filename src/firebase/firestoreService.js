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

const SCENARIOS_COLLECTION = 'scenarios';

// Scenarios
export const getScenarios = async () => {
  try {
    console.log('Attempting to fetch scenarios from Firestore...');
    console.log('Database instance:', db);
    
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
      name: error.name
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
    console.log('Loading scenario with ID:', scenarioId);
    
    const scenarioRef = doc(db, SCENARIOS_COLLECTION, scenarioId);
    const scenarioDoc = await getDoc(scenarioRef);
    
    if (!scenarioDoc.exists()) {
      console.error('Scenario not found:', {
        scenarioId,
        error: 'Document does not exist'
      });
      throw new Error('Scenario not found');
    }

    const data = scenarioDoc.data();
    console.log('Raw scenario data:', data);

    // Check for required fields
    if (!data.title) {
      console.error('Scenario missing required field:', {
        scenarioId,
        missingField: 'title'
      });
      throw new Error('Scenario data is incomplete');
    }

    const scenario = {
      id: scenarioDoc.id,
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

    console.log('Scenario loaded successfully:', {
      id: scenario.id,
      title: scenario.title
    });

    return scenario;
  } catch (error) {
    console.error('Error getting scenario:', {
      error,
      code: error.code,
      message: error.message,
      scenarioId,
      stack: error.stack
    });
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

/**
 * Set a user's role
 * @param {string} userId - The user ID
 * @param {string} role - The role to set ('admin' or 'user')
 * @returns {Promise<void>}
 */
export const setUserRole = async (userId, role) => {
  try {
    if (role !== 'admin' && role !== 'user') {
      throw new Error('Invalid role: must be either "admin" or "user"');
    }
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Role updated for user ${userId} to ${role}`);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Get user role
 * @param {string} userId - The user ID
 * @returns {Promise<string>} - The user's role
 */
export const getUserRole = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('User document not found in getUserRole, creating one...');
      
      // Get the current user from auth
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Create a basic user document
      await setDoc(userRef, {
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email.split('@')[0],
        role: 'user', // Default role
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return 'user'; // Default role
    }
    
    // Default to 'user' if no role is specified
    return userDoc.data().role || 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
};

/**
 * Create a new user (admin only)
 * @param {Object} userData - User data including email, password, displayName, and role
 * @returns {Promise<Object>} - The created user
 */
export const createUser = async (userData) => {
  try {
    // Create a new Firebase Auth user through a server function
    // This is typically done through a serverless function since client-side
    // code can't directly create users with Firebase Auth
    const response = await fetch('/api/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        role: userData.role || 'user'
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user');
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}; 