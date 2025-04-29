const fetch = require('node-fetch');

// System prompt for Claude to generate structured scenarios
const SYSTEM_PROMPT = `You are an expert at creating wine tasting room sales training scenarios. 
Given a narrative description, create a structured scenario with the following format:

{
  "title": "A descriptive title for the scenario",
  "description": "A detailed description of the scenario",
  "customerProfile": {
    "names": ["Customer names"],
    "homeLocation": "Where they live",
    "occupation": "Their occupation",
    "visitReason": "Why they are visiting"
  },
  "clientPersonality": {
    "knowledgeLevel": "Beginner/Intermediate/Advanced",
    "budget": "Low/Medium/High",
    "traits": ["Personality traits"],
    "preferences": {
      "favoriteWines": ["Wine types they like"],
      "dislikes": ["Wine types they dislike"],
      "interests": ["Other interests"]
    }
  },
  "behavioralInstructions": {
    "generalBehavior": ["How they should behave"],
    "tastingBehavior": ["How they should behave during tasting"],
    "purchaseIntentions": ["Their purchase intentions"]
  },
  "wineryInfo": {
    "name": "Winery name",
    "location": "Winery location"
  },
  "assistantRole": "The role of the staff member",
  "evaluationCriteria": ["Criteria for evaluating the interaction"],
  "tips": ["Tips for handling the scenario"]
}

Make sure to:
1. Extract all relevant information from the narrative
2. Fill in all fields with appropriate values
3. Keep the response in valid JSON format
4. Make the scenario realistic and challenging
5. Include specific wine preferences and dislikes
6. Add clear behavioral instructions
7. Include evaluation criteria for training purposes`;

exports.handler = async (event, context) => {
  console.log('=== narrative-to-scenario Function START ===');
  console.log('Event:', {
    httpMethod: event.httpMethod,
    path: event.path,
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : null
  });
  console.log('Context:', {
    functionName: context.functionName,
    functionVersion: context.functionVersion,
    invokedFunctionArn: context.invokedFunctionArn,
    memoryLimitInMB: context.memoryLimitInMB,
    awsRequestId: context.awsRequestId
  });

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Add OPTIONS handling for CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    console.log('Parsing request body');
    const { narrative } = JSON.parse(event.body);
    console.log('Narrative length:', narrative.length);
    console.log('Narrative preview:', narrative.substring(0, 100) + '...');

    // Check for Claude API key
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      throw new Error('CLAUDE_API_KEY environment variable is not set');
    }

    // Call Claude API
    console.log('Calling Claude API');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: narrative
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Claude API response:', data);

    // Parse the scenario from Claude's response
    let scenario;
    try {
      // Claude's response is in the content field
      const content = data.content[0].text;
      scenario = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      throw new Error('Failed to parse scenario from Claude response');
    }

    console.log('=== narrative-to-scenario Function SUCCESS ===');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ scenario })
    };
  } catch (error) {
    console.error('=== narrative-to-scenario Function ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}; 