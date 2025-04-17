import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Evaluator() {
  const [copied, setCopied] = useState(false);

  const evaluationPrompt = `I need you to evaluate the wine tasting conversation in the attached file against the criteria in "wines_sales_rubric.md" that's in your knowledge base. Format your evaluation in the same JSON structure as shown in "evaluation_example.json" also in your knowledge base. Please follow these instructions:

1. Carefully analyze the conversation for evidence of each of the 10 weighted criteria in the rubric
2. Score each criterion on a scale of 1-5 based on the detailed descriptions in the rubric
3. Calculate the weighted score for each criterion (criterion score × weight)
4. Calculate the overall percentage score (sum of weighted scores ÷ 500 × 100)
5. Determine the performance level based on the score ranges in the rubric
6. Include 3 specific strengths demonstrated in the conversation
7. Include 3 specific areas for improvement
8. Provide 3 actionable recommendations
9. Write detailed notes for each criterion explaining the score

Output your evaluation in exactly the same JSON format as in "evaluation_example.json", with the same field names and structure, including:
* staffName (extracted from the conversation)
* date (from the conversation)
* overallScore (as a number)
* performanceLevel
* criteriaScores (array with criterion, weight, score, weightedScore, and notes for each criterion)
* strengths (array of 3 strings)
* areasForImprovement (array of 3 strings)
* keyRecommendations (array of 3 strings)

Your evaluation should be thorough, fair, and actionable while maintaining the exact JSON structure required.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(evaluationPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="evaluator-container">
      <h1>Evaluator Instructions</h1>
      
      <div className="enhanced-evaluator-section">
        <p className="enhanced-title">Use the Enhanced Evaluator</p>
        <a 
          href="https://enhanced-evaluator.onrender.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="enhanced-button"
        >
          Enhanced Evaluator
        </a>
        <p className="fallback-text">If you have issues with the Enhanced Evaluator, follow the instructions below</p>
      </div>

      <div className="instruction-section">
        <p>Take the conversation markdown and go to the Claude evaluation project:</p>
        <a 
          href="https://claude.ai/project/01961152-cb48-7032-866d-1ad46bfa1497" 
          target="_blank" 
          rel="noopener noreferrer"
          className="evaluation-button"
        >
          Evaluation Project
        </a>
      </div>

      <div className="steps-section">
        <p>1. Attach the conversation markdown to a message in the Claude project</p>
        <p>2. Copy and paste this prompt into claude and run it:</p>
      </div>

      <div className="prompt-section">
        <div className="prompt-header">
          <button 
            onClick={handleCopy} 
            className="copy-button"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="prompt-content">
          {evaluationPrompt}
        </pre>
      </div>

      <div className="report-section">
        <p>Copy and paste the JSON that Claude creates into notepad and name it employeeName.json. Save it and then upload that to the report builder:</p>
        <a 
          href="https://sales-evaluator.netlify.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="report-button"
        >
          Report Builder
        </a>
      </div>

      <style jsx>{`
        .evaluator-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .enhanced-evaluator-section {
          margin: 2rem 0;
          padding: 1.5rem;
          background-color: #f0f7ff;
          border-radius: 8px;
          border: 1px solid #cce5ff;
        }

        .enhanced-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #004085;
          margin-bottom: 1rem;
        }

        .enhanced-button {
          display: inline-block;
          background-color: #6610f2;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          text-decoration: none;
          margin: 1rem 0;
          transition: background-color 0.2s;
          font-weight: 500;
        }

        .enhanced-button:hover {
          background-color: #520dc2;
        }

        .fallback-text {
          color: #856404;
          background-color: #fff3cd;
          padding: 0.75rem;
          border-radius: 4px;
          margin-top: 1rem;
        }

        .instruction-section {
          margin: 2rem 0;
        }

        .evaluation-button {
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          text-decoration: none;
          margin: 1rem 0;
          transition: background-color 0.2s;
        }

        .evaluation-button:hover {
          background-color: #0056b3;
        }

        .steps-section {
          margin: 2rem 0;
        }

        .prompt-section {
          position: relative;
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .prompt-header {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1rem;
        }

        .copy-button {
          background-color: #6c757d;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .copy-button:hover {
          background-color: #5a6268;
        }

        .prompt-content {
          white-space: pre-wrap;
          font-family: monospace;
          margin: 0;
          padding: 1rem;
          background-color: #fff;
          border-radius: 4px;
          border: 1px solid #dee2e6;
        }

        .report-section {
          margin: 2rem 0;
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 8px;
        }

        .report-button {
          display: inline-block;
          background-color: #28a745;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          text-decoration: none;
          margin: 1rem 0;
          transition: background-color 0.2s;
        }

        .report-button:hover {
          background-color: #218838;
        }
      `}</style>
    </div>
  );
}

export default Evaluator; 