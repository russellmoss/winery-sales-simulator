const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');

const claude = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Send a message to Claude
exports.sendMessage = async (req, res) => {
  try {
    const { scenario, messages } = req.body;

    console.log('Received request body:', JSON.stringify(req.body, null, 2));

    if (!scenario || !messages) {
      console.error('Missing required fields:', { scenario: !!scenario, messages: !!messages });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Received messages:', JSON.stringify(messages, null, 2));

    // Check if Claude API key is available
    if (!process.env.CLAUDE_API_KEY) {
      console.error('Claude API key is missing');
      return res.status(500).json({ error: 'Claude API key is missing' });
    }

    // Check if ElevenLabs API key is available
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY is not set');
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    // Format messages for Claude
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.message || msg.content || '' // Ensure content is included
    }));

    // Construct system prompt
    const systemPrompt = `You are a wine tasting room guest in a sales simulation scenario. Here are the details of your character and situation:

Title: ${scenario.title}
Description: ${scenario.description}

Customer Profile:
- Names: ${scenario.customerProfile.names.join(' and ')}
- Home Location: ${scenario.customerProfile.homeLocation}
- Occupation: ${scenario.customerProfile.occupation}
- Visit Reason: ${scenario.customerProfile.visitReason}

Personality & Knowledge:
- Knowledge Level: ${scenario.clientPersonality.knowledgeLevel}
- Budget Level: ${scenario.clientPersonality.budget}
- Personality Traits: ${scenario.clientPersonality.traits.join(', ')}

Wine Preferences:
- Favorite Wines: ${scenario.clientPersonality.preferences.favoriteWines.join(', ')}
- Dislikes: ${scenario.clientPersonality.preferences.dislikes.join(', ')}
${scenario.clientPersonality.preferences.interests.length > 0 ? `- Interests: ${scenario.clientPersonality.preferences.interests.join(', ')}` : ''}

Behavioral Instructions:
${scenario.behavioralInstructions.generalBehavior.map(behavior => `- ${behavior}`).join('\n')}

Tasting Behavior:
${scenario.behavioralInstructions.tastingBehavior.map(behavior => `- ${behavior}`).join('\n')}

Purchase Intentions:
${scenario.behavioralInstructions.purchaseIntentions.map(intention => `- ${intention}`).join('\n')}

Winery Context:
- Name: ${scenario.wineryInfo.name}
- Location: ${scenario.wineryInfo.location}

IMPORTANT: You are ALWAYS the customer in this conversation. The user is ALWAYS the wine tasting room staff member. Never switch roles. Your responses should be natural and conversational while staying true to your character's background, preferences, and visit history.`;

    console.log('System prompt:', systemPrompt);

    // Get response from Claude
    const claudeResponse = await claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      system: systemPrompt, // Send system prompt as top-level parameter
      messages: formattedMessages,
      temperature: 0.7
    });

    const responseText = claudeResponse.content[0].text;
    console.log('Claude response:', responseText);

    // Convert text to speech using ElevenLabs
    const voiceId = process.env[scenario.voiceId] || process.env.ELEVENLABS_ANN_VOICE_ID; // Use scenario's voice or default to Ann
    console.log('Using voice ID:', voiceId);
    const elevenLabsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: responseText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
          optimize_streaming_latency: 3
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer',
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    // Send both the text response and audio data
    res.json({
      response: responseText,
      audio: Buffer.from(elevenLabsResponse.data).toString('base64')
    });

  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message
    });
  }
};

// Analyze a response using Claude
exports.analyzeResponse = async (req, res) => {
  try {
    const { scenario, messages } = req.body;

    if (!scenario || !messages) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const analysisPrompt = `Please analyze the following conversation between a wine tasting room staff member and a customer. 
    Evaluate the staff member's performance based on these criteria:
    ${scenario.evaluationCriteria.map(c => `- ${c.name}: ${c.description}`).join('\n')}
    
    Provide specific feedback for each criterion and an overall assessment.`;

    const response = await claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [
        ...messages,
        { role: 'user', content: analysisPrompt }
      ]
    });

    res.json({ analysis: response.content[0].text });
  } catch (error) {
    console.error('Error analyzing response with Claude:', error);
    res.status(500).json({ error: 'Failed to analyze response' });
  }
};

// Convert narrative text to structured scenario JSON
exports.convertNarrativeToScenario = async (req, res) => {
  try {
    console.log('=== convertNarrativeToScenario START ===');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request URL:', req.url);
    console.log('Request path:', req.path);
    console.log('Request baseUrl:', req.baseUrl);
    console.log('Request originalUrl:', req.originalUrl);
    
    const { narrative } = req.body;

    if (!narrative) {
      console.error('Missing narrative in request body');
      return res.status(400).json({ error: 'Narrative text is required' });
    }

    // Check if Claude API key is available
    if (!process.env.CLAUDE_API_KEY) {
      console.error('Claude API key is missing');
      return res.status(500).json({ error: 'Claude API key is missing' });
    }

    console.log('Claude API key is available');
    console.log('Narrative length:', narrative.length);
    console.log('Narrative preview:', narrative.substring(0, 100) + '...');

    // Create a system prompt that instructs Claude to extract structured data
    const systemPrompt = `You are an expert at extracting structured data from narrative text.
Your task is to convert the provided narrative description of a winery sales scenario into a structured JSON format.

The JSON should follow this EXACT structure:
{
  "title": "A descriptive title for the scenario",
  "description": "A brief description of the scenario",
  "difficulty": "One of: Beginner, Intermediate, Advanced",
  "voiceId": "dF9Efvf1yhy50ez0XcsR",
  "wineryInfo": {
    "name": "Name of the winery",
    "location": "Location of the winery",
    "specialties": ["List", "of", "wine", "specialties"],
    "uniqueFeatures": ["List", "of", "unique", "features"]
  },
  "customerProfile": {
    "names": ["First customer name", "Second customer name if applicable"],
    "homeLocation": "Where the customer is from",
    "occupation": "Customer's occupation",
    "visitReason": "Why they are visiting the winery"
  },
  "clientPersonality": {
    "knowledgeLevel": "One of: Beginner, Intermediate, Advanced",
    "budget": "One of: Low, Moderate, High",
    "traits": ["List", "of", "personality", "traits"],
    "preferences": {
      "favoriteWines": ["List", "of", "favorite", "wines"],
      "dislikes": ["List", "of", "disliked", "wines"],
      "interests": ["List", "of", "interests"]
    }
  },
  "behavioralInstructions": {
    "generalBehavior": ["List", "of", "general", "behaviors"],
    "tastingBehavior": ["List", "of", "tasting", "behaviors"],
    "purchaseIntentions": ["List", "of", "purchase", "intentions"]
  },
  "funnelStage": "One of: awareness, consideration, decision",
  "objectives": ["List", "of", "objectives"],
  "evaluationCriteria": ["List", "of", "evaluation", "criteria"],
  "keyDocuments": ["List", "of", "key", "documents"],
  "initialContext": "Initial context for the scenario"
}

IMPORTANT:
1. ALWAYS use "dF9Efvf1yhy50ez0XcsR" as the voiceId
2. Extract as much information as possible from the narrative
3. For any missing information, use reasonable defaults
4. Your response should ONLY contain the JSON object, with no additional text or explanation
5. Ensure the JSON is properly formatted and valid`;

    console.log('Sending request to Claude API...');
    // Get response from Claude
    const claudeResponse = await claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: narrative }
      ],
      system: systemPrompt
    });

    const responseText = claudeResponse.content[0].text;
    console.log('Claude response received');
    console.log('Response length:', responseText.length);
    console.log('Response preview:', responseText.substring(0, 100) + '...');

    // Extract the JSON from the response
    let scenarioJson;
    try {
      console.log('Attempting to parse Claude response as JSON...');
      // Try to find JSON in the response (it might be wrapped in code blocks)
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/```\n([\s\S]*?)\n```/) ||
                        responseText.match(/({[\s\S]*})/);
      
      if (jsonMatch && jsonMatch[1]) {
        console.log('Found JSON in code block');
        scenarioJson = JSON.parse(jsonMatch[1]);
      } else {
        console.log('No code blocks found, trying to parse entire response');
        scenarioJson = JSON.parse(responseText);
      }
      
      // Ensure the voiceId is set correctly
      if (scenarioJson.voiceId !== "dF9Efvf1yhy50ez0XcsR") {
        console.log('Overriding voiceId to default value');
        scenarioJson.voiceId = "dF9Efvf1yhy50ez0XcsR";
      }
      
      console.log('Successfully parsed JSON');
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      console.error('Raw response:', responseText);
      return res.status(500).json({ 
        error: 'Failed to parse Claude response as JSON',
        details: parseError.message,
        rawResponse: responseText
      });
    }

    console.log('Sending response to client');
    // Send the structured scenario JSON
    res.json({ scenario: scenarioJson });
    console.log('=== convertNarrativeToScenario SUCCESS ===');

  } catch (error) {
    console.error('=== convertNarrativeToScenario ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    res.status(500).json({ 
      error: 'Failed to convert narrative to scenario',
      details: error.message
    });
  }
}; 