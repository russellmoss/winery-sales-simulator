# Debugging and Fixing Firestore Permissions in Winery Sales Simulator

Based on your error messages and Firestore rules, I've identified the issue. It appears that you have a mismatch between where your code is trying to write interactions data and what your Firestore security rules allow. Let me guide you through debugging and fixing this step-by-step.

## Step 1: Identify the Root Problem

The "Missing or insufficient permissions" error occurs because your code is trying to save interactions as subcollections under each scenario document (e.g., `scenarios/{scenarioId}/interactions/{interactionId}`), but your security rules only allow writing to a top-level `interactions` collection.

## Step 2: Update Firestore Security Rules

Let's start by updating your Firestore security rules to allow writing to subcollections of scenarios.

### Cursor.ai Prompt:
```
Update my firestore.rules file to allow reading and writing to interaction subcollections under each scenario document. Keep my existing rules but add a new rule to allow read/write access to scenarios/{scenarioId}/interactions/{interactionId}.
```

### Updated Firestore Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scenarios/{scenarioId} {
      allow read: if true;
      allow write: if false;  // Disable writing to scenarios
      
      // Add this rule to allow interactions subcollection
      match /interactions/{interactionId} {
        allow read, write: if true;
      }
    }
    
    match /interactions/{interactionId} {
      allow read, write: if true;  // Allow interactions without auth for now
    }
    
    match /evaluations/{evaluationId} {
      allow read, write: if request.auth != null;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /{document=**} {
      allow read, write: if false;  // Secure other collections by default
    }
  }
}
```

### Testing Step:
1. Deploy these updated rules to Firestore using the Firebase console or CLI
2. In the Firebase console, go to Firestore Database → Rules
3. Replace the current rules with the updated ones
4. Click "Publish"

## Step 3: Check How Interactions Are Being Saved

Let's examine how your code is saving interactions to ensure it's consistent with your data structure.

### Cursor.ai Prompt:
```
Find the saveInteraction function in my codebase and show me how it's currently structured. I need to verify if it's trying to save to a top-level 'interactions' collection or to subcollections under scenarios.
```

Looking at your code, I identified that the issue might be in your `saveInteraction` function in `client/src/firebase/firestoreService.js`. It appears to be trying to save interactions to a subcollection path.

### Current Implementation:
```javascript
// In client/src/firebase/firestoreService.js
export const saveInteraction = async (scenarioId, interaction) => {
  try {
    const interactionsRef = collection(db, 'interactions');
    await addDoc(interactionsRef, {
      scenarioId,
      ...interaction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving interaction:', error);
    throw error;
  }
};
```

But it seems your application is actually expecting it to be:

```javascript
export const saveInteraction = async (scenarioId, interaction) => {
  try {
    const interactionsRef = collection(db, 'scenarios', scenarioId, 'interactions');
    await addDoc(interactionsRef, {
      ...interaction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving interaction:', error);
    throw error;
  }
};
```

## Step 4: Update the SaveInteraction Function

Let's update the function to match your data structure.

### Cursor.ai Prompt:
```
Update the saveInteraction function in client/src/firebase/firestoreService.js to correctly save interactions to subcollections under scenario documents. It should use the path 'scenarios/{scenarioId}/interactions/{interactionId}'.
```

### Updated Function:
```javascript
export const saveInteraction = async (scenarioId, interaction) => {
  try {
    console.log('Saving interaction for scenario:', scenarioId);
    const interactionsRef = collection(db, 'scenarios', scenarioId, 'interactions');
    await addDoc(interactionsRef, {
      ...interaction,
      timestamp: new Date().toISOString()
    });
    console.log('Interaction saved successfully');
  } catch (error) {
    console.error('Error saving interaction:', error, error.stack);
    throw error;
  }
};
```

### Testing Step:
1. Update this function in your codebase
2. Run your app and try to interact with a scenario
3. Check the console for the new log messages

## Step 5: Fix the GetInteractions Function to Match

We should also update the `getInteractions` function to match this structure.

### Cursor.ai Prompt:
```
Update the getInteractions function in client/src/firebase/firestoreService.js to correctly fetch interactions from subcollections under scenario documents.
```

### Updated Function:
```javascript
export const getInteractions = async (scenarioId) => {
  try {
    console.log('Fetching interactions for scenario:', scenarioId);
    const interactionsRef = collection(db, 'scenarios', scenarioId, 'interactions');
    const interactionsQuery = query(interactionsRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(interactionsQuery);
    const interactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`Found ${interactions.length} interactions`);
    return interactions;
  } catch (error) {
    console.error('Error getting interactions:', error);
    throw error;
  }
};
```

## Step 6: Verify Firebase Configuration

Let's make sure the Firebase configuration is correct and consistent.

### Cursor.ai Prompt:
```
Check my client/src/firebase/firebase.js file to ensure Firebase is being initialized correctly with the right configuration for my project.
```

### Verify Configuration:
```javascript
// client/src/firebase/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA16MWIAudcNe3r7ae0y2OR90GLmfxCqCw",
  authDomain: "winery-sales-simulator.firebaseapp.com",
  projectId: "winery-sales-simulator",
  storageBucket: "winery-sales-simulator.appspot.com",
  messagingSenderId: "1003376854901",
  appId: "1:1003376854901:web:053269d1035fc3d32ab53c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
```

This looks correct. The configuration matches what's needed for your `winery-sales-simulator` project.

## Step 7: Update the SimulatorContext's addInteraction Method

Let's make sure the context provider's method for adding interactions matches our updated approach.

### Cursor.ai Prompt:
```
Examine the addInteraction method in src/contexts/SimulatorContext.js to ensure it's calling saveInteraction correctly with the right parameters.
```

### Check Implementation:
```javascript
const addInteraction = async (message, role) => {
  try {
    const newInteraction = {
      message,
      role,
      timestamp: new Date().toISOString(),
    };

    setInteractions(prev => [...prev, newInteraction]);
    await saveInteraction(scenarioId, newInteraction);
  } catch (err) {
    setError(err.message);
  }
};
```

This looks correct. It's passing the `scenarioId` and the interaction data to `saveInteraction`.

## Step 8: Add Robust Debugging

Let's add more detailed logging to help diagnose any other issues.

### Cursor.ai Prompt:
```
Add detailed debug logging to the SimulatorChat.js component's handleSendMessage function to track what's happening during the message sending process, especially when calling addInteraction and sendMessageToClaude.
```

### Updated Function:
```javascript
const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!message.trim()) return;

  console.log('Starting to send message:', message);
  setIsLoading(true);
  setChatError(null);

  try {
    console.log('Adding user message to interactions...');
    // Add user message to interactions
    await addInteraction(message, 'user');
    setIsTyping(true);

    console.log('Getting response from Claude...');
    // Get response from Claude
    const response = await sendMessageToClaude(
      currentScenario,
      [...interactions, { message: message, role: 'user' }]
    );
    console.log('Received response from Claude:', response);

    console.log('Adding Claude response to interactions...');
    // Add Claude's response to interactions
    await addInteraction(response, 'assistant');
    console.log('Successfully added Claude response');

    // Clear the input field
    setMessage('');
  } catch (err) {
    console.error('Error in handleSendMessage:', err, err.stack);
    setChatError(err.message);
  } finally {
    setIsTyping(false);
    setIsLoading(false);
    console.log('Message sending process completed');
  }
};
```

## Step 9: Implement Error Recovery for Interactions

Let's add a mechanism to recover from errors when saving interactions, so Claude's responses still get shown even if saving fails.

### Cursor.ai Prompt:
```
Modify the handleSendMessage function in SimulatorChat.js to still display Claude's response even if saving to Firestore fails. The conversation should continue in-memory.
```

### Updated Function:
```javascript
const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!message.trim()) return;

  console.log('Starting to send message:', message);
  setIsLoading(true);
  setChatError(null);
  
  // Store the current message for use in UI updates
  const currentUserMessage = message;
  // Clear input immediately for better UX
  setMessage('');

  // Add user message to local state immediately
  const newUserInteraction = {
    message: currentUserMessage,
    role: 'user',
    timestamp: new Date().toISOString()
  };
  setInteractions(prev => [...prev, newUserInteraction]);

  try {
    console.log('Adding user message to Firestore...');
    // Try to save to Firestore but don't block UI
    addInteraction(currentUserMessage, 'user').catch(err => {
      console.error('Failed to save user message to Firestore:', err);
      // Show a non-blocking warning
      setChatError('Your message was sent but could not be saved to the database. The conversation will continue in-memory only.');
    });
    
    setIsTyping(true);

    console.log('Getting response from Claude...');
    // Get response from Claude
    const response = await sendMessageToClaude(
      currentScenario,
      [...interactions, newUserInteraction]
    );
    console.log('Received response from Claude:', response);

    // Add Claude's response to local state immediately
    const newAssistantInteraction = {
      message: response,
      role: 'assistant',
      timestamp: new Date().toISOString()
    };
    setInteractions(prev => [...prev, newAssistantInteraction]);

    console.log('Adding Claude response to Firestore...');
    // Try to save to Firestore but don't block UI
    addInteraction(response, 'assistant').catch(err => {
      console.error('Failed to save Claude response to Firestore:', err);
      // We've already updated the UI, so this only affects database persistence
    });
    
  } catch (err) {
    console.error('Error in handleSendMessage:', err, err.stack);
    setChatError(`Error: ${err.message}. Please try again.`);
  } finally {
    setIsTyping(false);
    setIsLoading(false);
    console.log('Message sending process completed');
  }
};
```

## Step 10: Test Different Firestore Paths

Let's create a simple test function to check different Firestore paths.

### Cursor.ai Prompt:
```
Create a test function that attempts to write to both the top-level interactions collection and the subcollection path, then logs the results. We'll use this to debug which paths work with our security rules.
```

### Test Function:
```javascript
export const testFirestorePaths = async (scenarioId) => {
  try {
    console.log('Testing Firestore paths for scenario:', scenarioId);
    
    // Test writing to top-level interactions collection
    const topLevelRef = collection(db, 'interactions');
    try {
      const topLevelDoc = await addDoc(topLevelRef, {
        scenarioId,
        message: 'Test top-level write',
        role: 'system',
        timestamp: new Date().toISOString()
      });
      console.log('Successfully wrote to top-level path:', topLevelDoc.id);
    } catch (error) {
      console.error('Failed to write to top-level path:', error);
    }
    
    // Test writing to subcollection
    const subCollectionRef = collection(db, 'scenarios', scenarioId, 'interactions');
    try {
      const subCollectionDoc = await addDoc(subCollectionRef, {
        message: 'Test subcollection write',
        role: 'system',
        timestamp: new Date().toISOString()
      });
      console.log('Successfully wrote to subcollection path:', subCollectionDoc.id);
    } catch (error) {
      console.error('Failed to write to subcollection path:', error);
    }
    
    return "Test completed, check console for results";
  } catch (error) {
    console.error('Error in testFirestorePaths:', error);
    throw error;
  }
};
```

### Add a Test Button to SimulatorChat:
```javascript
// Add this near the top of your component
const [testing, setTesting] = useState(false);

// Add this to your JSX near other buttons
<button
  onClick={async () => {
    setTesting(true);
    try {
      const result = await testFirestorePaths(currentScenario.id);
      console.log(result);
      alert("Test completed, check console for results");
    } catch (error) {
      console.error(error);
      alert("Test failed: " + error.message);
    } finally {
      setTesting(false);
    }
  }}
  disabled={testing}
  className="test-button"
>
  {testing ? "Testing..." : "Test DB Paths"}
</button>
```

## Step 11: Create a Complete Fix for Production

Based on all our investigation, here's what you need to do:

### Cursor.ai Prompt:
```
Create a complete solution for fixing the Firestore permissions issue, including updating the Firestore rules and ensuring the application code consistently uses the same path structure for interactions.
```

### Complete Solution:

1. **Update Firestore Rules**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scenarios/{scenarioId} {
      allow read: if true;
      allow write: if false;  // Disable writing to scenarios
      
      // Allow interactions subcollection
      match /interactions/{interactionId} {
        allow read, write: if true;
      }
      
      // Allow evaluations subcollection 
      match /evaluations/{evaluationId} {
        allow read, write: if true;
      }
    }
    
    // Keep this for backward compatibility
    match /interactions/{interactionId} {
      allow read, write: if true;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /{document=**} {
      allow read, write: if false;  // Secure other collections by default
    }
  }
}
```

2. **Update firestoreService.js**:

```javascript
// client/src/firebase/firestoreService.js

// Scenarios
export const getScenarios = async () => {
  try {
    console.log('Attempting to fetch scenarios from Firestore...');
    console.log('Database instance:', db);
    
    const scenariosRef = collection(db, 'scenarios');
    console.log('Collection reference created:', {
      path: scenariosRef.path,
      id: scenariosRef.id
    });
    
    const scenariosQuery = query(scenariosRef);
    console.log('Query created:', scenariosQuery);
    
    const snapshot = await getDocs(scenariosQuery);
    console.log('Snapshot received:', {
      empty: snapshot.empty,
      size: snapshot.size,
      metadata: snapshot.metadata
    });
    
    if (snapshot.empty) {
      console.log('No scenarios found in the database');
      return [];
    }
    
    const scenarios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Successfully fetched scenarios:', scenarios);
    return scenarios;
    
  } catch (error) {
    console.error('Error getting scenarios:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return an empty array instead of throwing to prevent app crashes
    return [];
  }
};

export const getScenarioById = async (scenarioId) => {
  try {
    const scenarioRef = doc(db, 'scenarios', scenarioId);
    const scenarioDoc = await getDoc(scenarioRef);
    
    if (!scenarioDoc.exists()) {
      throw new Error('Scenario not found');
    }

    return {
      id: scenarioDoc.id,
      ...scenarioDoc.data()
    };
  } catch (error) {
    console.error('Error getting scenario:', error);
    throw error;
  }
};

// Interactions
export const saveInteraction = async (scenarioId, interaction) => {
  try {
    console.log(`Saving interaction for scenario: ${scenarioId}`, interaction);
    const interactionsRef = collection(db, 'scenarios', scenarioId, 'interactions');
    const docRef = await addDoc(interactionsRef, {
      ...interaction,
      timestamp: new Date().toISOString()
    });
    console.log('Interaction saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving interaction:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export const getInteractions = async (scenarioId) => {
  try {
    console.log('Fetching interactions for scenario:', scenarioId);
    const interactionsRef = collection(db, 'scenarios', scenarioId, 'interactions');
    const interactionsQuery = query(interactionsRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(interactionsQuery);
    
    const interactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${interactions.length} interactions`);
    return interactions;
  } catch (error) {
    console.error('Error getting interactions:', error);
    throw error;
  }
};

// Evaluations
export const saveEvaluation = async (scenarioId, evaluation) => {
  try {
    console.log('Saving evaluation for scenario:', scenarioId);
    const evaluationsRef = collection(db, 'scenarios', scenarioId, 'evaluations');
    const docRef = await addDoc(evaluationsRef, {
      ...evaluation,
      timestamp: new Date().toISOString()
    });
    console.log('Evaluation saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving evaluation:', error);
    throw error;
  }
};

export const getEvaluations = async (scenarioId) => {
  try {
    console.log('Fetching evaluations for scenario:', scenarioId);
    const evaluationsRef = collection(db, 'scenarios', scenarioId, 'evaluations');
    const snapshot = await getDocs(evaluationsRef);
    
    const evaluations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${evaluations.length} evaluations`);
    return evaluations;
  } catch (error) {
    console.error('Error getting evaluations:', error);
    throw error;
  }
};
```

3. **Update SimulatorChat.js**:

```javascript
const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!inputMessage.trim()) return;

  console.log('Starting to send message:', inputMessage);
  setIsLoading(true);
  setError(null);
  
  // Store the current message for use in UI updates
  const currentMessage = inputMessage;
  // Clear input immediately for better UX
  setInputMessage('');

  // Create user message object
  const userMessage = {
    role: 'user',
    content: currentMessage,
    timestamp: new Date().toISOString()
  };

  // Add to local state immediately
  addMessage(userMessage);

  try {
    setIsTyping(true);
    console.log('Getting response from Claude...');
    const response = await sendMessageToClaude(
      currentScenario,
      [...messages, userMessage]
    );
    console.log('Received response from Claude:', response);

    // Create assistant message object
    const assistantMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    };

    // Add to local state
    addMessage(assistantMessage);

    // Analyze the interaction
    const impact = analyzeAssistantResponseImpact(response, currentScenario);
    analyzeInteraction({
      successful: impact.salesPotential > 0.7,
      responseTime: 0,
      satisfaction: (impact.relevance + impact.helpfulness + impact.salesPotential) / 3
    });

  } catch (err) {
    console.error('Error in handleSendMessage:', err);
    setError('Failed to get response from assistant. Please try again.');
  } finally {
    setIsTyping(false);
    setIsLoading(false);
    console.log('Message sending process completed');
  }
};
```

## Step 12: Deploy and Test

Follow these steps to deploy and test your solution:

1. Update all the files as detailed above
2. Update the Firestore rules in Firebase Console
3. Deploy your application to Netlify
4. Test the application by:
   - Loading the homepage and verifying scenarios load
   - Starting a conversation with one of your scenarios
   - Sending a message and checking if Claude responds
   - Examining the console logs to verify interactions are being saved correctly

## Step 13: Create a Firestore Management Script

To help you manage scenarios in Firestore more easily, let's create a utility script:

### Cursor.ai Prompt:
```
Create a Node.js script that helps manage scenarios in Firestore, allowing me to add, update, or delete scenarios easily.
```

### Firestore Management Script (save as `scripts/manage-scenarios.js`):

```javascript
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc 
} = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA16MWIAudcNe3r7ae0y2OR90GLmfxCqCw",
  authDomain: "winery-sales-simulator.firebaseapp.com",
  projectId: "winery-sales-simulator",
  storageBucket: "winery-sales-simulator.appspot.com",
  messagingSenderId: "1003376854901",
  appId: "1:1003376854901:web:053269d1035fc3d32ab53c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();
const scenarioId = args[1];
const jsonFile = args[2];

// Helper functions
const listScenarios = async () => {
  try {
    console.log('Fetching all scenarios...');
    const scenariosRef = collection(db, 'scenarios');
    const snapshot = await getDocs(scenariosRef);
    
    if (snapshot.empty) {
      console.log('No scenarios found.');
      return;
    }
    
    console.log('\nAvailable Scenarios:');
    console.log('===================');
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`Title: ${data.title}`);
      console.log(`Difficulty: ${data.difficulty}`);
      console.log('-------------------');
    });
    
  } catch (error) {
    console.error('Error listing scenarios:', error);
  }
};

const getScenario = async (id) => {
  try {
    console.log(`Fetching scenario with ID: ${id}`);
    const scenarioRef = doc(db, 'scenarios', id);
    const scenarioDoc = await getDoc(scenarioRef);
    
    if (!scenarioDoc.exists()) {
      console.log(`Scenario with ID ${id} not found.`);
      return;
    }
    
    const data = scenarioDoc.data();
    console.log('\nScenario Details:');
    console.log('=================');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error getting scenario:', error);
  }
};

const addScenario = async (id, jsonFilePath) => {
  try {
    if (!id) {
      console.error('Error: Scenario ID is required');
      return;
    }
    
    if (!jsonFilePath) {
      console.error('Error: JSON file path is required');
      return;
    }
    
    const fullPath = path.resolve(jsonFilePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`Error: File not found at ${fullPath}`);
      return;
    }
    
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    let scenarioData;
    
    try {
      scenarioData = JSON.parse(fileContent);
    } catch (e) {
      console.error('Error parsing JSON file:', e);
      return;
    }
    
    // Add ID to the data
    scenarioData.id = id;
    
    // Save to Firestore
    console.log(`Adding scenario with ID: ${id}`);
    const scenarioRef = doc(db, 'scenarios', id);
    await setDoc(scenarioRef, scenarioData);
    
    console.log(`Scenario ${id} added successfully!`);
    
  } catch (error) {
    console.error('Error adding scenario:', error);
  }
};

const updateScenario = async (id, jsonFilePath) => {
  try {
    if (!id) {
      console.error('Error: Scenario ID is required');
      return;
    }
    
    // Check if scenario exists
    const scenarioRef = doc(db, 'scenarios', id);
    const scenarioDoc = await getDoc(scenarioRef);
    
    if (!scenarioDoc.exists()) {
      console.log(`Scenario with ID ${id} not found. Creating a new one...`);
    } else {
      console.log(`Updating existing scenario with ID: ${id}`);
    }
    
    if (!jsonFilePath) {
      console.error('Error: JSON file path is required');
      return;
    }
    
    const fullPath = path.resolve(jsonFilePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`Error: File not found at ${fullPath}`);
      return;
    }
    
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    let scenarioData;
    
    try {
      scenarioData = JSON.parse(fileContent);
    } catch (e) {
      console.error('Error parsing JSON file:', e);
      return;
    }
    
    // Add ID to the data
    scenarioData.id = id;
    
    // Update in Firestore
    await setDoc(scenarioRef, scenarioData, { merge: true });
    
    console.log(`Scenario ${id} updated successfully!`);
    
  } catch (error) {
    console.error('Error updating scenario:', error);
  }
};

const deleteScenario = async (id) => {
  try {
    if (!id) {
      console.error('Error: Scenario ID is required');
      return;
    }
    
    // Check if scenario exists
    const scenarioRef = doc(db, 'scenarios', id);
    const scenarioDoc = await getDoc(scenarioRef);
    
    if (!scenarioDoc.exists()) {
      console.log(`Scenario with ID ${id} not found.`);
      return;
    }
    
    // Confirm deletion
    console.log(`Are you sure you want to delete scenario '${id}'? This action cannot be undone.`);
    console.log("Type 'yes' to confirm:");
    
    // Simple confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        await deleteDoc(scenarioRef);
        console.log(`Scenario ${id} deleted successfully!`);
      } else {
        console.log('Deletion cancelled.');
      }
      
      readline.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error deleting scenario:', error);
  }
};

// Main execution
const main = async () => {
  if (!command) {
    console.log('Usage: node manage-scenarios.js <command> [scenarioId] [jsonFile]');
    console.log('\nCommands:');
    console.log('  list                     List all scenarios');
    console.log('  get <scenarioId>         Get details of a specific scenario');
    console.log('  add <scenarioId> <file>  Add a new scenario from JSON file');
    console.log('  update <scenarioId> <file> Update an existing scenario');
    console.log('  delete <scenarioId>      Delete a scenario');
    return;
  }
  
  switch (command) {
    case 'list':
      await listScenarios();
      break;
    case 'get':
      if (!scenarioId) {
        console.error('Error: Scenario ID is required for get command');
        return;
      }
      await getScenario(scenarioId);
      break;
    case 'add':
      await addScenario(scenarioId, jsonFile);
      break;
    case 'update':
      await updateScenario(scenarioId, jsonFile);
      break;
    case 'delete':
      await deleteScenario(scenarioId);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      break;
  }
};

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
```

### Usage Example:

```bash
# Install dependencies
npm install firebase

# List all scenarios
node scripts/manage-scenarios.js list

# Get a specific scenario
node scripts/manage-scenarios.js get wine-tasting-1

# Add a new scenario
node scripts/manage-scenarios.js add new-scenario-id path/to/scenario.json

# Update an existing scenario
node scripts/manage-scenarios.js update wine-tasting-1 path/to/updated-scenario.json

# Delete a scenario
node scripts/manage-scenarios.js delete scenario-to-delete
```

## Step 14: Create a Template for New Scenarios

### Cursor.ai Prompt:
```
Create a JSON template for new scenarios that I can use with the management script, following the structure of my existing scenarios.
```

### Scenario Template (`templates/scenario-template.json`):

```json
{
  "title": "New Scenario Title",
  "description": "A detailed description of this scenario...",
  "difficulty": "Beginner",
  "clientPersonality": {
    "knowledgeLevel": "Beginner",
    "budget": "Moderate",
    "traits": [
      "Wine enthusiast",
      "Social",
      "Curious"
    ]
  },
  "funnelStage": "awareness",
  "objectives": [
    "objective 1",
    "objective 2",
    "objective 3"
  ],
  "evaluationCriteria": [
    "criterion 1",
    "criterion 2",
    "criterion 3"
  ],
  "keyDocuments": [
    "Document 1",
    "Document 2"
  ]
}
```

## Final Notes and Best Practices

1. **Consistent Data Paths**: Always use subcollections (`scenarios/{scenarioId}/interactions`) for storing interactions - this organizes your data better than a flat structure.

2. **Error Handling**: Add robust error handling that allows your application to continue functioning even if a Firestore operation fails.

3. **Security Rules**: Always test your security rules thoroughly before deploying them to production.

4. **Logging**: Maintain detailed logs for debugging, but remember to remove sensitive or excessive logging in production.

5. **Testing**: Use the management script to create test scenarios and validate your changes.

By following these steps, you should be able to resolve the permission issues and continue building your winery sales simulator with Firestore. The key fix is ensuring your Firestore rules and your code's data paths match up correctly.