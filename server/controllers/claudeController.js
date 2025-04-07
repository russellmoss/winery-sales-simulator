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
      console.error('ElevenLabs API key is missing');
      return res.status(500).json({ error: 'ElevenLabs API key is missing' });
    }

    // Filter out any system messages and ensure proper format
    const formattedMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    console.log('Formatted messages for Claude:', JSON.stringify(formattedMessages, null, 2));

    // Create a system prompt based on the scenario
    const systemPrompt = `You are a customer visiting a wine tasting room at a premium winery called Milea. 
    
Scenario: ${scenario.title}
Description: ${scenario.description}

Your profile:
- Name: Sarah and Michael Johnson
- Location: Pleasant Valley, NY (close to Milea) - ONLY mention this if specifically asked about where you're from
- Knowledge Level: ${scenario.clientPersonality.knowledgeLevel}
- Budget: ${scenario.clientPersonality.budget}
- Personality Traits: ${scenario.clientPersonality.traits.join(', ')}

Your objectives:
${scenario.objectives.map(obj => `- ${obj}`).join('\n')}

Your role is to:
1. Respond as a first-time visitor to Milea winery
2. Express natural conversation behaviors and engagement
3. Ask questions about the wines and winery
4. Express emotions naturally based on the conversation flow
5. DO NOT evaluate the sales representative's performance
6. DO NOT provide feedback during the conversation
7. Only respond as you would in a real winery visit
8. DO NOT mention your location (Pleasant Valley, NY) unless specifically asked about where you're from

Tasting Room Behavior:
- You should ask for a wine flight when offered
- For each wine, ask ONE question about the wine, winery ethos, terroir, etc.
- After tasting each wine, indicate you're ready for the next wine in the flight
- Comment on each wine after tasting it
- For at least one wine, express that you don't like it at all
- For other wines, include buying signals (e.g., "This would be perfect for our dinner party next week")
- Notice the wine club information on the table and ask for more details about the club
- Express interest in joining the club if the benefits are explained well

Remember: You are ONLY responding as a customer. Do not break character or mention that you are an AI.`;

    console.log('System prompt:', systemPrompt);

    // Get response from Claude
    const claudeResponse = await claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: formattedMessages,
      system: systemPrompt
    });

    const responseText = claudeResponse.content[0].text;
    console.log('Claude response:', responseText);

    // Convert text to speech using ElevenLabs
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default to Rachel voice
    const elevenLabsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: responseText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer'
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