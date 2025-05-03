import React from 'react';
import { useLocation } from 'react-router-dom';

function NotFound() {
  const location = useLocation();

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <div style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
        <h3>Debug Information:</h3>
        <p>Current URL: {location.pathname}</p>
        <p>Search params: {location.search}</p>
        <p>Hash: {location.hash}</p>
        <p>User Agent: {navigator.userAgent}</p>
      </div>
      <button 
        onClick={() => window.location.href = '/'}
        style={{ marginTop: '20px', padding: '10px 20px' }}
      >
        Go to Home
      </button>
    </div>
  );
}

export default NotFound; 