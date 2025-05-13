import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStop } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import IOSAudioCapture from './IOSAudioCapture';
import { checkSpeechToTextCapability, requestMicrophonePermission } from '../../utils/permissionsUtil';
import LoadingSpinner from '../common/LoadingSpinner';
import { getEndpoint } from '../../config/api';

// Helper function to detect platform and browser
const getPlatformInfo = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  const isChrome = /chrome/i.test(userAgent) && !/edge|edg/i.test(userAgent);
  
  return {
    isMobile,
    isChrome,
    isDesktopChrome: isChrome && !isMobile
  };
};

// Helper function to check if we're on localhost
const isLocalhost = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('.local') ||
         window.location.hostname.includes('.test');
};

// Helper function to detect iOS
const isIOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
};

const SpeechToText = ({ onTranscriptComplete, autoStart = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState({
    checked: false,
    granted: false,
    error: null
  });
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for iOS on component mount
  useEffect(() => {
    setIsIOSDevice(isIOS());
  }, []);

  // Check for browser support and permissions on component mount
  useEffect(() => {
    const checkCapability = async () => {
      setIsInitializing(true);
      try {
        const capability = await checkSpeechToTextCapability();
        setPermissionStatus({
          checked: true,
          granted: capability.granted,
          error: capability.error
        });
        
        setIsSupported(capability.granted);
        if (capability.error) {
          setError(capability.error);
        }
      } catch (err) {
        console.error('Error checking capability:', err);
        setError('Failed to check speech recognition capability.');
      } finally {
        setIsInitializing(false);
      }
    };
    
    checkCapability();
  }, [isIOSDevice]);

  // Initialize speech recognition after permissions are granted
  useEffect(() => {
    if (!permissionStatus.checked || !permissionStatus.granted || isIOSDevice) {
      return;
    }

    // Initialize recognition
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        setError('Speech recognition is not supported in this browser.');
        return;
      }
      
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      // Set up event handlers
      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        
        // Reset timeout to detect speech end
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (isListening && currentTranscript) {
            stopListening();
          }
        }, 2000); // Stop after 2 seconds of silence
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if we're still supposed to be listening
          // This helps with some mobile browsers that stop after a pause
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
            setIsListening(false);
          }
        }
      };
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setIsSupported(false);
      setError('Failed to initialize speech recognition.');
    }

    return () => {
      // Clean up
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [permissionStatus, isIOSDevice]);

  // Handle auto-start prop
  useEffect(() => {
    if (autoStart && isSupported && !isListening && !isIOSDevice && permissionStatus.granted) {
      startListening();
    }
  }, [autoStart, isSupported, isIOSDevice, permissionStatus]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && isListening) {
        e.preventDefault();
        stopListening();
        // Call handlePreview directly to ensure the message is sent
        if (transcript.trim()) {
          handlePreview();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, transcript]);

  useEffect(() => {
    if (isListening) {
      startListening();
    }
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    if (isListening) {
      stopListening();
    }
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);

  useEffect(() => {
    if (handlePreview) {
      stopListening();
    }
    return () => {
      if (handlePreview) {
        stopListening();
      }
    };
  }, [handlePreview, stopListening]);

  const startListening = () => {
    setError(null);
    setTranscript('');
    
    try {
      // Check if recognition is already started
      if (recognitionRef.current && isListening) {
        console.log('Recognition already started');
        return;
      }
      
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start speech recognition. Try reloading the page.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Only call the completion handler if we have a transcript
      if (transcript.trim()) {
        handlePreview();
      }
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
  };

  const handlePreview = async () => {
    if (transcript.trim()) {
      try {
        setIsAnalyzing(true);
        
        const response = await fetch(getEndpoint('cleanup-transcription'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: transcript.trim() }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to clean up transcription');
        }

        const data = await response.json();
        if (onTranscriptComplete) {
          onTranscriptComplete({
            role: 'user',
            content: data.cleanedText,
            message: data.cleanedText
          });
        }
        setTranscript('');
      } catch (error) {
        console.error('Error cleaning up transcription:', error);
        setError(error.message || 'Error cleaning up transcription');
        toast.error(error.message || 'Error cleaning up transcription');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleIOSAudioCaptured = async (audioBlob) => {
    try {
      setIsAnalyzing(true);
      
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
      
      // Clean up the transcription
      const cleanupResponse = await fetch(getEndpoint('cleanup-transcription'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: data.transcript }),
      });

      if (!cleanupResponse.ok) {
        const errorData = await cleanupResponse.json();
        throw new Error(errorData.error || 'Failed to clean up transcription');
      }

      const cleanedData = await cleanupResponse.json();
      if (onTranscriptComplete) {
        onTranscriptComplete(cleanedData.cleanedText);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setError(error.message || 'Error processing audio');
      toast.error(error.message || 'Error processing audio');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRequestPermission = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const permission = await requestMicrophonePermission();
      setPermissionStatus({
        checked: true,
        granted: permission.granted,
        error: permission.error
      });
      
      setIsSupported(permission.granted);
      if (permission.error) {
        setError(permission.error);
      } else if (permission.granted) {
        // Auto-start listening if permission is granted
        startListening();
      }
    } catch (err) {
      console.error('Error requesting permission:', err);
      setError('Failed to request permission. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // For browsers without support
  const fallbackInputHandler = (e) => {
    setTranscript(e.target.value);
  };

  return (
    <div className="speech-to-text-container">
      {isInitializing ? (
        <LoadingSpinner />
      ) : isIOSDevice ? (
        <IOSAudioCapture onAudioCaptured={handleIOSAudioCaptured} />
      ) : !permissionStatus.checked ? (
        <div className="permission-request">
          <p>Speech to text requires microphone permission.</p>
          <button 
            className="permission-button"
            onClick={handleRequestPermission}
            disabled={isLoading}
          >
            {isLoading ? 'Requesting...' : 'Allow Microphone Access'}
          </button>
        </div>
      ) : isSupported ? (
        <div className="speech-controls">
          <button
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopListening : startListening}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <FontAwesomeIcon icon={isListening ? faStop : faMicrophone} />
            )}
          </button>
          {isListening && <span className="listening-indicator">Listening...</span>}
          {isAnalyzing && (
            <div className="processing-container">
              <div className="spinner"></div>
              <span className="analyzing-indicator">Processing...</span>
            </div>
          )}
          {transcript && <div className="transcript-preview">{transcript}</div>}
          {error && <div className="error-message">{error}</div>}
        </div>
      ) : (
        <div className="fallback-input">
          <p className="support-message">
            {error || 'Speech recognition is not available. Please type your message instead.'}
          </p>
          <textarea
            placeholder="Type your message here..."
            onChange={fallbackInputHandler}
            value={transcript}
            rows={3}
          />
          {transcript && (
            <button
              className="send-transcript-button"
              onClick={() => onTranscriptComplete(transcript)}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Use Text'}
            </button>
          )}
        </div>
      )}
      
      <style jsx>{`
        .speech-to-text-container {
          margin-top: 10px;
          width: 100%;
        }
        
        .mic-button {
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
        
        .mic-button.listening {
          background-color: #ff4d4f;
          color: white;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .listening-indicator {
          margin-left: 10px;
          color: #ff4d4f;
          font-size: 14px;
        }
        
        .transcript-preview {
          margin-top: 10px;
          padding: 8px;
          background-color: #f9f9f9;
          border-radius: 4px;
          max-height: 100px;
          overflow-y: auto;
          font-size: 14px;
        }
        
        .error-message {
          color: #ff4d4f;
          margin-top: 5px;
          font-size: 12px;
        }
        
        .fallback-input textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          resize: vertical;
        }
        
        .send-transcript-button {
          margin-top: 8px;
          padding: 5px 10px;
          background-color: #1890ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        @media (max-width: 768px) {
          .speech-controls {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .mic-button {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }
          
          .transcript-preview {
            width: 100%;
          }
        }
        
        .processing-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 10px;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #1890ff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s linear infinite;
        }
        
        .analyzing-indicator {
          color: #1890ff;
          font-size: 14px;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .permission-request {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 8px;
          text-align: center;
        }
        
        .permission-button {
          padding: 10px 16px;
          background-color: #1890ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .support-message {
          color: #6b7280;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .permission-button:disabled,
        .mic-button:disabled,
        .send-transcript-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .loading-spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100px;
          padding: 10px;
        }
      `}</style>
    </div>
  );
};

export default SpeechToText; 