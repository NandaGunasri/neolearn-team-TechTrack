import React, { useState } from 'react';
import { enrollCourse } from '../services/enrollmentService';
import { useNavigate } from 'react-router-dom';

export default function CourseCard({ course, currentUser, onEnrollSuccess }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEnroll = async () => {
    if (!currentUser) return alert('Please login as student to enroll.');
    if (currentUser.role !== 'student') return alert('Only students can enroll.');
    try {
      setLoading(true);
      await enrollCourse(course._id);
      setLoading(false);
      alert('Enrolled successfully!');
      if (onEnrollSuccess) onEnrollSuccess(course);
    } catch (err) {
      setLoading(false);
      alert(err?.response?.data?.error || 'Enrollment failed');
    }
  };

  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <div className="actions">
        <button onClick={() => navigate(`/courses/${course._id}`)} className="btn">View</button>
        {currentUser?.role === 'student' && (
          <button onClick={handleEnroll} disabled={loading} className="btn-outline">
            {loading ? 'Enrolling...' : 'Enroll'}
          </button>
        )}
        {currentUser?.role === 'teacher' && currentUser._id === course.teacher && (
          <button onClick={() => navigate(`/courses/${course._id}/students`)} className="btn">
            View Students
          </button>
        )}
      </div>
    </div>
  );
}
// frontend/src/components/CourseCard.jsx
import React, { useState } from 'react';
import { enrollCourse } from '../services/enrollmentService';

export default function CourseCard({ course, refresh }) {
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    try {
      setLoading(true);
      await enrollCourse(course.id || course._id); // support both id name styles
      alert('Enrolled successfully');
      if (refresh) refresh();
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Enrollment failed';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-card p-4 shadow rounded bg-white mb-4">
      <h3 className="text-lg font-semibold">{course.title}</h3>
      <p className="text-sm text-gray-600">{course.description}</p>
      <div className="mt-3">
        <button className="btn btn-primary mr-2">View</button>
        <button disabled={loading} onClick={handleEnroll} className="btn btn-outline">
          {loading ? 'Enrolling...' : 'Enroll'}
        </button>
      </div>
    </div>
  );
}
