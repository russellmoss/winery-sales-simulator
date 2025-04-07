import React, { useState } from 'react';
import { useSimulator } from '../../contexts/SimulatorContext';

function RubricEvaluation() {
  const { currentScenario, interactions, saveScenarioEvaluation, loading, error } = useSimulator();
  const [evaluation, setEvaluation] = useState({
    criteria: currentScenario?.evaluationCriteria.map(criterion => ({
      criterion,
      score: 0,
      feedback: ''
    })) || [],
    overallFeedback: '',
    totalScore: 0
  });
  const [submitted, setSubmitted] = useState(false);

  const handleScoreChange = (index, value) => {
    const newCriteria = [...evaluation.criteria];
    newCriteria[index] = {
      ...newCriteria[index],
      score: Math.min(Math.max(0, parseInt(value) || 0), 10)
    };

    const totalScore = newCriteria.reduce((sum, item) => sum + item.score, 0);
    setEvaluation({
      ...evaluation,
      criteria: newCriteria,
      totalScore
    });
  };

  const handleFeedbackChange = (index, value) => {
    const newCriteria = [...evaluation.criteria];
    newCriteria[index] = {
      ...newCriteria[index],
      feedback: value
    };
    setEvaluation({
      ...evaluation,
      criteria: newCriteria
    });
  };

  const handleOverallFeedbackChange = (value) => {
    setEvaluation({
      ...evaluation,
      overallFeedback: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveScenarioEvaluation({
        ...evaluation,
        timestamp: new Date().toISOString(),
        interactions
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error saving evaluation:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading evaluation...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!currentScenario) {
    return <div className="error-message">Scenario not found</div>;
  }

  if (submitted) {
    return (
      <div className="evaluation-container">
        <div className="evaluation-header">
          <h1 className="evaluation-title">Evaluation Submitted</h1>
          <p className="evaluation-subtitle">
            Thank you for completing the simulation. Your evaluation has been saved.
          </p>
        </div>
        <div className="evaluation-summary">
          <h2>Evaluation Summary</h2>
          <p>Total Score: {evaluation.totalScore} / {evaluation.criteria.length * 10}</p>
          <p>Overall Feedback: {evaluation.overallFeedback}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluation-container">
      <div className="evaluation-header">
        <h1 className="evaluation-title">Scenario Evaluation</h1>
        <p className="evaluation-subtitle">
          Please evaluate your performance in this scenario
        </p>
      </div>

      <form onSubmit={handleSubmit} className="evaluation-form">
        <div className="evaluation-criteria">
          {evaluation.criteria.map((item, index) => (
            <div key={index} className="criterion-item">
              <h3 className="criterion-title">{item.criterion}</h3>
              <div className="form-group">
                <label htmlFor={`score-${index}`}>Score (0-10):</label>
                <input
                  type="number"
                  id={`score-${index}`}
                  value={item.score}
                  onChange={(e) => handleScoreChange(index, e.target.value)}
                  className="score-input"
                  min="0"
                  max="10"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor={`feedback-${index}`}>Feedback:</label>
                <textarea
                  id={`feedback-${index}`}
                  value={item.feedback}
                  onChange={(e) => handleFeedbackChange(index, e.target.value)}
                  className="feedback-input"
                  required
                />
              </div>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label htmlFor="overall-feedback">Overall Feedback:</label>
          <textarea
            id="overall-feedback"
            value={evaluation.overallFeedback}
            onChange={(e) => handleOverallFeedbackChange(e.target.value)}
            className="feedback-input"
            required
          />
        </div>

        <div className="evaluation-summary">
          <h2>Total Score: {evaluation.totalScore} / {evaluation.criteria.length * 10}</h2>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit Evaluation
        </button>
      </form>
    </div>
  );
}

export default RubricEvaluation; 