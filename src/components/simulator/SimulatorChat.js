import React, { useState, useRef, useEffect } from 'react';
import { useSimulator } from '../../contexts/SimulatorContext';
import { sendMessageToClaude, analyzeAssistantResponseImpact } from '../../services/claudeService';
import './SimulatorChat.css';

const SimulatorChat = () => {
  const {
    currentScenario,
    messages,
    addMessage,
    analyzeInteraction,
    endSimulation
  } = useSimulator();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleEndSimulation = () => {
    if (window.confirm('Are you sure you want to end this simulation?')) {
      endSimulation();
    }
  };

  if (!currentScenario) {
    return null;
  }

  return (
    <div className="simulator-chat">
      <div className="chat-header">
        <h2>{currentScenario.title}</h2>
        <button
          className="end-simulation-btn"
          onClick={handleEndSimulation}
        >
          End Simulation
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
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={isTyping || !inputMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default SimulatorChat; 