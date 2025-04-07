import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/index.css';

// Contexts
import { SimulatorProvider } from './contexts/SimulatorContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import NotFound from './components/NotFound';

// Simulator Components
import SalesSimulator from './components/simulator/SalesSimulator';
import SimulatorHome from './components/simulator/SimulatorHome';
import SimulatorBrief from './components/simulator/SimulatorBrief';
import SimulatorChat from './components/simulator/SimulatorChat';
import ChatExport from './components/simulator/ChatExport';
import RubricEvaluation from './components/simulator/RubricEvaluation';
import ClaudeTest from './components/test/ClaudeTest';

function App() {
  return (
    <Router>
      <SimulatorProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Simulator routes */}
              <Route path="/simulator/*" element={<SalesSimulator />} />
              
              {/* Rubric Evaluation routes */}
              <Route path="/rubrics/:scenarioId" element={<RubricEvaluation />} />
              
              {/* Claude Test route */}
              <Route path="/test/claude" element={<ClaudeTest />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </SimulatorProvider>
    </Router>
  );
}

export default App;
