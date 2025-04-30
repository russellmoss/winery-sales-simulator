require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const http = require('http');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');

// Debug environment variables
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('CLAUDE_API_KEY exists:', !!process.env.CLAUDE_API_KEY);
console.log('Firebase Environment Variables:');
console.log('FIREBASE_API_KEY exists:', !!process.env.FIREBASE_API_KEY);
console.log('FIREBASE_AUTH_DOMAIN exists:', !!process.env.FIREBASE_AUTH_DOMAIN);
console.log('FIREBASE_PROJECT_ID exists:', !!process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_STORAGE_BUCKET exists:', !!process.env.FIREBASE_STORAGE_BUCKET);
console.log('FIREBASE_MESSAGING_SENDER_ID exists:', !!process.env.FIREBASE_MESSAGING_SENDER_ID);
console.log('FIREBASE_APP_ID exists:', !!process.env.FIREBASE_APP_ID);

// Initialize express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      /\.vercel\.app$/,
      /\.onrender\.com$/
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-id',
    'x-request-id',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // Cache preflight results for 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Apply middleware in correct order
app.use(helmet()); // Security headers first
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(rateLimit({ // Rate limiting
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('\n=== Request Debug ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('==================\n');
  next();
});

// Import routes
const claudeRoutes = require('./routes/claudeRoutes');
const elevenlabsRoutes = require('./routes/elevenlabsRoutes');

// Use routes
app.use('/api/claude', claudeRoutes);
app.use('/api/elevenlabs', elevenlabsRoutes);

// Test endpoint to verify API functionality
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to verify CORS functionality
app.get('/api/test-cors', (req, res) => {
  console.log('Test CORS endpoint hit with headers:', req.headers);
  res.json({
    status: 'success',
    message: 'CORS test successful',
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Add test-cors endpoint
app.get('/test-cors', (req, res) => {
  console.log('Test CORS endpoint hit');
  console.log('Headers:', req.headers);
  console.log('Origin:', req.headers.origin);
  
  res.json({
    success: true,
    message: 'CORS test successful',
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Root route handler
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'winery-sales-simulator-backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      claude: '/api/claude/message',
      narrative: '/api/claude/narrative-to-scenario',
      cleanup: '/api/claude/cleanup-transcription'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.originalUrl} was not found`,
    requestId: req.headers['x-request-id']
  });
});

// Start server
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

// WebSocket setup
const wss = new WebSocket.Server({ server, path: '/ws' });

// For Vercel deployment
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing, return all requests to React app
  // This should be the last route to ensure API routes are handled first
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Only start the server if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`API URL: ${process.env.API_URL}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  });
}

// Export the express app for Vercel
module.exports = app; 