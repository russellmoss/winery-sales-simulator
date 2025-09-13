# Winery Sales Simulator

A web application for training wine tasting room staff in sales and customer interaction skills using AI-powered scenarios.

## Features

- Interactive wine tasting room sales scenarios
- AI-powered customer interactions using Claude API
- Real-time feedback and evaluation
- Progress tracking and statistics
- User authentication and profile management
- Voice synthesis using ElevenLabs API

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (LTS version recommended)
- Git
- A code editor (VS Code recommended)
- npm (comes with Node.js)

## Tech Stack

- Frontend: React.js
- Backend: Node.js/Express
- Database: Firebase Firestore
- Authentication: Firebase Auth
- AI Integration: Claude API
- Voice Synthesis: ElevenLabs API

## Project Structure

```
winery-sales-simulator/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # React components
│       ├── contexts/      # React contexts
│       ├── firebase/      # Firebase configuration
│       ├── services/      # API services
│       └── data/          # Static data
└── server/                # Node.js backend
    ├── routes/            # API routes
    ├── controllers/       # Route controllers
    ├── services/          # Business logic
    └── config/            # Configuration files
```

## Setup Instructions

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/winery-sales-simulator.git
cd winery-sales-simulator
```

2. **Environment Setup**

Create a `.env` file in the root directory with the following configuration:

```env
# Server Configuration
PORT=5000

# Claude API Configuration
CLAUDE_API_KEY=your_claude_api_key

# ElevenLabs API Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_ANN_VOICE_ID=your_ann_voice_id
ELEVENLABS_GABRIELLA_VOICE_ID=your_gabriella_voice_id
ELEVENLABS_RUSSELL_VOICE_ID=your_russell_voice_id
ELEVENLABS_MIKE_VOICE_ID=your_mike_voice_id

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id

FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id

NODE_ENV=production
```

3. **Install Dependencies**

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

4. **Running the Application**

You'll need two terminal windows:

Terminal 1 (Server):
```bash
cd server
npm run dev
```

Terminal 2 (Client):
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Keys and Services

You'll need to obtain the following API keys:

1. **Claude API**
   - Visit [Anthropic's website](https://www.anthropic.com/) to get your API key
   - Replace `your_claude_api_key` in the .env file

2. **ElevenLabs API**
   - Visit [ElevenLabs](https://elevenlabs.io/) to get your API key
   - Replace `your_elevenlabs_api_key` and voice IDs in the .env file

3. **Firebase**
   - Create a project in [Firebase Console](https://console.firebase.google.com/)
   - Get your configuration details from Project Settings
   - Replace all Firebase-related values in the .env file

## Troubleshooting

If you encounter any issues:

1. **Dependency Problems**
```bash
# In both server and client directories
rm -rf node_modules
rm package-lock.json
npm install
```

2. **FontAwesome Issues**
If you see errors related to FontAwesome like:
```
Module not found: Error: Can't resolve '@fortawesome/fontawesome-svg-core'
```
Run these commands in the client directory:
```bash
npm install @fortawesome/fontawesome-svg-core
# Or to ensure all FontAwesome packages are properly installed:
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome
```

3. **Environment Variables**
- Ensure all required environment variables are set in the .env file
- Check that the values are correct and properly formatted
- Make sure there are no spaces around the = sign in the .env file

4. **Port Conflicts**
- If port 5000 is in use, you can change the PORT in the .env file
- If port 3000 is in use, React will automatically suggest using a different port

5. **API Connection Issues**
- Verify your API keys are correct
- Check your internet connection
- Ensure the services (Claude, ElevenLabs, Firebase) are operational

## Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and don't share them
- Use different API keys for development and production
- Regularly rotate your API keys
- Follow the principle of least privilege when setting up service accounts

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
