import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSimulator } from '../contexts/SimulatorContext';
import LoadingSpinner from './common/LoadingSpinner';

function AppContent({ children }) {
  const { loading: authLoading } = useAuth();
  const { loading: simulatorLoading } = useSimulator();

  if (authLoading || simulatorLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}

export default AppContent; 