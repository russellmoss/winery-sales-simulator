# Winery Sales Simulator API Documentation

## Overview
The Winery Sales Simulator is a web application that simulates wine tasting room conversations between staff and customers. It uses Claude for natural language processing and ElevenLabs for text-to-speech functionality.

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-production-url/api`

## Authentication
All endpoints require a valid API key in the `Authorization` header:
```
Authorization: Bearer YOUR_API_KEY
```

## Claude API Endpoints

### Test Route
```http
GET /claude/test
```
Simple test endpoint to verify Claude routes are working.

**Response:**
```json
{
  "message": "Claude routes are working!"
}
```

### Test Claude API Connectivity
```http
GET /claude/test-claude
```
Tests the connection to the Claude API.

**Response:**
```json
{
  "status": "healthy",
  "service": "claude",
  "requestId": "string",
  "timestamp": "ISO-8601 date string"
}
```

### Send Message to Claude
```http
POST /claude/message
```
Sends a message to Claude and receives a response with optional audio narration.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, I'm interested in learning about your wines."
    }
  ],
  "scenario": {
    "id": "string",
    "title": "string",
    "description": "string",
    "customerProfile": {
      "names": ["string"],
      "homeLocation": "string",
      "occupation": "string",
      "visitReason": "string"
    },
    "clientPersonality": {
      "knowledgeLevel": "string",
      "traits": ["string"],
      "budget": "string",
      "preferences": {
        "favoriteWines": ["string"],
        "dislikes": ["string"],
        "interests": ["string"]
      }
    },
    "wineryInfo": {
      "name": "string",
      "location": "string",
      "specialties": ["string"],
      "uniqueFeatures": ["string"]
    },
    "voiceId": "string"
  }
}
```

**Response:**
```json
{
  "response": "string",
  "audioUrl": "string",
  "messageId": "string",
  "model": "string",
  "usage": {
    "input_tokens": number,
    "output_tokens": number
  }
}
```

### Analyze Response
```http
POST /claude/analyze
```
Analyzes a conversation using Claude.

**Request Body:**
```json
{
  "scenario": {
    "evaluationCriteria": [
      {
        "name": "string",
        "description": "string"
      }
    ],
    "difficulty": "Beginner|Intermediate|Advanced"
  },
  "messages": [
    {
      "role": "user",
      "content": "string"
    },
    {
      "role": "assistant",
      "content": "string"
    }
  ]
}
```

**Response:**
```json
{
  "analysis": "string"
}
```

### Evaluate Conversation
```http
POST /claude/evaluate
```
Evaluates a wine sales conversation.

**Request Body:**
```json
{
  "prompt": "Please evaluate this wine sales conversation:\n\nCustomer: [message]\nSalesperson: [message]"
}
```

**Response:**
```json
{
  "evaluation": {
    "rawResponse": "string",
    "error": "string" // Only present if parsing failed
  }
}
```

### Convert Narrative to Scenario
```http
POST /claude/narrative-to-scenario
```
Converts a narrative description into a structured scenario.

**Request Body:**
```json
{
  "narrative": "Description of the scenario"
}
```

**Response:**
```json
{
  "title": "string",
  "description": "string",
  "difficulty": "string",
  "voiceId": "string",
  "wineryInfo": {
    "name": "string",
    "location": "string",
    "specialties": ["string"],
    "uniqueFeatures": ["string"]
  },
  "customerProfile": {
    "names": ["string"],
    "homeLocation": "string",
    "occupation": "string",
    "visitReason": "string"
  },
  "clientPersonality": {
    "knowledgeLevel": "string",
    "budget": "string",
    "traits": ["string"],
    "preferences": {
      "favoriteWines": ["string"],
      "dislikes": ["string"],
      "interests": ["string"]
    }
  },
  "behavioralInstructions": {
    "generalBehavior": ["string"],
    "tastingBehavior": ["string"],
    "purchaseIntentions": ["string"]
  },
  "funnelStage": "string",
  "objectives": ["string"],
  "evaluationCriteria": ["string"],
  "keyDocuments": ["string"],
  "initialContext": "string"
}
```

## ElevenLabs API Endpoints

### Health Check
```http
GET /elevenlabs/health
```
Checks the ElevenLabs API connectivity.

**Response:**
```json
{
  "status": "ok",
  "elevenLabs": boolean
}
```

### Text to Speech
```http
POST /elevenlabs/text-to-speech
```
Converts text to speech using ElevenLabs API.

**Request Body:**
```json
{
  "text": "string",
  "voiceId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "audioUrl": "string"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "string",
  "message": "string"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

### 405 Method Not Allowed
```json
{
  "error": "Method Not Allowed",
  "message": "string"
}
```

### 500 Internal Server Error
```json
{
  "error": "string",
  "message": "string",
  "stack": "string" // Only in development mode
}
```

## Notes
- All endpoints support CORS
- Rate limiting is enabled (100 requests per 15 minutes)
- All responses include security headers
- Environment variables must be properly configured for production 

## Example Use Cases

### 1. Creating a New Sales Scenario
```http
POST /claude/narrative-to-scenario
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "narrative": "A couple from San Francisco visiting Napa Valley for their anniversary. They are wine enthusiasts but new to this winery. They are interested in learning about the winery's signature red blends and have a budget of $100-150 per bottle."
}
```

### 2. Starting a Sales Conversation
```http
POST /claude/message
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "messages": [
    {
      "role": "user",
      "content": "Welcome to our winery! I see you're interested in our red blends. What brings you to Napa Valley today?"
    }
  ],
  "options": {
    "model": "claude-3-opus-20240229",
    "max_tokens": 1000
  }
}
```

### 3. Analyzing a Sales Interaction
```http
POST /claude/analyze
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "scenario": {
    "evaluationCriteria": [
      {
        "name": "Product Knowledge",
        "description": "Demonstrates understanding of wine characteristics and pairings"
      },
      {
        "name": "Customer Engagement",
        "description": "Actively listens and responds to customer needs"
      },
      {
        "name": "Sales Techniques",
        "description": "Uses appropriate sales techniques and handles objections"
      }
    ],
    "difficulty": "Intermediate"
  },
  "messages": [
    {
      "role": "user",
      "content": "We're celebrating our anniversary and looking for a special red blend. What do you recommend?"
    },
    {
      "role": "assistant",
      "content": "Congratulations on your anniversary! For a special occasion, I'd recommend our Reserve Red Blend. It's a carefully crafted blend of Cabernet Sauvignon, Merlot, and Petit Verdot, aged in French oak for 18 months. It has notes of dark cherry, vanilla, and a hint of spice, perfect for celebrating."
    }
  ]
}
```

### 4. Evaluating a Complete Sales Conversation
```http
POST /claude/evaluate
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "prompt": "Please evaluate this wine sales conversation:\n\nCustomer: We're celebrating our anniversary and looking for a special red blend. What do you recommend?\n\nSalesperson: Congratulations on your anniversary! For a special occasion, I'd recommend our Reserve Red Blend. It's a carefully crafted blend of Cabernet Sauvignon, Merlot, and Petit Verdot, aged in French oak for 18 months. It has notes of dark cherry, vanilla, and a hint of spice, perfect for celebrating.\n\nCustomer: That sounds interesting. What's the price point?\n\nSalesperson: The Reserve Red Blend is $125 per bottle. Given the occasion and the quality of the wine, it's an excellent value. Would you like to try a sample?"
}
```

### 5. Converting Text to Speech for Customer Response
```http
POST /elevenlabs/text-to-speech
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "text": "Congratulations on your anniversary! For a special occasion, I'd recommend our Reserve Red Blend. It's a carefully crafted blend of Cabernet Sauvignon, Merlot, and Petit Verdot, aged in French oak for 18 months.",
  "voiceId": "dF9Efvf1yhy50ez0XcsR"
}
```

### 6. Testing API Health
```http
GET /claude/test-claude
Authorization: Bearer YOUR_API_KEY
```

### 7. Testing ElevenLabs Integration
```http
GET /elevenlabs/health
Authorization: Bearer YOUR_API_KEY
```

## Common Error Scenarios

### 1. Missing Required Fields
```http
POST /claude/analyze
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "messages": [
    {
      "role": "user",
      "content": "What wine would you recommend?"
    }
  ]
}
```

**Response:**
```json
{
  "error": "Missing required fields",
  "message": "scenario is required"
}
```

### 2. Invalid API Key
```http
GET /claude/test
Authorization: Bearer INVALID_KEY
```

**Response:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

### 3. Rate Limit Exceeded
```http
POST /claude/message
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "messages": [
    {
      "role": "user",
      "content": "Tell me about your wines"
    }
  ]
}
```

**Response:**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

## Best Practices

1. **Error Handling**
   - Always check the response status code
   - Implement proper error handling for 400, 401, and 500 responses
   - Use the error messages to guide user actions

2. **Rate Limiting**
   - Implement exponential backoff for retries
   - Cache responses when appropriate
   - Monitor your API usage

3. **Security**
   - Never expose API keys in client-side code
   - Use environment variables for sensitive data
   - Implement proper CORS policies

4. **Performance**
   - Batch requests when possible
   - Use appropriate timeouts
   - Implement proper caching strategies 

## Environment Variables

### Server (.env)
```plaintext
# Server Configuration
PORT=5000
NODE_ENV=development
SERVER_URL=http://localhost:5000

# API Keys
CLAUDE_API_KEY=your_claude_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Voice IDs
ELEVENLABS_ANN_VOICE_ID=voice_id_for_ann
ELEVENLABS_GABRIELLA_VOICE_ID=voice_id_for_gabriella
ELEVENLABS_RUSSELL_VOICE_ID=voice_id_for_russell
ELEVENLABS_MIKE_VOICE_ID=voice_id_for_mike

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

### Client (.env)
```plaintext
# Server Configuration
REACT_APP_SERVER_URL=http://localhost:5000

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# D-ID Configuration
REACT_APP_DID_API_KEY=your_did_api_key

# Firebase Emulator Settings (Development Only)
REACT_APP_USE_FIREBASE_EMULATOR=true
REACT_APP_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
REACT_APP_FIREBASE_FIRESTORE_EMULATOR_HOST=localhost:8080
```

## Features

### Chat Interface
- Real-time conversation simulation
- Thinking indicator with animated dots while waiting for response
- Audio playback of responses
- Mute/unmute functionality
- Speech-to-text input
- Mobile-responsive design

### Audio Features
- Text-to-speech conversion using ElevenLabs
- Automatic audio playback
- Manual playback option for mobile devices
- Mute/unmute controls
- Audio queue management

### Scenario Management
- Dynamic scenario loading
- Customer profile customization
- Winery information configuration
- Voice selection for different characters

## Error Handling
- Automatic retry for failed API calls
- Error messages displayed in the UI
- Offline support with local storage
- Connection status monitoring

## Development
To run the application locally:

1. Start the server:
```bash
cd server
npm install
npm run vercel-dev
```

2. Start the client:
```bash
cd client
npm install
npm start
```

## Deployment
The application is configured for deployment on Vercel. The `vercel.json` file handles routing and build configuration.

## Security
- API keys are stored in environment variables
- Firebase authentication for user management
- CORS configuration for API endpoints
- Rate limiting on API endpoints

## Monitoring
- Console logging for debugging
- Error tracking
- Performance monitoring
- Usage analytics 