import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimulator } from '../../contexts/SimulatorContext';
import { getScenarioById } from '../../data/winerySalesSimulatorScenarios';
import { evaluationService } from '../../services/evaluationService';
import { exportService } from '../../services/exportService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaSpinner } from 'react-icons/fa';
import { FaDownload, FaArrowLeft } from 'react-icons/fa';
import './RubricEvaluation.css';

/**
 * RubricEvaluation Component
 * 
 * This component displays and allows interaction with the evaluation rubric
 * for a specific sales scenario.
 */
const RubricEvaluation = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const { currentScenario, loading: contextLoading, error: contextError } = useSimulator();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [rubric, setRubric] = useState(null);

  console.log('RubricEvaluation render:', {
    scenarioId,
    currentScenario,
    contextLoading,
    contextError,
    loading,
    error,
    evaluation,
    rubric
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Starting to load evaluation data...');
        setLoading(true);
        setError(null);

        // Load rubric
        console.log('Loading rubric...');
        const rubricData = await evaluationService.loadRubric();
        console.log('Rubric loaded:', rubricData.substring(0, 100) + '...');
        setRubric(rubricData);

        // Load scenario if not already loaded
        if (!currentScenario && scenarioId) {
          console.log('Loading scenario with ID:', scenarioId);
          const scenario = getScenarioById(scenarioId);
          console.log('Scenario loaded:', scenario);
          if (!scenario) {
            throw new Error('Scenario not found');
          }
        }

        // Load evaluation if available
        if (currentScenario?.evaluation) {
          console.log('Setting evaluation data:', currentScenario.evaluation);
          setEvaluation(currentScenario.evaluation);
        } else {
          console.log('No evaluation data available in currentScenario');
        }
      } catch (error) {
        console.error('Error loading evaluation data:', error);
        console.error('Error stack:', error.stack);
        setError(error.message || 'Failed to load evaluation data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [scenarioId, currentScenario]);

  const handleExportPDF = async () => {
    try {
      await exportService.exportEvaluationPDF(evaluation, currentScenario);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError('Failed to export evaluation PDF');
    }
  };

  const handleExportMarkdown = async () => {
    try {
      await exportService.exportConversationMarkdown(currentScenario);
    } catch (error) {
      console.error('Error exporting markdown:', error);
      setError('Failed to export conversation markdown');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading || contextLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error || contextError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-xl mb-4">
          {error || contextError}
        </div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  if (!currentScenario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-xl mb-4">No scenario data available</div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-xl mb-4">No evaluation data available</div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{currentScenario.title || 'Evaluation Results'}</h1>
        <div className="flex gap-4">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <FaDownload /> Export PDF
          </button>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <FaDownload /> Export Markdown
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Overall Performance</h2>
          <div className="mb-4">
            <div className="text-4xl font-bold text-blue-500">
              {evaluation.finalScore.toFixed(1)}%
            </div>
            <div className="text-gray-600">
              Performance Level: {evaluation.performanceLevel}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={evaluation.criteriaScores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Feedback</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Strengths</h3>
              <ul className="list-disc list-inside">
                {evaluation.strengths.map((strength, index) => (
                  <li key={index} className="text-gray-700">{strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Areas for Improvement</h3>
              <ul className="list-disc list-inside">
                {evaluation.improvements.map((improvement, index) => (
                  <li key={index} className="text-gray-700">{improvement}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Recommendations</h3>
              <ul className="list-disc list-inside">
                {evaluation.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-gray-700">{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Detailed Notes</h2>
        <div className="prose max-w-none">
          {evaluation.detailedNotes}
        </div>
      </div>
    </div>
  );
};

export default RubricEvaluation; 