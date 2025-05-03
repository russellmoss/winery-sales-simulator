/**
 * Service for loading and managing evaluation rubrics
 */

/**
 * Loads the evaluation rubric
 * @returns {Promise<string>} - The rubric text
 */
export const loadRubric = async () => {
  console.log('loadRubric called');
  
  try {
    // In a real implementation, this would fetch the rubric from an API or database
    // For now, we'll return a mock rubric
    console.log('Loading mock rubric');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock rubric
    return `
# Wine Tasting Room Evaluation Rubric

## Knowledge (0-10 points)
- Demonstrates comprehensive knowledge of wines, regions, and varietals
- Can explain wine characteristics (body, tannins, acidity, etc.)
- Understands food and wine pairing principles

## Communication Skills (0-10 points)
- Uses clear and professional language
- Asks appropriate questions to understand guest preferences
- Provides personalized recommendations based on guest preferences

## Customer Service (0-10 points)
- Greets guests warmly and professionally
- Maintains a friendly and approachable demeanor
- Handles guest questions and concerns effectively

## Sales Techniques (0-10 points)
- Identifies sales opportunities without being pushy
- Highlights special promotions or limited-time offers
- Suggests complementary products when appropriate

## Overall Experience (0-10 points)
- Creates a memorable and positive experience for guests
- Demonstrates enthusiasm and passion for wine
- Provides value beyond just selling products
    `;
  } catch (error) {
    console.error('Error loading rubric:', error);
    throw new Error('Failed to load rubric: ' + error.message);
  }
}; 