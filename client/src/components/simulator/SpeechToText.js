import React, { useState, useEffect, useRef } from 'react';

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

const SpeechToText = ({ onTranscriptComplete, autoStart }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasRecorded, setHasRecorded] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const platformInfo = useRef(getPlatformInfo());
  const isLocal = useRef(isLocalhost());

  useEffect(() => {
    // Check if we're on HTTPS or localhost
    if (window.location.protocol !== 'https:' && !isLocal.current) {
      setError('Speech recognition requires a secure HTTPS connection. Please use the HTTPS URL provided by ngrok.');
      return;
    }

    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        setIsSupported(true);
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(prev => prev + ' ' + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          
          // Handle errors differently based on platform
          if (platformInfo.current.isDesktopChrome) {
            if (event.error === 'service-not-allowed') {
              setError('Please click the microphone icon to start recording. Chrome requires a user gesture to enable speech recognition.');
            } else {
              setError(`Speech recognition error: ${event.error}. Please try clicking the microphone icon again.`);
            }
          } else {
            if (event.error === 'service-not-allowed') {
              setError('Speech recognition service not allowed. Please ensure you have granted microphone permissions.');
            } else {
              setError(`Speech recognition error: ${event.error}`);
            }
          }
          
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } catch (err) {
        console.error('Error initializing speech recognition:', err);
        setError('Failed to initialize speech recognition. Please try refreshing the page.');
        setIsSupported(false);
      }
    } else {
      setError('Speech recognition is not supported in your browser.');
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Effect to handle autoStart prop
  useEffect(() => {
    if (autoStart && !isListening && recognitionRef.current && !platformInfo.current.isDesktopChrome) {
      setTranscript('');
      startRecording();
    }
  }, [autoStart, isListening]);

  const startRecording = async () => {
    try {
      // Request microphone access first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Unable to access microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setHasRecorded(true);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      stopRecording();
    } else {
      setTranscript('');
      startRecording();
    }
  };

  const handlePreview = () => {
    if (transcript.trim()) {
      onTranscriptComplete(transcript.trim());
      setTranscript('');
      setHasRecorded(false);
    }
  };

  return (
    <div className="speech-to-text-container">
      <div className="button-container">
        <button
          onClick={toggleListening}
          className={`record-button ${isListening ? 'recording' : ''}`}
          disabled={!isSupported}
        >
          {isListening ? '⏹️ Stop Recording' : '🎤 Start Recording'}
        </button>
        {hasRecorded && (
          <button onClick={handlePreview} className="preview-button">
            Preview Transcription
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
          {platformInfo.current.isDesktopChrome && (
            <div className="chrome-help">
              <p>For Chrome on desktop:</p>
              <ol>
                <li>Click the microphone icon to start recording</li>
                <li>Allow microphone access when prompted</li>
                <li>Speak clearly into your microphone</li>
                <li>Click the stop button when finished</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {transcript && (
        <div className="transcript-preview">
          <h4>Current Transcript:</h4>
          <p>{transcript}</p>
        </div>
      )}

      <style jsx>{`
        .speech-to-text-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
        }
        .button-container {
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .record-button, .preview-button {
          padding: 10px 20px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          transition: all 0.2s;
        }
        .record-button {
          background-color: #dc3545;
          color: white;
        }
        .record-button.recording {
          background-color: #28a745;
        }
        .preview-button {
          background-color: #007bff;
          color: white;
        }
        .record-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        .error-message {
          color: #dc3545;
          padding: 10px;
          background: #f8d7da;
          border-radius: 4px;
          margin: 10px 0;
        }
        .chrome-help {
          margin-top: 10px;
          padding: 10px;
          background: #fff;
          border-radius: 4px;
        }
        .chrome-help ol {
          margin: 5px 0;
          padding-left: 20px;
        }
        .chrome-help li {
          margin: 5px 0;
        }
        .transcript-preview {
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
          margin-top: 10px;
        }
        .transcript-preview h4 {
          margin: 0 0 5px 0;
          color: #495057;
        }
        .transcript-preview p {
          margin: 0;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
};

export default SpeechToText; 