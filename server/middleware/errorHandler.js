const { v4: uuidv4 } = require('uuid');

const errorHandler = (err, req, res, next) => {
  // Generate a unique request ID if not present
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  // Calculate request duration
  const startTime = req._startTime || Date.now();
  const duration = Date.now() - startTime;

  // Log detailed error information
  console.error(`[${requestId}] Error details:`, {
    timestamp: new Date().toISOString(),
    duration: `${duration}ms`,
    message: err.message,
    stack: err.stack,
    status: err.status,
    path: req.path,
    method: req.method,
    body: req.body,
    headers: req.headers,
    claudeError: err.claudeError,
    apiError: err.apiError,
    originalError: err.originalError
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.errors,
      requestId
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token',
      requestId
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to access this resource',
      requestId
    });
  }

  // Handle Claude API specific errors
  if (err.claudeError) {
    const status = err.status || 500;
    return res.status(status).json({
      error: 'Claude API Error',
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.claudeError : undefined,
      requestId
    });
  }

  // Handle API errors
  if (err.response) {
    const status = err.response.status || 500;
    return res.status(status).json({
      error: 'API Error',
      message: err.response.data?.message || 'An error occurred while processing your request',
      details: process.env.NODE_ENV === 'development' ? err.response.data : undefined,
      requestId
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    requestId
  });
};

module.exports = { errorHandler }; 