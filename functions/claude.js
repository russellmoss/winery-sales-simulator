const fetch = require('node-fetch');

const handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    // Log the raw event body for debugging
    console.log('Raw event body:', event.body);
    
    const { scenario, messages } = JSON.parse(event.body);
    console.log('Received request with scenario:', JSON.stringify(scenario, null, 2));
    console.log('Received messages:', JSON.stringify(messages, null, 2));

    // Check if we have the API key
    if (!process.env.CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY is not set in environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured', details: 'CLAUDE_API_KEY environment variable is missing' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        }
      };
    }

    // Create system prompt
    const systemPrompt = createSystemPrompt(scenario);
    console.log('Created system prompt:', systemPrompt);

    // Format messages for Claude API - exclude system message from the messages array
    const formattedMessages = messages.map(msg => ({
      role: msg.role || 'user',
      content: msg.message || msg.content || ''
    }));
    console.log('Formatted messages:', JSON.stringify(formattedMessages, null, 2));

    // Call Claude API
    console.log('Calling Claude API');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 500,
        system: systemPrompt,
        messages: formattedMessages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      throw new Error(`Claude API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Claude API response:', JSON.stringify(data, null, 2));

    // Get the text response from Claude
    const claudeResponse = data.content[0].text;
    console.log('Claude response text:', claudeResponse);

    // Check if we have the ElevenLabs API key and voice ID
    if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_ANN_VOICE_ID) {
      try {
        // Call ElevenLabs API to convert text to speech
        console.log('Calling ElevenLabs API');
        // Use the voice ID directly from the environment variable
        const voiceId = scenario.voiceId || process.env.ELEVENLABS_ANN_VOICE_ID;
        console.log('Using voice ID:', voiceId);
        const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: claudeResponse,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          })
        });

        if (!elevenLabsResponse.ok) {
          const errorData = await elevenLabsResponse.json();
          console.error('ElevenLabs API error:', errorData);
          // Continue without audio if ElevenLabs fails
        } else {
          // Get the audio data as a buffer
          const audioBuffer = await elevenLabsResponse.buffer();
          console.log('ElevenLabs API response received, audio size:', audioBuffer.length);

          // Convert the buffer to a base64 string
          const audioBase64 = audioBuffer.toString('base64');
          console.log('Audio converted to base64, length:', audioBase64.length);

          // Return both the text and audio
          return {
            statusCode: 200,
            body: JSON.stringify({
              message: claudeResponse,
              audio: audioBase64
            }),
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
          };
        }
      } catch (elevenLabsError) {
        console.error('Error calling ElevenLabs API:', elevenLabsError);
        // Continue without audio if ElevenLabs fails
      }
    }

    // If we don't have ElevenLabs credentials or the API call failed, return just the text
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: claudeResponse
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  } catch (error) {
    console.error('Error in handler:', error);
    console.error('Error stack:', error.stack);
    
    // Return a more detailed error response
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process request', 
        details: error.message,
        stack: error.stack
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }
};

function createSystemPrompt(scenario) {
  if (!scenario) {
    return "You are a helpful wine tasting room associate.";
  }

  return `You are a winery guest. Follow the scenario details exactly as provided:

${JSON.stringify(scenario, null, 2)}

Stay in character and respond naturally based on the scenario details above.`;
}

module.exports = { handler }; 