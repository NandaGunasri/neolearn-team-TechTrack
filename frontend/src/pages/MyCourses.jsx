// frontend/src/pages/MyCourses.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const isTeacher = user.role.toLowerCase() === 'teacher';
        const res = await API.get(isTeacher ? '/courses/owned' : '/courses/enrolled');
        setCourses(res.data.courses || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    if (user) fetchMyCourses();
  }, [user]);

  if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}><div className="spinner"></div></div>;

  return (
    <div className="container fade-in" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem' }}>{user.role.toLowerCase() === 'teacher' ? 'Your Curriculum' : 'Learning Library'}</h2>
          <p className="small-muted">Managing {courses.length} active modules.</p>
        </div>
        {user.role.toLowerCase() === 'teacher' && <Link to="/dashboard" className="btn btn-primary">+ Create Course</Link>}
      </div>

      {courses.length === 0 ? (
        <div className="card text-center" style={{ padding: '5rem' }}>
          <p className="small-muted mb-4">You haven't started any courses yet.</p>
          <Link to="/" className="btn btn-primary">Browse Catalog</Link>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-thumb" style={{ height: '140px' }}>
                {course.category === 'Coding' ? '💻' : '📚'}
              </div>
              <div className="course-body">
                <span className="course-tag">{course.category}</span>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{course.title}</h3>
                <Link to={`/courses/${course.id}`} className="btn btn-outline btn-block">Enter Course</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
