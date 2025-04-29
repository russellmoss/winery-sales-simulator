# Optimizing Winery Sales Simulator for Mobile

This guide provides step-by-step instructions for optimizing your winery sales simulator for mobile devices, focusing on speech-to-text functionality. The goal is to create a seamless experience on mobile that matches the desktop experience.

## Table of Contents

1. [Analyzing Current Issues](#analyzing-current-issues)
2. [Fixing Speech Recognition on Mobile](#fixing-speech-recognition-on-mobile)
3. [Improving Audio Playback](#improving-audio-playback)
4. [Enhancing User Interface for Mobile](#enhancing-user-interface-for-mobile)
5. [Handling Permissions Gracefully](#handling-permissions-gracefully)
6. [Optimizing Performance](#optimizing-performance)
7. [Testing on Multiple Devices](#testing-on-multiple-devices)

## Analyzing Current Issues

The primary issues with mobile compatibility appear to be:

1. Speech recognition not working on some mobile browsers
2. Audio playback issues on mobile
3. User interface elements not properly sized for mobile screens
4. Permission handling issues
5. Performance issues on lower-powered devices

Let's address each issue systematically.

## Fixing Speech Recognition on Mobile

### Step 1: Create a more robust SpeechToText component

Cursor.ai prompt:
```
Create a robust SpeechToText.js component that works across desktop and mobile browsers, handling all edge cases including iOS Safari, which has limited Web Speech API support. Include fallback mechanisms for browsers without native support.
```

Here's the optimized SpeechToText component code:

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStop } from '@fortawesome/free-solid-svg-icons';

const SpeechToText = ({ onTranscriptComplete, autoStart = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Check for browser support on component mount
  useEffect(() => {
    // Check if SpeechRecognition is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Initialize recognition
    try {
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
  }, []);

  // Handle auto-start prop
  useEffect(() => {
    if (autoStart && isSupported && !isListening) {
      startListening();
    }
  }, [autoStart, isSupported]);

  const startListening = () => {
    setError(null);
    setTranscript('');
    
    try {
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
      if (transcript.trim() && onTranscriptComplete) {
        onTranscriptComplete(transcript);
      }
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
  };

  // For iOS Safari and other problematic browsers
  const fallbackInputHandler = (e) => {
    setTranscript(e.target.value);
  };

  // Render microphone button or fallback input
  return (
    <div className="speech-to-text-container">
      {isSupported ? (
        <div className="speech-controls">
          <button
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopListening : startListening}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            <FontAwesomeIcon icon={isListening ? faStop : faMicrophone} />
          </button>
          {isListening && <span className="listening-indicator">Listening...</span>}
          {transcript && <div className="transcript-preview">{transcript}</div>}
          {error && <div className="error-message">{error}</div>}
        </div>
      ) : (
        <div className="fallback-input">
          <textarea
            placeholder="Speech recognition isn't available. Type your message here instead."
            onChange={fallbackInputHandler}
            value={transcript}
            rows={3}
          />
          {transcript && (
            <button
              className="send-transcript-button"
              onClick={() => onTranscriptComplete(transcript)}
            >
              Use Text
            </button>
          )}
          {error && <div className="error-message">{error}</div>}
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
      `}</style>
    </div>
  );
};

export default SpeechToText;
```

### Step 2: Implement custom voice fallback for iOS

Cursor.ai prompt:
```
Create a fallback solution for iOS Safari that uses manual voice input since iOS has limitations with the Web Speech API. This should integrate with the existing SpeechToText component.
```

Create a new file called `iOSAudioCapture.js`:

```javascript
import React, { useState, useRef } from 'react';

const iOSAudioCapture = ({ onAudioCaptured }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
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
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // We don't set isRecording to false here as it's handled in the onstop event
    }
  };

  return (
    <div className="ios-audio-capture">
      <div className="button-container">
        {!isRecording ? (
          <button 
            className="record-button"
            onClick={startRecording}
          >
            Start Speaking
          </button>
        ) : (
          <button 
            className="stop-button"
            onClick={stopRecording}
          >
            Stop Speaking
          </button>
        )}
      </div>
      
      {hasRecording && (
        <div className="audio-preview">
          <audio ref={audioRef} controls />
          <p className="help-text">Review your recording, then tap "Use Recording" below.</p>
          <button 
            className="use-recording-button"
            onClick={() => {
              if (onAudioCaptured && audioRef.current && audioRef.current.src) {
                onAudioCaptured(audioRef.current.src);
              }
            }}
          >
            Use Recording
          </button>
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
        
        .record-button, .stop-button {
          padding: 10px 20px;
          border-radius: 20px;
          border: none;
          font-weight: bold;
          cursor: pointer;
        }
        
        .record-button {
          background-color: #1a73e8;
          color: white;
        }
        
        .stop-button {
          background-color: #ea4335;
          color: white;
        }
        
        .audio-preview {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 10px;
        }
        
        .audio-preview audio {
          width: 100%;
          max-width: 300px;
        }
        
        .help-text {
          font-size: 13px;
          color: #666;
          margin: 8px 0;
        }
        
        .use-recording-button {
          padding: 8px 16px;
          background-color: #34a853;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 5px;
        }
      `}</style>
    </div>
  );
};

export default iOSAudioCapture;
```

### Step 3: Integrate SpeechToText with SimulatorChat component

Cursor.ai prompt:
```
Update the SimulatorChat.js component to properly integrate the enhanced SpeechToText component with proper mobile detection and fallbacks.
```

Here's the relevant part of SimulatorChat.js to update:

```javascript
import React, { useState, useEffect, useRef } from 'react';
import SpeechToText from './SpeechToText';
import iOSAudioCapture from './iOSAudioCapture';

// ... other imports

const SimulatorChat = () => {
  // ... existing state and refs
  
  const [isIOS, setIsIOS] = useState(false);
  const [showSpeechInput, setShowSpeechInput] = useState(false);
  
  // Detect iOS on component mount
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);
  }, []);

  // ... existing code

  const handleTranscriptComplete = (transcript) => {
    setMessage(transcript);
    setShowSpeechInput(false);
  };

  const handleIOSAudioCaptured = async (audioBlob) => {
    // Here you would send the audio to a server that can convert it to text
    // For simplicity, we'll just ask the user to manually transcribe
    setShowSpeechInput(false);
    
    // In a real implementation, you would send the audio to a speech-to-text service
    // For now, we'll just confirm with the user
    const useAudio = window.confirm("Would you like to send this audio recording?");
    if (useAudio) {
      // In a real app, you'd need to implement an API endpoint to process the audio
      // For now, just show a prompt for the user to enter what they said
      const manualTranscript = prompt("Please enter what you said in the recording:");
      if (manualTranscript) {
        setMessage(manualTranscript);
      }
    }
  };

  const toggleSpeechInput = () => {
    setShowSpeechInput(!showSpeechInput);
  };

  // ... existing code

  return (
    <div className="simulator-chat">
      {/* ... existing JSX */}
      
      <div className="chat-input">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isTyping || evaluationLoading}
        />

        <div className="input-controls">
          <button
            type="button"
            onClick={toggleSpeechInput}
            className="speech-toggle-button"
            aria-label="Toggle speech input"
          >
            <i className="fas fa-microphone"></i>
          </button>
          
          <button
            type="submit"
            onClick={handleSendMessage}
            disabled={isTyping || !message.trim() || evaluationLoading}
            className="send-button"
          >
            Send
          </button>
        </div>
        
        {showSpeechInput && (
          <div className="speech-input-container">
            {isIOS ? (
              <iOSAudioCapture onAudioCaptured={handleIOSAudioCaptured} />
            ) : (
              <SpeechToText 
                onTranscriptComplete={handleTranscriptComplete}
                autoStart={true}
              />
            )}
          </div>
        )}
      </div>
      
      {/* ... rest of the component */}
    </div>
  );
};

export default SimulatorChat;
```

## Improving Audio Playback

### Step 1: Optimize audio playback for mobile browsers

Cursor.ai prompt:
```
Rewrite the audio playback functionality in claudeService.js to handle mobile browser restrictions and ensure audio plays reliably on iOS and Android devices.
```

Update the audio playback code in claudeService.js:

```javascript
// Audio playback variables
let audioQueue = [];
let isPlaying = false;
let audioElement = null;
let isMuted = false;
let audioContext = null;
let userInteracted = false;

// This flag will be set to true once the user interacts with the page
export const setUserInteracted = () => {
  userInteracted = true;
  
  // Initialize audio context after user interaction
  if (!audioContext && window.AudioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.error('Error creating AudioContext:', e);
    }
  }
  
  // Try to resume AudioContext if it exists
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(err => {
      console.error('Error resuming AudioContext:', err);
    });
  }
};

// Function to toggle mute state
export const toggleMute = () => {
  isMuted = !isMuted;
  
  if (audioElement) {
    audioElement.muted = isMuted;
    
    // If unmuting, try to play the audio
    if (!isMuted && audioElement.paused && userInteracted) {
      playAudioElement(audioElement).catch(error => {
        console.error('Error playing audio after unmute:', error);
      });
    }
  }
  
  return isMuted;
};

// Helper function to safely play audio element
const playAudioElement = async (element) => {
  try {
    if (element.paused) {
      // For iOS, we need to play in response to user interaction
      if (!userInteracted) {
        console.warn('Attempted to play audio before user interaction');
        return false;
      }
      
      // Resume audio context if it exists and is suspended
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Play the audio
      await element.play();
      return true;
    }
  } catch (error) {
    console.error('Error playing audio element:', error);
    return false;
  }
  return false;
};

const playNextInQueue = async () => {
  if (audioQueue.length === 0) {
    isPlaying = false;
    return;
  }
  
  try {
    isPlaying = true;
    const audioData = audioQueue.shift();
    
    // Create a new audio element for each playback
    if (audioElement) {
      // Clean up previous audio element
      audioElement.pause();
      audioElement.src = '';
    }
    
    audioElement = new Audio(`data:audio/mpeg;base64,${audioData}`);
    
    // Set initial mute state
    audioElement.muted = isMuted;
    
    // Add event listeners
    audioElement.addEventListener('play', () => {
      console.log('Audio started playing');
    });
    
    audioElement.addEventListener('ended', () => {
      console.log('Audio playback ended');
      playNextInQueue();
    });
    
    audioElement.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      playNextInQueue();
    });
    
    // Pre-load the audio
    audioElement.load();
    
    // Set a reasonable timeout to detect if the audio fails to play
    const playTimeout = setTimeout(() => {
      if (audioElement.paused && !isMuted) {
        console.warn('Audio failed to play automatically, waiting for user interaction');
      }
    }, 2000);
    
    // Try to play immediately if not muted and user has interacted
    if (!isMuted && userInteracted) {
      try {
        const played = await playAudioElement(audioElement);
        if (!played) {
          console.warn('Auto-play failed, will try again on user interaction');
        }
        clearTimeout(playTimeout);
      } catch (error) {
        console.error('Error auto-playing audio:', error);
        clearTimeout(playTimeout);
      }
    } else {
      console.log('Audio queued but waiting for user interaction or unmute');
    }
  } catch (error) {
    console.error('Error in playNextInQueue:', error);
    playNextInQueue();
  }
};

// Function to manually trigger audio playback after user interaction
export const playQueuedAudio = async () => {
  setUserInteracted();
  
  if (audioElement && audioElement.paused && !isMuted) {
    try {
      await playAudioElement(audioElement);
    } catch (error) {
      console.error('Error playing queued audio:', error);
    }
  }
};

// Call this function when the page loads to set up interaction detection
export const initializeAudioPlayback = () => {
  // Add event listeners to detect user interaction
  const interactionEvents = ['click', 'touchstart', 'keydown'];
  
  const handleUserInteraction = () => {
    setUserInteracted();
    
    // Try to play any queued audio
    if (audioElement && audioElement.paused && !isMuted) {
      playAudioElement(audioElement).catch(error => {
        console.error('Error playing audio after user interaction:', error);
      });
    }
    
    // Remove event listeners after first interaction
    interactionEvents.forEach(event => {
      document.removeEventListener(event, handleUserInteraction);
    });
  };
  
  // Add event listeners for user interaction
  interactionEvents.forEach(event => {
    document.addEventListener(event, handleUserInteraction, { once: false });
  });
};
```

### Step 2: Initialize audio playback in the application root

Cursor.ai prompt:
```
Update the App.js file to initialize audio playback when the application loads. This ensures that the audio system is properly set up for both desktop and mobile.
```

Update App.js to initialize audio playback:

```javascript
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeAudioPlayback } from './services/claudeService';
// ... other imports

function App() {
  useEffect(() => {
    // Initialize audio playback system
    initializeAudioPlayback();
  }, []);

  return (
    <Router>
      {/* ... existing router code */}
    </Router>
  );
}

export default App;
```

## Enhancing User Interface for Mobile

### Step 1: Improve the responsive design in SimulatorChat.css

Cursor.ai prompt:
```
Update the SimulatorChat.css file to improve responsive design for mobile devices, ensuring all UI elements are properly sized and positioned on small screens.
```

Update SimulatorChat.css with enhanced mobile styles:

```css
.simulator-chat {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 160px); /* Adjust based on header/footer height */
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #722f37;
  color: white;
  border-radius: 8px 8px 0 0;
}

.chat-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.end-simulation-btn {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.end-simulation-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #f5f5f5;
}

.message {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  position: relative;
  word-wrap: break-word;
}

.message.user {
  align-self: flex-end;
  background-color: #722f37;
  color: white;
}

.message.assistant {
  align-self: flex-start;
  background-color: white;
  color: #1a1a1a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message.system {
  align-self: center;
  background-color: #f3f4f6;
  color: #6b7280;
  font-size: 14px;
  max-width: 90%;
}

.message-content {
  margin-bottom: 4px;
  line-height: 1.5;
}

.message-timestamp {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-align: right;
}

.message.assistant .message-timestamp {
  color: #6b7280;
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
  margin: 16px 24px;
  padding: 12px;
  background-color: #fee2e2;
  color: #991b1b;
  border-radius: 4px;
  font-size: 14px;
}

.chat-input {
  padding: 16px;
  background-color: white;
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
}

.chat-input textarea {
  width: 100%;
  min-height: 60px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  resize: vertical;
  font-size: 16px;
  transition: border-color 0.2s;
}

.chat-input textarea:focus {
  outline: none;
  border-color: #722f37;
}

.chat-input textarea:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.input-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  gap: 10px;
}

.speech-toggle-button {
  padding: 10px;
  background-color: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.speech-toggle-button:hover {
  background-color: #e5e7eb;
}

.speech-toggle-button.active {
  background-color: #722f37;
  color: white;
}

.send-button {
  padding: 10px 20px;
  background-color: #722f37;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
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

.speech-input-container {
  margin-top: 16px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.audio-controls {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.mute-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
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
  padding: 8px 16px;
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

/* Mobile-specific styles */
@media (max-width: 768px) {
  .simulator-chat {
    padding: 10px;
  }
  
  .chat-header {
    padding: 12px 16px;
  }
  
  .chat-header h2 {
    font-size: 18px;
    max-width: 200px;
  }
  
  .end-simulation-btn {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .chat-messages {
    padding: 16px;
  }
  
  .message {
    max-width: 85%;
    padding: 10px 12px;
    font-size: 15px;
  }
  
  .chat-input {
    padding: 12px;
  }
  
  .chat-input textarea {
    min-height: 80px;
    font-size: 16px;
    padding: 10px;
  }
  
  .input-controls {
    flex-wrap: wrap;
  }
  
  .speech-toggle-button {
    width: 48px;
    height: 48px;
  }
  
  .send-button {
    padding: 12px 20px;
    font-size: 16px;
    flex-grow: 1;
  }
  
  .audio-controls {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  
  .mute-button, .play-audio-button {
    width: 100%;
    justify-content: center;
  }
}

/* iOS Safari specific fixes */
@supports (-webkit-touch-callout: none) {
  .chat-input textarea {
    font-size: 16px; /* Prevents auto-zoom on iOS */
  }
  
  .send-button, .speech-toggle-button {
    padding-top: 12px;
    padding-bottom: 12px;
  }
}
```

### Step 2: Add Play Audio button for mobile devices

Cursor.ai prompt:
```
Add a Play Audio button to the SimulatorChat component that appears on mobile devices to allow users to manually trigger audio playback, which addresses the auto-play restrictions on mobile browsers.
```

Add this to the SimulatorChat.js component:

```javascript
import { playQueuedAudio } from '../../services/claudeService';
// ... other imports

const SimulatorChat = () => {
  // ... existing state and refs
  
  const [isMobile, setIsMobile] = useState(false);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);
  
  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
      
      // On mobile, assume we might need manual play
      if (isMobileDevice) {
        setNeedsManualPlay(true);
      }
    };
    
    checkMobile();
  }, []);
  
  const handleManualPlayAudio = () => {
    playQueuedAudio();
    setNeedsManualPlay(false);
  };
  
  // ... existing code
  
  return (
    <div className="simulator-chat">
      {/* ... existing JSX */}
      
      <div className="chat-messages">
        {/* ... existing messages JSX */}
        
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
      
      <div className="audio-controls">
        <button 
          onClick={handleToggleMute}
          className={`mute-button ${isMuted ? 'muted' : 'unmuted'}`}
        >
          <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
      
      {/* ... rest of the component */}
    </div>
  );
};

export default SimulatorChat;
```

## Handling Permissions Gracefully

### Step 1: Create a permissions handler utility

Cursor.ai prompt:
```
Create a permissions handler utility that properly requests and manages microphone permissions on mobile devices, with clear user feedback.
```

Create a new file called `permissionsUtil.js`:

```javascript
/**
 * Utility for handling permissions in the application
 */

// Request microphone permission with better user feedback
export const requestMicrophonePermission = async () => {
  try {
    // Check if navigator.mediaDevices is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        granted: false,
        error: 'Speech recognition is not supported in this browser.'
      };
    }
    
    // Check if permission is already granted
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        
        if (permissionStatus.state === 'granted') {
          return { granted: true };
        } else if (permissionStatus.state === 'denied') {
          return {
            granted: false,
            error: 'Microphone permission has been denied. Please enable it in your browser settings.'
          };
        }
      } catch (e) {
        // Some browsers might not support this API, continue with requesting permission
        console.warn('Permission query not supported:', e);
      }
    }
    
    // Request permission
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // If we get here, permission was granted
    // Release the stream
    stream.getTracks().forEach(track => track.stop());
    
    return { granted: true };
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    
    // Format user-friendly error message based on error type
    let errorMessage = 'Failed to access microphone.';
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage = 'Microphone permission denied. Please enable it in your browser settings.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No microphone detected. Please connect a microphone and try again.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage = 'Your microphone is busy or unavailable. Please close other apps that might be using it.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'Microphone constraints cannot be satisfied.';
    } else if (error.name === 'SecurityError') {
      errorMessage = 'Use of microphone is not allowed in this context due to security restrictions.';
    }
    
    return {
      granted: false,
      error: errorMessage
    };
  }
};

// Check if device has a microphone
export const checkMicrophoneAvailability = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasAudioInput = devices.some(device => device.kind === 'audioinput');
    
    return {
      available: hasAudioInput,
      error: hasAudioInput ? null : 'No microphone detected on this device.'
    };
  } catch (error) {
    console.error('Error checking microphone availability:', error);
    return {
      available: false,
      error: 'Failed to detect microphone. Please ensure the browser has permission to access your devices.'
    };
  }
};

// Check if the browser supports speech recognition
export const checkSpeechRecognitionSupport = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  return {
    supported: !!SpeechRecognition,
    error: SpeechRecognition ? null : 'Speech recognition is not supported in this browser.'
  };
};

// Comprehensive check for speech-to-text capability
export const checkSpeechToTextCapability = async () => {
  // First check browser support
  const browserSupport = checkSpeechRecognitionSupport();
  if (!browserSupport.supported) {
    return browserSupport;
  }
  
  // Then check microphone availability
  const microphoneAvailable = await checkMicrophoneAvailability();
  if (!microphoneAvailable.available) {
    return microphoneAvailable;
  }
  
  // Finally request permission
  return await requestMicrophonePermission();
};
```

### Step 2: Integrate permissions handler into SpeechToText component

Cursor.ai prompt:
```
Update the SpeechToText component to use the permissions handler utility, with clear feedback for users when permissions are denied.
```

Update SpeechToText.js to use the permissions handler:

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStop } from '@fortawesome/free-solid-svg-icons';
import { checkSpeechToTextCapability } from '../../utils/permissionsUtil';

const SpeechToText = ({ onTranscriptComplete, autoStart = false }) => {
  // ... existing state variables
  
  const [permissionStatus, setPermissionStatus] = useState({
    checked: false,
    granted: false,
    error: null
  });
  
  // Check for browser support and permissions on component mount
  useEffect(() => {
    const checkCapability = async () => {
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
    };
    
    checkCapability();
  }, []);
  
  // Initialize speech recognition after permissions are granted
  useEffect(() => {
    if (!permissionStatus.checked || !permissionStatus.granted) {
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
      // ... rest of the initialization code
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setIsSupported(false);
      setError('Failed to initialize speech recognition.');
    }
  }, [permissionStatus]);
  
  // Handle auto-start prop
  useEffect(() => {
    if (autoStart && isSupported && !isListening && permissionStatus.granted) {
      startListening();
    }
  }, [autoStart, isSupported, permissionStatus]);
  
  // ... rest of the component

  // Add permission request button
  const requestPermission = async () => {
    setError(null);
    
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
      } else if (capability.granted) {
        // Auto-start listening if permission is granted
        startListening();
      }
    } catch (err) {
      console.error('Error requesting permission:', err);
      setError('Failed to request permission. Please try again.');
    }
  };
  
  // Render microphone button or fallback input
  return (
    <div className="speech-to-text-container">
      {!permissionStatus.checked ? (
        <div className="permission-request">
          <p>Speech to text requires microphone permission.</p>
          <button 
            className="permission-button"
            onClick={requestPermission}
          >
            Allow Microphone Access
          </button>
        </div>
      ) : isSupported ? (
        <div className="speech-controls">
          <button
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopListening : startListening}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            <FontAwesomeIcon icon={isListening ? faStop : faMicrophone} />
          </button>
          {isListening && <span className="listening-indicator">Listening...</span>}
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
            >
              Use Text
            </button>
          )}
        </div>
      )}
      
      <style jsx>{`
        /* ... existing styles */
        
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
      `}</style>
    </div>
  );
};

export default SpeechToText;
```

## Optimizing Performance

### Step 1: Add loading indicators and lazy loading for mobile

Cursor.ai prompt:
```
Optimize the application performance by implementing loading indicators and lazy loading for components, especially important for slower mobile connections.
```

Update App.js to use React.lazy and Suspense:

```javascript
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeAudioPlayback } from './services/claudeService';
import Header from './components/Header';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
const SimulatorChat = lazy(() => import('./components/simulator/SimulatorChat'));
const SimulatorBrief = lazy(() => import('./components/simulator/SimulatorBrief'));
const Login = lazy(() => import('./pages/Login'));
// ... other lazy-loaded components

function App() {
  useEffect(() => {
    // Initialize audio playback system
    initializeAudioPlayback();
  }, []);

  return (
    <Router>
      <Header />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* ... existing routes */}
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
```

Create a LoadingSpinner component:

```javascript
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
      
      <style jsx>{`
        .loading-spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          padding: 20px;
          width: 100%;
          height: 100%;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(114, 47, 55, 0.2);
          border-radius: 50%;
          border-top-color: #722f37;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
```

### Step 2: Optimize audio processing and playback

Cursor.ai prompt:
```
Optimize the audio processing and playback functions to be more efficient on mobile devices, including reducing the size of audio files and improved buffering.
```

Add these optimizations to claudeService.js:

```javascript
// Audio processing utilities
const processAudioForMobile = (audioBase64) => {
  // For now, we're just passing through the audio data
  // In a real implementation, you could add compression or conversion
  // based on device capabilities
  return audioBase64;
};

// Update the sendMessageToClaude function to process audio
export const sendMessageToClaude = async (scenario, messages) => {
  try {
    // ... existing code
    
    const data = await response.json();
    
    // Check if we have audio data
    if (data.audio) {
      console.log('Audio data received, length:', data.audio.length);
      
      // Process audio for mobile if needed
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const processedAudio = isMobile ? processAudioForMobile(data.audio) : data.audio;
      
      // Add to queue
      audioQueue.push(processedAudio);
      
      // Start playing if not already playing
      if (!isPlaying) {
        playNextInQueue();
      }
    }
    
    // ... rest of the function
  } catch (error) {
    // ... error handling
  }
};
```

## Handling Permissions Gracefully

### Create a unified permissions manager

Cursor.ai prompt:
```
Create a unified permissions manager that handles all permissions required by the app (microphone, audio playback) in a user-friendly way, with clear instructions for mobile users.
```

Create a new file called `PermissionsManager.js`:

```javascript
import React, { useState, useEffect } from 'react';
import { 
  checkMicrophoneAvailability, 
  requestMicrophonePermission 
} from '../utils/permissionsUtil';

const PermissionsManager = ({ onPermissionsGranted }) => {
  const [microphonePermission, setMicrophonePermission] = useState({
    checked: false,
    granted: false,
    error: null
  });
  
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    setIsIOS(isIOSDevice);
    setIsMobile(isMobileDevice);
    
    // Check microphone availability
    const checkMicrophone = async () => {
      const availability = await checkMicrophoneAvailability();
      
      if (availability.available) {
        // If microphone is available, check permission
        const permission = await requestMicrophonePermission();
        setMicrophonePermission({
          checked: true,
          granted: permission.granted,
          error: permission.error
        });
        
        if (permission.granted) {
          // If all permissions are granted, call the callback
          onPermissionsGranted();
        }
      } else {
        setMicrophonePermission({
          checked: true,
          granted: false,
          error: availability.error
        });
      }
    };
    
    checkMicrophone();
  }, [onPermissionsGranted]);
  
  const handleRequestMicrophonePermission = async () => {
    const permission = await requestMicrophonePermission();
    setMicrophonePermission({
      checked: true,
      granted: permission.granted,
      error: permission.error
    });
    
    if (permission.granted) {
      // If permission is granted, call the callback
      onPermissionsGranted();
    }
  };
  
  // If permissions are already granted, don't show anything
  if (microphonePermission.granted) {
    return null;
  }
  
  return (
    <div className="permissions-manager">
      <div className="permissions-card">
        <h3>Microphone Access Needed</h3>
        
        {isIOS && (
          <div className="device-specific-instructions ios">
            <p>On iOS devices:</p>
            <ol>
              <li>Tap "Allow" when prompted for microphone access</li>
              <li>If denied previously, go to Settings &gt; Safari &gt; Microphone</li>
              <li>Make sure this website is allowed to use your microphone</li>
            </ol>
          </div>
        )}
        
        {isMobile && !isIOS && (
          <div className="device-specific-instructions android">
            <p>On Android devices:</p>
            <ol>
              <li>Tap "Allow" when prompted for microphone access</li>
              <li>If denied previously, check your browser settings</li>
              <li>You may need to refresh the page after enabling microphone access</li>
            </ol>
          </div>
        )}
        
        <p className="permission-status">
          {microphonePermission.error || 'Microphone access is required for speech recognition.'}
        </p>
        
        <button 
          className="request-permission-button"
          onClick={handleRequestMicrophonePermission}
        >
          Allow Microphone Access
        </button>
        
        <p className="skip-text">
          You can still use the app by typing your responses instead.
        </p>
      </div>
      
      <style jsx>{`
        .permissions-manager {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .permissions-card {
          background-color: white;
          border-radius: 8px;
          padding: 24px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        h3 {
          font-size: 20px;
          margin-top: 0;
          margin-bottom: 16px;
          color: #333;
        }
        
        .device-specific-instructions {
          background-color: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        
        .device-specific-instructions p {
          font-weight: bold;
          margin-top: 0;
          margin-bottom: 8px;
        }
        
        .device-specific-instructions ol {
          margin-top: 0;
          margin-bottom: 0;
          padding-left: 24px;
        }
        
        .device-specific-instructions li {
          margin-bottom: 4px;
        }
        
        .ios {
          border-left: 4px solid #007aff;
        }
        
        .android {
          border-left: 4px solid #a4c639;
        }
        
        .permission-status {
          color: ${microphonePermission.error ? '#e53e3e' : '#718096'};
          margin-bottom: 16px;
        }
        
        .request-permission-button {
          background-color: #722f37;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          transition: background-color 0.2s;
        }
        
        .request-permission-button:hover {
          background-color: #591f26;
        }
        
        .skip-text {
          text-align: center;
          color: #718096;
          font-size: 14px;
          margin-top: 16px;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default PermissionsManager;
```

## Testing on Multiple Devices

Create a testing checklist for your application:

### Mobile Testing Checklist

1. **Browser Compatibility**
   - Test on Safari (iOS)
   - Test on Chrome (Android)
   - Test on Firefox Mobile
   - Test on Samsung Internet (if available)

2. **Feature Testing**
   - Speech recognition works
   - Audio playback works
   - Manual audio play button appears when needed
   - Text input works as fallback
   - UI elements are properly sized for touch

3. **Performance Testing**
   - App loads within acceptable time
   - Speech processing is responsive
   - Audio playback is smooth
   - No noticeable lag when typing or interacting

4. **Permissions Testing**
   - Permission requests are clear and user-friendly
   - App works in fallback mode when permissions denied
   - Instructions for enabling permissions are clear

5. **Edge Cases**
   - Test with slow network connections
   - Test with microphone disconnected/reconnected
   - Test with audio muted/unmuted
   - Test landscape vs. portrait orientation

By implementing all these improvements, your winery sales simulator will work seamlessly on mobile devices while maintaining desktop functionality. The key improvements are:

1. Enhanced speech recognition with proper mobile support
2. Optimized audio playback that works around mobile browser restrictions
3. Responsive UI design for mobile screens
4. Clear permissions handling with user-friendly instructions
5. Performance optimizations for slower mobile devices
6. Comprehensive testing across different devices and browsers

These changes will ensure your users have a consistent experience regardless of whether they're using the application on desktop or mobile devices.