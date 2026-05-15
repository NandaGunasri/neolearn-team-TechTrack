// frontend/src/pages/CourseStudents.jsx
import React, { useEffect, useState } from 'react';
import { getCourseStudents, getCourseById } from '../services/courseService';
import { useParams, Link } from 'react-router-dom';

export default function CourseStudents() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [courseRes, studentsRes] = await Promise.all([
          getCourseById(courseId),
          getCourseStudents(courseId)
        ]);
        setCourse(courseRes.data.course);
        setStudents(studentsRes.data.students || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) load();
  }, [courseId]);

  if (loading) return <div className="container" style={{ padding: '5rem' }}><p>Loading students...</p></div>;

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div className="section-header" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <Link to="/dashboard" className="btn btn-outline btn-sm">← Back</Link>
          <span className="small-muted">Course Management</span>
        </div>
        <h2 style={{ fontSize: '2.5rem' }}>Students for: {course?.title}</h2>
        <p className="small-muted">Total Enrolled: {students.length}</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '20px', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
        {students.length === 0 ? (
          <div className="text-center" style={{ padding: '5rem' }}>
            <p className="small-muted">No students have enrolled in this course yet.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '600' }}>Student Name</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '600' }}>Email Address</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '600' }}>Enrollment Date</th>
                <th style={{ padding: '1.25rem', textAlign: 'center', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700' }}>
                        {s?.name?.charAt(0) || 'U'}
                      </div>
                      {s.name}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>{s.email}</td>
                  <td style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>{new Date(s.enrolled_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <span className="badge badge-success">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
