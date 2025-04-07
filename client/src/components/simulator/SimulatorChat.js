import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSimulator } from '../../contexts/SimulatorContext';
import { sendMessageToClaude } from '../../services/claudeService';
import SpeechToText from './SpeechToText';

function SimulatorChat() {
  const { currentScenario, interactions, addInteraction, loading, error } = useSimulator();
  const { scenarioId } = useParams();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [shouldStartRecording, setShouldStartRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [interactions]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setChatError(null);

    try {
      // Add user message to interactions
      await addInteraction(message, 'user');
      setIsTyping(true);

      // Get response from Claude
      const response = await sendMessageToClaude(
        currentScenario,
        [...interactions, { message: message, role: 'user' }]
      );

      // Add Claude's response to interactions
      await addInteraction(response, 'assistant');

      // Create and play audio if available
      if (response.audio) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(response.audio), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
      }
    } catch (err) {
      setChatError(err.message);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleEndSimulation = () => {
    if (window.confirm('Are you sure you want to end this simulation?')) {
      // Navigate to evaluation page
      window.location.href = `/simulator/${scenarioId}/evaluation`;
    }
  };

  const handleTranscriptComplete = (transcript) => {
    setMessage(transcript);
  };

  const handleAudioEnded = () => {
    setShouldStartRecording(true);
  };

  const exportConversation = () => {
    // Create markdown content
    let markdown = `# Wine Tasting Room Conversation\n\n`;
    markdown += `## Scenario: ${currentScenario.title}\n\n`;
    markdown += `**Description:** ${currentScenario.description}\n\n`;
    markdown += `**Date:** ${new Date().toLocaleString()}\n\n`;
    markdown += `## Conversation\n\n`;

    // Add each interaction to the markdown
    interactions.forEach((interaction, index) => {
      const role = interaction.role === 'user' ? 'Staff Member' : 'Guest';
      markdown += `### ${role} (${index + 1})\n\n`;
      markdown += `${interaction.message}\n\n`;
    });

    // Create and download the file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wine-tasting-conversation-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="loading">Loading chat...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!currentScenario) {
    return <div className="error-message">Scenario not found</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{currentScenario.title}</h2>
        <div className="header-buttons">
          <button onClick={exportConversation} className="btn btn-primary">
            Export Conversation
          </button>
          <button onClick={handleEndSimulation} className="btn btn-secondary">
            End Simulation
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {interactions.map((interaction, index) => (
          <div
            key={index}
            className={`message message-${interaction.role}`}
          >
            {interaction.message}
          </div>
        ))}
        {isTyping && (
          <div className="message message-assistant typing">
            Claude is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {chatError && (
        <div className="error-message">{chatError}</div>
      )}

      <div className="chat-input-container">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <SpeechToText 
          onTranscriptComplete={handleTranscriptComplete}
          autoStart={shouldStartRecording}
        />
        <div className="button-container">
          <button 
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      <audio 
        ref={audioRef}
        onEnded={handleAudioEnded}
        style={{ display: 'none' }}
      />

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .header-buttons {
          display: flex;
          gap: 10px;
        }
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          border: none;
        }
        .btn-primary {
          background-color: #28a745;
          color: white;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .message {
          margin-bottom: 15px;
          padding: 10px 15px;
          border-radius: 8px;
          max-width: 80%;
        }
        .message.user {
          background: #007bff;
          color: white;
          margin-left: auto;
        }
        .message.assistant {
          background: white;
          color: #333;
          margin-right: auto;
        }
        .chat-input-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        textarea {
          width: 100%;
          min-height: 60px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
          font-family: inherit;
        }
        .button-container {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }
        .send-button {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .typing-indicator {
          padding: 10px;
          background: #e9ecef;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        .error-message {
          color: #dc3545;
          padding: 10px;
          background: #f8d7da;
          border-radius: 4px;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}

export default SimulatorChat; 