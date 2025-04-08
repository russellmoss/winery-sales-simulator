import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSimulator } from '../../contexts/SimulatorContext';
import { sendMessageToClaude, toggleMute, getMuteState, setMuteState } from '../../services/claudeService';
import SpeechToText from './SpeechToText';

function SimulatorChat() {
  const { currentScenario, interactions, addInteraction, loading, error } = useSimulator();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [shouldStartRecording, setShouldStartRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [interactions]);

  // Initialize audio state on component mount
  useEffect(() => {
    // Set initial mute state to unmuted
    setMuteState(false);
    setIsMuted(false);
    
    // Set up interval to check for changes
    const interval = setInterval(() => {
      const currentMuteState = getMuteState();
      if (currentMuteState !== isMuted) {
        setIsMuted(currentMuteState);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

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

      // Audio will be handled by the service
    } catch (err) {
      setChatError(err.message);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleToggleMute = () => {
    const newMuteState = toggleMute();
    setIsMuted(newMuteState);
  };

  const handleEndSimulation = () => {
    if (window.confirm('Are you sure you want to end this simulation?')) {
      // Export conversation as markdown
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
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `wine-tasting-conversation-${new Date().toISOString().slice(0, 10)}.md`;
      
      // For mobile devices, we need to append the link to the document
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Navigate to home page after a short delay to ensure download starts
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
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

      <div className="audio-controls">
        <button 
          onClick={handleToggleMute}
          className={`mute-button ${isMuted ? 'muted' : 'unmuted'}`}
        >
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>

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
            {isLoading ? 'Sending...' : '3. Send'}
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
          padding: 8px 16px;
          border-radius: 4px;
          background-color: #28a745;
          color: white;
          border: none;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        }
        .send-button:disabled {
          background-color: #ccc;
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
        .audio-controls {
          display: flex;
          justify-content: center;
          margin-bottom: 15px;
        }
        .mute-button {
          padding: 10px 20px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          border: none;
          transition: all 0.2s;
        }
        .mute-button.muted {
          background-color: #6c757d;
          color: white;
        }
        .mute-button.unmuted {
          background-color: #28a745;
          color: white;
        }
        .mute-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

export default SimulatorChat; 