/**
 * Service for evaluating sales conversations using Claude API
 */

/**
 * Format evaluation data to match dashboard requirements
 * @param {Object} rawEvaluation - Raw evaluation data from Claude
 * @returns {Object} - Formatted evaluation data
 */
const formatEvaluationData = (rawEvaluation) => {
  console.log('Formatting evaluation data:', rawEvaluation);
  console.log('Raw evaluation type:', typeof rawEvaluation);
  console.log('Raw evaluation keys:', Object.keys(rawEvaluation));
  
  // Ensure we have valid data
  if (!rawEvaluation) {
    console.error('No evaluation data received');
    throw new Error('No evaluation data received');
  }

  // Check if we have the expected format
  if (rawEvaluation.final_score === undefined) {
    console.error('Unexpected evaluation format:', rawEvaluation);
    throw new Error('Unexpected evaluation format');
  }

  // The data is already in the correct format, just return it
  const formattedData = {
    criteriaScores: rawEvaluation.criteria_scores || [],
    finalScore: rawEvaluation.final_score || 0,
    performanceLevel: rawEvaluation.performance_level || 'Unknown',
    strengths: rawEvaluation.strengths || [],
    improvements: rawEvaluation.improvements || [],
    recommendations: rawEvaluation.recommendations || [],
    detailedNotes: rawEvaluation.detailed_notes || {}
  };
  
  console.log('Formatted evaluation data:', formattedData);
  console.log('Formatted data keys:', Object.keys(formattedData));
  console.log('Criteria scores:', formattedData.criteriaScores);
  
  return formattedData;
};

/**
 * Send conversation to Claude for evaluation
 * @param {string} prompt - The evaluation prompt
 * @returns {Promise<Object>} - Evaluation results
 */
export const evaluateConversation = async (prompt) => {
  console.log('Starting conversation evaluation');
  console.log('Prompt length:', prompt.length);
  console.log('Prompt preview:', prompt.substring(0, 200) + '...');

  try {
    console.log('Sending evaluation request to server');
    const response = await fetch('/api/claude/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    console.log('Server response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received evaluation response:', data);
    console.log('Response data type:', typeof data);
    console.log('Response data keys:', Object.keys(data));

    return formatEvaluationData(data);
  } catch (error) {
    console.error('Error evaluating conversation:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

/**
 * Load the wine sales rubric from file
 * @returns {Promise<string>} - The rubric text
 */
export const loadRubric = async () => {
  console.log('Loading rubric from file...');
  try {
    // This assumes rubric is stored in public folder
    const response = await fetch('/wine_sales_rubric.md');
    if (!response.ok) {
      console.error('Failed to load rubric file:', response.status, response.statusText);
      throw new Error('Failed to load rubric');
    }
    const rubricText = await response.text();
    console.log('Successfully loaded rubric:', rubricText.substring(0, 100) + '...');
    return rubricText;
  } catch (error) {
    console.error('Error loading rubric:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

export default {
  evaluateConversation,
  loadRubric
}; 