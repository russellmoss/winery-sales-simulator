require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Validate required environment variables
const requiredEnvVars = [
  'CLAUDE_API_KEY',
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  process.exit(1);
}

// Initialize express app
const app = express();

// Apply middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[VercelDev] ${req.method} ${req.path}`);
  console.log('[VercelDev] Headers:', req.headers);
  console.log('[VercelDev] Body:', req.body);
  next();
});

// Import routes
const claudeRoutes = require('../routes/claudeRoutes');
const elevenlabsRoutes = require('../routes/elevenlabsRoutes');

// Use routes
app.use('/api/claude', claudeRoutes);
app.use('/api/elevenlabs', elevenlabsRoutes);

// Serve static files from client/build
app.use(express.static(path.join(__dirname, '../../client/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Vercel-like development server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`Frontend URL: http://localhost:${PORT}`);
  console.log('Environment variables loaded:', {
    NODE_ENV: process.env.NODE_ENV,
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY ? 'exists' : 'missing',
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID
  });
}); 