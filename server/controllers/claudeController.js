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

    // Create a simple system prompt that lets the scenario data drive behavior
    const systemPrompt = `You are a winery guest. Follow the scenario details exactly as provided:

${JSON.stringify(scenario, null, 2)}

Stay in character and respond naturally based on the scenario details above.`;

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