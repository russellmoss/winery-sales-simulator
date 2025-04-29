# Winery Sales Simulator

A web application for training wine tasting room staff in sales and customer interaction skills using AI-powered scenarios.

## Features

- Interactive wine tasting room sales scenarios
- AI-powered customer interactions using Claude API
- Real-time feedback and evaluation
- Progress tracking and statistics
- User authentication and profile management

## Tech Stack

- Frontend: React.js
- Backend: Node.js/Express
- Database: Firebase Firestore
- Authentication: Firebase Auth
- AI Integration: Claude API

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

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/winery-sales-simulator.git
cd winery-sales-simulator
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
- Create a `.env` file in the client directory with Firebase and Claude API credentials
- Create a `.env` file in the server directory with necessary configurations

4. Start the development servers:
```bash
# Start the backend server
cd server
npm run dev

# Start the frontend development server
cd ../client
npm start
```

## Environment Variables

### Client (.env)
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_CLAUDE_API_KEY=your_claude_api_key
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### Server (.env)
```
PORT=5000
CLAUDE_API_KEY=your_claude_api_key
```

## Environment Setup

1. Copy the example environment file:
```bash
cp client/.env.example client/.env
```

2. Update the `.env` file with your actual credentials:
- Firebase credentials from your Firebase Console
- ElevenLabs API key and voice IDs
- D-ID API key

3. Never commit the `.env` file to version control!

## Security Notes

- Keep your `.env` file secure and never share it
- Rotate API keys if they are ever exposed
- Use different API keys for development and production
- Follow the principle of least privilege when setting up service accounts

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
