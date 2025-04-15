import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Don't show header on login page
  if (!currentUser) return null;

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">Winery Sales Simulator</Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/evaluator" className="nav-link">Evaluator</Link>
          {process.env.NODE_ENV === 'development' && (
            <Link to="/scenarios/manage" className="nav-link">Edit Scenarios</Link>
          )}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header; 