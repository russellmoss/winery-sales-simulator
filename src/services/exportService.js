/**
 * Convert conversation messages to markdown format
 * @param {Array} messages - Array of message objects
 * @param {Object} scenario - Current scenario object
 * @returns {string} - Markdown formatted conversation
 */
export const conversationToMarkdown = (messages, scenario) => {
  let markdown = `# Wine Tasting Room Conversation\n\n`;
  markdown += `## Scenario: ${scenario.title}\n\n`;
  markdown += `**Description:** ${scenario.description}\n\n`;
  markdown += `**Date:** ${new Date().toLocaleString()}\n\n`;
  markdown += `## Conversation\n\n`;

  messages.forEach((message, index) => {
    const role = message.role === 'user' ? 'Staff Member' : 'Guest';
    markdown += `### ${role} (${index + 1})\n\n`;
    markdown += `${message.content}\n\n`;
  });

  return markdown;
};

/**
 * Generate evaluation prompt for Claude
 * @param {string} conversationMarkdown - Markdown formatted conversation
 * @param {string} rubric - Evaluation rubric text
 * @returns {string} - Generated evaluation prompt
 */
export const generateEvaluationPrompt = (conversationMarkdown, rubric) => {
  return `Please evaluate the following wine tasting room conversation based on the provided rubric:

${conversationMarkdown}

Evaluation Rubric:
${rubric}

Please provide a detailed evaluation including:
1. Overall performance score (0-100)
2. Key strengths
3. Areas for improvement
4. Specific examples from the conversation
5. Recommendations for future interactions`;
}; 