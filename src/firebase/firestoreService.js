import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
const COLLECTIONS = {
  INTERACTIONS: 'interactions',
  EVALUATIONS: 'evaluations',
  SCENARIOS: 'scenarios',
  USERS: 'users'
};

/**
 * Save a chat interaction to Firestore
 * @param {Object} interaction - The interaction object to save
 * @returns {Promise<string>} - The ID of the saved interaction
 */
export const saveInteraction = async (interaction) => {
  try {
    const interactionData = {
      ...interaction,
      timestamp: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.INTERACTIONS), interactionData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving interaction:', error);
    throw error;
  }
};

/**
 * Get all interactions for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of interactions
 */
export const getUserInteractions = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.INTERACTIONS),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user interactions:', error);
    throw error;
  }
};

/**
 * Get a specific interaction by ID
 * @param {string} interactionId - The interaction ID
 * @returns {Promise<Object>} - The interaction object
 */
export const getInteractionById = async (interactionId) => {
  try {
    const docRef = doc(db, COLLECTIONS.INTERACTIONS, interactionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Interaction not found');
    }
  } catch (error) {
    console.error('Error getting interaction:', error);
    throw error;
  }
};

/**
 * Save an evaluation to Firestore
 * @param {Object} evaluation - The evaluation object to save
 * @returns {Promise<string>} - The ID of the saved evaluation
 */
export const saveEvaluation = async (evaluation) => {
  try {
    const evaluationData = {
      ...evaluation,
      timestamp: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.EVALUATIONS), evaluationData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving evaluation:', error);
    throw error;
  }
};

/**
 * Get evaluations for a specific interaction
 * @param {string} interactionId - The interaction ID
 * @returns {Promise<Array>} - Array of evaluations
 */
export const getEvaluationsForInteraction = async (interactionId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.EVALUATIONS),
      where('interactionId', '==', interactionId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting evaluations:', error);
    throw error;
  }
};

/**
 * Get all scenarios from Firestore
 * @returns {Promise<Array>} - Array of scenarios
 */
export const fetchScenarios = async () => {
  console.log('Attempting to fetch scenarios from Firestore...');
  try {
    const scenariosRef = collection(db, COLLECTIONS.SCENARIOS);
    console.log('Collection reference created:', {
      path: scenariosRef.path,
      id: scenariosRef.id,
      type: scenariosRef.type
    });
    
    const scenariosQuery = query(scenariosRef);
    console.log('Query created, attempting to fetch documents...');
    
    const querySnapshot = await getDocs(scenariosQuery);
    console.log('Query executed, documents received:', querySnapshot.size);
    
    const scenarios = [];
    querySnapshot.forEach((doc) => {
      console.log('Processing document:', doc.id);
      scenarios.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('Successfully fetched scenarios:', scenarios.length);
    
    // If no scenarios were found, add some default ones
    if (scenarios.length === 0) {
      console.log('No scenarios found, using default scenarios');
      return [{
        id: 'scenario1',
        title: 'First-Time Wine Club Member',
        difficulty: 'Beginner',
        description: 'Help a first-time visitor understand wine club membership benefits and close a sale.',
        context: 'A couple visiting your winery for the first time shows interest in wine club membership.',
        objectives: [
          'Explain wine club benefits clearly',
          'Address common concerns about membership',
          'Close the wine club membership sale'
        ],
        clientPersonality: {
          name: 'Sarah & James Thompson',
          traits: ['curious', 'value-conscious', 'new to wine'],
          background: 'Young professional couple exploring wine country for the first time'
        }
      }];
    }
    
    return scenarios;
  } catch (error) {
    console.error('Error fetching scenarios:', {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Return default scenarios on error
    console.log('Returning default scenarios due to error');
    return [{
      id: 'scenario1',
      title: 'First-Time Wine Club Member',
      difficulty: 'Beginner',
      description: 'Help a first-time visitor understand wine club membership benefits and close a sale.',
      context: 'A couple visiting your winery for the first time shows interest in wine club membership.',
      objectives: [
        'Explain wine club benefits clearly',
        'Address common concerns about membership',
        'Close the wine club membership sale'
      ],
      clientPersonality: {
        name: 'Sarah & James Thompson',
        traits: ['curious', 'value-conscious', 'new to wine'],
        background: 'Young professional couple exploring wine country for the first time'
      }
    }];
  }
};

/**
 * Get a specific scenario by ID
 * @param {string} scenarioId - The scenario ID
 * @returns {Promise<Object>} - The scenario object
 */
export const getScenarioById = async (scenarioId) => {
  try {
    const docRef = doc(db, COLLECTIONS.SCENARIOS, scenarioId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Scenario not found');
    }
  } catch (error) {
    console.error('Error getting scenario:', error);
    throw error;
  }
};

/**
 * Get recent interactions for a user
 * @param {string} userId - The user ID
 * @param {number} limit - Maximum number of interactions to return
 * @returns {Promise<Array>} - Array of recent interactions
 */
export const getRecentInteractions = async (userId, limitCount = 5) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.INTERACTIONS),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting recent interactions:', error);
    throw error;
  }
};

export default {
  saveInteraction,
  getUserInteractions,
  getInteractionById,
  saveEvaluation,
  getEvaluationsForInteraction,
  fetchScenarios,
  getScenarioById,
  getRecentInteractions
}; 