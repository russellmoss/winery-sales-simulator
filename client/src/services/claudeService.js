// Use local server in development, Netlify functions in production
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5001/api/claude/message'
  : '/.netlify/functions/claude';

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
    console.log('Response data:', {
      hasResponse: !!data.response,
      responseType: typeof data.response,
      hasAudio: !!data.audio,
      audioLength: data.audio?.length
    });
    
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

    // Ensure we return a proper text response
    if (!data.response) {
      throw new Error('No response received from Claude API');
    }

    const textResponse = typeof data.response === 'string' ? 
      data.response : 
      data.response.text || data.response.content || data.response.message || JSON.stringify(data.response);
    
    return textResponse;
  } catch (error) {
    console.error('Error sending message to Claude:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}; 