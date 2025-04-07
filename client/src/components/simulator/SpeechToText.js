import React, { useState, useEffect, useRef } from 'react';

const SpeechToText = ({ onTranscriptComplete, autoStart }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

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
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Effect to handle autoStart prop
  useEffect(() => {
    if (autoStart && !isListening && recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [autoStart, isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = () => {
    if (transcript.trim()) {
      onTranscriptComplete(transcript.trim());
      setTranscript('');
    }
  };

  return (
    <div className="speech-to-text-container">
      <div className="transcript-display">
        {transcript || 'Your speech will appear here...'}
      </div>
      <div className="controls">
        <button 
          className={`record-button ${isListening ? 'recording' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button 
          className="send-button"
          onClick={handleSend}
          disabled={!transcript.trim()}
        >
          Send
        </button>
      </div>
      <style jsx>{`
        .speech-to-text-container {
          margin: 10px 0;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .transcript-display {
          min-height: 60px;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #eee;
          border-radius: 4px;
          background-color: #f9f9f9;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .controls {
          display: flex;
          gap: 10px;
        }
        .record-button, .send-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .record-button {
          background-color: #e74c3c;
          color: white;
        }
        .record-button.recording {
          background-color: #c0392b;
          animation: pulse 1.5s infinite;
        }
        .send-button {
          background-color: #2ecc71;
          color: white;
        }
        .send-button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SpeechToText; 