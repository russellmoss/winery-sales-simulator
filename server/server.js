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
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    /\.onrender\.com$/ // Allow all Render subdomains
  ],
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

// Custom CORS middleware
const corsMiddleware = (req, res, next) => {
  // Set CORS headers for all responses
  res.header('Access-Control-Allow-Origin', corsOptions.origin.includes(req.headers.origin) ? req.headers.origin : corsOptions.origin[0]);
  res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
  res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  res.header('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', corsOptions.maxAge);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight request:', {
      origin: req.headers.origin,
      method: req.headers['access-control-request-method'],
      headers: req.headers['access-control-request-headers']
    });
    return res.status(200).end();
  }

  next();
};

// Apply middleware in correct order
app.use(helmet()); // Security headers first
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(corsMiddleware); // CORS handling
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

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`API URL: ${process.env.API_URL}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
}); 