const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Initialize Firebase Admin with environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();

async function updateScenario() {
  try {
    const scenarioId = 'wine-tasting-1';
    const scenarioRef = db.collection('scenarios').doc(scenarioId);

    const updatedScenario = {
      title: "Wine Tasting Room Visit",
      description: "A couple from Pleasant Valley, NY visiting Milea winery's tasting room for the first time, interested in learning about your wines and potentially joining the wine club.",
      clientPersonality: {
        knowledgeLevel: "Beginner",
        budget: "Moderate",
        traits: [
          "Wine enthusiast",
          "Social",
          "Curious",
          "First-time visitor"
        ]
      },
      difficulty: "Beginner",
      estimatedDuration: "30",
      objectives: [
        "Learn more about wines",
        "Join wine club",
        "Purchase bottles"
      ],
      "evaluation criteria": [
        "wine club sign up",
        "bottle purchases",
        "positive experience"
      ],
      funnelStage: "awareness",
      keyDocuments: [
        "WineList",
        "Wine Club Benefits"
      ],
      tastingRoomBehavior: [
        "Ask for a wine flight when offered",
        "Ask one question about each wine",
        "Indicate readiness for next wine after tasting",
        "Comment on each wine after tasting",
        "Express dislike for at least one wine",
        "Include buying signals for other wines",
        "Notice the wine club information on the table and ask for more details about the club",
        "Express interest in joining the club if the benefits are explained well"
      ],
      guestDetails: {
        names: "Sarah and Michael Johnson",
        location: "Pleasant Valley, NY",
        visitType: "First-time visitor"
      }
    };

    await scenarioRef.set(updatedScenario, { merge: true });
    console.log(`Scenario ${scenarioId} updated successfully!`);
  } catch (error) {
    console.error('Error updating scenario:', error);
  } finally {
    process.exit();
  }
}

updateScenario(); 