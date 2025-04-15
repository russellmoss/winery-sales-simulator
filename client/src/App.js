import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SimulatorProvider } from './contexts/SimulatorContext';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Header from './components/Header';
import Home from './pages/Home';
import SimulatorHome from './components/simulator/SimulatorHome';
import SimulatorBrief from './components/simulator/SimulatorBrief';
import SimulatorChat from './components/simulator/SimulatorChat';
import Evaluator from './components/Evaluator';
import ScenarioManagement from './pages/ScenarioManagement';
import './App.css';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="/simulator" element={
            <PrivateRoute>
              <SimulatorHome />
            </PrivateRoute>
          } />
          <Route path="/scenario/:scenarioId/chat" element={
            <PrivateRoute>
              <SimulatorChat />
            </PrivateRoute>
          } />
          <Route path="/scenario/:scenarioId/brief" element={
            <PrivateRoute>
              <SimulatorBrief />
            </PrivateRoute>
          } />
          <Route path="/evaluator" element={
            <PrivateRoute>
              <Evaluator />
            </PrivateRoute>
          } />
          <Route path="/scenarios/manage" element={
            <PrivateRoute>
              <ScenarioManagement />
            </PrivateRoute>
          } />
          <Route path="*" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SimulatorProvider>
          <AppContent />
        </SimulatorProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 