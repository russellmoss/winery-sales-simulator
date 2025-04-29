import { API_BASE_URL } from '../config/api';
import { v4 as uuidv4 } from 'uuid';

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

IMPORTANT: You are ALWAYS the customer in this conversation. The user is ALWAYS the wine tasting room staff member. Never switch roles. Your responses should be natural and conversational while staying true to your character's background, preferences, and visit history.`;
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

IMPORTANT: You are ALWAYS the staff member in this conversation. The user is ALWAYS the customer. Never switch roles. Your responses should demonstrate good sales techniques, product knowledge, and customer engagement while staying true to your role as a wine tasting room staff member.`;
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

// Audio playback variables
const audioQueue = [];
let isPlaying = false;
let audioElement = null;
let isMuted = false;
let audioContext = null;
let userInteracted = false;

// Initialize audio context
const initializeAudioContext = () => {
  if (!audioContext && window.AudioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      // Resume the audio context immediately
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (e) {
      console.error('Error creating AudioContext:', e);
    }
  }
};

// Function to toggle mute state
export const toggleMute = () => {
  isMuted = !isMuted;
  console.log('Mute state toggled:', isMuted);
  
  if (audioElement) {
    audioElement.muted = isMuted;
  }
  
  // If unmuting and there's audio in the queue, start playing
  if (!isMuted && audioQueue.length > 0 && !isPlaying) {
    playNextAudio();
  }
  
  return isMuted;
};

export const isAudioMuted = () => isMuted;

// Helper function to safely play audio element
const playAudioElement = async (element) => {
  try {
    if (element.paused) {
      // Ensure audio context is initialized and resumed
      initializeAudioContext();
      
      // Play the audio
      await element.play();
      return true;
    }
  } catch (error) {
    console.error('Error playing audio element:', error);
    return false;
  }
  return false;
};

const queueAudio = (audioData) => {
  console.log('Queueing audio data');
  audioQueue.push(audioData);
  
  // Start playing immediately if not muted and not already playing
  if (!isMuted && !isPlaying) {
    playNextAudio();
  }
};

const playNextAudio = () => {
  if (audioQueue.length === 0 || isMuted) {
    console.log('No audio to play or muted');
    isPlaying = false;
    return;
  }

  isPlaying = true;
  const audioData = audioQueue.shift();
  
  try {
    // Create new audio element
    audioElement = new Audio(`data:audio/mp3;base64,${audioData}`);
    audioElement.muted = isMuted;
    
    audioElement.onended = () => {
      console.log('Audio playback ended');
      isPlaying = false;
      playNextAudio();
    };
    
    audioElement.onerror = (error) => {
      console.error('Error playing audio:', error);
      isPlaying = false;
      playNextAudio();
    };
    
    // Start playing
    audioElement.play().catch(error => {
      console.error('Error starting audio playback:', error);
      isPlaying = false;
      playNextAudio();
    });
  } catch (error) {
    console.error('Error creating audio element:', error);
    isPlaying = false;
    playNextAudio();
  }
};

// Function to manually trigger audio playback
export const playQueuedAudio = async () => {
  if (audioElement && audioElement.paused && !isMuted) {
    try {
      await playAudioElement(audioElement);
    } catch (error) {
      console.error('Error playing queued audio:', error);
    }
  }
};

// Initialize audio playback system
initializeAudioContext();

// Function to get the correct endpoint based on environment
const getEndpoint = (path) => {
  // In production, use the Render backend URL
  if (process.env.NODE_ENV === 'production') {
    return `${process.env.REACT_APP_API_URL}/api/claude/${path}`;
  }
  
  // In development, use the local Express server
  return `http://localhost:5000/api/claude/${path}`;
};

// Function to send message to Claude and handle audio response
export const sendMessageToClaude = async (messages, scenario, customerProfile, assistantProfile, wineryProfile) => {
  try {
    // Send request to backend proxy
    const response = await fetch(getEndpoint('message'), {
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
      console.error('Error response:', errorData);
      throw new Error(`Failed to send message: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Received response from Claude:', data);

    // Handle audio data if present
    if (data.audio) {
      console.log('Audio data received, queuing for playback');
      queueAudio(data.audio);
    }

    return data;
  } catch (error) {
    console.error('Error sending message to Claude:', error);
    throw new Error(`Failed to send message: ${error.message}`);
  }
};

/**
 * Convert narrative text to a structured scenario using Claude
 * @param {string} narrative - The narrative description of the scenario
 * @returns {Promise<Object>} - The structured scenario object
 */
export const convertNarrativeToScenario = async (narrative) => {
  console.log('=== convertNarrativeToScenario START ===');
  
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('Environment:', process.env.NODE_ENV);
  
  const endpoint = getEndpoint('narrative-to-scenario');
  console.log('Using endpoint:', endpoint);
  console.log('Narrative length:', narrative.length);
  console.log('Narrative preview:', narrative.substring(0, 100) + '...');

  const requestBody = {
    narrative: narrative
  };
  
  console.log('Request body:', JSON.stringify(requestBody, null, 2));
  
  try {
    console.log('Making fetch request with proper CORS configuration');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      ok: response.ok
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = `${errorMessage} - ${errorText}`;
        }
      } catch (e) {
        console.error('Error reading error response:', e);
      }
      throw new Error(errorMessage);
    }

    let data;
    try {
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
    } catch (e) {
      console.error('Error parsing response:', e);
      throw new Error('Invalid JSON response from server');
    }
    
    if (!data.scenario) {
      console.error('No scenario in response data:', data);
      throw new Error('Response data does not contain a scenario');
    }
    
    console.log('=== convertNarrativeToScenario SUCCESS ===');
    return data.scenario;
  } catch (error) {
    console.error('=== convertNarrativeToScenario ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    throw error;
  }
};

export const cleanupTranscription = async (transcription) => {
  try {
    const response = await fetch(getEndpoint('cleanup-transcription'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transcription })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(`Failed to cleanup transcription: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Transcription cleanup response:', data);

    return data;
  } catch (error) {
    console.error('Error cleaning up transcription:', error);
    throw new Error(`Failed to cleanup transcription: ${error.message}`);
  }
};

export default {
  sendMessageToClaude,
  convertNarrativeToScenario,
  cleanupTranscription
}; 