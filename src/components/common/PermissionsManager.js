import React, { useState, useEffect } from 'react';
import { 
  checkMicrophoneAvailability, 
  requestMicrophonePermission,
  checkSpeechRecognitionSupport
} from '../../utils/permissionsUtil';

const PermissionsManager = ({ onPermissionsGranted }) => {
  const [permissions, setPermissions] = useState({
    microphone: {
      checked: false,
      granted: false,
      error: null
    },
    speechRecognition: {
      checked: false,
      supported: false,
      error: null
    }
  });
  
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  
  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    setIsIOS(isIOSDevice);
    setIsMobile(isMobileDevice);
    
    // Check all permissions
    const checkAllPermissions = async () => {
      setIsLoading(true);
      try {
        // Check microphone availability
        const microphoneAvailable = await checkMicrophoneAvailability();
        
        if (microphoneAvailable.available) {
          // If microphone is available, check permission
          const microphonePermission = await requestMicrophonePermission();
          setPermissions(prev => ({
            ...prev,
            microphone: {
              checked: true,
              granted: microphonePermission.granted,
              error: microphonePermission.error
            }
          }));
        } else {
          setPermissions(prev => ({
            ...prev,
            microphone: {
              checked: true,
              granted: false,
              error: microphoneAvailable.error
            }
          }));
        }
        
        // Check speech recognition support
        const speechSupport = checkSpeechRecognitionSupport();
        setPermissions(prev => ({
          ...prev,
          speechRecognition: {
            checked: true,
            supported: speechSupport.supported,
            error: speechSupport.error
          }
        }));
        
        // If all permissions are granted, call the callback
        if (permissions.microphone.granted && speechSupport.supported) {
          onPermissionsGranted();
        }
      } catch (err) {
        console.error('Error checking permissions:', err);
        setPermissions(prev => ({
          ...prev,
          microphone: {
            ...prev.microphone,
            error: 'Failed to check permissions. Please try again.'
          }
        }));
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAllPermissions();
  }, [onPermissionsGranted]);
  
  const handleRequestMicrophonePermission = async () => {
    setIsLoading(true);
    try {
      const microphonePermission = await requestMicrophonePermission();
      setPermissions(prev => ({
        ...prev,
        microphone: {
          checked: true,
          granted: microphonePermission.granted,
          error: microphonePermission.error
        }
      }));
      
      if (microphonePermission.granted) {
        // If permission is granted, call the callback
        onPermissionsGranted();
      }
    } catch (err) {
      console.error('Error requesting permission:', err);
      setPermissions(prev => ({
        ...prev,
        microphone: {
          ...prev.microphone,
          error: 'Failed to request permission. Please try again.'
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  // If all permissions are granted, don't show anything
  if (permissions.microphone.granted && permissions.speechRecognition.supported) {
    return null;
  }
  
  return (
    <div className="permissions-manager">
      <div className="permissions-card">
        <h3>Permissions Required</h3>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Checking permissions...</p>
          </div>
        ) : (
          <>
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
            
            <div className="permission-status">
              {!permissions.microphone.granted && (
                <div className="permission-item">
                  <h4>Microphone Access</h4>
                  <p className="status-text">
                    {permissions.microphone.error || 'Microphone access is required for speech recognition.'}
                  </p>
                  <button 
                    className="request-permission-button"
                    onClick={handleRequestMicrophonePermission}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Requesting...' : 'Allow Microphone Access'}
                  </button>
                </div>
              )}
              
              {!permissions.speechRecognition.supported && (
                <div className="permission-item">
                  <h4>Speech Recognition</h4>
                  <p className="status-text">
                    {permissions.speechRecognition.error || 'Speech recognition is not supported in this browser.'}
                  </p>
                </div>
              )}
            </div>
            
            <button 
              className="instructions-toggle"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
            </button>
            
            {showInstructions && (
              <div className="detailed-instructions">
                <h4>How to Enable Permissions</h4>
                <div className="browser-instructions">
                  <h5>Chrome (Desktop & Mobile)</h5>
                  <ol>
                    <li>Click the lock/info icon in the address bar</li>
                    <li>Find "Microphone" in the permissions list</li>
                    <li>Select "Allow" from the dropdown</li>
                    <li>Refresh the page</li>
                  </ol>
                </div>
                
                <div className="browser-instructions">
                  <h5>Safari (iOS)</h5>
                  <ol>
                    <li>Go to Settings &gt; Safari</li>
                    <li>Scroll down to "Settings for Websites"</li>
                    <li>Tap "Microphone"</li>
                    <li>Select "Allow" for this website</li>
                    <li>Return to Safari and refresh the page</li>
                  </ol>
                </div>
                
                <div className="browser-instructions">
                  <h5>Firefox (Desktop & Mobile)</h5>
                  <ol>
                    <li>Click the lock/info icon in the address bar</li>
                    <li>Click "Permissions"</li>
                    <li>Find "Use the Microphone"</li>
                    <li>Select "Allow"</li>
                    <li>Refresh the page</li>
                  </ol>
                </div>
              </div>
            )}
            
            <p className="skip-text">
              You can still use the app by typing your responses instead.
            </p>
          </>
        )}
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
          margin-bottom: 16px;
        }
        
        .permission-item {
          margin-bottom: 16px;
        }
        
        .permission-item h4 {
          margin-top: 0;
          margin-bottom: 8px;
          color: #333;
        }
        
        .status-text {
          color: #e53e3e;
          margin-bottom: 8px;
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
        
        .request-permission-button:hover:not(:disabled) {
          background-color: #591f26;
        }
        
        .request-permission-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .instructions-toggle {
          background: none;
          border: none;
          color: #722f37;
          text-decoration: underline;
          cursor: pointer;
          padding: 8px;
          margin-bottom: 16px;
        }
        
        .detailed-instructions {
          background-color: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        
        .detailed-instructions h4 {
          margin-top: 0;
          margin-bottom: 16px;
        }
        
        .browser-instructions {
          margin-bottom: 16px;
        }
        
        .browser-instructions h5 {
          margin-top: 0;
          margin-bottom: 8px;
          color: #333;
        }
        
        .browser-instructions ol {
          margin-top: 0;
          margin-bottom: 0;
          padding-left: 24px;
        }
        
        .skip-text {
          text-align: center;
          color: #718096;
          font-size: 14px;
          margin-top: 16px;
          margin-bottom: 0;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
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

export default PermissionsManager; 