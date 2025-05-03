import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStop, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

const IOSAudioCapture = ({ onAudioCaptured }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }
        
        setHasRecording(true);
        setIsRecording(false);
        
        // Pass the audio blob to the parent component
        if (onAudioCaptured) {
          onAudioCaptured(audioBlob);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks in the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleUseRecording = () => {
    if (audioRef.current && audioRef.current.src) {
      onAudioCaptured(audioRef.current.src);
    }
  };

  return (
    <div className="ios-audio-capture">
      <div className="button-container">
        {!isRecording ? (
          <button 
            className={`record-button ${hasRecording ? 'has-recording' : ''}`}
            onClick={startRecording}
            disabled={hasRecording}
          >
            <FontAwesomeIcon icon={faMicrophone} />
            <span>Start Recording</span>
          </button>
        ) : (
          <button 
            className="stop-button"
            onClick={stopRecording}
          >
            <FontAwesomeIcon icon={faStop} />
            <span>Stop Recording</span>
          </button>
        )}
      </div>
      
      {hasRecording && (
        <div className="audio-preview">
          <div className="playback-controls">
            <button 
              className="play-button"
              onClick={togglePlayback}
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <audio 
              ref={audioRef} 
              onEnded={() => setIsPlaying(false)}
              controls
              style={{ display: 'none' }}
            />
          </div>
          
          <p className="help-text">Review your recording, then tap "Use Recording" below.</p>
          
          <button 
            className="use-recording-button"
            onClick={handleUseRecording}
          >
            Use Recording
          </button>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <style jsx>{`
        .ios-audio-capture {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          margin-top: 10px;
        }
        
        .button-container {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }
        
        .record-button, .stop-button, .play-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 20px;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .record-button {
          background-color: #1a73e8;
          color: white;
        }
        
        .record-button.has-recording {
          background-color: #e0e0e0;
          color: #666;
          cursor: not-allowed;
        }
        
        .stop-button {
          background-color: #ea4335;
          color: white;
        }
        
        .play-button {
          background-color: #34a853;
          color: white;
        }
        
        .audio-preview {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 10px;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 8px;
        }
        
        .playback-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .help-text {
          font-size: 13px;
          color: #666;
          margin: 8px 0;
          text-align: center;
        }
        
        .use-recording-button {
          padding: 10px 20px;
          background-color: #722f37;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 5px;
          font-weight: 500;
        }
        
        .error-message {
          color: #ea4335;
          margin-top: 10px;
          font-size: 14px;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .record-button, .stop-button, .play-button {
            padding: 15px 25px;
            font-size: 16px;
          }
          
          .use-recording-button {
            padding: 12px 24px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default IOSAudioCapture; 