const API_BASE_URL = 'http://localhost:5000/api';

const createSystemPrompt = (scenario) => {
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
    // Format customer profile
    const customerProfile = {
      knowledge: scenario.clientPersonality?.knowledge || 'Beginner',
      budget: scenario.clientPersonality?.budget || 'Moderate',
      interest: 'High',
      timeAvailable: '1-2 hours',
      preferences: scenario.clientPersonality?.preferences || 'Interested in red wines',
      occasion: 'First visit',
      groupSize: '2 people'
    };

    // Format assistant profile
    const assistantProfile = {
      role: scenario.assistantRole || 'Wine Tasting Room Associate',
      experience: '3+ years in wine sales',
      knowledge: 'Expert in wine and winemaking',
      personality: 'Friendly, knowledgeable, and passionate about wine',
      salesApproach: 'Consultative, focusing on customer needs and preferences',
      specialties: 'Red wines, wine pairing, and wine club membership'
    };

    const response = await fetch(`${API_BASE_URL}/claude/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: formatMessages(messages),
        scenario: scenario,
        customerProfile: customerProfile,
        assistantProfile: assistantProfile,
        wineryProfile: {
          name: "Milea Estate",
          location: "Pleasant Valley, NY",
          description: "A boutique winery known for its handcrafted wines and personalized tasting experiences."
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Create and play audio if available
    if (data.audio) {
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }

    return data.content || data.response;
  } catch (error) {
    console.error('Error sending message to Claude:', error);
    throw error;
  }
};

export const analyzeResponse = async (scenario, messages) => {
  try {
    const response = await fetch(`${API_BASE_URL}/claude/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenario,
        messages: formatMessages(messages)
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze response');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing response:', error);
    throw error;
  }
}; 