const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Clean up transcription text using Claude
exports.cleanupTranscription = async (req, res) => {
  try {
    const { text, transcription } = req.body;
    const inputText = text || transcription;
    
    if (!inputText) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('Cleaning up transcription text:', inputText.substring(0, 100) + '...');
    
    // Use Claude to clean up the transcription
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Clean up and improve the following text. Fix any obvious errors, add proper punctuation, and make it more readable while preserving the original meaning. Return ONLY the cleaned text, with no additional explanation or formatting:

${inputText}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to clean up transcription',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Invalid Claude API response format:', data);
      return res.status(500).json({ 
        error: 'Invalid response format from Claude API'
      });
    }

    const cleanedText = data.content[0].text;
    console.log('Cleaned text:', cleanedText.substring(0, 100) + '...');
    
    res.json({ cleanedText });
  } catch (error) {
    console.error('Error cleaning up transcription:', error);
    res.status(500).json({ 
      error: 'Failed to clean up transcription',
      details: error.message
    });
  }
};

// Transcribe audio file using Web Speech API
exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioFile = req.files.audio;
    console.log('Received audio file:', audioFile.name, 'size:', audioFile.size);
    
    // For now, we'll use a simple transcription service
    // In a production environment, you would want to use a more robust service
    // like Google Cloud Speech-to-Text or Azure Speech Services
    
    // Since we can't directly use the Web Speech API on the server,
    // we'll return a message asking the user to use the browser's built-in
    // speech recognition instead
    res.json({ 
      transcript: "Please use the browser's built-in speech recognition instead of uploading audio files."
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
}; 