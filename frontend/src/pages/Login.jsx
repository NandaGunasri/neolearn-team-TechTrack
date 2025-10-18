// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function change(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.email || !form.password) {
      return alert('Please enter email and password');
    }

    setLoading(true);
    try {
      // make request and await response
      const res = await API.post('/auth/login', {
        email: form.email,
        password: form.password
      });

      // success: store token and user in localStorage so Dashboard and other pages can use it
      const token = res?.data?.token;
      const user = res?.data?.user || null;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      // temporary debug log to confirm token stored (remove after testing)
      console.log('Login succeeded. token stored?', !!localStorage.getItem('token'));

      alert('Logged in: ' + (user?.name || res?.data?.message || 'OK'));

      // navigate to welcome splash OR directly to dashboard if splash already seen
      const seenSplash = localStorage.getItem('seenWelcomeSplash');
      navigate(seenSplash ? '/dashboard' : '/welcome');
    } catch (err) {
      console.error('Login error full:', err);
      // prefer server message when available
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Login failed';
      alert('Login failed: ' + serverMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 540, margin: '40px auto' }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label style={{ display: 'block', marginTop: 12 }}>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={e => change('email', e.target.value)}
          placeholder="you@example.com"
          style={{ width: '100%', padding: 8, borderRadius: 6 }}
        />

        <label style={{ display: 'block', marginTop: 12 }}>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={e => change('password', e.target.value)}
          placeholder="Password"
          style={{ width: '100%', padding: 8, borderRadius: 6 }}
        />

        <div style={{ marginTop: 16 }}>
          <button type="submit" disabled={loading} className="btn">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
