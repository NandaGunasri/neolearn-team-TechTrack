// frontend/src/components/WelcomeSplash.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const JOKES = [
  "Want to hear a joke about a piece of paper? Never mind...it's tearable",
  "Why did the computer show up at work late? It had a hard drive.",
  "I told my computer I needed a break — now it won’t stop sending me KitKat ads.",
  "Why don't programmers like nature? Too many bugs.",
  "I would tell you a UDP joke, but you might not get it."
];

export default function WelcomeSplash() {
  const navigate = useNavigate();
  const TOTAL = 10; // seconds

  const [countdown, setCountdown] = useState(TOTAL);
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      clearInterval(intervalRef.current);
      navigate('/dashboard');
    }
  }, [countdown, navigate]);

  const progress = ((TOTAL - countdown) / TOTAL) * 100;

  function handleSkip() {
    clearInterval(intervalRef.current);
    navigate('/dashboard');
  }

  function handleAnother() {
    setIndex((i) => (i + 1) % JOKES.length);
  }

  return (
    <div className="auth-container" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="auth-card"
          style={{ maxWidth: '600px' }}
        >
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ fontSize: '3rem' }}>💡</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Did you know?</h2>
              <p className="small-muted" style={{ marginBottom: '1.5rem' }}>While we prepare your personalized dashboard, here's a little something for you.</p>
              
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ minHeight: '80px', fontSize: '1.25rem', fontWeight: '500', color: 'var(--text)' }}
              >
                "{JOKES[index]}"
              </motion.div>

              <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={handleSkip} className="btn btn-outline btn-sm">Skip</button>
                <button onClick={handleAnother} className="btn btn-primary btn-sm">Another One</button>
                <span className="small-muted" style={{ marginLeft: 'auto' }}>Redirecting in {countdown}s</span>
              </div>

              <div style={{ marginTop: '1.5rem', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: 0.5 }}
                  style={{ height: '100%', background: 'var(--primary)' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
