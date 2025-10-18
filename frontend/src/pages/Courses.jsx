// frontend/src/pages/Courses.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null; // expects backend stored user in localStorage after login

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await API.get('/courses');
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  async function enroll(courseId) {
    if (!user) return alert('Please login to enroll');
    try {
      const res = await API.post(`/courses/${courseId}/enroll`, { user_id: user.id });
      alert(res.data.message || 'Enrolled');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Enroll failed';
      alert(msg);
    }
  }

  if (loading) return <div>Loading courses…</div>;
  if (!courses.length) return <div>No courses yet. Teachers, create one from Dashboard.</div>;

  return (
    <div>
      <h1>Available Courses</h1>
      <div>
        {courses.map(c => (
          <div key={c.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 8 }}>
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <div>
              <button onClick={() => enroll(c.id)}>Enroll</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
