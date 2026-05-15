// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/welcome');
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper fade-in">
      {/* Visual Section */}
      <div className="auth-visual" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="logo-box mb-4" style={{ background: 'white', color: 'var(--primary)', width: '64px', height: '64px', fontSize: '2rem' }}>NL</div>
          <h1 style={{ fontSize: '3rem', color: 'white', marginBottom: '1.5rem', lineHeight: 1.1 }}>Join the Elite <br/>Learning Community.</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '480px', lineHeight: 1.6, marginBottom: '3rem' }}>
            Build your future with personalized learning paths, industry certifications, and a global network of experts.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Why NeoLearn?</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.95rem' }}>✅ Unlimited access to 500+ courses</li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.95rem' }}>✅ Direct mentorship from teachers</li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.95rem' }}>✅ Career-ready portfolio projects</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="auth-form-container">
        <div className="auth-card" style={{ maxWidth: '480px' }}>
          <div className="mb-5">
            <div className="badge badge-primary mb-3" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>Start Your Journey</div>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', fontWeight: 800 }}>Create Account</h2>
            <p className="small-muted">Join NeoLearn to start mastering new skills today.</p>
          </div>

          {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Nanda Gunasri"
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  required 
                />
              </div>
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
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="form-control"
                placeholder="••••••••"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label>I WANT TO JOIN AS A...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{ 
                  cursor: 'pointer', 
                  border: `2px solid ${form.role === 'student' ? 'var(--primary)' : 'var(--border)'}`, 
                  borderRadius: '16px', 
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: form.role === 'student' ? 'rgba(79, 70, 229, 0.05)' : 'white',
                  transition: 'all 0.3s ease'
                }}>
                  <input type="radio" name="role" value="student" checked={form.role === 'student'} onChange={e => setForm({...form, role: e.target.value})} style={{ display: 'none' }} />
                  <span style={{ fontSize: '1.75rem' }}>🎓</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Student</span>
                </label>
                <label style={{ 
                  cursor: 'pointer', 
                  border: `2px solid ${form.role === 'teacher' ? 'var(--primary)' : 'var(--border)'}`, 
                  borderRadius: '16px', 
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: form.role === 'teacher' ? 'rgba(79, 70, 229, 0.05)' : 'white',
                  transition: 'all 0.3s ease'
                }}>
                  <input type="radio" name="role" value="teacher" checked={form.role === 'teacher'} onChange={e => setForm({...form, role: e.target.value})} style={{ display: 'none' }} />
                  <span style={{ fontSize: '1.75rem' }}>👨‍🏫</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Teacher</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" style={{ padding: '1rem', borderRadius: '14px', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Get Started Now'}
            </button>
          </form>

          <div className="text-center mt-5">
            <span className="small-muted">Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign In to NeoLearn</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
