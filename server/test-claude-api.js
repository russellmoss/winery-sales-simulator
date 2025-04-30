const { Anthropic } = require('@anthropic-ai/sdk');
require('dotenv').config();

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Test message data from the logs
const testData = {
  messages: [
    { role: 'user', content: 'hi' }
  ],
  system: 'You are acting as a wine tasting room customer in a sales simulation scenario. Here are the details of your character and situation:\n\nTitle: Wine Tasting Room Visit \nDescription: A couple visiting the tasting room for the first time, interested in learning about your wines and potentially joining the wine club.\n\nCustomer Profile:\n- Names: Sarah and Michael\n- Home Location: Pleasant Valley, NY\n- Occupation: Sarah is a doctor. Michael is an occupational therapist\n- Visit Reason: They live close by in Pleasant Valley and have heard of Milea.  They are friends with Kevin and Mary Serrano, who are club members and they had Milea wine at a party of theirs and liked it and now they came in for a tasting.  They really liked the Cabernet Franc. \n\nPersonality & Knowledge:\n- Knowledge Level: Beginner\n- Budget Level: Moderate\n- Personality Traits: Wine enthusiast, curious, reserved\n\nWine Preferences:\n- Favorite Wines: Pinot noir\n- Dislikes: Chardonnay\n\nBehavioral Instructions:\n- interested\n- not verbose\n\nTasting Behavior:\n- Wants to know about the winemaking techniques\n\nPurchase Intentions:\n- will convert to bottle sales or club membership, if persuaded and asked, but only if asked\n\nWinery Context:\n- Name: Milea Estate Vineyard\n- Location: Staatsburg, NY \n\nIMPORTANT: You are ALWAYS the customer in this conversation. The user is ALWAYS the wine tasting room staff member. Never switch roles. Your responses should be natural and conversational while staying true to your character\'s background, preferences, and visit history.',
  model: 'claude-3-opus-20240229',
  max_tokens: 1000
};

async function testClaudeAPI() {
  console.log('Starting Claude API test...');
  console.log('Environment variables loaded:', {
    NODE_ENV: process.env.NODE_ENV,
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY ? 'exists' : 'missing',
  });

  try {
    // Test 1: Simple message without system prompt
    console.log('\nTest 1: Simple message without system prompt');
    const simpleMessage = {
      messages: [{ role: 'user', content: 'hi' }],
      model: testData.model,
      max_tokens: 1000
    };

    console.log('Request:', JSON.stringify(simpleMessage, null, 2));
    const simpleResponse = await anthropic.messages.create(simpleMessage);
    console.log('Response:', JSON.stringify(simpleResponse, null, 2));

    // Test 2: Full message with system prompt
    console.log('\nTest 2: Full message with system prompt');
    console.log('Request:', JSON.stringify(testData, null, 2));
    const fullResponse = await anthropic.messages.create(testData);
    console.log('Response:', JSON.stringify(fullResponse, null, 2));

  } catch (error) {
    console.error('Error:', {
      name: error.name,
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      response: error.response?.data,
      stack: error.stack
    });
  }
}

// Run the test
testClaudeAPI().catch(console.error); 