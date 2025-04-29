const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const claudeApi = require('../utils/claudeApi');
const { v4: uuidv4 } = require('uuid');

// Initialize Anthropic client with error handling
let claude;
try {
  claude = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });
  console.log('Anthropic client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Anthropic client:', error);
  throw error;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function for retrying API calls
const retryWithBackoff = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
};

// Health check endpoint
exports.healthCheck = async (req, res) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  try {
    const isHealthy = await claudeApi.healthCheck();
    
    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'claude',
      requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[${requestId}] Claude API health check failed:`, error);
    next(error);
  }
};

// Test Claude API connectivity
exports.testClaude = async (req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  try {
    const isHealthy = await claudeApi.healthCheck();
    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'claude',
      requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Send a message to Claude
exports.sendMessage = async (req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  try {
    // Validate request body
    const { messages, options } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid request: messages array is required');
    }

    // Validate each message
    messages.forEach((msg, index) => {
      if (!msg.role || !msg.content) {
        throw new Error(`Invalid message at index ${index}: role and content are required`);
      }
    });

    // Log request details
    console.log(`[${requestId}] Sending message to Claude API:`, {
      messageCount: messages.length,
      options
    });

    // Send message using the Claude API utility
    const response = await claudeApi.sendMessage(messages, options);

    // Log successful response
    console.log(`[${requestId}] Claude API response received:`, {
      responseId: response.id,
      model: response.model,
      usage: response.usage
    });

    res.json({
      success: true,
      response,
      requestId
    });
  } catch (error) {
    // Log error details
    console.error(`[${requestId}] Error sending message to Claude API:`, {
      error: error.message,
      stack: error.stack,
      claudeError: error.claudeError
    });

    // Pass the error to the error handler middleware
    next(error);
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