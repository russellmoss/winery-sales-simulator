// Use local server in development, Netlify functions in production
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api/claude/message'
  : '/.netlify/functions/claude';

// eslint-disable-next-line no-unused-vars
const createSystemPrompt = (scenario) => {
  console.log('Creating system prompt with scenario:', JSON.stringify(scenario, null, 2));
  return `You are acting as a wine tasting room customer in a sales simulation scenario. Here are the details of your character and situation:

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

Please respond to the wine tasting room staff member's messages in character, based on your profile, personality traits, and the specific behavioral instructions. Your responses should be natural and conversational while staying true to your character's background, preferences, and visit history.`;
};

// eslint-disable-next-line no-unused-vars
const createAssistantPrompt = (scenario) => {
  console.log('Creating assistant prompt with scenario:', JSON.stringify(scenario, null, 2));
  return `You are a wine tasting room staff member in a sales simulation scenario. Here are the details of your role:

Title: ${scenario.title}
Description: ${scenario.description}
Your Role: ${scenario.assistantRole}

Evaluation Criteria:
${scenario.evaluationCriteria.map(criterion => `- ${criterion}`).join('\n')}

Tips for Success:
${scenario.tips.map(tip => `- ${tip}`).join('\n')}

Please respond to the customer's messages in character, based on your role and the evaluation criteria. Your responses should demonstrate good sales techniques, product knowledge, and customer engagement while staying true to your role as a wine tasting room staff member.`;
};

// eslint-disable-next-line no-unused-vars
const formatMessages = (messages) => {
  console.log('Formatting messages:', JSON.stringify(messages, null, 2));
  const formatted = messages.map(msg => ({
    role: msg.role || 'user',
    content: msg.message || msg.content || ''
  }));
  console.log('Formatted messages:', JSON.stringify(formatted, null, 2));
  return formatted;
};

// Create a global audio context for better mobile compatibility
let audioQueue = [];
let isPlaying = false;
let audioElement = null;
let isMuted = false; // Start unmuted

// Function to toggle mute state
export const toggleMute = () => {
  isMuted = !isMuted;
  
  if (audioElement) {
    audioElement.muted = isMuted;
    
    // If unmuting, try to play the audio
    if (!isMuted) {
      audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }
  
  return isMuted;
};

// Function to get current mute state
export const getMuteState = () => {
  return isMuted;
};

// Function to set mute state
export const setMuteState = (muted) => {
  isMuted = muted;
  
  if (audioElement) {
    audioElement.muted = isMuted;
  }
  
  return isMuted;
};

const playNextInQueue = async () => {
  if (audioQueue.length === 0) {
    isPlaying = false;
    return;
  }
  
  try {
    isPlaying = true;
    const audioData = audioQueue.shift();
    
    // Create a new audio element for each playback
    audioElement = new Audio(`data:audio/mpeg;base64,${audioData}`);
    
    // Set initial mute state
    audioElement.muted = isMuted;
    
    // Add event listeners
    audioElement.addEventListener('play', () => {
      console.log('Audio started playing');
    });
    
    audioElement.addEventListener('ended', () => {
      console.log('Audio playback ended');
      playNextInQueue();
    });
    
    audioElement.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      playNextInQueue();
    });
    
    // Try to play immediately if not muted
    if (!isMuted) {
      try {
        await audioElement.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  } catch (error) {
    console.error('Error in playNextInQueue:', error);
    playNextInQueue();
  }
};

export const sendMessageToClaude = async (scenario, messages) => {
  try {
    console.log('Sending message to Claude with scenario:', JSON.stringify(scenario, null, 2));
    
    // Clean and format messages to prevent duplicates
    const formattedMessages = messages.map(msg => ({
      role: msg.role || 'user',
      content: msg.message || msg.content || ''
    })).filter((msg, index, self) => 
      // Remove any duplicate messages that might cause repetition
      index === self.findIndex(m => 
        m.role === msg.role && 
        m.content === msg.content
      )
    );

    console.log('Messages to send:', JSON.stringify(formattedMessages, null, 2));
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenario,
        messages: formattedMessages
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error response data:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Full response data:', data);
    
    // Check if we have audio data
    if (data.audio) {
      console.log('Audio data received, length:', data.audio.length);
      
      // Add to queue
      audioQueue.push(data.audio);
      
      // Start playing if not already playing
      if (!isPlaying) {
        playNextInQueue();
      }
    }

    // Extract text response with more detailed logging
    let textResponse = null;

    if (typeof data === 'string') {
      textResponse = data;
    } else if (typeof data === 'object') {
      if (data.response) {
        textResponse = typeof data.response === 'string' ? 
          data.response : 
          data.response.text || data.response.content || data.response.message;
      }
      
      // Try other common response formats
      if (!textResponse) {
        textResponse = data.text || data.content || data.message;
      }

      // For Netlify function format
      if (!textResponse && data.body) {
        const body = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
        textResponse = body.response || body.text || body.content || body.message;
      }
    }

    console.log('Extracted text response:', {
      hasResponse: !!textResponse,
      responseType: typeof textResponse,
      responseLength: textResponse?.length,
      firstFewWords: textResponse ? textResponse.split(' ').slice(0, 5).join(' ') + '...' : 'No text found'
    });

    if (!textResponse) {
      console.error('Could not extract text response from data:', data);
      throw new Error('Could not extract text response from Claude API');
    }

    return textResponse;
  } catch (error) {
    console.error('Error sending message to Claude:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}; 