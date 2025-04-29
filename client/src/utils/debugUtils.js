import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const debugScenarioStructure = async (scenarioId) => {
  try {
    console.group('🔍 Debugging Scenario Structure');
    
    // Get specific scenario
    if (scenarioId) {
      const scenarioRef = doc(db, 'scenarios', scenarioId);
      const scenarioDoc = await getDoc(scenarioRef);
      
      if (!scenarioDoc.exists()) {
        console.error('❌ Scenario not found:', scenarioId);
        return;
      }

      const data = scenarioDoc.data();
      console.log('📄 Scenario Data:', {
        id: scenarioId,
        exists: true,
        hasRequiredFields: {
          title: !!data.title,
          description: !!data.description,
          difficulty: !!data.difficulty,
          clientPersonality: !!data.clientPersonality,
          objectives: Array.isArray(data.objectives),
          evaluationCriteria: Array.isArray(data.evaluationCriteria)
        },
        data: data
      });

      // Check subcollections
      const interactionsRef = collection(db, 'scenarios', scenarioId, 'interactions');
      const interactionsSnap = await getDocs(interactionsRef);
      console.log('🗣️ Interactions:', {
        count: interactionsSnap.size,
        isEmpty: interactionsSnap.empty,
        sample: interactionsSnap.empty ? null : interactionsSnap.docs[0].data()
      });

    } else {
      // Get all scenarios
      const scenariosRef = collection(db, 'scenarios');
      const scenariosSnap = await getDocs(scenariosRef);
      
      console.log('📚 All Scenarios:', {
        count: scenariosSnap.size,
        isEmpty: scenariosSnap.empty,
        scenarios: scenariosSnap.docs.map(doc => ({
          id: doc.id,
          hasRequiredFields: {
            title: !!doc.data().title,
            description: !!doc.data().description,
            difficulty: !!doc.data().difficulty,
            clientPersonality: !!doc.data().clientPersonality,
            objectives: Array.isArray(doc.data().objectives),
            evaluationCriteria: Array.isArray(doc.data().evaluationCriteria)
          }
        }))
      });
    }
  } catch (error) {
    console.error('❌ Error in debugScenarioStructure:', error);
  } finally {
    console.groupEnd();
  }
};

export const debugNetlifyEnvironment = () => {
  console.group('🌐 Netlify Environment Debug');
  
  // Check environment variables
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_ENV: process.env.REACT_APP_ENV,
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development'
  });

  // Check Firebase config
  console.log('Firebase Config Available:', {
    apiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: !!process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: !!process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: !!process.env.REACT_APP_FIREBASE_APP_ID
  });

  // Check build-specific features
  console.log('Build Features:', {
    hasServiceWorker: 'serviceWorker' in navigator,
    isHttps: window.location.protocol === 'https:',
    hasIndexedDB: !!window.indexedDB,
    netlifyInfo: {
      isNetlify: !!process.env.REACT_APP_NETLIFY,
      deployUrl: process.env.REACT_APP_DEPLOY_URL,
      deployPrime: process.env.REACT_APP_DEPLOY_PRIME_URL,
    }
  });

  console.groupEnd();
};

export const validateScenario = (scenario) => {
  console.group('🔎 Validating Scenario');
  
  const requiredFields = [
    'title',
    'description',
    'difficulty',
    'clientPersonality',
    'objectives',
    'evaluationCriteria'
  ];

  const validation = {
    hasAllRequiredFields: true,
    missingFields: [],
    fieldTypes: {},
    warnings: [],
    isValid: true
  };

  // Check required fields
  requiredFields.forEach(field => {
    const hasField = field in scenario;
    validation.fieldTypes[field] = typeof scenario[field];
    
    if (!hasField) {
      validation.hasAllRequiredFields = false;
      validation.missingFields.push(field);
      validation.isValid = false;
    }
  });

  // Validate clientPersonality structure
  if (scenario.clientPersonality) {
    const personalityValidation = {
      hasKnowledgeLevel: 'knowledgeLevel' in scenario.clientPersonality,
      hasBudget: 'budget' in scenario.clientPersonality,
      hasTraits: Array.isArray(scenario.clientPersonality.traits)
    };

    if (!personalityValidation.hasKnowledgeLevel) {
      validation.warnings.push('Missing knowledgeLevel in clientPersonality');
    }
    if (!personalityValidation.hasBudget) {
      validation.warnings.push('Missing budget in clientPersonality');
    }
    if (!personalityValidation.hasTraits) {
      validation.warnings.push('Missing or invalid traits array in clientPersonality');
      validation.isValid = false;
    }
  }

  // Validate arrays
  if (Array.isArray(scenario.objectives) && scenario.objectives.length === 0) {
    validation.warnings.push('objectives array is empty');
  }
  if (Array.isArray(scenario.evaluationCriteria) && scenario.evaluationCriteria.length === 0) {
    validation.warnings.push('evaluationCriteria array is empty');
  }

  console.log('Validation Results:', validation);
  console.groupEnd();
  
  return validation;
};

export const debugFirestoreOperations = async (operation, data) => {
  console.group(`🔥 Firestore ${operation} Debug`);
  
  try {
    console.log('Operation Details:', {
      type: operation,
      timestamp: new Date().toISOString(),
      data: data
    });

    // Check permissions
    if (operation === 'write' || operation === 'delete') {
      console.log('Checking write permissions...');
      // You could add specific permission checks here
    }

    // Log any rate limiting or quota information
    console.log('Quota Information:', {
      dailyOperations: '...',  // You would need to track this
      operationsPerMinute: '...',  // You would need to track this
    });

  } catch (error) {
    console.error('❌ Firestore Operation Error:', {
      operation,
      error: error.message,
      code: error.code,
      stack: error.stack
    });
  } finally {
    console.groupEnd();
  }
}; 