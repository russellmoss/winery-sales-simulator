import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SimulatorProvider } from './contexts/SimulatorContext';
import SimulatorHome from './components/simulator/SimulatorHome';
import SimulatorBrief from './components/simulator/SimulatorBrief';
import SimulatorChat from './components/simulator/SimulatorChat';
import RubricEvaluation from './components/simulator/RubricEvaluation';
import ClaudeTest from './components/test/ClaudeTest';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="container header-content">
            <a href="/" className="logo">Winery Sales Simulator</a>
            <nav className="nav-links">
              <a href="/" className="nav-link">Home</a>
              <a href="/test/claude" className="nav-link">Test Claude</a>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<SimulatorHome />} />
              <Route path="/simulator/:scenarioId/brief" element={
                <SimulatorProvider>
                  <SimulatorBrief />
                </SimulatorProvider>
              } />
              <Route path="/simulator/:scenarioId/chat" element={
                <SimulatorProvider>
                  <SimulatorChat />
                </SimulatorProvider>
              } />
              <Route path="/simulator/:scenarioId/evaluation" element={
                <SimulatorProvider>
                  <RubricEvaluation />
                </SimulatorProvider>
              } />
              <Route path="/test/claude" element={<ClaudeTest />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        <footer className="footer">
          <div className="container footer-content">
            <p>&copy; 2024 Winery Sales Simulator. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App; 