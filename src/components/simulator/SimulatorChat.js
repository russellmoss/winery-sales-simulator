import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulator } from '../../contexts/SimulatorContext';
import { sendMessageToClaude, analyzeAssistantResponseImpact } from '../../services/claudeService';
import { conversationToMarkdown, generateEvaluationPrompt } from '../../services/exportService';
import { evaluateConversation, loadRubric } from '../../services/evaluationService';
import EvaluationDashboard from './EvaluationDashboard';
import './SimulatorChat.css';

const SimulatorChat = () => {
  const navigate = useNavigate();
  const {
    currentScenario,
    messages,
    addMessage,
    analyzeInteraction,
    endSimulation,
    loading: scenarioLoading
  } = useSimulator();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [conversationMd, setConversationMd] = useState('');
  const [rubric, setRubric] = useState('');
  const [rubricLoading, setRubricLoading] = useState(true);
  const [evaluationError, setEvaluationError] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchRubric = async () => {
      try {
        setRubricLoading(true);
        const rubricText = await loadRubric();
        setRubric(rubricText);
      } catch (error) {
        console.error('Error loading rubric:', error);
        setError('Failed to load evaluation rubric');
      } finally {
        setRubricLoading(false);
      }
    };
    
    fetchRubric();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setInputMessage('');
    setError(null);
    addMessage(userMessage);

    try {
      setIsTyping(true);
      const response = await sendMessageToClaude(
        currentScenario,
        [...messages, userMessage]
      );

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      addMessage(assistantMessage);

      // Analyze the interaction
      const impact = analyzeAssistantResponseImpact(response, currentScenario);
      analyzeInteraction({
        successful: impact.salesPotential > 0.7,
        responseTime: 0, // TODO: Implement actual response time calculation
        satisfaction: (impact.relevance + impact.helpfulness + impact.salesPotential) / 3
      });

    } catch (err) {
      setError('Failed to get response from assistant. Please try again.');
      console.error('Error sending message:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEndSimulation = async () => {
    if (!window.confirm('Are you sure you want to end this simulation?')) {
      return;
    }

    console.log('Starting end simulation process');
    console.log('Current scenario:', currentScenario);
    console.log('Messages:', messages);
    setEvaluationLoading(true);
    setEvaluationError(null);

    try {
      // Convert conversation to markdown
      console.log('Converting conversation to markdown');
      const conversationMarkdown = conversationToMarkdown(messages, currentScenario);
      console.log('Conversation markdown length:', conversationMarkdown.length);
      console.log('Conversation markdown preview:', conversationMarkdown.substring(0, 200) + '...');
      setConversationMd(conversationMarkdown);

      // Load rubric
      console.log('Loading rubric');
      const rubric = await loadRubric();
      console.log('Rubric loaded, length:', rubric.length);
      console.log('Rubric preview:', rubric.substring(0, 200) + '...');

      // Generate evaluation prompt
      console.log('Generating evaluation prompt');
      const evaluationPrompt = generateEvaluationPrompt(conversationMarkdown, rubric);
      console.log('Evaluation prompt generated, length:', evaluationPrompt.length);
      console.log('Evaluation prompt preview:', evaluationPrompt.substring(0, 200) + '...');

      // Evaluate conversation
      console.log('Evaluating conversation');
      const evaluationResults = await evaluateConversation(evaluationPrompt);
      console.log('Evaluation completed:', evaluationResults);

      setEvaluationData(evaluationResults);
      setShowEvaluation(true); // Show the evaluation dashboard
      console.log('Evaluation dashboard should now be visible');
    } catch (error) {
      console.error('Error during evaluation:', error);
      console.error('Error stack:', error.stack);
      setEvaluationError(error.message || 'Failed to evaluate conversation');
    } finally {
      setEvaluationLoading(false);
    }
  };

  const handleCloseEvaluation = () => {
    setShowEvaluation(false);
    // Navigate to home after closing evaluation
    navigate('/');
  };

  if (scenarioLoading || rubricLoading) {
    return (
      <div className="simulator-chat loading">
        <div className="loading-spinner"></div>
        <p>Loading simulation...</p>
      </div>
    );
  }

  if (!currentScenario) {
    return (
      <div className="simulator-chat error">
        <h2>Error</h2>
        <p>No scenario data available. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="simulator-chat">
      <div className="chat-header">
        <h2>{currentScenario.title}</h2>
        <button
          className="end-simulation-btn"
          onClick={handleEndSimulation}
          disabled={evaluationLoading}
        >
          {evaluationLoading ? 'Evaluating...' : 'End Simulation'}
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role}`}
          >
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message assistant typing">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isTyping || evaluationLoading}
        />
        <button
          type="submit"
          disabled={isTyping || !inputMessage.trim() || evaluationLoading}
        >
          Send
        </button>
      </form>

      {evaluationLoading && (
        <div className="evaluation-loading">
          <div className="loading-spinner"></div>
          <p>Analyzing your sales conversation...</p>
        </div>
      )}
      
      {showEvaluation && evaluationData && (
        <EvaluationDashboard 
          evaluation={evaluationData}
          conversationMarkdown={conversationMd}
          onClose={handleCloseEvaluation}
        />
      )}
    </div>
  );
};

export default SimulatorChat; 