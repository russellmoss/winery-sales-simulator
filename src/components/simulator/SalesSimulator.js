import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SimulatorHome from './SimulatorHome';
import SimulatorBrief from './SimulatorBrief';
import SimulatorChat from './SimulatorChat';
import RubricEvaluation from './RubricEvaluation';
import ChatExport from './ChatExport';
import { SimulatorProvider } from '../../contexts/SimulatorContext';

// Route wrapper component to log route rendering
const RouteWithLogging = ({ path, element }) => {
  console.log(`Route matched: ${path}`);
  return element;
};

function SalesSimulator() {
  console.log('SalesSimulator component rendering');
  const location = useLocation();
  
  useEffect(() => {
    console.log('SalesSimulator location changed:', location.pathname);
  }, [location]);
  
  return (
    <div className="simulator-container">
      <Routes>
        <Route 
          path="/" 
          element={
            <RouteWithLogging 
              path="/" 
              element={<SimulatorHome />} 
            />
          } 
        />
        <Route 
          path="/:scenarioId/brief" 
          element={
            <SimulatorProvider>
              <RouteWithLogging 
                path="/:scenarioId/brief" 
                element={<SimulatorBrief />} 
              />
            </SimulatorProvider>
          } 
        />
        <Route 
          path="/:scenarioId/chat" 
          element={
            <SimulatorProvider>
              <RouteWithLogging 
                path="/:scenarioId/chat" 
                element={<SimulatorChat />} 
              />
            </SimulatorProvider>
          } 
        />
        <Route 
          path="/:scenarioId/export" 
          element={
            <SimulatorProvider>
              <RouteWithLogging 
                path="/:scenarioId/export" 
                element={<ChatExport />} 
              />
            </SimulatorProvider>
          } 
        />
        <Route 
          path="/:scenarioId/evaluation" 
          element={
            <SimulatorProvider>
              <RouteWithLogging 
                path="/:scenarioId/evaluation" 
                element={<RubricEvaluation />} 
              />
            </SimulatorProvider>
          } 
        />
        <Route 
          path="*" 
          element={
            <RouteWithLogging 
              path="*" 
              element={
                <div>
                  <p>Redirecting to simulator home...</p>
                  <Navigate to="/" replace />
                </div>
              } 
            />
          } 
        />
      </Routes>
    </div>
  );
}

export default SalesSimulator; 