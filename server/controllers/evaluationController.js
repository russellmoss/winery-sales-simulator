const Anthropic = require('@anthropic-ai/sdk');

const claude = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

/**
 * Evaluates a wine sales conversation using Claude API
 */
exports.evaluateConversation = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await claude.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.2, // Lower temperature for more consistent evaluations
    });

    // Parse the JSON from Claude's text response
    try {
      const jsonMatch = response.content[0].text.match(/```json\n([\s\S]*?)\n```/) || 
                        response.content[0].text.match(/({[\s\S]*?})$/);
      
      let evaluationData;
      if (jsonMatch && jsonMatch[1]) {
        evaluationData = JSON.parse(jsonMatch[1]);
      } else {
        // If Claude didn't format as JSON properly, we still send back the full text
        evaluationData = { 
          rawResponse: response.content[0].text,
          error: 'Failed to parse structured data'
        };
      }
      
      res.json({ evaluation: evaluationData });
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      res.json({ 
        evaluation: { 
          rawResponse: response.content[0].text,
          error: 'Failed to parse response'
        }
      });
    }
  } catch (error) {
    console.error('Error in evaluateConversation:', error);
    res.status(500).json({ 
      error: 'Failed to evaluate conversation',
      details: error.message
    });
  }
}; 