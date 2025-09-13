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

// Get device-specific instructions for enabling microphone
export const getMicrophoneInstructions = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  const isAndroid = /Android/i.test(userAgent);
  
  if (isIOS) {
    return {
      title: 'Enable Microphone on iOS',
      steps: [
        'Tap "Allow" when prompted for microphone access',
        'If denied previously, go to Settings > Safari > Microphone',
        'Make sure this website is allowed to use your microphone'
      ]
    };
  } else if (isAndroid) {
    return {
      title: 'Enable Microphone on Android',
      steps: [
        'Tap "Allow" when prompted for microphone access',
        'If denied previously, check your browser settings',
        'You may need to refresh the page after enabling microphone access'
      ]
    };
  } else {
    return {
      title: 'Enable Microphone',
      steps: [
        'Click "Allow" when prompted for microphone access',
        'If denied previously, check your browser settings',
        'Refresh the page after enabling microphone access'
      ]
    };
  }
}; 