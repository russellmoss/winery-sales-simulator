const { handler } = require('@netlify/functions');
const Anthropic = require('@anthropic-ai/sdk');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    // Fallback to default credentials if service account file is not available
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }
}

const db = admin.firestore();
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const messageHandler = async (event, context) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    const { message, scenarioId } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Get the scenario from Firestore if scenarioId is provided
    let scenario = null;
    if (scenarioId) {
      try {
        const scenarioDoc = await db.collection('scenarios').doc(scenarioId).get();
        if (scenarioDoc.exists) {
          scenario = scenarioDoc.data();
          console.log('Loaded scenario:', scenarioId);
        } else {
          console.warn('Scenario not found:', scenarioId);
        }
      } catch (error) {
        console.error('Error loading scenario:', error);
      }
    }

    // Construct the system prompt based on scenario context
    let systemPrompt = 'You are a helpful AI assistant.';
    if (scenario) {
      systemPrompt = `You are playing the role of ${scenario.clientName || 'a client'} in a wine sales scenario. 
        Context: ${scenario.context || 'No specific context provided.'}
        Objectives: ${scenario.objectives || 'No specific objectives provided.'}
        Personality: ${scenario.clientPersonality || 'No specific personality traits provided.'}
        
        Please respond naturally and in character, maintaining the context and objectives of the scenario.`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        response: response.content[0].text,
        scenarioId: scenarioId,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Error in Claude message handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process message',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};

exports.handler = handler(messageHandler); 