const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyA16MWIAudcNe3r7ae0y2OR90GLmfxCqCw",
  authDomain: "winery-sales-simulator.firebaseapp.com",
  projectId: "winery-sales-simulator",
  storageBucket: "winery-sales-simulator.appspot.com",
  messagingSenderId: "1003376854901",
  appId: "1:1003376854901:web:053269d1035fc3d32ab53c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const scenarios = [
  {
    id: 'wine-club-intro',
    title: 'Wine Club Introduction',
    difficulty: 'Beginner',
    description: 'A young professional couple interested in exploring premium wines and considering wine club membership.',
    funnelStage: 'consideration',
    clientPersonality: {
      budget: 'High',
      knowledgeLevel: 'Intermediate',
      traits: [
        'Enthusiastic',
        'Value-conscious',
        'Career-focused'
      ]
    },
    objectives: [
      'explain wine club tiers',
      'demonstrate value proposition',
      'secure membership signup'
    ],
    evaluationCriteria: [
      'wine club signup',
      'membership tier selection',
      'customer satisfaction'
    ],
    keyDocuments: [
      'Wine Club Benefits',
      'Membership Tiers',
      'Pricing Sheet'
    ]
  },
  {
    id: 'premium-collector',
    title: 'Premium Collector Visit',
    difficulty: 'Advanced',
    description: 'An experienced wine collector interested in rare and reserve wines for their collection.',
    funnelStage: 'decision',
    clientPersonality: {
      budget: 'Very High',
      knowledgeLevel: 'Expert',
      traits: [
        'Collector',
        'Knowledgeable',
        'Detail-oriented'
      ]
    },
    objectives: [
      'showcase reserve wines',
      'discuss aging potential',
      'secure large purchase'
    ],
    evaluationCriteria: [
      'case purchases',
      'reserve wine sales',
      'future visit scheduling'
    ],
    keyDocuments: [
      'Reserve Wine List',
      'Vintage Chart',
      'Cellar Notes'
    ]
  },
  {
    id: 'corporate-event',
    title: 'Corporate Event Planning',
    difficulty: 'Intermediate',
    description: 'A corporate event planner looking to organize a team-building wine tasting experience.',
    funnelStage: 'awareness',
    clientPersonality: {
      budget: 'High',
      knowledgeLevel: 'Beginner',
      traits: [
        'Professional',
        'Organized',
        'Budget-conscious'
      ]
    },
    objectives: [
      'present event packages',
      'customize experience',
      'secure booking'
    ],
    evaluationCriteria: [
      'event booking',
      'package customization',
      'budget alignment'
    ],
    keyDocuments: [
      'Event Packages',
      'Venue Information',
      'Catering Menu'
    ]
  }
];

async function initializeFirestore() {
  try {
    console.log('Starting Firestore initialization...');
    const scenariosRef = collection(db, 'scenarios');
    
    for (const scenario of scenarios) {
      const { id, ...scenarioData } = scenario;
      // Use setDoc with custom ID instead of addDoc for consistent IDs
      await setDoc(doc(scenariosRef, id), scenarioData);
      console.log('Added/Updated scenario:', scenario.title, 'with ID:', id);
    }
    
    console.log('Successfully initialized Firestore with sample scenarios');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

initializeFirestore(); 