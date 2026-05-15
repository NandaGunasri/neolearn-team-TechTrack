// frontend/src/pages/SubmissionsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionsByAssignment, postGrade } from '../services/courseService';

export default function SubmissionsPage() {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await getSubmissionsByAssignment(assignmentId);
        setSubmissions(res.data.submissions || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchSubmissions();
  }, [assignmentId]);

  const handleGrade = async (subId) => {
    if (marks === '') return alert('Please enter marks');
    setSubmitting(true);
    try {
      await postGrade({ submissionId: subId, marks: parseInt(marks), feedback });
      setSubmissions(submissions.map(s => s.id === subId ? { ...s, status: 'Reviewed', feedback, marks } : s));
      setReviewingId(null);
      setMarks('');
      setFeedback('');
    } catch (err) { alert('Failed to post grade'); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}><div className="spinner"></div></div>;

  return (
    <div className="container fade-in" style={{ padding: '3rem 0' }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/dashboard" className="btn btn-outline btn-sm">← Back</Link>
        <h2 style={{ fontSize: '1.75rem' }}>Submissions</h2>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {submissions.length === 0 ? (
          <div className="text-center" style={{ padding: '4rem' }}>
            <p className="small-muted">No student submissions yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem' }}>Student</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem' }}>Response</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>Grade</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ fontWeight: 600 }}>{sub.studentName}</div>
                      <div className="small-muted" style={{ fontSize: '0.75rem' }}>{sub.studentEmail}</div>
                    </td>
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ maxWidth: '300px', fontSize: '0.9rem', color: 'var(--text-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.content}</div>
                    </td>
                    <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                      {sub.status === 'Reviewed' ? <span className="badge badge-success">{sub.marks}/100</span> : <span className="badge" style={{ background: '#F1F5F9' }}>Pending</span>}
                    </td>
                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setReviewingId(sub.id)}>Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reviewingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Grade Submission</h3>
            <div className="form-group">
              <label>Marks (0-100)</label>
              <input type="number" className="form-control" value={marks} onChange={e => setMarks(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Feedback</label>
              <textarea className="form-control" rows="3" value={feedback} onChange={e => setFeedback(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary btn-block" onClick={() => handleGrade(reviewingId)} disabled={submitting}>Save Grade</button>
              <button className="btn btn-outline" onClick={() => setReviewingId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
