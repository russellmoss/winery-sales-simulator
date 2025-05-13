import React from 'react';

const Evaluator = () => {
  return (
    <div className="evaluator">
      <h1>Evaluation Dashboard</h1>
      <p>Review and evaluate simulation sessions.</p>
      
      <style jsx>{`
        .evaluator {
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

export default Evaluator; 