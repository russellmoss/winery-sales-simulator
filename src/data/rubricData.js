/**
 * Rubric data for evaluating winery sales scenarios
 */

// Wine Tasting Scenario Rubric
export const wineTastingRubric = {
  id: 'wine-tasting',
  title: 'Wine Tasting Experience',
  description: 'Evaluation criteria for wine tasting sales interactions',
  criteria: [
    {
      id: 'greeting',
      title: 'Greeting and Initial Engagement',
      description: 'How well the sales representative greets and engages with the customer',
      maxScore: 10,
      evaluationPoints: [
        'Welcoming and friendly greeting',
        'Establishing rapport quickly',
        'Identifying customer preferences early',
        'Creating a comfortable atmosphere',
        'Setting expectations for the tasting experience'
      ]
    },
    {
      id: 'product-knowledge',
      title: 'Wine Knowledge',
      description: 'Demonstration of wine knowledge and expertise',
      maxScore: 15,
      evaluationPoints: [
        'Accurate description of wine characteristics',
        'Explaining winemaking techniques',
        'Discussing grape varieties and regions',
        'Sharing information about vintage differences',
        'Connecting wine attributes to customer preferences'
      ]
    },
    {
      id: 'tasting-technique',
      title: 'Tasting Technique Guidance',
      description: 'Ability to guide customers through proper wine tasting',
      maxScore: 10,
      evaluationPoints: [
        'Explaining the tasting process (look, smell, taste)',
        'Providing appropriate tasting order',
        'Offering palate cleansers when needed',
        'Encouraging customer exploration and discovery',
        'Asking for customer impressions and feedback'
      ]
    },
    {
      id: 'engagement',
      title: 'Customer Engagement',
      description: 'How well the sales representative engages with the customer',
      maxScore: 15,
      evaluationPoints: [
        'Active listening to customer preferences',
        'Asking relevant follow-up questions',
        'Adapting explanations to customer knowledge level',
        'Creating a personalized experience',
        'Maintaining conversation flow throughout tasting'
      ]
    },
    {
      id: 'sales-approach',
      title: 'Sales Approach',
      description: 'Effectiveness of the sales approach',
      maxScore: 15,
      evaluationPoints: [
        'Identifying buying signals',
        'Making appropriate wine recommendations',
        'Discussing pricing naturally',
        'Suggesting wine club membership when appropriate',
        'Creating urgency without pressure'
      ]
    },
    {
      id: 'closing',
      title: 'Closing and Follow-up',
      description: 'How well the sales representative closes the interaction',
      maxScore: 10,
      evaluationPoints: [
        'Summarizing customer preferences',
        'Confirming purchase decisions',
        'Providing additional information about the winery',
        'Suggesting future visits or events',
        'Thanking the customer for their visit'
      ]
    },
    {
      id: 'overall-experience',
      title: 'Overall Experience',
      description: 'The overall quality of the customer experience',
      maxScore: 25,
      evaluationPoints: [
        'Creating a memorable and enjoyable experience',
        'Demonstrating passion for wine and the winery',
        'Making the customer feel valued',
        'Balancing education with entertainment',
        'Leaving a positive impression of the winery'
      ]
    }
  ]
};

// Wine Club Membership Scenario Rubric
export const wineClubMembershipRubric = {
  id: 'wine-club-membership',
  title: 'Wine Club Membership',
  description: 'Evaluation criteria for wine club membership sales interactions',
  criteria: [
    {
      id: 'greeting',
      title: 'Greeting and Initial Engagement',
      description: 'How well the sales representative greets and engages with the customer',
      maxScore: 10,
      evaluationPoints: [
        'Welcoming and friendly greeting',
        'Establishing rapport quickly',
        'Identifying customer wine preferences',
        'Creating a comfortable atmosphere',
        'Setting the context for discussing wine club membership'
      ]
    },
    {
      id: 'benefits-presentation',
      title: 'Benefits Presentation',
      description: 'How well the sales representative presents wine club benefits',
      maxScore: 15,
      evaluationPoints: [
        'Clearly explaining membership benefits',
        'Highlighting exclusive offerings',
        'Discussing wine club discounts',
        'Explaining shipping options',
        'Presenting member events and experiences'
      ]
    },
    {
      id: 'addressing-concerns',
      title: 'Addressing Concerns',
      description: 'How well the sales representative addresses customer concerns',
      maxScore: 15,
      evaluationPoints: [
        'Anticipating common objections',
        'Providing clear answers to questions',
        'Explaining commitment terms clearly',
        'Offering flexible options when available',
        'Addressing pricing concerns professionally'
      ]
    },
    {
      id: 'personalization',
      title: 'Personalization',
      description: 'How well the sales representative personalizes the wine club offering',
      maxScore: 15,
      evaluationPoints: [
        'Tailoring benefits to customer preferences',
        'Suggesting appropriate membership tier',
        'Connecting club offerings to customer interests',
        'Creating a sense of exclusivity',
        'Making the customer feel like an ideal member'
      ]
    },
    {
      id: 'value-proposition',
      title: 'Value Proposition',
      description: 'How well the sales representative communicates the value of membership',
      maxScore: 15,
      evaluationPoints: [
        'Quantifying the value of membership',
        'Comparing costs to regular purchases',
        'Highlighting long-term benefits',
        'Creating a sense of community',
        'Emphasizing the unique aspects of the wine club'
      ]
    },
    {
      id: 'closing',
      title: 'Closing and Follow-up',
      description: 'How well the sales representative closes the membership discussion',
      maxScore: 15,
      evaluationPoints: [
        'Asking for the membership commitment',
        'Making the sign-up process easy',
        'Confirming membership details',
        'Explaining next steps clearly',
        'Expressing excitement about their membership'
      ]
    },
    {
      id: 'overall-approach',
      title: 'Overall Approach',
      description: 'The overall effectiveness of the wine club membership approach',
      maxScore: 15,
      evaluationPoints: [
        'Maintaining a consultative approach',
        'Balancing information with persuasion',
        'Creating enthusiasm without pressure',
        'Demonstrating passion for the wine club',
        'Leaving a positive impression regardless of outcome'
      ]
    }
  ]
};

// Vineyard Tour Scenario Rubric
export const vineyardTourRubric = {
  id: 'vineyard-tour',
  title: 'Vineyard Tour',
  description: 'Evaluation criteria for vineyard tour guide interactions',
  criteria: [
    {
      id: 'greeting',
      title: 'Greeting and Initial Engagement',
      description: 'How well the tour guide greets and engages with the group',
      maxScore: 10,
      evaluationPoints: [
        'Welcoming and friendly greeting',
        'Introducing themselves professionally',
        'Establishing rapport with the group',
        'Setting expectations for the tour',
        'Creating excitement about the experience'
      ]
    },
    {
      id: 'vineyard-knowledge',
      title: 'Vineyard Knowledge',
      description: 'Demonstration of vineyard and viticulture knowledge',
      maxScore: 15,
      evaluationPoints: [
        'Explaining grape growing techniques',
        'Discussing vineyard management practices',
        'Describing terroir and its impact on wine',
        'Sharing information about grape varieties',
        'Explaining sustainable farming practices'
      ]
    },
    {
      id: 'winery-history',
      title: 'Winery History and Philosophy',
      description: 'How well the tour guide shares the winery\'s history and philosophy',
      maxScore: 15,
      evaluationPoints: [
        'Sharing the winery\'s founding story',
        'Explaining the winery\'s philosophy',
        'Discussing the winemaker\'s approach',
        'Connecting history to current practices',
        'Creating a sense of heritage and tradition'
      ]
    },
    {
      id: 'production-knowledge',
      title: 'Production Knowledge',
      description: 'Demonstration of winemaking process knowledge',
      maxScore: 15,
      evaluationPoints: [
        'Explaining the winemaking process clearly',
        'Describing fermentation techniques',
        'Discussing aging and barrel selection',
        'Explaining blending decisions',
        'Connecting production choices to wine characteristics'
      ]
    },
    {
      id: 'engagement',
      title: 'Group Engagement',
      description: 'How well the tour guide engages with the group',
      maxScore: 15,
      evaluationPoints: [
        'Maintaining eye contact with the group',
        'Asking questions to involve participants',
        'Adapting explanations to group knowledge level',
        'Creating interactive moments',
        'Keeping the tour moving at an appropriate pace'
      ]
    },
    {
      id: 'storytelling',
      title: 'Storytelling',
      description: 'How well the tour guide uses storytelling to enhance the experience',
      maxScore: 10,
      evaluationPoints: [
        'Using anecdotes to illustrate points',
        'Creating memorable moments',
        'Connecting personal stories to the winery',
        'Making technical information accessible',
        'Creating emotional connections to the wines'
      ]
    },
    {
      id: 'sales-integration',
      title: 'Sales Integration',
      description: 'How well the tour guide integrates sales opportunities',
      maxScore: 10,
      evaluationPoints: [
        'Highlighting wines being tasted',
        'Connecting tour information to wine purchases',
        'Mentioning wine club benefits naturally',
        'Creating interest in special offerings',
        'Suggesting post-tour purchases without pressure'
      ]
    },
    {
      id: 'closing',
      title: 'Closing and Follow-up',
      description: 'How well the tour guide closes the experience',
      maxScore: 10,
      evaluationPoints: [
        'Summarizing key points of the tour',
        'Thanking the group for their visit',
        'Providing information about next steps',
        'Encouraging questions',
        'Expressing hope for a return visit'
      ]
    }
  ]
};

// Wine Pairing Scenario Rubric
export const winePairingRubric = {
  id: 'wine-pairing',
  title: 'Wine Pairing Consultation',
  description: 'Evaluation criteria for wine pairing consultation interactions',
  criteria: [
    {
      id: 'greeting',
      title: 'Greeting and Initial Engagement',
      description: 'How well the sales representative greets and engages with the customer',
      maxScore: 10,
      evaluationPoints: [
        'Welcoming and friendly greeting',
        'Establishing rapport quickly',
        'Creating a comfortable atmosphere',
        'Setting the context for the consultation',
        'Expressing enthusiasm for helping with wine selection'
      ]
    },
    {
      id: 'needs-assessment',
      title: 'Needs Assessment',
      description: 'How well the sales representative assesses the customer\'s needs',
      maxScore: 15,
      evaluationPoints: [
        'Asking about the occasion',
        'Understanding the menu or food being served',
        'Identifying guest preferences and dietary restrictions',
        'Determining budget considerations',
        'Understanding the customer\'s wine knowledge level'
      ]
    },
    {
      id: 'pairing-knowledge',
      title: 'Wine Pairing Knowledge',
      description: 'Demonstration of wine and food pairing expertise',
      maxScore: 20,
      evaluationPoints: [
        'Explaining pairing principles clearly',
        'Considering flavor profiles of both food and wine',
        'Suggesting multiple pairing options',
        'Explaining why specific pairings work well',
        'Offering alternatives for different preferences'
      ]
    },
    {
      id: 'recommendations',
      title: 'Wine Recommendations',
      description: 'Quality and appropriateness of wine recommendations',
      maxScore: 20,
      evaluationPoints: [
        'Suggesting wines that match the customer\'s needs',
        'Offering options at different price points',
        'Recommending wines available at the winery',
        'Considering the customer\'s preferences',
        'Providing specific vintage recommendations when relevant'
      ]
    },
    {
      id: 'education',
      title: 'Customer Education',
      description: 'How well the sales representative educates the customer',
      maxScore: 15,
      evaluationPoints: [
        'Explaining wine characteristics in accessible terms',
        'Teaching basic pairing principles',
        'Sharing interesting facts about recommended wines',
        'Providing serving suggestions',
        'Offering tips for enhancing the wine experience'
      ]
    },
    {
      id: 'sales-approach',
      title: 'Sales Approach',
      description: 'Effectiveness of the sales approach',
      maxScore: 10,
      evaluationPoints: [
        'Discussing pricing naturally',
        'Suggesting appropriate quantities',
        'Mentioning wine club benefits when relevant',
        'Creating confidence in the recommendations',
        'Making the purchase decision easy'
      ]
    },
    {
      id: 'follow-up',
      title: 'Follow-up and Additional Support',
      description: 'How well the sales representative provides follow-up support',
      maxScore: 10,
      evaluationPoints: [
        'Offering additional assistance if needed',
        'Providing contact information for questions',
        'Suggesting future consultations',
        'Thanking the customer for their business',
        'Expressing hope for a successful event'
      ]
    }
  ]
};

// Special Event Scenario Rubric
export const specialEventRubric = {
  id: 'special-event',
  title: 'Special Event Planning',
  description: 'Evaluation criteria for special event venue sales interactions',
  criteria: [
    {
      id: 'greeting',
      title: 'Greeting and Initial Engagement',
      description: 'How well the sales representative greets and engages with the customer',
      maxScore: 10,
      evaluationPoints: [
        'Welcoming and friendly greeting',
        'Establishing rapport quickly',
        'Creating a comfortable atmosphere',
        'Setting the context for the consultation',
        'Expressing enthusiasm for helping with event planning'
      ]
    },
    {
      id: 'needs-assessment',
      title: 'Needs Assessment',
      description: 'How well the sales representative assesses the customer\'s event needs',
      maxScore: 15,
      evaluationPoints: [
        'Asking about the type of event',
        'Understanding the event date and guest count',
        'Identifying specific requirements and preferences',
        'Determining budget considerations',
        'Understanding the customer\'s vision for the event'
      ]
    },
    {
      id: 'venue-presentation',
      title: 'Venue Presentation',
      description: 'How well the sales representative presents the venue options',
      maxScore: 15,
      evaluationPoints: [
        'Highlighting venue features and amenities',
        'Explaining capacity and layout options',
        'Discussing indoor and outdoor spaces',
        'Sharing information about accessibility',
        'Presenting venue photos and examples'
      ]
    },
    {
      id: 'services-knowledge',
      title: 'Services Knowledge',
      description: 'Demonstration of knowledge about available services',
      maxScore: 15,
      evaluationPoints: [
        'Explaining catering options',
        'Discussing beverage service packages',
        'Describing setup and cleanup services',
        'Outlining additional service providers',
        'Explaining customization possibilities'
      ]
    },
    {
      id: 'logistics',
      title: 'Logistics and Planning',
      description: 'How well the sales representative addresses event logistics',
      maxScore: 15,
      evaluationPoints: [
        'Discussing timeline and scheduling',
        'Explaining booking and deposit process',
        'Addressing parking and transportation',
        'Covering weather contingency plans',
        'Outlining vendor coordination'
      ]
    },
    {
      id: 'addressing-concerns',
      title: 'Addressing Concerns',
      description: 'How well the sales representative addresses customer concerns',
      maxScore: 10,
      evaluationPoints: [
        'Anticipating common event planning concerns',
        'Providing clear answers to questions',
        'Offering solutions to potential challenges',
        'Addressing pricing concerns professionally',
        'Creating confidence in the venue and services'
      ]
    },
    {
      id: 'closing',
      title: 'Closing and Follow-up',
      description: 'How well the sales representative closes the consultation',
      maxScore: 10,
      evaluationPoints: [
        'Summarizing key points discussed',
        'Outlining next steps clearly',
        'Providing written information and proposals',
        'Setting up follow-up communication',
        'Expressing excitement about their potential event'
      ]
    },
    {
      id: 'overall-approach',
      title: 'Overall Approach',
      description: 'The overall effectiveness of the special event sales approach',
      maxScore: 10,
      evaluationPoints: [
        'Maintaining a consultative approach',
        'Balancing information with enthusiasm',
        'Creating confidence without pressure',
        'Demonstrating passion for hosting events',
        'Leaving a positive impression regardless of outcome'
      ]
    }
  ]
};

// Default Rubric for other scenarios
export const defaultRubric = {
  id: 'default',
  title: 'Winery Sales Interaction',
  description: 'General evaluation criteria for winery sales interactions',
  criteria: [
    {
      id: 'greeting',
      title: 'Greeting and Initial Engagement',
      description: 'How well the sales representative greets and engages with the customer',
      maxScore: 15,
      evaluationPoints: [
        'Welcoming and friendly greeting',
        'Establishing rapport quickly',
        'Creating a comfortable atmosphere',
        'Setting appropriate expectations',
        'Expressing enthusiasm for helping the customer'
      ]
    },
    {
      id: 'product-knowledge',
      title: 'Product Knowledge',
      description: 'Demonstration of wine and winery knowledge',
      maxScore: 20,
      evaluationPoints: [
        'Accurate description of wine characteristics',
        'Explaining winemaking techniques',
        'Discussing grape varieties and regions',
        'Sharing information about the winery',
        'Connecting wine attributes to customer preferences'
      ]
    },
    {
      id: 'needs-assessment',
      title: 'Needs Assessment',
      description: 'How well the sales representative assesses the customer\'s needs',
      maxScore: 15,
      evaluationPoints: [
        'Asking relevant questions',
        'Listening actively to responses',
        'Identifying customer preferences',
        'Understanding customer goals',
        'Adapting approach based on customer needs'
      ]
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      description: 'Quality and appropriateness of recommendations',
      maxScore: 15,
      evaluationPoints: [
        'Suggesting products that match customer needs',
        'Offering options at different price points',
        'Explaining the benefits of recommendations',
        'Considering the customer\'s preferences',
        'Providing specific product information'
      ]
    },
    {
      id: 'sales-approach',
      title: 'Sales Approach',
      description: 'Effectiveness of the sales approach',
      maxScore: 15,
      evaluationPoints: [
        'Discussing pricing naturally',
        'Identifying and addressing buying signals',
        'Creating urgency without pressure',
        'Making the purchase decision easy',
        'Suggesting additional products when appropriate'
      ]
    },
    {
      id: 'closing',
      title: 'Closing and Follow-up',
      description: 'How well the sales representative closes the interaction',
      maxScore: 10,
      evaluationPoints: [
        'Confirming purchase decisions',
        'Summarizing key points discussed',
        'Providing additional information as needed',
        'Setting up follow-up communication',
        'Thanking the customer for their business'
      ]
    },
    {
      id: 'overall-experience',
      title: 'Overall Experience',
      description: 'The overall quality of the customer experience',
      maxScore: 10,
      evaluationPoints: [
        'Creating a memorable and enjoyable experience',
        'Demonstrating passion for wine and the winery',
        'Making the customer feel valued',
        'Balancing education with sales',
        'Leaving a positive impression of the winery'
      ]
    }
  ]
};

// Map of scenario IDs to rubrics
export const rubricMap = {
  'wine-tasting': wineTastingRubric,
  'wine-club-membership': wineClubMembershipRubric,
  'vineyard-tour': vineyardTourRubric,
  'wine-pairing': winePairingRubric,
  'special-event': specialEventRubric,
  'default': defaultRubric
};

// Get the appropriate rubric for a scenario
export const getRubricForScenario = (scenarioId) => {
  return rubricMap[scenarioId] || defaultRubric;
};

export default {
  wineTastingRubric,
  wineClubMembershipRubric,
  vineyardTourRubric,
  winePairingRubric,
  specialEventRubric,
  defaultRubric,
  getRubricForScenario
}; 