// frontend/src/pages/CourseStudents.jsx
import React, { useEffect, useState } from 'react';
import { getCourseStudents } from '../services/enrollmentService';
import { useParams } from 'react-router-dom';

export default function CourseStudents() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getCourseStudents(courseId);
        setStudents(res.data.students || []);
      } catch (err) {
        console.error(err);
        alert(err?.response?.data?.error || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    if (courseId) load();
  }, [courseId]);

  if (loading) return <p>Loading…</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Enrolled Students</h2>
      {students.length === 0 ? (
        <div className="rounded p-6 bg-white shadow">No students enrolled yet.</div>
      ) : (
        <table className="w-full bg-white shadow">
          <thead>
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Enrolled At</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">{new Date(s.enrolledAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
