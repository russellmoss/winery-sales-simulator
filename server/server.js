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

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

// Claude API configuration
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-opus-20240229';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Store active conversations and their system messages
const activeConversations = new Map();

// Helper function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make Claude API request with retries
async function makeClaudeRequest(requestBody, retryCount = 0) {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Claude API error:", errorData);
      throw new Error(`Claude API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying Claude API request (${retryCount + 1}/${MAX_RETRIES})...`);
      await delay(RETRY_DELAY);
      return makeClaudeRequest(requestBody, retryCount + 1);
    }
    throw error;
  }
}

// Request timing middleware
app.use((req, res, next) => {
  req._startTime = Date.now();
  next();
});

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('dev'));

// Parse JSON bodies
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://winery-sales-simulator.onrender.com',
    'https://winery-sales-simulator-frontend.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Add CORS debug middleware
app.use((req, res, next) => {
  console.log('=== CORS Debug ===');
  console.log('Request Origin:', req.headers.origin);
  console.log('Request Method:', req.method);
  console.log('Request Headers:', req.headers);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    const origin = req.headers.origin;
    if (corsOptions.origin.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    res.header('Access-Control-Allow-Credentials', corsOptions.credentials.toString());
    res.header('Access-Control-Max-Age', corsOptions.maxAge.toString());
    return res.status(204).end();
  }
  
  // For non-OPTIONS requests, set the appropriate CORS headers
  const origin = req.headers.origin;
  if (corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', corsOptions.credentials.toString());
  }
  
  next();
});

app.use(cors(corsOptions));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Route debugging middleware
app.use((req, res, next) => {
  console.log('\n=== Route Debug ===');
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Request Path:', req.path);
  console.log('Request Base URL:', req.baseUrl);
  console.log('Request Original URL:', req.originalUrl);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  console.log('==================\n');
  next();
});

// Routes
console.log('Mounting routes...');

// Test route to verify server is working
app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Server is working!' });
});

// Health check endpoint with Claude API status
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {
      claude: !!process.env.CLAUDE_API_KEY,
      elevenLabs: !!process.env.ELEVENLABS_API_KEY,
      firebase: !!process.env.FIREBASE_API_KEY
    }
  };

  // If in development, add more detailed health information
  if (process.env.NODE_ENV === 'development') {
    health.details = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    };
  }

  res.json(health);
});

// Import routes
const claudeRoutes = require('./routes/claudeRoutes');
const elevenlabsRoutes = require('./routes/elevenlabsRoutes');

// Use routes
app.use('/api/claude', claudeRoutes);
app.use('/api/elevenlabs', elevenlabsRoutes);

// Serve favicon
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

console.log('Mounting /api/users routes...');
app.use('/api/users', require('./routes/userRoutes'));
console.log('Routes mounted successfully');

// Debug middleware to log all routes
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(`Route: ${r.route.stack[0].method.toUpperCase()} ${r.route.path}`);
  } else if (r.name === 'router') {
    r.handle.stack.forEach(function(h) {
      if (h.route) {
        console.log(`Route: ${h.route.stack[0].method.toUpperCase()} ${r.regexp} ${h.route.path}`);
      }
    });
  }
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
const PORT = process.env.PORT || 5000;
const MAX_PORT_ATTEMPTS = 10;

function startServer(port) {
  server.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
    console.log('Environment variables status:', {
      claude: !!process.env.CLAUDE_API_KEY,
      elevenLabs: !!process.env.ELEVENLABS_API_KEY,
      firebase: !!process.env.FIREBASE_API_KEY
    });
    console.log(`WebSocket server running on ws://localhost:${port}/ws`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      if (port < PORT + MAX_PORT_ATTEMPTS) {
        startServer(port + 1);
      } else {
        console.error(`Could not find an available port after ${MAX_PORT_ATTEMPTS} attempts`);
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

startServer(PORT); 