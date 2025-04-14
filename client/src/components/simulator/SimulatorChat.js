import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSimulator } from '../../contexts/SimulatorContext';
import { sendMessageToClaude, toggleMute, getMuteState, setMuteState } from '../../services/claudeService';
import SpeechToText from './SpeechToText';
import InteractionTest from './InteractionTest';

function SimulatorChat() {
  const { 
    currentScenario, 
    interactions, 
    addInteraction, 
    loading, 
    error,
    setInteractions
  } = useSimulator();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [shouldStartRecording, setShouldStartRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
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

    console.log('Starting to send message:', {
      messageLength: message.length,
      scenarioId: currentScenario?.id,
      interactionsCount: interactions.length
    });

    setIsLoading(true);
    setChatError(null);
    
    // Store the current message and clear input immediately for better UX
    const currentUserMessage = message;
    setMessage('');

    try {
      console.log('Adding user message to Firestore...');
      // Add user message and handle any errors
      try {
        await addInteraction(currentUserMessage, 'user');
      } catch (err) {
        console.error('Failed to save user message to Firestore:', err);
        setChatError('Your message was sent but could not be saved to the database. The conversation will continue in-memory only.');
      }
      
      setIsTyping(true);

      console.log('Getting response from Claude...', {
        currentScenario: {
          id: currentScenario?.id,
          title: currentScenario?.title
        },
        interactionsCount: interactions.length
      });

      // Get response from Claude
      const response = await sendMessageToClaude(
        currentScenario,
        [...interactions, { message: currentUserMessage, role: 'user' }]
      );

      console.log('Received response from Claude:', {
        responseLength: response?.length,
        firstFewWords: response?.split(' ').slice(0, 5).join(' ') + '...'
      });

      // Add Claude's response
      try {
        await addInteraction(response, 'assistant');
      } catch (err) {
        console.error('Failed to save Claude response to Firestore:', err);
        setChatError('The response was received but could not be saved to the database. The conversation will continue in-memory only.');
      }

    } catch (err) {
      console.error('Error in handleSendMessage:', {
        error: err,
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack,
        state: {
          isLoading,
          isTyping,
          hasError: !!chatError,
          interactionsCount: interactions.length
        }
      });

      // Show error but don't clear the conversation
      setChatError(`Error: ${err.message}. The conversation will continue but some messages may not be saved.`);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
      console.log('Message sending process completed', {
        finalState: {
          isLoading: false,
          isTyping: false,
          hasError: !!chatError,
          interactionsCount: interactions.length
        }
      });
    }
  };

  // Add a recovery function for retrying failed saves
  const retryFailedInteractions = async (failedInteractions) => {
    console.log('Attempting to recover failed interactions:', failedInteractions);
    
    for (const interaction of failedInteractions) {
      try {
        await addInteraction(interaction.message, interaction.role);
        console.log('Successfully recovered interaction:', interaction);
      } catch (err) {
        console.error('Failed to recover interaction:', err);
      }
    }
  };

  // Add an effect to handle connection status
  useEffect(() => {
    let failedInteractions = [];
    
    const handleOnline = () => {
      console.log('Connection restored. Attempting to recover failed interactions...');
      if (failedInteractions.length > 0) {
        retryFailedInteractions(failedInteractions);
        failedInteractions = [];
      }
    };

    const handleOffline = () => {
      console.log('Connection lost. Interactions will be saved locally until connection is restored.');
      setChatError('You are currently offline. Messages will be saved when connection is restored.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add error display component
  const ErrorDisplay = ({ error }) => {
    if (!error) return null;
    
    return (
      <div className="error-banner" style={{
        padding: '10px',
        marginBottom: '10px',
        backgroundColor: '#fff3cd',
        color: '#856404',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>⚠️ {error}</span>
        <button 
          onClick={() => setChatError(null)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 5px'
          }}
        >
          ✕
        </button>
      </div>
    );
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
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={() => setShowTestPanel(!showTestPanel)} 
              className="btn btn-info"
            >
              {showTestPanel ? 'Hide Test Panel' : 'Show Test Panel'}
            </button>
          )}
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && showTestPanel && (
        <div className="test-panel">
          <InteractionTest />
        </div>
      )}

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

      <ErrorDisplay error={chatError} />

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