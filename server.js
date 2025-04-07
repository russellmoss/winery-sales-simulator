const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Claude API configuration
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-sonnet-20240229';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Usage tracking middleware
const usageTracking = (req, res, next) => {
  const userId = req.headers['x-user-id'] || 'anonymous';
  const timestamp = new Date().toISOString();
  const endpoint = req.path;
  
  // Log usage (in a real app, you would store this in a database)
  console.log(`Usage: ${timestamp} - User: ${userId} - Endpoint: ${endpoint}`);
  
  next();
};
app.use(usageTracking);

// Claude API proxy endpoint
app.post('/api/claude/message', async (req, res) => {
  try {
    // Check if API key is available
    if (!CLAUDE_API_KEY) {
      return res.status(500).json({ 
        error: 'Claude API key is missing. Please set the CLAUDE_API_KEY environment variable.' 
      });
    }
    
    const { messages, scenario, customerProfile, assistantProfile, wineryProfile } = req.body;
    
    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array is required' });
    }
    
    // Create system prompts
    const scenarioPrompt = createWineryScenarioSystemPrompt(scenario);
    const customerPrompt = createCustomerSystemPrompt(customerProfile);
    const assistantPrompt = createAssistantSystemPrompt(assistantProfile);
    const wineryPrompt = createWinerySystemPrompt(wineryProfile);
    
    // Combine system prompts
    const systemPrompt = `${scenarioPrompt}\n\n${customerPrompt}\n\n${assistantPrompt}\n\n${wineryPrompt}`;
    
    // Format messages for Claude API - filter out any system messages
    const formattedMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    
    console.log('Formatted messages for Claude:', JSON.stringify(formattedMessages, null, 2));
    
    // Prepare request body
    const requestBody = {
      model: CLAUDE_MODEL,
      messages: formattedMessages,
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt
    };
    
    // Send request to Claude API
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Claude API error:", errorData);
      return res.status(response.status).json({ 
        error: `Claude API error: ${errorData.error?.message || 'Unknown error'}` 
      });
    }
    
    const data = await response.json();
    
    // Format response
    const formattedResponse = {
      id: uuidv4(),
      type: 'assistant',
      content: data.content[0].text,
      timestamp: new Date().toISOString()
    };
    
    // Return response
    res.json(formattedResponse);
  } catch (error) {
    console.error("Error in Claude API proxy:", error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Claude API analysis endpoint
app.post('/api/claude/analyze', async (req, res) => {
  try {
    // Check if API key is available
    if (!CLAUDE_API_KEY) {
      return res.status(500).json({ 
        error: 'Claude API key is missing. Please set the CLAUDE_API_KEY environment variable.' 
      });
    }
    
    const { interaction } = req.body;
    
    // Validate request
    if (!interaction) {
      return res.status(400).json({ error: 'Invalid request: interaction object is required' });
    }
    
    // Create system prompt for analysis
    const systemPrompt = `You are an expert in wine sales and customer service. 
Your task is to analyze the following interaction between a wine sales representative and a customer.
Provide feedback on the sales representative's performance, identifying strengths and areas for improvement.
Focus on techniques used, customer engagement, product knowledge, and sales approach.`;

    // Format messages for Claude API
    const formattedMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `Please analyze this interaction:
        
Scenario: ${interaction.scenario?.title || 'Unknown'}
Customer: ${interaction.customerProfile?.knowledge || 'Unknown'} knowledge, ${interaction.customerProfile?.budget || 'Unknown'} budget
Interaction: ${interaction.successful ? 'Successful' : 'Unsuccessful'}
Response Time: ${interaction.responseTime || 'Unknown'} ms
Satisfaction: ${interaction.satisfaction || 'Unknown'}

Messages:
${interaction.messages?.map(msg => `${msg.type === 'user' ? 'Customer' : 'Sales Rep'}: ${msg.content}`).join('\n') || 'No messages'}`
      }
    ];
    
    // Prepare request body
    const requestBody = {
      model: CLAUDE_MODEL,
      messages: formattedMessages,
      max_tokens: 1000,
      temperature: 0.5
    };
    
    // Send request to Claude API
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Claude API error:", errorData);
      return res.status(response.status).json({ 
        error: `Claude API error: ${errorData.error?.message || 'Unknown error'}` 
      });
    }
    
    const data = await response.json();
    
    // Format response
    const formattedResponse = {
      feedback: data.content[0].text,
      score: calculateScore(interaction),
      suggestions: extractSuggestions(data.content[0].text)
    };
    
    // Return response
    res.json(formattedResponse);
  } catch (error) {
    console.error("Error in Claude API analysis proxy:", error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Helper functions
function createWineryScenarioSystemPrompt(scenario) {
  if (!scenario) {
    console.error("createWineryScenarioSystemPrompt called with null or undefined scenario");
    return "You are a sales representative for a winery.";
  }
  
  // Special handling for wine tasting scenario
  if (scenario.id === 'wine-tasting') {
    return `You are a customer visiting a winery for a wine tasting experience.
Scenario: ${scenario.title || 'Wine Tasting Experience'}
Description: ${scenario.description || 'A guided wine tasting at a premium winery'}

Your Background:
- You are a wine enthusiast visiting the winery
- You have some knowledge about wine but are not an expert
- You're particularly interested in red wines
- You're considering joining a wine club if you enjoy the wines
- You have a budget of around $150-200 for wine purchases today
- You're visiting with a friend/partner
- This is your first time at this specific winery

Your Role:
1. Respond naturally as a customer during a wine tasting
2. Ask questions about the wines, vineyard, and winemaking process
3. Express your preferences and reactions to the wines
4. Consider purchases or wine club membership based on the experience
5. DO NOT provide any feedback or evaluation during the conversation
6. Express emotions appropriately based on the conversation

Remember: You are ONLY responding as a customer in a realistic way during a wine tasting visit.`;
  }
  
  // Default prompt for other scenarios
  return `You are a customer visiting a winery.
Scenario: ${scenario.title || 'Winery Visit'}
Description: ${scenario.description || 'A visit to a premium winery'}

Your role is to:
1. Respond as a customer in a realistic way
2. Express natural conversation behaviors and engagement
3. Ask questions about the wines and winery
4. Express emotions naturally based on the conversation flow
5. DO NOT evaluate the sales representative's performance
6. DO NOT provide feedback during the conversation
7. Only respond as you would in a real winery visit

Remember: You are ONLY responding as a customer. Do not evaluate or provide feedback during the conversation.`;
}

function createCustomerSystemPrompt(customerProfile) {
  if (!customerProfile) {
    console.error("createCustomerSystemPrompt called with null or undefined customerProfile");
    return "You are a customer visiting a winery.";
  }
  
  return `You are a customer visiting a winery with the following profile:

Knowledge Level: ${customerProfile.knowledge || 'Moderate'}
Budget: ${customerProfile.budget || '$100-200'}
Interest Level: ${customerProfile.interest || 'Moderate'}
Time Available: ${customerProfile.timeAvailable || '1-2 hours'}
Preferences: ${customerProfile.preferences || 'Interested in red wines, particularly Cabernet Sauvignon'}
Occasion: ${customerProfile.occasion || 'Casual visit'}
Group Size: ${customerProfile.groupSize || '2 people'}

Your role is to:
1. Respond as a customer with the above profile
2. Express natural conversation behaviors and engagement
3. Ask questions about the wines and winery
4. Express emotions naturally based on the conversation flow
5. DO NOT evaluate the sales representative's performance
6. DO NOT provide feedback during the conversation
7. Only respond as you would in a real winery visit

Remember: You are ONLY responding as a customer. Do not evaluate or provide feedback during the conversation.`;
}

function createAssistantSystemPrompt(assistantProfile) {
  if (!assistantProfile) {
    console.error("createAssistantSystemPrompt called with null or undefined assistantProfile");
    return "You are a knowledgeable wine sales representative at a premium winery.";
  }
  
  return `You are a knowledgeable wine sales representative at a premium winery with the following profile:

Role: ${assistantProfile.role || 'Wine Sales Representative'}
Experience: ${assistantProfile.experience || '5+ years in wine sales'}
Knowledge Level: ${assistantProfile.knowledge || 'Expert in wine and winemaking'}
Personality: ${assistantProfile.personality || 'Friendly, knowledgeable, and passionate about wine'}
Sales Approach: ${assistantProfile.salesApproach || 'Consultative, focusing on customer needs and preferences'}
Specialties: ${assistantProfile.specialties || 'Red wines, wine pairing, and wine club membership'}

Your role is to:
1. Respond as a wine sales representative with the above profile
2. Provide knowledgeable information about wines, the winery, and winemaking
3. Guide the customer through their wine experience
4. Identify and address customer needs and preferences
5. Make appropriate recommendations based on customer preferences
6. Look for opportunities to suggest wine purchases or wine club membership
7. Express emotions naturally based on the conversation flow

Remember: You are ONLY responding as a wine sales representative. Do not evaluate or provide feedback during the conversation.`;
}

function createWinerySystemPrompt(wineryProfile) {
  if (!wineryProfile) {
    console.error("createWinerySystemPrompt called with null or undefined wineryProfile");
    return "You are representing a premium winery with a focus on quality wines and customer experience.";
  }
  
  return `You are representing the following winery:

Name: ${wineryProfile.name || 'Vineyard Estates Winery'}
Location: ${wineryProfile.location || 'Napa Valley, California'}
History: ${wineryProfile.history || 'Family-owned since 1985, producing premium wines for over 35 years'}
Philosophy: ${wineryProfile.philosophy || 'Focus on sustainable farming, minimal intervention winemaking, and expressing terroir'}
Wine Style: ${wineryProfile.wineStyle || 'Elegant, balanced wines with a focus on varietal character'}
Specialties: ${wineryProfile.specialties || 'Cabernet Sauvignon, Chardonnay, and Bordeaux blends'}
Awards: ${wineryProfile.awards || 'Multiple gold medals at international wine competitions'}
Facilities: ${wineryProfile.facilities || 'Tasting room, vineyard tours, and event spaces'}

Your role is to:
1. Represent this winery accurately in all conversations
2. Share information about the winery's history, philosophy, and wine-making approach
3. Highlight the winery's unique features and specialties
4. Provide accurate information about the wines, vineyard, and production process
5. Express the winery's values and commitment to quality
6. Look for opportunities to promote the winery's products and services

Remember: You are representing this specific winery. Ensure all information is consistent with the winery's profile.`;
}

function calculateScore(interaction) {
  if (!interaction) return 0;
  
  // Base score
  let score = 50;
  
  // Adjust based on satisfaction
  if (interaction.satisfaction) {
    score += (interaction.satisfaction - 0.5) * 30;
  }
  
  // Adjust based on response time
  if (interaction.responseTime) {
    if (interaction.responseTime < 1000) {
      score += 10;
    } else if (interaction.responseTime > 3000) {
      score -= 10;
    }
  }
  
  // Adjust based on success
  if (interaction.successful) {
    score += 10;
  } else {
    score -= 10;
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

function extractSuggestions(feedback) {
  if (!feedback) return [];
  
  // Simple extraction of bullet points or numbered items
  const suggestions = [];
  const lines = feedback.split('\n');
  
  for (const line of lines) {
    if (line.trim().match(/^[-•*]\s+/) || line.trim().match(/^\d+\.\s+/)) {
      suggestions.push(line.trim().replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, ''));
    }
  }
  
  return suggestions;
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 