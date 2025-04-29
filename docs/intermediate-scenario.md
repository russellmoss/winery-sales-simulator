# Adding an Intermediate Wine Tasting Scenario: Step-by-Step Guide

This guide will walk you through creating a new "Intermediate" wine tasting scenario for your winery sales simulator while keeping the existing "Beginner" scenario. I'll provide clear instructions, Cursor.ai prompts, code snippets, and testing steps.

## Step 1: Modify the Scenario Data File

First, we need to add the new Intermediate scenario to your data file.

### Cursor.ai Prompt for Step 1:
```
Looking at the winerySalesSimulatorScenarios.js file, update the scenario with ID 'wine-tasting' to explicitly set its difficulty to 'Beginner', then add a new scenario with ID 'wine-tasting-intermediate' that's identical except with 'Intermediate' difficulty and the client details I provide below. The new scenario should represent reserved guests Emily and Susan who are value-conscious, analytical, and less forthcoming with questions. They should be described as introverted, careful with purchases, and requiring thoughtful engagement.
```

### Code Snippet:

```javascript
// Find this in src/data/winerySalesSimulatorScenarios.js
export const winerySalesSimulatorScenarios = [
  {
    id: "wine-tasting",
    title: "Wine Tasting Room Visit",
    difficulty: "Beginner", // Make sure this is explicitly set to "Beginner"
    description: "Guide a visitor through a tasting of your winery's signature wines, explaining each wine's unique characteristics and production process.",
    context: "A couple has arrived at your tasting room for a wine tasting experience. This is their first visit to your winery, and they're interested in learning more about your wines.",
    clientPersonality: {
      name: "Michael and Sarah",
      traits: ["Wine enthusiast", "Curious", "Budget-conscious"],
      concerns: ["Wine quality", "Value for money", "Wine club benefits"]
    },
    // [Existing properties remain the same]
  },
  // Add this new scenario
  {
    id: "wine-tasting-intermediate",
    title: "Wine Tasting Room Visit",
    difficulty: "Intermediate",
    description: "Guide a more reserved couple through a tasting experience who are less forthcoming with questions but potentially interested in your wines.",
    context: "A couple visiting your tasting room for the first time. They are more reserved and less forthcoming with questions or enthusiasm, but they are potentially interested in your wines. They are value-conscious and will require thoughtful engagement to convert to bottle purchases or wine club membership.",
    clientPersonality: {
      name: "Emily and Susan",
      traits: ["Introverted", "Value-conscious", "Analytical", "Reserved", "Thoughtful", "Observant"],
      concerns: ["Price-to-quality ratio", "Clear value propositions", "Privacy", "Deliberate decision-making"]
    },
    objectives: [
      "Create a comfortable atmosphere for reserved guests",
      "Identify and respond to subtle buying signals",
      "Clearly communicate value propositions",
      "Drive wine purchases",
      "Capture contact information",
      "Promote wine club membership"
    ],
    evaluationCriteria: {
      welcomeExperience: {
        description: "Created a warm, welcoming atmosphere without overwhelming reserved guests",
        weight: 15,
        dealBreaker: true,
        minimumScore: 60
      },
      wineKnowledge: {
        description: "Demonstrated expertise about wines and production",
        weight: 15,
        dealBreaker: false
      },
      tastingTechnique: {
        description: "Properly guided the tasting process",
        weight: 15,
        dealBreaker: false
      },
      customerEngagement: {
        description: "Engaged with reserved customers and identified subtle buying signals",
        weight: 20,
        dealBreaker: false
      },
      valueProposition: {
        description: "Effectively communicated value propositions for purchases and membership",
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
    keyDocuments: ["wine-tasting-guide.md"],
    estimatedDuration: "30-45"
  },
  // [Other existing scenarios remain here]
];
```

### Testing Step 1:

1. After making these changes, start the development server:
   ```
   npm start
   ```
2. Navigate to the homepage
3. Verify both "Wine Tasting Room Visit" scenarios appear, one labeled "Beginner" and one "Intermediate"

## Step 2: Update the SimulatorHome Component

Let's ensure the simulator home page properly displays both scenarios with their difficulty labels.

### Cursor.ai Prompt for Step 2:
```
Check the SimulatorHome component to ensure it correctly displays the difficulty badge for each scenario and that filtering by difficulty works correctly. Make any necessary adjustments to show both our Beginner and Intermediate scenarios.
```

### Code Snippet:

```javascript
// This code should already exist in src/components/simulator/SimulatorHome.js
// Make sure the difficulty badge is displayed correctly:

<div className="scenario-card">
  <div className="scenario-header">
    <h2>{scenario.title}</h2>
    <span className={`difficulty-badge ${scenario.difficulty.toLowerCase()}`}>
      {scenario.difficulty}
    </span>
  </div>
  <p className="scenario-description">{scenario.description}</p>
  {/* Rest of the card content */}
</div>
```

Ensure the CSS for different difficulty badges is defined:

```css
/* Add these styles to src/components/simulator/SimulatorHome.css if they don't exist */
.difficulty-badge.beginner {
  background-color: var(--success-light);
  color: var(--success);
}

.difficulty-badge.intermediate {
  background-color: var(--info-light);
  color: var(--info);
}
```

### Testing Step 2:

1. View the simulator home page
2. Verify that both scenarios appear with their correct difficulty badges
3. Test the difficulty filter dropdown to ensure:
   - When "Beginner" is selected, only the Beginner scenario appears
   - When "Intermediate" is selected, only the Intermediate scenario appears
   - When "All Difficulties" is selected, both scenarios appear

## Step 3: Update the SimulatorBrief Component

Now let's ensure the brief page correctly displays the content for the Intermediate scenario.

### Cursor.ai Prompt for Step 3:
```
Check the SimulatorBrief component to ensure it correctly displays all the new details for our intermediate scenario, including the client personality traits, objectives, evaluation criteria, and tips.
```

### Code Snippet:
The SimulatorBrief component should already handle different scenarios based on their IDs. Check that it correctly displays all fields, especially those specific to the new scenario:

```javascript
// src/components/simulator/SimulatorBrief.js should already handle this,
// but verify that it correctly displays these fields:

// Client Personality traits
<div className="profile-trait">
  <span className="trait-label">Traits:</span>
  <div className="trait-tags">
    {currentScenario.clientPersonality.traits.map((trait, index) => (
      <span key={index} className="trait-tag">{trait}</span>
    ))}
  </div>
</div>

// Objectives
<section className="objectives">
  <h3>Objectives</h3>
  <ul>
    {currentScenario.objectives.map((objective, index) => (
      <li key={index}>{objective}</li>
    ))}
  </ul>
</section>

// Duration
<p className="meta-item">
  <span className="meta-label">Duration:</span>
  <span className="meta-value">{currentScenario.estimatedDuration || '30'} minutes</span>
</p>
```

### Testing Step 3:

1. Click on the "Start Simulation" button for the Intermediate scenario
2. Verify that the brief page correctly displays:
   - "Intermediate" difficulty
   - "30-45 minutes" duration
   - The description about reserved guests
   - Client personalities listing "Introverted", "Value-conscious", etc.
   - All objectives and evaluation criteria
   - The tips for success

## Step 4: Update the Chat System Prompt for the Intermediate Scenario

We need to update the system prompting for Claude to correctly roleplay as Emily and Susan when the Intermediate scenario is selected.

### Cursor.ai Prompt for Step 4:
```
Modify the createSystemPrompt function in the server code (server.js or claudeController.js) to create a different prompt when the scenario ID is 'wine-tasting-intermediate', specifying that Claude should roleplay as Emily and Susan, a reserved couple who are value-conscious and less forthcoming with questions.
```

### Code Snippet:

```javascript
// This could be in server.js, functions/claude.js, or a controller file
// Find the createSystemPrompt function or equivalent

function createWineryScenarioSystemPrompt(scenario) {
  if (!scenario) {
    console.error("createWineryScenarioSystemPrompt called with null or undefined scenario");
    return "You are a sales representative for a winery.";
  }
  
  // Special handling for beginner wine tasting scenario
  if (scenario.id === 'wine-tasting') {
    return `You are a customer visiting a wine tasting room at a premium winery called Milea. 
    
Scenario: ${scenario.title}
Description: ${scenario.description}

Your profile:
- Name: Sarah and Michael Johnson
- Location: Pleasant Valley, NY (close to Milea) - ONLY mention this if specifically asked about where you're from
- Knowledge Level: ${scenario.clientPersonality.knowledgeLevel || 'Beginner'}
- Budget: ${scenario.clientPersonality.budget || 'Moderate'}
- Personality Traits: ${scenario.clientPersonality.traits.join(', ')}

Your objectives:
${scenario.objectives.map(obj => `- ${obj}`).join('\n')}

Your role is to:
1. Respond as a first-time visitor to Milea winery
2. Express natural conversation behaviors and engagement
3. Ask questions about the wines and winery
4. Express emotions naturally based on the conversation flow
5. DO NOT evaluate the sales representative's performance
6. DO NOT provide feedback during the conversation
7. Only respond as you would in a real winery visit
8. DO NOT mention your location (Pleasant Valley, NY) unless specifically asked about where you're from

Tasting Room Behavior:
- You should ask for a wine flight when offered
- For each wine, ask ONE question about the wine, winery ethos, terroir, etc.
- After tasting each wine, indicate you're ready for the next wine in the flight
- Comment on each wine after tasting it
- For at least one wine, express that you don't like it at all
- For other wines, include buying signals (e.g., "This would be perfect for our dinner party next week")
- Notice the wine club information on the table and ask for more details about the club
- Express interest in joining the club if the benefits are explained well

Remember: You are ONLY responding as a customer. Do not break character or mention that you are an AI.`;
  }
  
  // Add special handling for intermediate wine tasting scenario
  if (scenario.id === 'wine-tasting-intermediate') {
    return `You are a customer visiting a wine tasting room at a premium winery called Milea. 
    
Scenario: ${scenario.title} (Intermediate)
Description: ${scenario.description}

Your profile:
- Names: Emily and Susan (a couple in their mid-30s)
- Location: Only say if specifically asked, but you live about an hour away
- Knowledge Level: Intermediate - you enjoy wine but are not experts
- Budget: Value-conscious - you care about price-to-quality ratio, not just low prices
- Personality Traits: ${scenario.clientPersonality.traits.join(', ')}

Your objectives:
${scenario.objectives.map(obj => `- ${obj}`).join('\n')}

Your role is to:
1. Respond as a reserved, introverted couple visiting Milea winery
2. Be LESS forthcoming with questions - wait for the staff to engage you
3. Be thoughtful and analytical about the wines, but express opinions subtly
4. Take time to warm up to the staff member - don't immediately show enthusiasm
5. DO NOT evaluate the sales representative's performance
6. DO NOT provide feedback during the conversation
7. Only respond as you would in a real winery visit as a more reserved guest

Tasting Room Behavior:
- You don't immediately ask questions - you wait for the staff to guide you
- You're more likely to nod or give brief responses than ask detailed questions
- You speak more to your partner (Susan) than to the staff initially
- Comment on each wine, but with subtle reactions rather than obvious enthusiasm
- For at least one wine, express polite disinterest ("It's not quite what I typically enjoy")
- For wines you do like, your buying signals are subtle ("This is interesting" or "I appreciate this one")
- You don't mention the wine club first - you wait for it to be brought up
- You carefully consider membership benefits and ask questions about value
- You're reluctant to share contact information unless there's clear benefit

Remember: You are ONLY responding as reserved, value-conscious customers. Do not break character or mention that you are an AI.`;
  }
  
  // Default prompt for other scenarios
  return `You are a customer visiting a winery.
Scenario: ${scenario.title || 'Winery Visit'}
Description: ${scenario.description || 'A visit to a premium winery'}

Your role is to:
1. Respond as a customer in a realistic way
2. Express natural conversation behaviors and engagement
3. Ask questions about the wines and winery
4. Express emotions naturally based on the conversation flow
5. DO NOT evaluate the sales representative's performance
6. DO NOT provide feedback during the conversation
7. Only respond as you would in a real winery visit

Remember: You are ONLY responding as a customer. Do not evaluate or provide feedback during the conversation.`;
}
```

### Testing Step 4:

1. This is harder to test directly without making a real API call to Claude
2. You can add some debug logging to verify your changes:
   ```javascript
   console.log("Creating system prompt for scenario:", scenario.id);
   const prompt = createWineryScenarioSystemPrompt(scenario);
   console.log("System prompt preview:", prompt.substring(0, 200) + "...");
   ```
3. Start a chat in the Intermediate scenario and check server logs for the prompt
4. Verify Claude's responses match the reserved personality specified

## Step 5: Create Instructions Component for the Intermediate Scenario

Let's create or update the instructions displayed to the user when they start the Intermediate scenario chat.

### Cursor.ai Prompt for Step 5:
```
Create or modify the instruction component for when users start the Intermediate scenario. Explain that they're dealing with more reserved guests who need a different approach than enthusiastic beginners.
```

### Code Snippet:

```javascript
// Create or modify src/components/simulator/WineTastingIntermediateInstructions.js

import React from 'react';

const WineTastingIntermediateInstructions = ({ onDismiss }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 animate-fade-in">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-purple-800">Intermediate Wine Tasting Simulation</h3>
        <button 
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Dismiss instructions"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="text-gray-600 mb-4">
        <p className="mb-2">
          This is an <span className="font-bold">intermediate</span> wine tasting simulation with a more reserved couple (Emily and Susan) who need thoughtful engagement.
        </p>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-3 my-3">
          <p className="font-medium">To start the tasting:</p>
          <p className="mt-1">Introduce yourself naturally, as you would to real winery guests. For example: "Welcome to our winery! My name is [your name]. Is this your first time visiting us?"</p>
        </div>
        <p>
          Unlike enthusiastic beginners, this couple is more reserved and analytical. Remember to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Create a comfortable atmosphere without overwhelming them</li>
          <li>Ask targeted questions that are easy for reserved guests to answer</li>
          <li>Allow comfortable silences for them to experience and consider the wine</li>
          <li>Watch for subtle buying signals rather than obvious enthusiasm</li>
          <li>Explicitly highlight value propositions and quantify benefits</li>
          <li>Give them space to discuss privately at key decision points</li>
          <li>End with a clear call to action that respects their deliberate approach</li>
        </ul>
      </div>
      
      <button
        onClick={onDismiss}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition-colors"
      >
        Got it!
      </button>
    </div>
  );
};

export default WineTastingIntermediateInstructions;
```

Then update the instructions index file:

```javascript
// Modify src/components/simulator/instructions/index.js

import WineTastingInstructions from '../WineTastingInstructions';
import WineTastingIntermediateInstructions from '../WineTastingIntermediateInstructions'; // Add this
import WineClubMembershipInstructions from '../WineClubMembershipInstructions';
import VineyardTourInstructions from '../VineyardTourInstructions';
import WinePairingInstructions from '../WinePairingInstructions';
import SpecialEventInstructions from '../SpecialEventInstructions';

export {
  WineTastingInstructions,
  WineTastingIntermediateInstructions, // Add this
  WineClubMembershipInstructions,
  VineyardTourInstructions,
  WinePairingInstructions,
  SpecialEventInstructions
};
```

### Testing Step 5:

1. Start a chat in the Intermediate scenario
2. Verify the instructions component shows with:
   - "Intermediate Wine Tasting Simulation" title
   - Instructions specific to handling reserved guests
   - Tips about watching for subtle buying signals
   - Guidance on creating a comfortable atmosphere

## Step 6: Update SimulatorChat to Show the Correct Instructions

Update the SimulatorChat component to show the appropriate instructions based on the scenario ID.

### Cursor.ai Prompt for Step 6:
```
Update the SimulatorChat component to show WineTastingIntermediateInstructions when the scenario ID is 'wine-tasting-intermediate' and the regular WineTastingInstructions when the scenario ID is 'wine-tasting'.
```

### Code Snippet:

```javascript
// Modify src/components/simulator/SimulatorChat.js

import React, { useState, useRef, useEffect } from 'react';
import { useSimulator } from '../../contexts/SimulatorContext';
import { 
  WineTastingInstructions,
  WineTastingIntermediateInstructions, // Import the new component
  WineClubMembershipInstructions,
  VineyardTourInstructions,
  WinePairingInstructions,
  SpecialEventInstructions
} from './instructions';

// Inside the component
const SimulatorChat = () => {
  const { currentScenario } = useSimulator();
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Add this function to determine which instructions to show
  const getInstructionsComponent = () => {
    if (!currentScenario) return null;
    
    switch (currentScenario.id) {
      case 'wine-tasting':
        return <WineTastingInstructions onDismiss={() => setShowInstructions(false)} />;
      case 'wine-tasting-intermediate':
        return <WineTastingIntermediateInstructions onDismiss={() => setShowInstructions(false)} />;
      case 'wine-club-membership':
        return <WineClubMembershipInstructions onDismiss={() => setShowInstructions(false)} />;
      case 'vineyard-tour':
        return <VineyardTourInstructions onDismiss={() => setShowInstructions(false)} />;
      case 'wine-pairing':
        return <WinePairingInstructions onDismiss={() => setShowInstructions(false)} />;
      case 'special-event':
        return <SpecialEventInstructions onDismiss={() => setShowInstructions(false)} />;
      default:
        return null;
    }
  };
  
  // In the render section
  return (
    <div className="simulator-chat">
      {/* ... other content ... */}
      
      {/* Show instructions if needed */}
      {showInstructions && getInstructionsComponent()}
      
      {/* ... chat messages and input ... */}
    </div>
  );
};
```

### Testing Step 6:

1. Start a chat in the Beginner scenario
2. Verify you see the basic WineTastingInstructions
3. Go back and start a chat in the Intermediate scenario
4. Verify you see the WineTastingIntermediateInstructions with content specific to reserved guests

## Step 7: Update the Evaluation Rubric

Let's update the evaluation process to handle the different expectations for the Intermediate scenario.

### Cursor.ai Prompt for Step 7:
```
Update the evaluation rubric or process to account for the different expectations for the Intermediate scenario. For the Intermediate scenario, evaluation should emphasize identifying subtle buying signals, creating a comfortable atmosphere for reserved guests, and effectively communicating value propositions.
```

### Code Snippet:

```javascript
// Update the rubric data in src/data/rubricData.js or equivalent

// Add a new rubric for the intermediate wine tasting scenario
export const wineTastingIntermediateRubric = {
  id: 'wine-tasting-intermediate',
  title: 'Intermediate Wine Tasting Experience',
  description: 'Evaluation criteria for wine tasting sales interactions with reserved guests',
  criteria: [
    {
      id: 'greeting',
      title: 'Greeting and Initial Engagement',
      description: 'How effectively the staff member welcomes reserved guests and creates a comfortable atmosphere',
      maxScore: 10,
      evaluationPoints: [
        'Welcoming and friendly greeting without overwhelming guests',
        'Creating a comfortable atmosphere for reserved visitors',
        'Reading initial comfort level and adapting approach',
        'Allowing space for guests to settle in',
        'Setting appropriate expectations for the tasting experience'
      ]
    },
    {
      id: 'engagement-approach',
      title: 'Engagement with Reserved Guests',
      description: 'How well the staff member engages with reserved guests without overwhelming them',
      maxScore: 15,
      evaluationPoints: [
        'Asking targeted, open-ended questions that are easy to answer',
        'Allowing comfortable silences for wine consideration',
        'Being attentive without hovering',
        'Adapting to the guests\' communication style',
        'Providing information when needed without information overload'
      ]
    },
    {
      id: 'signal-recognition',
      title: 'Recognition of Subtle Buying Signals',
      description: 'Ability to identify and respond to subtle buying signals from reserved guests',
      maxScore: 15,
      evaluationPoints: [
        'Noticing subtle verbal cues of interest',
        'Identifying non-verbal signals like extended examination of bottles',
        'Recognizing positive taste reactions even when subdued',
        'Addressing signals with appropriate follow-up',
        'Giving space after identifying interest in a particular wine'
      ]
    },
    {
      id: 'value-communication',
      title: 'Value Proposition Communication',
      description: 'How well the staff member communicates value to value-conscious guests',
      maxScore: 15,
      evaluationPoints: [
        'Explicitly highlighting value aspects of wines',
        'Quantifying savings for multi-bottle purchases',
        'Clearly explaining club membership benefits in value terms',
        'Avoiding pressure tactics that might alienate analytical guests',
        'Providing clear comparisons that demonstrate value'
      ]
    },
    {
      id: 'wine-knowledge',
      title: 'Wine Knowledge',
      description: 'Demonstration of wine expertise appropriate for analytically-minded guests',
      maxScore: 15,
      evaluationPoints: [
        'Providing factual and substantive information',
        'Explaining production processes clearly',
        'Discussing terroir and regional characteristics',
        'Connecting wine attributes to value proposition',
        'Answering questions with depth appropriate to guest knowledge'
      ]
    },
    {
      id: 'decision-space',
      title: 'Respecting the Decision Process',
      description: 'How well the staff member respects the guests\' deliberate decision-making style',
      maxScore: 10,
      evaluationPoints: [
        'Providing space for private discussion at key decision points',
        'Offering clear, written information for review',
        'Not rushing or pressuring decisions',
        'Recognizing when guests need time to consider',
        'Following up appropriately after giving space'
      ]
    },
    {
      id: 'closing',
      title: 'Appropriate Closing Approach',
      description: 'How effectively the staff member closes with reserved guests',
      maxScore: 10,
      evaluationPoints: [
        'Using appropriate closing techniques for reserved guests',
        'Making clear but low-pressure purchase suggestions',
        'Offering a clear path to wine club membership',
        'Providing contact information for future consideration',
        'Creating a comfortable exit path regardless of purchase'
      ]
    },
    {
      id: 'overall-experience',
      title: 'Overall Experience for Reserved Guests',
      description: 'The overall quality of the experience for more reserved visitors',
      maxScore: 10,
      evaluationPoints: [
        'Creating a memorable experience appropriate for the guests',
        'Demonstrating genuine interest without overwhelming',
        'Balancing information with space for reflection',
        'Adapting throughout the experience based on guest response',
        'Leaving guests feeling valued and comfortable'
      ]
    }
  ]
};

// Then update the rubricMap
export const rubricMap = {
  'wine-tasting': wineTastingRubric,
  'wine-tasting-intermediate': wineTastingIntermediateRubric, // Add this line
  'wine-club-membership': wineClubMembershipRubric,
  'vineyard-tour': vineyardTourRubric,
  'wine-pairing': winePairingRubric,
  'special-event': specialEventRubric,
  'default': defaultRubric
};
```

### Testing Step 7:

1. This is harder to test directly without a full evaluation run
2. To test that the correct rubric is loaded:
   ```javascript
   import { getRubricForScenario } from '../data/rubricData';
   
   // Add this where you can see the output
   console.log("Rubric loaded:", getRubricForScenario('wine-tasting-intermediate').title);
   ```
3. When evaluation is performed, check the criteria being evaluated match the intermediate scenario expectations

## Step 8: Test the Complete Flow

Now let's test the complete flow from start to finish.

### Testing Steps:

1. Start from the home page
2. Verify both scenarios appear with correct labels
3. Click on the Intermediate scenario
4. Verify the brief shows all the correct information about Emily and Susan
5. Start the conversation
6. Verify the intermediate instructions appear
7. Begin chatting with a natural greeting
8. Verify Claude responds as a reserved couple (Emily and Susan)
9. Test different engagement approaches to see if Claude maintains the reserved character
10. Complete a full conversation and check if the evaluation uses the correct criteria

## Step 9: Clean Up and Final Adjustments

Let's make sure everything is properly connected and there are no loose ends.

### Cursor.ai Prompt for Step 9:
```
Check for any imports, routes, or references that might need updating to fully support the new scenario. Make sure all components are properly connected and functioning together.
```

### Final Checklist:

1. The scenario data file has the new scenario with all details
2. The home page shows both scenarios correctly
3. The filtering by difficulty works for both
4. The brief page displays all the correct information
5. The chat system creates the right prompt based on scenario ID
6. The instructions component appears correctly
7. The evaluation rubric is updated
8. All routes and links work as expected

## Important Note About Starting the Conversation

Claude should respond appropriately to whatever greeting or introduction you provide. The "GREET" suggestion in the instructions is just a convention to help users who might not know how to begin, but it's not technically required for the system to function.

For the updated Intermediate scenario instructions, we've removed that specific instruction and made it clearer that users can begin with any natural greeting, as seen in the updated code:

```javascript
<div className="bg-purple-50 border-l-4 border-purple-500 p-3 my-3">
  <p className="font-medium">To start the tasting:</p>
  <p className="mt-1">Introduce yourself naturally, as you would to real winery guests. For example: "Welcome to our winery! My name is [your name]. Is this your first time visiting us?"</p>
</div>
```

This encourages a more natural conversational flow from the beginning rather than suggesting a command-like interaction.

## Conclusion

You now have a new "Intermediate" wine tasting scenario featuring Emily and Susan as reserved, value-conscious guests. This provides users with a progression from the "Beginner" scenario with Michael and Sarah, allowing them to practice different sales techniques for different customer types.

The scenario is fully integrated into your existing winery sales simulator, with appropriate prompts for Claude to roleplay the reserved guests, updated instructions for users, and a specialized evaluation rubric for this scenario.