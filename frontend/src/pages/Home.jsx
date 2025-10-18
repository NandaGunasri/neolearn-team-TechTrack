// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

export default function Home(){
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    // normalize response: support either an array or { courses: [...] }
    API.get('/courses')
      .then(r => {
        // r.data could be an array or an object { courses: [...] }
        const payload = r.data;
        const arr = Array.isArray(payload) ? payload : (payload?.courses || []);
        setCourses(arr);
      })
      .catch(()=> setCourses([]))
      .finally(()=> setLoading(false));
  },[]);

  async function enrollPrompt(courseId){
    const studentId = prompt('Enter your student id (for demo use a numeric id like 1):', '1');
    if (!studentId) return alert('Cancelled');

    try{
      // correct enroll endpoint: POST /courses/:id/enroll
      const res = await API.post(`/courses/${courseId}/enroll`, { userId: studentId });
      alert(res.data?.message || 'Enrolled!');
      // optionally you can refresh enrollments/courses here
    }catch(err){
      console.error('Enroll error', err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Enroll failed';
      alert(msg);
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <div className="left">
          <h2>Available Courses</h2>
          <p className="small-muted">Enroll, submit assignments, and learn — local demo</p>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <>
          {courses.length===0 && <p className="small-muted">No courses yet. Teachers, create one from Dashboard.</p>}
          <div className="course-grid">
            {(Array.isArray(courses) ? courses : []).map(c=>(
              <div key={c.id} className="course-card card">
                <h3>{c.title}</h3>
                <p className="small-muted">{c.description}</p>
                <div style={{display:'flex', gap:10}}>
                  <Link to={`/courses/${c.id}`} className="btn">View</Link>
                  <button className="btn outline-btn" onClick={()=>enrollPrompt(c.id)}>Enroll</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
