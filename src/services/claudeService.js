import { v4 as uuidv4 } from 'uuid';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Send a message to Claude API via backend proxy
 * @param {Array} messages - The conversation messages
 * @param {Object} scenario - The current scenario
 * @param {Object} customerProfile - The customer profile
 * @param {Object} assistantProfile - The assistant profile
 * @param {Object} wineryProfile - The winery profile
 * @returns {Promise<Object>} - The Claude API response
 */
export const sendMessageToClaude = async (messages, scenario, customerProfile, assistantProfile, wineryProfile) => {
  try {
    // Send request to backend proxy
    const response = await fetch(`${API_BASE_URL}/claude/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-' + uuidv4() // Add user ID for tracking
      },
      body: JSON.stringify({
        messages,
        scenario,
        customerProfile,
        assistantProfile,
        wineryProfile
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Claude API proxy error:", errorData);
      throw new Error(`Claude API error: ${errorData.error || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message to Claude:", error);
    throw error;
  }
};

/**
 * Analyze a conversation interaction via backend proxy
 * @param {Object} interaction - The interaction object
 * @returns {Promise<Object>} - The analysis result
 */
export const analyzeInteraction = async (interaction) => {
  try {
    // Send request to backend proxy
    const response = await fetch(`${API_BASE_URL}/claude/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-' + uuidv4() // Add user ID for tracking
      },
      body: JSON.stringify({ interaction })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Claude API proxy error:", errorData);
      throw new Error(`Claude API error: ${errorData.error || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error analyzing interaction:", error);
    throw error;
  }
};

/**
 * Analyze the impact of an assistant response
 * @param {string} response - The assistant's response
 * @param {Object} context - The conversation context
 * @returns {Object} - The analysis result
 */
export const analyzeAssistantResponseImpact = (response, context) => {
  if (!response || !context) {
    return {
      relevance: 0.5,
      helpfulness: 0.5,
      salesPotential: 0.5,
      suggestions: []
    };
  }
  
  // Simple analysis based on keywords and context
  const relevance = calculateRelevance(response, context);
  const helpfulness = calculateHelpfulness(response, context);
  const salesPotential = calculateSalesPotential(response, context);
  
  // Generate suggestions based on analysis
  const suggestions = generateSuggestions(response, relevance, helpfulness, salesPotential);
  
  return {
    relevance,
    helpfulness,
    salesPotential,
    suggestions
  };
};

// Helper functions
function calculateRelevance(response, context) {
  if (!response || !context) return 0.5;
  
  // Extract keywords from previous messages
  const previousMessages = context.previousMessages || [];
  const keywords = extractKeywords(previousMessages);
  
  // Check if response contains keywords
  let matchCount = 0;
  for (const keyword of keywords) {
    if (response.toLowerCase().includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  // Calculate relevance score
  return keywords.length > 0 ? matchCount / keywords.length : 0.5;
}

function calculateHelpfulness(response, context) {
  if (!response || !context) return 0.5;
  
  // Check for helpful indicators
  const helpfulIndicators = [
    'would you like',
    'can i help',
    'let me know',
    'tell me more',
    'what do you think',
    'how about',
    'i recommend',
    'i suggest',
    'you might enjoy',
    'consider trying'
  ];
  
  let indicatorCount = 0;
  for (const indicator of helpfulIndicators) {
    if (response.toLowerCase().includes(indicator)) {
      indicatorCount++;
    }
  }
  
  // Calculate helpfulness score
  return Math.min(1, 0.5 + (indicatorCount * 0.1));
}

function calculateSalesPotential(response, context) {
  if (!response || !context) return 0.5;
  
  // Check for sales indicators
  const salesIndicators = [
    'purchase',
    'buy',
    'price',
    'cost',
    'discount',
    'special offer',
    'limited time',
    'exclusive',
    'club membership',
    'join our club',
    'wine club',
    'tasting flight',
    'bottle',
    'case',
    'shipping',
    'delivery'
  ];
  
  let indicatorCount = 0;
  for (const indicator of salesIndicators) {
    if (response.toLowerCase().includes(indicator)) {
      indicatorCount++;
    }
  }
  
  // Calculate sales potential score
  return Math.min(1, 0.3 + (indicatorCount * 0.05));
}

function extractKeywords(messages) {
  if (!messages || messages.length === 0) return [];
  
  // Combine all message content
  const content = messages.map(msg => msg.content).join(' ');
  
  // Extract words (simple approach)
  const words = content.toLowerCase().split(/\s+/);
  
  // Filter out common words and short words
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'cannot', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'cannot'];
  
  const keywords = words.filter(word => 
    word.length > 3 && 
    !commonWords.includes(word) &&
    !word.match(/^(what|when|where|who|why|how)$/)
  );
  
  // Return unique keywords
  return [...new Set(keywords)];
}

function generateSuggestions(response, relevance, helpfulness, salesPotential) {
  const suggestions = [];
  
  // Relevance suggestions
  if (relevance < 0.7) {
    suggestions.push("Try to address the customer's specific questions and interests more directly.");
  }
  
  // Helpfulness suggestions
  if (helpfulness < 0.7) {
    suggestions.push("Offer more specific recommendations and ask if the customer would like additional information.");
  }
  
  // Sales potential suggestions
  if (salesPotential < 0.7) {
    suggestions.push("Look for opportunities to suggest wine purchases or wine club membership.");
  }
  
  // Response length suggestions
  if (response.length < 100) {
    suggestions.push("Provide more detailed information to better engage the customer.");
  } else if (response.length > 500) {
    suggestions.push("Keep responses concise to maintain customer engagement.");
  }
  
  return suggestions;
}

export default {
  sendMessageToClaude,
  analyzeInteraction,
  analyzeAssistantResponseImpact
}; 