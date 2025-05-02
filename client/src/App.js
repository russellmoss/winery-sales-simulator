import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SimulatorProvider } from './contexts/SimulatorContext';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import AppContent from './components/AppContent';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFound from './pages/NotFound';
import './App.css';

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
const SimulatorHome = lazy(() => import('./pages/SimulatorHome'));
const SimulatorChat = lazy(() => import('./components/simulator/SimulatorChat'));
const SimulatorBrief = lazy(() => import('./components/simulator/SimulatorBrief'));
const Login = lazy(() => import('./pages/Login'));
const Evaluator = lazy(() => import('./pages/Evaluator'));
const ScenarioManagement = lazy(() => import('./pages/ScenarioManagement'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const AdminSetup = lazy(() => import('./pages/AdminSetup'));

// Add error tracking
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // You can add error reporting service here (e.g., Sentry)
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SimulatorProvider>
          <div className="app">
            <Header />
            <main className="main-content">
              <Suspense fallback={<LoadingSpinner />}>
                <AppContent>
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
                    <Route path="/users" element={
                      <PrivateRoute>
                        <UserManagement />
                      </PrivateRoute>
                    } />
                    <Route path="/admin-setup" element={
                      <PrivateRoute>
                        <AdminSetup />
                      </PrivateRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppContent>
              </Suspense>
            </main>
          </div>
        </SimulatorProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App; 