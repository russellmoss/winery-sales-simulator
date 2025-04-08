import React, { useState, useEffect, useRef } from 'react';

const SpeechToText = ({ onTranscriptComplete, autoStart }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasRecorded, setHasRecorded] = useState(false);
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
      setHasRecorded(true);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
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
      <div className="transcript-display">
        {transcript || 'Your speech will appear here...'}
      </div>
      <div className="controls">
        <button 
          className={`record-button ${isListening ? 'recording' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? 'Stop Recording' : '1. Start Recording'}
        </button>
        <button 
          className="preview-button"
          onClick={handlePreview}
          disabled={!transcript.trim() || !hasRecorded}
        >
          2. Preview Transcription
        </button>
      </div>
      <style jsx>{`
        .speech-to-text-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }
        .transcript-display {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          min-height: 60px;
          background: #f9f9f9;
        }
        .controls {
          display: flex;
          gap: 10px;
        }
        .record-button, .preview-button {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: bold;
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
        .preview-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default SpeechToText; 