import React from 'react';

const SimulatorHome = () => {
  return (
    <div className="simulator-home">
      <h1>Wine Sales Simulator</h1>
      <p>Welcome to the wine sales simulation training platform.</p>
      
      <style jsx>{`
        .simulator-home {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h1 {
          color: #722f37;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default SimulatorHome; 