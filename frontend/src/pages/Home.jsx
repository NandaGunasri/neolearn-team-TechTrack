// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../services/courseService';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCourses().then(res => {
      setCourses(res.data.courses || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="badge badge-primary mb-4" style={{ padding: '0.5rem 1rem', borderRadius: '99px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>✨ NeoLearn Platinum Edition</div>
          <h1>Master Your Future with <br/><span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Expert-Led Courses</span></h1>
          <p>Learn the most in-demand skills from industry experts. Flexible learning paths designed to help you succeed in your career.</p>
          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', marginBottom: '4rem' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>Start Learning</Link>
            <a href="#courses" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>Explore Courses</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '1.5rem', border: 'none', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>10k+</div>
              <div className="small-muted">Active Learners</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', border: 'none', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💎</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>500+</div>
              <div className="small-muted">Platinum Courses</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', border: 'none', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌟</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>4.9/5</div>
              <div className="small-muted">Course Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="container" style={{ paddingBottom: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem' }}>Explore Our Curriculum</h2>
            <p className="small-muted">Find the perfect course to advance your skills.</p>
          </div>
          <div className="hide-mobile">
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View All Courses →</Link>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div className="course-grid">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-thumb">
                  {course.category === 'Coding' ? '💻' : course.category === 'Design' ? '🎨' : '📚'}
                </div>
                <div className="course-body">
                  <span className="course-tag">{course.category}</span>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', lineHeight: 1.3 }}>{course.title}</h3>
                  <p className="small-muted" style={{ marginBottom: '1.25rem' }}>{(course.description || "Master industry-standard skills with our curated curriculum...").substring(0, 90)}...</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>By Prof. Expert</div>
                    <Link to={`/courses/${course.id}`} className="btn btn-outline btn-sm">Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
