import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';

export default function CourseDetails(){
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [enrolls, setEnrolls] = useState([]);

  useEffect(()=>{
    let mounted = true;
    API.get(`/courses`).then(r=>{
      if(!mounted) return;
      const found = r.data.find(x => x.id === id);
      setCourse(found || null);
      setLoading(false);
    }).catch(()=>{ setCourse(null); setLoading(false); });

    API.get('/enrollments').then(r=>{ if(mounted) setEnrolls(r.data); }).catch(()=>{});
    return ()=> mounted = false;
  },[id]);

  if(loading) return <div className="container"><p className="small-muted">Loading...</p></div>;
  if(!course) return <div className="container"><p className="small-muted">Course not found</p></div>;

  const isEnrolled = () => {
    if(!user) return false;
    return enrolls.some(e => e.courseId === course.id && e.studentId === user.id);
  };

  const enroll = async () => {
    if(!user) return alert('Please login');
    if(user.role !== 'Student') return alert('Only students can enroll');
    if(isEnrolled()) return alert('Already enrolled');

    try {
      const r = await API.post('/enroll', { studentId: user.id, courseId: course.id });
      setEnrolls(prev=>[...prev, r.data.enrollment]);
      alert('Enrolled!');
    } catch (err) {
      alert(err?.response?.data?.error || 'Enroll failed');
    }
  };

  const enrolledStudents = enrolls.filter(e => e.courseId === course.id).map(e => e.studentId);

  return (
    <div className="container">
      <div className="course-card">
        <h2>{course.title}</h2>
        <p className="small-muted">{course.description}</p>
        <div style={{marginTop:12}}>Duration: {course.duration || '—'}</div>

        <div style={{marginTop:14}} className="card-actions">
          <button className="btn" onClick={enroll} disabled={isEnrolled() || (user && user.role !== 'Student')}>
            {isEnrolled() ? 'Enrolled' : 'Enroll'}
          </button>
        </div>

        {user && user.role === 'Teacher' && (
          <div style={{marginTop:20}}>
            <h4>Enrolled Students</h4>
            {enrolledStudents.length === 0 ? <p className="small-muted">No students yet</p> :
              <ul>
                {enrolledStudents.map(sid => <li key={sid}>{sid}</li>)}
              </ul>}
          </div>
        )}
      </div>
    </div>
  );
}
