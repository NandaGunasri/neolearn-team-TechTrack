// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/welcome');
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-wrapper fade-in">
      {/* Visual Section */}
      <div className="auth-visual">
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="logo-box mb-4" style={{ background: 'white', color: 'var(--primary)', width: '64px', height: '64px', fontSize: '2rem' }}>NL</div>
          <h1 style={{ fontSize: '3rem', color: 'white', marginBottom: '1.5rem', lineHeight: 1.1 }}>Master Every Skill,<br/>Lead the Future.</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '480px', lineHeight: 1.6, marginBottom: '3rem' }}>
            Access the most advanced LMS platform with expert-led curriculum, real-time collaboration, and elite career tracking.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💎</div>
              <span style={{ fontWeight: 600 }}>Platinum Grade Curriculum</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚀</div>
              <span style={{ fontWeight: 600 }}>Accelerated Career Paths</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="mb-5">
            <div className="badge badge-primary mb-3" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>Secure Access</div>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', fontWeight: 800 }}>Welcome Back</h2>
            <p className="small-muted">Enter your NeoLearn credentials to continue.</p>
          </div>

          {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-control"
                placeholder="nanda@example.com"
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control"
                  style={{ paddingRight: '3.5rem' }}
                  placeholder="••••••••"
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block mt-4" style={{ padding: '1rem', borderRadius: '14px', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="text-center mt-5">
            <span className="small-muted">New to NeoLearn? </span>
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Create Platinum Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
