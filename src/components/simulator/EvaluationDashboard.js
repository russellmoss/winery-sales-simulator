import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './EvaluationDashboard.css';

const EvaluationDashboard = ({ evaluation, conversationMarkdown, onClose }) => {
  const [exportingPdf, setExportingPdf] = useState(false);

  if (!evaluation) {
    return (
      <div className="evaluation-dashboard">
        <div className="dashboard-header">
          <h2>Evaluation Results</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="dashboard-content">
          <p>No evaluation data available.</p>
        </div>
      </div>
    );
  }

  // Format chart data
  const chartData = evaluation.criteriaScores?.map(item => ({
    name: item.name,
    score: item.score,
    fill: getScoreColor(item.score)
  })) || [];

  // Export as PDF function
  const exportAsPdf = async () => {
    setExportingPdf(true);
    try {
      const dashboardElement = document.getElementById('evaluation-dashboard');
      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(
        imgData,
        'JPEG',
        0,
        0,
        canvas.width / 2,
        canvas.height / 2
      );
      
      pdf.save(`wine-sales-evaluation-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExportingPdf(false);
    }
  };

  // Export conversation function
  const exportConversation = () => {
    const blob = new Blob([conversationMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wine-tasting-conversation-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper function for score colors
  function getScoreColor(score) {
    if (score >= 4) return '#4ECDC4';
    if (score >= 3) return '#FFD166';
    return '#FF6B6B';
  }

  // Helper function for score text color
  function getScoreTextColor(score) {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  }

  return (
    <div id="evaluation-dashboard" className="evaluation-dashboard">
      <div className="dashboard-header">
        <h2>Sales Performance Evaluation</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="dashboard-content">
        {/* Score Overview */}
        <div className="score-overview">
          <div className="overall-score">
            <h3>Overall Performance</h3>
            <div className={`score-value ${getScoreTextColor(evaluation.finalScore)}`}>
              {evaluation.finalScore?.toFixed(1)}%
            </div>
            <div className="performance-level">{evaluation.performanceLevel}</div>
          </div>
          
          <div className="score-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                <Tooltip 
                  formatter={(value) => [`${value}/5`, 'Score']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e9ecef' }}
                />
                <Bar dataKey="score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths and Improvements */}
        <div className="feedback-grid">
          <div className="feedback-card strengths">
            <h3>Strengths</h3>
            <ul>
              {evaluation.strengths?.map((strength, index) => (
                <li key={index}>
                  <span className="check-icon">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="feedback-card improvements">
            <h3>Areas for Improvement</h3>
            <ul>
              {evaluation.improvements?.map((improvement, index) => (
                <li key={index}>
                  <span className="warning-icon">⚠</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="recommendations">
          <h3>Key Recommendations</h3>
          <ol>
            {evaluation.recommendations?.map((recommendation, index) => (
              <li key={index}>
                <div className="recommendation-number">{index + 1}</div>
                <div className="recommendation-text">{recommendation}</div>
              </li>
            ))}
          </ol>
        </div>

        {/* Detailed Notes */}
        <div className="detailed-notes">
          <h3>Detailed Evaluation Notes</h3>
          <div className="notes-content">
            {evaluation.criteriaScores?.map((criterion) => (
              <div key={criterion.name} className="criterion-note">
                <div className="criterion-header">
                  <h4>{criterion.name}</h4>
                  <div className={`criterion-score score-${criterion.score}`}>
                    Score: {criterion.score}/5
                  </div>
                </div>
                <p>{evaluation.detailedNotes[criterion.name] || 'No detailed notes available.'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="export-buttons">
          <button 
            className="export-button pdf"
            onClick={exportAsPdf}
            disabled={exportingPdf}
          >
            {exportingPdf ? 'Exporting...' : 'Export as PDF'}
          </button>
          <button 
            className="export-button conversation"
            onClick={exportConversation}
          >
            Export Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationDashboard; 