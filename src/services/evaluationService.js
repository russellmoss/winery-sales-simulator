/**
 * Service for evaluating conversations using Claude API
 */

/**
 * Evaluates a conversation based on the provided prompt
 * @param {string} evaluationPrompt - The prompt containing the conversation and rubric
 * @returns {Promise<Object>} - The evaluation results
 */
export const evaluateConversation = async (evaluationPrompt) => {
  console.log('evaluateConversation called with prompt length:', evaluationPrompt.length);
  
  try {
    // In a real implementation, this would call the Claude API
    // For now, we'll analyze the conversation content to provide a more realistic evaluation
    
    // Extract the conversation from the prompt
    const conversationMatch = evaluationPrompt.match(/## Conversation\n\n([\s\S]*?)(?=\n\n## Evaluation Rubric|$)/);
    const conversation = conversationMatch ? conversationMatch[1] : '';
    
    console.log('Analyzing conversation:', conversation);
    
    // Count the number of interactions
    const userMessages = (conversation.match(/### Staff Member/g) || []).length;
    const guestMessages = (conversation.match(/### Guest/g) || []).length;
    
    console.log(`Conversation analysis: ${userMessages} staff messages, ${guestMessages} guest messages`);
    
    // Analyze the content of the conversation
    const hasGreeting = /hello|hi|welcome|greeting|taking care of you/i.test(conversation);
    const hasQuestion = /\?/g.test(conversation);
    const hasWineKnowledge = /wine|varietal|region|tasting|flavor|aroma|body|tannin|acidity/i.test(conversation);
    const hasRecommendation = /recommend|suggestion|try|prefer|enjoy|like/i.test(conversation);
    const hasFollowUp = /anything else|how about|what about|would you like|can i help/i.test(conversation);
    const hasRapportBuilding = /family|weekend|occasion|celebration|experience|story/i.test(conversation);
    const hasClosing = /club|membership|purchase|buy|take home|bottle|case|thank you|come back/i.test(conversation);
    
    // Count specific elements
    const questionCount = (conversation.match(/\?/g) || []).length;
    const wineMentions = (conversation.match(/wine|varietal|region|tasting|flavor|aroma|body|tannin|acidity/gi) || []).length;
    
    console.log('Content analysis:', {
      hasGreeting,
      hasQuestion,
      hasWineKnowledge,
      hasRecommendation,
      hasFollowUp,
      hasRapportBuilding,
      hasClosing,
      questionCount,
      wineMentions
    });
    
    // Generate a more realistic evaluation based on the actual conversation
    let summary = "";
    let strengths = [];
    let improvements = [];
    let score = 0;
    
    // Calculate individual metrics
    const greetingScore = hasGreeting ? 8 : 3;
    const questioningScore = questionCount > 0 ? Math.min(questionCount * 2, 10) : 3;
    const wineKnowledgeScore = hasWineKnowledge ? Math.min(wineMentions, 10) : 3;
    const salesApproachScore = hasRecommendation ? 8 : 3;
    const rapportBuildingScore = hasRapportBuilding ? 8 : 3;
    const closingScore = hasClosing ? 8 : 3;
    
    // Calculate average response time (mock data for now)
    const avgResponseTime = Math.floor(Math.random() * 30) + 10; // 10-40 seconds
    
    // Calculate question ratio
    const questionRatio = userMessages > 0 ? (questionCount / userMessages).toFixed(1) : 0;
    
    // Evaluate based on conversation content
    if (userMessages === 0) {
      summary = "No staff interaction detected in the conversation.";
      score = 0;
    } else if (userMessages === 1 && guestMessages === 0) {
      summary = "The conversation only contains a single greeting from the staff member with no guest response.";
      score = 2;
      
      if (hasGreeting) {
        strengths.push("Provided a proper greeting");
        score += 1;
      } else {
        improvements.push("Should have greeted the guest properly");
      }
      
      if (hasQuestion) {
        strengths.push("Asked a question to engage the guest");
        score += 1;
      } else {
        improvements.push("Should have asked questions to understand the guest's needs");
      }
      
      improvements.push("No wine knowledge demonstrated");
      improvements.push("No recommendations provided");
      improvements.push("No follow-up questions after initial greeting");
    } else {
      // More complex evaluation for longer conversations
      summary = "The conversation shows some interaction between staff and guest.";
      
      if (hasGreeting) {
        strengths.push("Provided a proper greeting");
        score += 1;
      } else {
        improvements.push("Should have greeted the guest properly");
      }
      
      if (hasQuestion) {
        strengths.push("Asked questions to engage the guest");
        score += 1;
      } else {
        improvements.push("Should have asked questions to understand the guest's needs");
      }
      
      if (hasWineKnowledge) {
        strengths.push("Demonstrated wine knowledge");
        score += 2;
      } else {
        improvements.push("Should have demonstrated wine knowledge");
      }
      
      if (hasRecommendation) {
        strengths.push("Provided wine recommendations");
        score += 2;
      } else {
        improvements.push("Should have provided wine recommendations");
      }
      
      if (hasFollowUp) {
        strengths.push("Asked follow-up questions");
        score += 1;
      } else {
        improvements.push("Should have asked follow-up questions");
      }
      
      if (hasRapportBuilding) {
        strengths.push("Built rapport with the guest");
        score += 1;
      } else {
        improvements.push("Could have built more rapport with the guest");
      }
      
      if (hasClosing) {
        strengths.push("Attempted to close the sale or suggest next steps");
        score += 1;
      } else {
        improvements.push("Should have attempted to close the sale or suggest next steps");
      }
      
      // Adjust score based on conversation length
      if (userMessages + guestMessages > 5) {
        score += 1; // Bonus for longer conversations
      }
    }
    
    // Ensure score is between 0 and 10
    score = Math.min(Math.max(score, 0), 10);
    
    // If no strengths or improvements were identified, add generic ones
    if (strengths.length === 0) {
      strengths.push("Initiated conversation with the guest");
    }
    
    if (improvements.length === 0) {
      improvements.push("Could have engaged the guest more effectively");
      improvements.push("Should have demonstrated more wine knowledge");
    }
    
    // Generate recommendations based on the evaluation
    const recommendations = [];
    
    if (greetingScore < 7) {
      recommendations.push("Practice a warm, welcoming greeting that includes introducing yourself");
    }
    
    if (questioningScore < 7) {
      recommendations.push("Ask more open-ended questions to understand the guest's preferences");
    }
    
    if (wineKnowledgeScore < 7) {
      recommendations.push("Demonstrate more wine knowledge by discussing varietals, regions, and characteristics");
    }
    
    if (salesApproachScore < 7) {
      recommendations.push("Make specific wine recommendations based on the guest's preferences");
    }
    
    if (rapportBuildingScore < 7) {
      recommendations.push("Build rapport by asking about the guest's occasion or wine preferences");
    }
    
    if (closingScore < 7) {
      recommendations.push("Suggest wine club membership or purchasing bottles to take home");
    }
    
    // If no specific recommendations, add generic ones
    if (recommendations.length === 0) {
      recommendations.push("Continue to engage guests with personalized recommendations");
      recommendations.push("Consider suggesting wine club membership to regular customers");
    }
    
    console.log('Generated evaluation:', { 
      summary, 
      strengths, 
      improvements, 
      score,
      metrics: {
        greeting: greetingScore,
        questioning: questioningScore,
        wineKnowledge: wineKnowledgeScore,
        salesApproach: salesApproachScore,
        rapportBuilding: rapportBuildingScore,
        closing: closingScore,
        avgResponseTime,
        questionRatio,
        wineMentions
      },
      recommendations
    });
    
    // Return the evaluation results
    return {
      summary,
      strengths,
      improvements,
      score,
      metrics: {
        greeting: greetingScore,
        questioning: questioningScore,
        wineKnowledge: wineKnowledgeScore,
        salesApproach: salesApproachScore,
        rapportBuilding: rapportBuildingScore,
        closing: closingScore,
        avgResponseTime,
        questionRatio,
        wineMentions
      },
      recommendations
    };
  } catch (error) {
    console.error('Error evaluating conversation:', error);
    throw new Error('Failed to evaluate conversation: ' + error.message);
  }
}; 