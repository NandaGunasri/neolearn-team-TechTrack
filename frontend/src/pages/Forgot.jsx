// frontend/src/pages/Forgot.jsx
import React, {useState} from 'react';

export default function Forgot(){
  const [email, setEmail] = useState('');
  const submit = (e) => { e.preventDefault(); alert('If this were production we would send a reset link to: ' + email); }
  return (
    <div className="container" style={{maxWidth:520, marginTop:48}}>
      <div className="auth-card">
        <h2>Forgot password</h2>
        <p className="small-muted">Enter your account email — we'll send a reset link (demo).</p>
        <form onSubmit={submit}>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
          <div style={{display:'flex', justifyContent:'flex-end', marginTop:12}}>
            <button className="btn" type="submit">Send reset link</button>
          </div>
        </form>
      </div>
    </div>
  );
}
