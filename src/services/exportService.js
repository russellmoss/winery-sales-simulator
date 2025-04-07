/**
 * Service for exporting conversation data
 */

/**
 * Convert conversation messages to markdown format
 * @param {Array} messages - Array of conversation messages
 * @param {Object} scenario - The scenario metadata
 * @returns {string} - Markdown formatted conversation
 */
export const conversationToMarkdown = (messages, scenario) => {
  if (!messages || messages.length === 0) {
    return "# Empty Conversation";
  }

  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  let markdown = `# Wine Tasting Room Conversation\n\n`;
  markdown += `## Scenario: ${scenario?.title || 'Wine Tasting Room Visit'} \n\n`;
  markdown += `**Description:** ${scenario?.description || 'A conversation with a winery visitor'}\n\n`;
  markdown += `**Date:** ${currentDate}, ${currentTime}\n\n`;
  markdown += `## Conversation\n\n`;

  messages.forEach((message, index) => {
    const role = message.role === 'user' ? 'Staff Member' : 'Guest';
    markdown += `### ${role} (${index + 1})\n\n`;
    markdown += `${message.content}\n\n`;
  });

  return markdown;
};

/**
 * Generate a Claude evaluation prompt
 * @param {string} markdown - Markdown conversation
 * @param {string} rubric - Evaluation rubric
 * @returns {string} - Complete prompt for Claude
 */
export const generateEvaluationPrompt = (markdown, rubric) => {
  return `
I need you to evaluate a wine tasting room sales conversation based on the following rubric:

${rubric}

Here is the conversation:

${markdown}

Please analyze this conversation and provide:
1. A numeric score for each criterion in the rubric (0-5 scale)
2. The final weighted score as a percentage
3. The performance level based on the score
4. 3 key strengths demonstrated in the conversation
5. 3 areas for improvement
6. 3 specific, actionable recommendations
7. Detailed notes for each criterion explaining your evaluation

Format your response as a structured JSON object with the following fields:
{
  "criteria_scores": [
    {
      "name": "Criterion name",
      "score": number between 0-5
    }
  ],
  "final_score": number between 0-100,
  "performance_level": "Excellent|Very Good|Good|Satisfactory|Needs Improvement",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "detailed_notes": {
    "criterion_name": "detailed notes about this criterion"
  }
}

Please provide balanced, constructive feedback that acknowledges both strengths and areas for growth.
`;
};

export default {
  conversationToMarkdown,
  generateEvaluationPrompt
}; 