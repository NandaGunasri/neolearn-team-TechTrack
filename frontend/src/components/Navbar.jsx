import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar(){
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const logout = () => {
    localStorage.removeItem('user');
    // optionally remove token if you had one: localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="app-navbar">
      <div className="brand">
        <div className="logo">NL</div>
        <div>
          <h1>NeoLearn</h1>
          <div className="small-muted">LMS demo</div>
        </div>
      </div>

      <nav className="nav-links">
        <Link to="/" className="nav-btn btn ">Home</Link>
        {!user && <Link to="/register" className="nav-btn btn ">Register</Link>}
        {!user && <Link to="/login" className="nav-btn btn ">Login</Link>}
        <Link to="/dashboard" className="nav-btn btn">Dashboard</Link>

        {user && (
          <>
            <div style={{minWidth:150, textAlign:'right', color:'#fff', marginLeft:12}}>
              <div style={{fontWeight:700}}>{user.name}</div>
              <div className="small-muted" style={{fontSize:12}}>{user.role}</div>
            </div>
            <button className="nav-btn btn outline" onClick={logout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}
