// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar(){
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="app-navbar">
      <div className="container nav-container">
        <Link to="/" className="brand">
          <div className="logo-box">NL</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>NeoLearn</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platinum Edition</span>
          </div>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Explore</Link>
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'right' }} className="hide-mobile">
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.name || 'Anonymous Learner'}</div>
                <div className="small-muted" style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700 }}>{user?.role || 'User'}</div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Log Out</button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
