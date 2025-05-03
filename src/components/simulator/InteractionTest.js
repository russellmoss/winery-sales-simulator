import React, { useState } from 'react';
import { useSimulator } from '../../contexts/SimulatorContext';

const InteractionTest = () => {
  const [message, setMessage] = useState('');
  const [testError, setTestError] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const { addInteraction, interactions, error } = useSimulator();

  const runTests = async () => {
    setTestError(null);
    setTestResult(null);
    
    try {
      console.log('Starting interaction tests...');

      // Test 1: Valid interaction
      console.log('Test 1: Adding valid interaction');
      const validId = await addInteraction('Hello, this is a test message', 'user');
      console.log('Test 1 result - Interaction ID:', validId);
      setTestResult(prev => [...(prev || []), 'Test 1: ✅ Valid interaction saved']);

      // Test 2: Empty message
      console.log('Test 2: Testing empty message');
      try {
        await addInteraction('', 'user');
        setTestResult(prev => [...(prev || []), 'Test 2: ❌ Empty message was accepted']);
      } catch (err) {
        setTestResult(prev => [...(prev || []), 'Test 2: ✅ Empty message rejected']);
      }

      // Test 3: Missing role
      console.log('Test 3: Testing missing role');
      try {
        await addInteraction('Test message', '');
        setTestResult(prev => [...(prev || []), 'Test 3: ❌ Missing role was accepted']);
      } catch (err) {
        setTestResult(prev => [...(prev || []), 'Test 3: ✅ Missing role rejected']);
      }

      // Test 4: Check optimistic update
      console.log('Test 4: Testing optimistic update');
      const testMessage = 'Testing optimistic update';
      addInteraction(testMessage, 'user');
      const hasOptimisticUpdate = interactions.some(i => i.message === testMessage);
      setTestResult(prev => [...(prev || []), 
        `Test 4: ${hasOptimisticUpdate ? '✅' : '❌'} Optimistic update`
      ]);

    } catch (err) {
      console.error('Test error:', err);
      setTestError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Interaction Test Panel</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runTests}
          style={{ padding: '10px', marginRight: '10px' }}
        >
          Run Tests
        </button>
      </div>

      {testError && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Test Error: {testError}
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Simulator Error: {error}
        </div>
      )}

      {testResult && (
        <div style={{ marginTop: '20px' }}>
          <h3>Test Results:</h3>
          <ul>
            {testResult.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Current Interactions:</h3>
        <ul>
          {interactions.map((interaction, index) => (
            <li key={index}>
              [{interaction.role}] {interaction.message}
              {interaction.id && <span style={{ color: 'green' }}> (ID: {interaction.id})</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InteractionTest; 