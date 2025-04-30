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
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'Accept', 'x-requested-with'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Add preflight request handling
app.options('*', cors());

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Add CSP headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com https://*.elevenlabs.io https://api.anthropic.com; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
    "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
    "img-src 'self' data: https:;"
  );
  next();
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`[VercelDev] ${req.method} ${req.path}`);
  console.log('[VercelDev] Headers:', req.headers);
  console.log('[VercelDev] Body:', req.body);
  next();
});

// Add detailed request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log('[Server] Incoming request:', {
    method: req.method,
    path: req.path,
    headers: {
      'x-user-id': req.headers['x-user-id'],
      'content-type': req.headers['content-type'],
      'accept': req.headers['accept'],
      'origin': req.headers['origin'],
      'access-control-request-method': req.headers['access-control-request-method'],
      'access-control-request-headers': req.headers['access-control-request-headers']
    },
    timestamp: new Date().toISOString()
  });

  // Log response details
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log('[Server] Request completed:', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      headers: {
        'access-control-allow-origin': res.getHeader('access-control-allow-origin'),
        'access-control-allow-credentials': res.getHeader('access-control-allow-credentials'),
        'access-control-allow-methods': res.getHeader('access-control-allow-methods'),
        'access-control-allow-headers': res.getHeader('access-control-allow-headers')
      },
      timestamp: new Date().toISOString()
    });
  });

  next();
});

// Add error logging middleware
app.use((err, req, res, next) => {
  console.error('[Server] Error occurred:', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
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