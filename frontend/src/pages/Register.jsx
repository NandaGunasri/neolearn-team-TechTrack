// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function Register(){
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'Student' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function change(k, v){ setForm(prev => ({...prev, [k]: v})); }

  async function submit(e){
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return alert('Fill all fields');
    if (!passwordRules.test(form.password)) {
      return alert('Password must be 8+ chars, include upper, lower, and a number.');
    }

    try{
      setLoading(true);

      // debug: show which full URL axios will call
      // (axios will combine API.baseURL + '/auth/register')
      console.log('Sending registration payload:', form);
      let fullUrl = API.defaults.baseURL ? `${API.defaults.baseURL.replace(/\/$/, '')}/auth/register` : '/auth/register';
      console.log('Expecting to POST to:', fullUrl);

      const res = await API.post('/auth/register', form); // keep endpoint relative to API.baseURL
      console.log('Register response:', res.status, res.data);
      alert('Registered: ' + (res.data?.user?.name || res.data?.message || 'OK'));
      navigate('/login');
    }catch(err){
      console.error('Register error full:', err);

      // prefer message fields from backend (message, error, or raw data)
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Register failed';

      // show full detail in console and short message to user
      console.log('Server response (err.response):', err?.response);
      alert('Register failed: ' + serverMsg);
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="small-muted">Join NeoLearn — learn, submit, and grow.</p>
        <form onSubmit={submit}>
          <label>Full name</label>
          <input placeholder="Name" value={form.name} onChange={e=>change('name',e.target.value)} />
          <label>Email</label>
          <input type="email" value={form.email} onChange={e=>change('email',e.target.value)} />
          <label>Password</label>
          <input type="password" value={form.password} onChange={e=>change('password',e.target.value)} />
          <label>I am a</label>
          <select value={form.role} onChange={e=>change('role', e.target.value)}>
            <option>Student</option><option>Teacher</option>
          </select>

          <div style={{marginTop:12, display:'flex', gap:10}}>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Register'}</button>
            <button className="btn secondary" type="button" onClick={()=>setForm({name:'',email:'',password:'',role:'Student'})}>Reset</button>
          </div>
        </form>
        <p className="small-muted" style={{marginTop:12}}>
          By registering you agree to the NeoLearn demo terms. This is a local demo — passwords are not hashed.
        </p>
      </div>
    </div>
  );
}
