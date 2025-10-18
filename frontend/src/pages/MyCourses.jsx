// frontend/src/pages/MyCourses.jsx
import React, { useEffect, useState } from 'react';
import { getMyCourses } from '../services/courseService';
import { Link } from 'react-router-dom';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await getMyCourses();
        if (!mounted) return;
        // dedupe by id
        const unique = Array.from(new Map((res.data.courses || []).map(c => [c.id, c])).values());
        setCourses(unique);
      } catch (err) {
        console.error(err);
        alert(err?.response?.data?.error || 'Failed to load courses');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Courses</h2>

      {courses.length === 0 ? (
        <div className="rounded p-6 bg-white shadow">No courses found.</div>
      ) : (
        <div className="space-y-6">
          {courses.map(course => (
            <div key={course.id} className="rounded p-6 bg-white shadow flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="text-sm text-gray-600">{course.description}</p>
              </div>
              <div className="flex gap-3">
                <Link to={`/courses/${course.id}/students`} className="px-4 py-2 rounded bg-blue-600 text-white">
                  View Students
                </Link>
                <Link to={`/courses/${course.id}`} className="px-4 py-2 rounded border">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
