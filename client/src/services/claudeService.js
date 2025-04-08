const API_URL = '/.netlify/functions/claude';

const createSystemPrompt = (scenario) => {
  console.log('Creating system prompt with scenario:', JSON.stringify(scenario, null, 2));
  return `You are acting as a wine tasting room customer in a sales simulation scenario. Here are the details of your character:

Title: ${scenario.title}
Description: ${scenario.description}
Client Profile: ${scenario.clientProfile}

Personality Traits:
${scenario.clientPersonality.traits.map(trait => `- ${trait}`).join('\n')}

Objectives:
${scenario.clientObjectives.map(objective => `- ${objective}`).join('\n')}

Please respond to the wine tasting room staff member's messages in character, based on your profile, personality traits, and objectives. Your responses should be natural and conversational, while staying true to your character's traits and goals.`;
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

export const sendMessageToClaude = async (scenario, messages) => {
  try {
    console.log('Sending message to Claude with scenario:', JSON.stringify(scenario, null, 2));
    console.log('Messages to send:', JSON.stringify(messages, null, 2));
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenario,
        messages
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response data:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    
    // Check if we have audio data
    if (data.audio) {
      console.log('Audio data received, length:', data.audio.length);
      // Create an audio element and play it
      const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    
    return data.message;
  } catch (error) {
    console.error('Error sending message to Claude:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}; 