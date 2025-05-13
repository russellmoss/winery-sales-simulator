import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleOpenEvaluator = () => {
    window.open('https://enhanced-evaluator.onrender.com/', '_blank');
  };

  // Don't show header on login page
  if (!currentUser) return null;

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">Winery Sales Simulator</Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <button onClick={handleOpenEvaluator} className="nav-link">
            Evaluator
          </button>
          
          {/* Admin-only links */}
          {isAdmin() && (
            <>
              <Link to="/scenarios/manage" className="nav-link">Edit Scenarios</Link>
              <Link to="/admin" className="nav-link">Admin Panel</Link>
            </>
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