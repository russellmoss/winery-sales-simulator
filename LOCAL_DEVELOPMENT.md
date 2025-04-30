# Local Development Guide

## Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- Git
- A code editor (VS Code recommended)

## Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/russellmoss/winery-sales-simulator.git
cd winery-sales-simulator
```

2. **Set up environment variables**
Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=5000

# Claude API Configuration
CLAUDE_API_KEY=your_claude_api_key

# ElevenLabs API Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_ANN_VOICE_ID=dF9Efvf1yhy50ez0XcsR
ELEVENLABS_GABRIELLA_VOICE_ID=gZxyH7932tdOwvzX8PFQ
ELEVENLABS_RUSSELL_VOICE_ID=2gpEexocpZxzUMhsKtta
ELEVENLABS_MIKE_VOICE_ID=mwkkRsuaW4LoXOJdYHw5

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id

NODE_ENV=development
```

## Starting the Application

1. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

2. **Build the client**
```bash
# From the client directory
npm run build
```

3. **Start the development server**
```bash
# From the server directory
npm run vercel-dev
```

The server will start on `http://localhost:5000` and serve both the API and the React application.

## Testing the Application

1. **Test API endpoints**
```bash
# Test Claude API health
curl http://localhost:5000/api/claude/test-claude

# Test ElevenLabs API health
curl http://localhost:5000/api/elevenlabs/health
```

2. **Test the frontend**
- Open `http://localhost:5000` in your browser
- The React application should load
- Test the following features:
  - User authentication
  - Scenario creation
  - Sales conversations
  - Voice interactions

## Development Workflow

1. **Making changes to the client**
```bash
# From the client directory
npm start
```
This will start the React development server on `http://localhost:3000` with hot reloading.

2. **Making changes to the server**
```bash
# From the server directory
npm run dev
```
This will start the server with nodemon for automatic reloading.

## Debugging

1. **Server logs**
- Check the console output for any errors
- Look for API request/response logs
- Monitor environment variable loading

2. **Client logs**
- Open browser developer tools (F12)
- Check the Console tab for errors
- Monitor Network tab for API requests

3. **Common issues and solutions**

**Issue: API endpoints not responding**
- Check if the server is running
- Verify environment variables are loaded
- Check CORS configuration

**Issue: Frontend not loading**
- Verify client build completed successfully
- Check browser console for errors
- Ensure all dependencies are installed

**Issue: Authentication failing**
- Verify Firebase configuration
- Check network requests in browser dev tools
- Ensure proper environment variables are set

## Testing API Endpoints

1. **Using cURL**
```bash
# Test Claude message endpoint
curl -X POST http://localhost:5000/api/claude/message \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Test narrative-to-scenario endpoint
curl -X POST http://localhost:5000/api/claude/narrative-to-scenario \
  -H "Content-Type: application/json" \
  -d '{"narrative":"A customer looking for a red wine to pair with steak"}'
```

2. **Using PowerShell**
```powershell
# Test Claude message endpoint
$body = '{"messages":[{"role":"user","content":"Hello"}]}'
Invoke-WebRequest -Uri "http://localhost:5000/api/claude/message" -Method POST -Body $body -ContentType "application/json"

# Test narrative-to-scenario endpoint
$body = '{"narrative":"A customer looking for a red wine to pair with steak"}'
Invoke-WebRequest -Uri "http://localhost:5000/api/claude/narrative-to-scenario" -Method POST -Body $body -ContentType "application/json"
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port number | Yes |
| CLAUDE_API_KEY | Anthropic Claude API key | Yes |
| ELEVENLABS_API_KEY | ElevenLabs API key | Yes |
| ELEVENLABS_*_VOICE_ID | Voice IDs for different characters | Yes |
| FIREBASE_* | Firebase configuration | Yes |
| NODE_ENV | Environment (development/production) | Yes |

## Troubleshooting

1. **Server won't start**
- Check if port 5000 is in use
- Verify all required environment variables are set
- Check for syntax errors in server code

2. **Client build fails**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules`
- Reinstall dependencies: `npm install`

3. **API requests failing**
- Check network connectivity
- Verify API keys are valid
- Check CORS configuration

4. **Authentication issues**
- Verify Firebase configuration
- Check browser console for errors
- Clear browser cache and cookies

## Additional Resources

- [API Documentation](API.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Claude API Documentation](https://docs.anthropic.com/claude/reference)
- [ElevenLabs API Documentation](https://docs.elevenlabs.io/api-reference) 