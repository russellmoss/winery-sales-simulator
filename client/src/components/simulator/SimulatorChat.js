import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimulator } from '../../contexts/SimulatorContext';
import { 
  sendMessageToClaude, 
  toggleMute,
  playQueuedAudio 
} from '../../services/claudeService';
import SpeechToText from './SpeechToText';
import IOSAudioCapture from './IOSAudioCapture';
import InteractionTest from './InteractionTest';
import PermissionsManager from '../common/PermissionsManager';
import { conversationToMarkdown, generateEvaluationPrompt } from '../../services/exportService';
import { evaluateConversation, loadRubric } from '../../services/evaluationService';
import EvaluationDashboard from './EvaluationDashboard';
import { getEndpoint } from '../../config/api';

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
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showSpeechInput, setShowSpeechInput] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [evaluationError, setEvaluationError] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [interactions]);

  // Detect iOS and mobile on component mount
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    
    setIsIOS(isIOSDevice);
    setIsMobile(isMobileDevice);
    
    if (isMobileDevice) {
      setNeedsManualPlay(true);
    }
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
      let claudeResponse;
      try {
        claudeResponse = await sendMessageToClaude(
          currentUserMessage,
          currentScenario
        );

        console.log('Received response from Claude:', {
          responseType: typeof claudeResponse,
          responseValue: claudeResponse,
          responseLength: claudeResponse?.length,
          responseKeys: claudeResponse ? Object.keys(claudeResponse) : [],
          firstFewWords: typeof claudeResponse === 'string' ? claudeResponse.split(' ').slice(0, 5).join(' ') + '...' : 'Not a string'
        });
      } catch (claudeError) {
        console.error('Error getting response from Claude:', claudeError);
        
        // If we have audio playing but no text, create a placeholder message
        if (claudeError.message.includes('Could not extract text response')) {
          claudeResponse = "I apologize, but I'm having trouble displaying my response. However, you should be able to hear my answer through the audio.";
        } else {
          throw claudeError;
        }
      }

      // Add Claude's response - ensure we're passing a string message
      try {
        if (!claudeResponse) {
          throw new Error('No response received from Claude');
        }

        let responseMessage;
        if (typeof claudeResponse === 'string') {
          responseMessage = claudeResponse;
        } else if (typeof claudeResponse === 'object') {
          // Try to extract the message from various possible object structures
          responseMessage = claudeResponse.text || claudeResponse.content || claudeResponse.message;
          
          if (!responseMessage && claudeResponse.response) {
            responseMessage = typeof claudeResponse.response === 'string' ? 
              claudeResponse.response : 
              claudeResponse.response.text || claudeResponse.response.content || claudeResponse.response.message;
          }
          
          if (!responseMessage) {
            console.error('Could not find message in response object:', claudeResponse);
            responseMessage = JSON.stringify(claudeResponse);
          }
        } else {
          responseMessage = String(claudeResponse);
        }

        if (!responseMessage) {
          throw new Error('Could not extract message from Claude response');
        }

        console.log('Saving Claude response to Firestore:', {
          messageLength: responseMessage.length,
          firstFewWords: responseMessage.split(' ').slice(0, 5).join(' ') + '...'
        });

        // Only use addInteraction to update the state
        await addInteraction(responseMessage, 'assistant');
        
      } catch (err) {
        console.error('Failed to save Claude response to Firestore:', {
          error: err,
          errorName: err.name,
          errorMessage: err.message,
          errorStack: err.stack,
          response: claudeResponse
        });
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
    // No need to update local state since we're using the global state
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
    // Handle both string and object transcript formats
    const messageText = typeof transcript === 'string' ? transcript : transcript.content || transcript.message;
    setMessage(messageText);
    setShowSpeechInput(false);
  };

  const handleIOSAudioCaptured = async (audioBlob) => {
    try {
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      // Send the audio file to the server for transcription
      const response = await fetch(getEndpoint('transcribe-audio'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const data = await response.json();
      setMessage(data.transcript);
      setShowSpeechInput(false);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setChatError(error.message || 'Error transcribing audio');
    }
  };

  const toggleSpeechInput = () => {
    setShowSpeechInput(!showSpeechInput);
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

  const handleManualPlayAudio = () => {
    playQueuedAudio();
    setNeedsManualPlay(false);
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
      {!permissionsGranted && (
        <PermissionsManager onPermissionsGranted={() => setPermissionsGranted(true)} />
      )}
      
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
        {isMobile && needsManualPlay && (
          <div className="audio-controls">
            <button 
              className="play-audio-button"
              onClick={handleManualPlayAudio}
            >
              <i className="fas fa-play"></i> Play Response Audio
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ErrorDisplay error={chatError} />

      <div className="audio-controls">
        <button 
          onClick={handleToggleMute}
          className="mute-button"
        >
          <i className="fas fa-volume-up"></i>
          Mute
        </button>
      </div>

      <div className="chat-input-container">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isTyping || isLoading}
        />

        <div className="input-controls">
          <button
            type="button"
            onClick={toggleSpeechInput}
            className={`speech-toggle-button ${showSpeechInput ? 'active' : ''}`}
            aria-label="Toggle speech input"
          >
            <i className="fas fa-microphone"></i>
          </button>
          
          <button
            type="submit"
            onClick={handleSendMessage}
            disabled={isTyping || !message.trim() || isLoading}
            className="send-button"
          >
            Send
          </button>
        </div>
        
        {showSpeechInput && (
          <div className="speech-input-container">
            {isIOS ? (
              <IOSAudioCapture onAudioCaptured={handleIOSAudioCaptured} />
            ) : (
              <SpeechToText 
                onTranscriptComplete={handleTranscriptComplete}
                autoStart={true}
              />
            )}
          </div>
        )}
      </div>

      <audio 
        ref={audioRef}
        onEnded={handleAudioEnded}
        style={{ display: 'none' }}
      />

      <style jsx="true">{`
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
          padding: 12px 16px;
          background-color: #722f37;
          color: white;
          border-radius: 8px;
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
          font-size: 14px;
          white-space: nowrap;
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
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .message {
          margin-bottom: 15px;
          padding: 12px 16px;
          border-radius: 8px;
          max-width: 85%;
          word-wrap: break-word;
          position: relative;
        }
        .message.user {
          background: #007bff;
          color: white;
          margin-left: auto;
          align-self: flex-end;
        }
        .message.assistant {
          background: white;
          color: #333;
          margin-right: auto;
          align-self: flex-start;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .message.system {
          background: #f3f4f6;
          color: #6b7280;
          align-self: center;
          max-width: 90%;
          font-size: 14px;
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
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
          font-family: inherit;
          font-size: 16px;
          transition: border-color 0.2s;
        }
        textarea:focus {
          outline: none;
          border-color: #722f37;
        }
        textarea:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }
        .input-controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .send-button {
          padding: 12px 20px;
          border-radius: 4px;
          background-color: #722f37;
          color: white;
          border: none;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
          flex-grow: 1;
          max-width: 100px;
        }
        .send-button:hover:not(:disabled) {
          background-color: #591f26;
        }
        .send-button:disabled {
          background-color: #e5e7eb;
          cursor: not-allowed;
          color: #9ca3af;
        }
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          background-color: #722f37;
          border-radius: 50%;
          animation: typing 1s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .error-message {
          color: #dc3545;
          padding: 12px;
          background: #f8d7da;
          border-radius: 4px;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .audio-controls {
          display: flex;
          justify-content: center;
          margin: 16px 0;
          gap: 10px;
        }
        .mute-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mute-button:hover {
          background-color: #e5e7eb;
        }
        .play-audio-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background-color: #722f37;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .play-audio-button:hover {
          background-color: #591f26;
        }
        .speech-toggle-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background-color: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .speech-toggle-button.active {
          background-color: #722f37;
          color: white;
        }
        .speech-input-container {
          margin-top: 15px;
          padding: 15px;
          background-color: white;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        /* Mobile-specific styles */
        @media (max-width: 768px) {
          .chat-container {
            padding: 10px;
            height: calc(100vh - 20px);
          }
          
          .chat-header {
            padding: 10px 12px;
            margin-bottom: 10px;
          }
          
          .chat-header h2 {
            font-size: 18px;
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .header-buttons {
            flex-direction: column;
            gap: 8px;
          }
          
          .btn {
            padding: 8px 12px;
            font-size: 13px;
            width: 100%;
          }
          
          .chat-messages {
            padding: 12px;
            margin-bottom: 10px;
          }
          
          .message {
            max-width: 90%;
            padding: 10px 12px;
            font-size: 15px;
          }
          
          .chat-input-container {
            padding: 12px;
          }
          
          textarea {
            min-height: 80px;
            font-size: 16px;
            padding: 10px;
          }
          
          .input-controls {
            flex-direction: column;
          }
          
          .speech-toggle-button {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }
          
          .send-button {
            width: 100%;
            padding: 12px;
            max-width: none;
          }
          
          .audio-controls {
            flex-direction: column;
            gap: 10px;
            align-items: center;
          }
          
          .mute-button,
          .play-audio-button {
            width: 100%;
            justify-content: center;
          }
        }

        /* iOS Safari specific fixes */
        @supports (-webkit-touch-callout: none) {
          .chat-input-container textarea {
            font-size: 16px; /* Prevents auto-zoom on iOS */
          }
          
          .send-button,
          .speech-toggle-button {
            padding-top: 12px;
            padding-bottom: 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default SimulatorChat; 