import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// WelcomeSplash.jsx
// - 30s countdown (auto-navigate)
// - Skip and "Another" (cycles jokes)
// - Smooth transitions with framer-motion
// - TailwindCSS utility classes for spacing/padding and responsive design

const JOKES = [
  "Want to hear a joke about a piece of paper? Never mind...it's tearable",
  "Why did the computer show up at work late? It had a hard drive.",
  "I told my computer I needed a break — now it won’t stop sending me KitKat ads.",
  "Why don't programmers like nature? Too many bugs.",
  "I would tell you a UDP joke, but you might not get it."
];

export default function WelcomeSplash() {
  const navigate = useNavigate();
  const TOTAL = 30; // seconds

  const [countdown, setCountdown] = useState(TOTAL);
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    // start countdown
    intervalRef.current = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      clearInterval(intervalRef.current);
      // small delay to let animation finish
      setTimeout(() => navigate('/dashboard'), 200);
    }
  }, [countdown, navigate]);

  // progress value 0..1
  const progress = Math.max(0, Math.min(1, (TOTAL - countdown) / TOTAL));

  function handleSkip() {
    clearInterval(intervalRef.current);
    navigate('/dashboard');
  }

  function handleAnother() {
    // reset countdown slightly so user sees the new joke but doesn't extend timer
    setIndex((i) => (i + 1) % JOKES.length);
    // subtle pulse animation by bumping progress ref (framer anim handles visual)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-sky-50 p-6">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-3xl bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8 md:p-12 border border-slate-100"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">😊</div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Welcome back!</h1>
              <p className="mt-3 text-slate-700">A tiny thing before you go to your dashboard.</p>

              <div className="mt-6">
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.35 }}
                  className="text-lg md:text-xl text-slate-800"
                >
                  {JOKES[index]}
                </motion.p>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSkip}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm font-medium shadow-sm hover:scale-[1.02] active:scale-[0.99] transition-transform"
                      aria-label="Skip welcome splash"
                    >
                      Skip
                    </button>

                    <button
                      onClick={handleAnother}
                      className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium shadow hover:bg-sky-700 active:scale-[0.98] transition-colors"
                      aria-label="Show another joke"
                    >
                      Another
                    </button>
                  </div>

                  <div className="mt-3 sm:mt-0 text-slate-600 text-sm">Auto continues in <span className="font-medium">{countdown}s</span></div>
                </div>

                <div className="mt-5">
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      ref={progressRef}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ ease: 'linear', duration: 0.3 }}
                      className="h-3 bg-sky-500/90 rounded-full"
                    />
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-400">Tip: Click "Another" to cycle jokes. Click "Skip" to go straight to the dashboard.</div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
