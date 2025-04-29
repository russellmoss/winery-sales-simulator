/**
 * Winery Sales Simulator Scenarios
 * 
 * This file contains the scenarios for the winery sales simulator.
 * Each scenario represents a different sales situation that a winery sales representative might encounter.
 */

export const winerySalesSimulatorScenarios = [
  {
    id: "wine-tasting",
    title: "Guided Wine Tasting Experience",
    difficulty: "Beginner",
    description: "Guide a visitor through a tasting of your winery's signature wines, explaining each wine's unique characteristics and production process.",
    context: "A couple has arrived at your tasting room for a wine tasting experience. This is their first visit to your winery, and they're interested in learning more about your wines.",
    clientPersonality: {
      name: "Michael and Sarah",
      traits: ["Wine enthusiast", "Curious", "Budget-conscious"],
      concerns: ["Wine quality", "Value for money", "Wine club benefits"]
    },
    objectives: [
      "Create a welcoming atmosphere",
      "Educate visitors about your wines",
      "Identify preferences and buying signals",
      "Drive wine purchases",
      "Promote wine club membership"
    ],
    evaluationCriteria: {
      welcomeExperience: {
        description: "Created a warm, welcoming atmosphere",
        weight: 15,
        dealBreaker: true,
        minimumScore: 60
      },
      wineKnowledge: {
        description: "Demonstrated expertise about wines and production",
        weight: 20,
        dealBreaker: false
      },
      tastingTechnique: {
        description: "Properly guided the tasting process",
        weight: 15,
        dealBreaker: false
      },
      customerEngagement: {
        description: "Engaged with customers and addressed their questions",
        weight: 15,
        dealBreaker: false
      },
      salesApproach: {
        description: "Used appropriate sales techniques without being pushy",
        weight: 20,
        dealBreaker: false
      },
      closing: {
        description: "Effectively closed with a purchase or membership",
        weight: 15,
        dealBreaker: false
      }
    },
    stageFunnel: "top-funnel",
    keyDocuments: ["wine-tasting-guide.md"]
  },
  {
    id: "wine-club-membership",
    title: "Wine Club Membership Sale",
    difficulty: "Intermediate",
    description: "Convince a wine enthusiast to join your exclusive wine club, highlighting the benefits and value proposition.",
    context: "A regular customer has been visiting your tasting room for the past few months and has shown interest in your wine club. They're considering joining but have some concerns about the commitment.",
    clientPersonality: {
      name: "Jennifer",
      traits: ["Wine connoisseur", "Busy professional", "Value-focused"],
      concerns: ["Monthly commitment", "Flexibility", "Exclusive benefits"]
    },
    objectives: [
      "Explain wine club benefits clearly",
      "Address concerns about commitment",
      "Highlight exclusive member experiences",
      "Demonstrate value proposition",
      "Close the membership sale"
    ],
    evaluationCriteria: {
      greeting: {
        description: "Welcomed the customer appropriately",
        weight: 10,
        dealBreaker: false
      },
      benefitsPresentation: {
        description: "Clearly explained wine club benefits",
        weight: 20,
        dealBreaker: false
      },
      addressingConcerns: {
        description: "Effectively addressed customer concerns",
        weight: 20,
        dealBreaker: false
      },
      personalization: {
        description: "Tailored the pitch to the customer's interests",
        weight: 15,
        dealBreaker: false
      },
      valueProposition: {
        description: "Demonstrated clear value for the membership",
        weight: 20,
        dealBreaker: false
      },
      closing: {
        description: "Used appropriate closing techniques",
        weight: 15,
        dealBreaker: false
      }
    },
    stageFunnel: "mid-funnel",
    keyDocuments: ["wine-club-benefits.md", "membership-terms.md"]
  },
  {
    id: "vineyard-tour",
    title: "Vineyard Tour and Wine Education",
    difficulty: "Intermediate",
    description: "Lead a group of visitors on a tour of your vineyard, explaining the wine-making process and your winery's history.",
    context: "A group of 8 wine enthusiasts has booked a private vineyard tour. They're interested in learning about your wine-making process and the history of your winery.",
    clientPersonality: {
      name: "Wine Enthusiasts Group",
      traits: ["Knowledgeable", "Engaged", "Photography-focused"],
      concerns: ["Tour quality", "Educational value", "Photo opportunities"]
    },
    objectives: [
      "Share winery history and philosophy",
      "Explain wine-making techniques",
      "Highlight unique vineyard features",
      "Engage the group with interesting facts",
      "Drive wine purchases after the tour"
    ],
    evaluationCriteria: {
      greeting: {
        description: "Welcomed the group warmly",
        weight: 10,
        dealBreaker: false
      },
      vineyardKnowledge: {
        description: "Demonstrated expertise about the vineyard",
        weight: 20,
        dealBreaker: false
      },
      wineryHistory: {
        description: "Shared interesting history about the winery",
        weight: 15,
        dealBreaker: false
      },
      productionKnowledge: {
        description: "Explained wine production process clearly",
        weight: 20,
        dealBreaker: false
      },
      groupEngagement: {
        description: "Kept the group engaged throughout the tour",
        weight: 15,
        dealBreaker: false
      },
      storytelling: {
        description: "Used storytelling to make information memorable",
        weight: 10,
        dealBreaker: false
      },
      salesIntegration: {
        description: "Naturally integrated sales opportunities",
        weight: 10,
        dealBreaker: false
      }
    },
    stageFunnel: "mid-funnel",
    keyDocuments: ["vineyard-tour-script.md", "winery-history.md"]
  },
  {
    id: "wine-pairing",
    title: "Wine Pairing Consultation",
    difficulty: "Advanced",
    description: "Provide personalized wine pairing recommendations for a customer's upcoming dinner party.",
    context: "A customer is hosting a dinner party and needs help selecting wines that pair well with their menu. They want to impress their guests with thoughtful wine selections.",
    clientPersonality: {
      name: "David",
      traits: ["Entertaining-focused", "Detail-oriented", "Quality-conscious"],
      concerns: ["Perfect pairings", "Quantity needed", "Presentation"]
    },
    objectives: [
      "Understand the dinner menu and guest preferences",
      "Recommend appropriate wine pairings",
      "Explain pairing principles",
      "Suggest serving quantities",
      "Close with a wine purchase"
    ],
    evaluationCriteria: {
      greeting: {
        description: "Welcomed the customer appropriately",
        weight: 10,
        dealBreaker: false
      },
      needsAssessment: {
        description: "Thoroughly assessed customer needs",
        weight: 20,
        dealBreaker: false
      },
      pairingKnowledge: {
        description: "Demonstrated expertise in wine pairing",
        weight: 20,
        dealBreaker: false
      },
      recommendations: {
        description: "Provided appropriate pairing recommendations",
        weight: 20,
        dealBreaker: false
      },
      education: {
        description: "Educated customer about pairing principles",
        weight: 15,
        dealBreaker: false
      },
      salesApproach: {
        description: "Used appropriate sales techniques",
        weight: 15,
        dealBreaker: false
      }
    },
    stageFunnel: "mid-funnel",
    keyDocuments: ["wine-pairing-guide.md", "serving-quantities.md"]
  },
  {
    id: "special-event",
    title: "Special Event Booking",
    difficulty: "Advanced",
    description: "Sell your winery as a venue for a special event, such as a wedding, corporate event, or private party.",
    context: "A couple is interested in hosting their wedding at your winery. They're looking for a unique venue with a romantic atmosphere and good wine.",
    clientPersonality: {
      name: "Emma and James",
      traits: ["Romantic", "Detail-oriented", "Budget-aware"],
      concerns: ["Venue capacity", "Catering options", "Cost", "Availability"]
    },
    objectives: [
      "Understand event requirements and vision",
      "Showcase venue features and amenities",
      "Address concerns about logistics",
      "Explain catering and service options",
      "Close with a venue booking"
    ],
    evaluationCriteria: {
      greeting: {
        description: "Welcomed the couple appropriately",
        weight: 10,
        dealBreaker: false
      },
      needsAssessment: {
        description: "Thoroughly assessed event needs",
        weight: 15,
        dealBreaker: false
      },
      venuePresentation: {
        description: "Effectively showcased venue features",
        weight: 20,
        dealBreaker: false
      },
      servicesKnowledge: {
        description: "Demonstrated knowledge of available services",
        weight: 15,
        dealBreaker: false
      },
      logistics: {
        description: "Addressed logistical concerns",
        weight: 15,
        dealBreaker: false
      },
      addressingConcerns: {
        description: "Effectively addressed customer concerns",
        weight: 15,
        dealBreaker: false
      },
      closing: {
        description: "Used appropriate closing techniques",
        weight: 10,
        dealBreaker: false
      }
    },
    stageFunnel: "bottom-funnel",
    keyDocuments: ["venue-capacities.md", "catering-options.md", "event-packages.md"]
  },
  {
    id: "large-purchase",
    title: "Large Wine Purchase Negotiation",
    difficulty: "Expert",
    description: "Negotiate a large wine purchase with a restaurant or retailer, focusing on volume discounts and long-term partnership.",
    context: "A local restaurant is interested in featuring your wines on their menu. They're looking to establish a long-term partnership and want to discuss pricing for regular large orders.",
    clientPersonality: {
      name: "Robert Chen",
      traits: ["Business-focused", "Negotiation-savvy", "Quality-conscious"],
      concerns: ["Pricing", "Delivery reliability", "Exclusivity", "Marketing support"]
    },
    objectives: [
      "Understand the client's business needs",
      "Present your wine portfolio effectively",
      "Negotiate pricing and terms",
      "Address concerns about logistics",
      "Close with a long-term partnership agreement"
    ],
    evaluationCriteria: {
      preparation: {
        description: "Demonstrated thorough preparation",
        weight: 15,
        dealBreaker: false
      },
      needsAssessment: {
        description: "Thoroughly assessed client needs",
        weight: 15,
        dealBreaker: false
      },
      portfolioPresentation: {
        description: "Effectively presented wine portfolio",
        weight: 15,
        dealBreaker: false
      },
      negotiation: {
        description: "Used effective negotiation techniques",
        weight: 20,
        dealBreaker: false
      },
      addressingConcerns: {
        description: "Effectively addressed client concerns",
        weight: 15,
        dealBreaker: false
      },
      partnershipFocus: {
        description: "Emphasized long-term partnership benefits",
        weight: 10,
        dealBreaker: false
      },
      closing: {
        description: "Used appropriate closing techniques",
        weight: 10,
        dealBreaker: false
      }
    },
    stageFunnel: "bottom-funnel",
    keyDocuments: ["wholesale-pricing.md", "delivery-terms.md", "partnership-benefits.md"]
  },
  {
    id: "wine-education",
    title: "Wine Education Class",
    difficulty: "Intermediate",
    description: "Lead a wine education class for a group of beginners, teaching them about wine basics, tasting techniques, and your winery's offerings.",
    context: "A group of 12 beginners has signed up for your 'Wine 101' class. They're eager to learn about wine but have limited knowledge and experience.",
    clientPersonality: {
      name: "Wine Beginners Group",
      traits: ["Curious", "Eager to learn", "Somewhat intimidated"],
      concerns: ["Understanding wine basics", "Feeling comfortable", "Getting value"]
    },
    objectives: [
      "Create a welcoming, non-intimidating atmosphere",
      "Teach wine basics clearly and engagingly",
      "Demonstrate proper tasting techniques",
      "Introduce your winery's wines",
      "Drive wine purchases and future visits"
    ],
    evaluationCriteria: {
      atmosphere: {
        description: "Created a welcoming, comfortable atmosphere",
        weight: 15,
        dealBreaker: false
      },
      teachingClarity: {
        description: "Explained concepts clearly and simply",
        weight: 20,
        dealBreaker: false
      },
      engagement: {
        description: "Kept the group engaged throughout",
        weight: 15,
        dealBreaker: false
      },
      tastingGuidance: {
        description: "Effectively guided the tasting process",
        weight: 15,
        dealBreaker: false
      },
      wineryIntroduction: {
        description: "Effectively introduced winery offerings",
        weight: 15,
        dealBreaker: false
      },
      salesIntegration: {
        description: "Naturally integrated sales opportunities",
        weight: 10,
        dealBreaker: false
      },
      followUp: {
        description: "Provided clear next steps for continued learning",
        weight: 10,
        dealBreaker: false
      }
    },
    stageFunnel: "top-funnel",
    keyDocuments: ["wine-101-curriculum.md", "tasting-techniques.md"]
  },
  {
    id: "wine-club-renewal",
    title: "Wine Club Membership Renewal",
    difficulty: "Intermediate",
    description: "Convince a wine club member to renew their membership, highlighting the value they've received and new benefits.",
    context: "A wine club member's annual membership is coming up for renewal. They've been a member for two years but haven't visited the winery recently and may be considering cancellation.",
    clientPersonality: {
      name: "Thomas",
      traits: ["Busy", "Value-focused", "Somewhat disengaged"],
      concerns: ["Continued value", "Usage of benefits", "Changing preferences"]
    },
    objectives: [
      "Remind the member of their benefits and value received",
      "Address any concerns about the membership",
      "Highlight new benefits and upcoming events",
      "Re-engage the member with the winery",
      "Secure membership renewal"
    ],
    evaluationCriteria: {
      personalizedApproach: {
        description: "Used a personalized approach based on member history",
        weight: 20,
        dealBreaker: false
      },
      valueReminder: {
        description: "Effectively reminded of value received",
        weight: 15,
        dealBreaker: false
      },
      addressingConcerns: {
        description: "Addressed concerns about continued membership",
        weight: 15,
        dealBreaker: false
      },
      newBenefits: {
        description: "Highlighted new benefits and upcoming events",
        weight: 15,
        dealBreaker: false
      },
      reengagement: {
        description: "Effectively re-engaged the member",
        weight: 15,
        dealBreaker: false
      },
      closing: {
        description: "Used appropriate closing techniques",
        weight: 20,
        dealBreaker: false
      }
    },
    stageFunnel: "mid-funnel",
    keyDocuments: ["member-history.md", "new-benefits.md", "upcoming-events.md"]
  }
];

/**
 * Helper function to get a scenario by ID
 * @param {string} id - The ID of the scenario to retrieve
 * @returns {Object} - The scenario object, or null if not found
 */
export const getScenarioById = (id) => {
  return winerySalesSimulatorScenarios.find(scenario => scenario.id === id) || null;
};

/**
 * Helper function to get scenarios by difficulty level
 * @param {string} difficulty - The difficulty level to filter by
 * @returns {Array} - Array of scenarios with the specified difficulty
 */
export const getScenariosByDifficulty = (difficulty) => {
  return winerySalesSimulatorScenarios.filter(scenario => scenario.difficulty === difficulty);
};

/**
 * Helper function to get scenarios by funnel stage
 * @param {string} stage - The funnel stage to filter by
 * @returns {Array} - Array of scenarios with the specified funnel stage
 */
export const getScenariosByFunnelStage = (stage) => {
  return winerySalesSimulatorScenarios.filter(scenario => scenario.stageFunnel === stage);
};

export default winerySalesSimulatorScenarios; 