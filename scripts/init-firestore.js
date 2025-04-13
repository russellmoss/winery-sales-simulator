import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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
  },
  {
    title: 'Premium Wine Tasting Experience',
    difficulty: 'Intermediate',
    description: 'Guide an experienced wine enthusiast through a premium wine tasting and secure a large purchase.',
    context: 'A knowledgeable wine collector is interested in your reserve wines.',
    objectives: [
      'Demonstrate deep wine knowledge',
      'Showcase premium wines effectively',
      'Secure a significant purchase'
    ],
    clientPersonality: {
      name: 'Robert Chen',
      traits: ['knowledgeable', 'discerning', 'collector'],
      background: 'Experienced wine collector with a sophisticated palate'
    }
  }
];

async function initializeFirestore() {
  try {
    const scenariosRef = collection(db, 'scenarios');
    
    for (const scenario of scenarios) {
      const docRef = await addDoc(scenariosRef, scenario);
      console.log('Added scenario with ID:', docRef.id);
    }
    
    console.log('Successfully initialized Firestore with sample scenarios');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
}

initializeFirestore(); 