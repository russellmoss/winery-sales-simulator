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
export const getAllScenarios = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.SCENARIOS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting scenarios:', error);
    throw error;
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
  getAllScenarios,
  getScenarioById,
  getRecentInteractions
}; 