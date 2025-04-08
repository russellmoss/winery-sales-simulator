/**
 * Utility functions for evaluation
 */

/**
 * Converts a conversation to markdown format
 * @param {Array} interactions - The conversation interactions
 * @param {Object} scenario - The current scenario
 * @returns {string} - The conversation in markdown format
 */
export const conversationToMarkdown = (interactions, scenario) => {
  console.log('conversationToMarkdown called with', interactions.length, 'interactions');
  
  let markdown = `# Wine Tasting Room Conversation\n\n`;
  markdown += `## Scenario: ${scenario.title}\n\n`;
  markdown += `**Description:** ${scenario.description}\n\n`;
  markdown += `**Date:** ${new Date().toLocaleString()}\n\n`;
  markdown += `## Conversation\n\n`;
  
  interactions.forEach((interaction, index) => {
    const role = interaction.role === 'user' ? 'Staff Member' : 'Guest';
    markdown += `### ${role} (${index + 1})\n\n`;
    markdown += `${interaction.message}\n\n`;
  });
  
  return markdown;
};

/**
 * Generates an evaluation prompt based on the conversation and rubric
 * @param {string} conversationMarkdown - The conversation in markdown format
 * @param {string} rubricText - The evaluation rubric
 * @returns {string} - The evaluation prompt
 */
export const generateEvaluationPrompt = (conversationMarkdown, rubricText) => {
  console.log('generateEvaluationPrompt called');
  
  return `
You are an expert wine tasting room manager evaluating a conversation between a staff member and a guest.

Please evaluate the following conversation based on the rubric provided.

${conversationMarkdown}

## Evaluation Rubric
${rubricText}

Please provide a detailed evaluation with the following sections:
1. A brief summary of the conversation
2. A list of strengths demonstrated by the staff member
3. A list of areas for improvement
4. An overall score out of 10

Format your response as a JSON object with the following structure:
{
  "summary": "Brief summary of the conversation",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"],
  "score": 8
}
`;
}; 