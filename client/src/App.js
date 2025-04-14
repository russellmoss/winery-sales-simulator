import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimulatorHome from './components/simulator/SimulatorHome';
import SimulatorBrief from './components/simulator/SimulatorBrief';
import SimulatorChat from './components/simulator/SimulatorChat';
import { SimulatorProvider } from './contexts/SimulatorContext';
import Evaluator from './components/Evaluator';
import ScenarioManagement from './pages/ScenarioManagement';
import EditScenariosButton from './components/header/EditScenariosButton';
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
              <a href="/evaluator" className="nav-link">Evaluator</a>
              <EditScenariosButton />
            </nav>
          </div>
        </header>

        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<SimulatorHome />} />
              <Route
                path="/:scenarioId/brief"
                element={
                  <SimulatorProvider>
                    <SimulatorBrief />
                  </SimulatorProvider>
                }
              />
              <Route
                path="/:scenarioId/chat"
                element={
                  <SimulatorProvider>
                    <SimulatorChat />
                  </SimulatorProvider>
                }
              />
              <Route path="/evaluator" element={<Evaluator />} />
              <Route path="/scenarios/manage" element={<ScenarioManagement />} />
              <Route path="*" element={<SimulatorHome />} />
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