// frontend/src/pages/CourseDetails.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getCourseById, getAssignmentsByCourse, createAssignment, submitAssignment, 
  getCourseStudents, getEnrolledCourses, getMaterials, uploadMaterial,
  getDiscussions, postComment
} from '../services/courseService';
import API from '../services/api';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [comments, setComments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ id: null, title: '', description: '', deadline: '', max_marks: 100 });
  const [showUploadMaterial, setShowUploadMaterial] = useState(false);
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'Link', fileUrl: '' });
  const [submissionForm, setSubmissionForm] = useState({ assignmentId: null, content: '' });
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  
  // Grading state
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: 0, feedback: '' });

  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const courseRes = await getCourseById(id);
      setCourse(courseRes.data.course);

      if (user) {
        const enrolledRes = await getEnrolledCourses();
        const isEnrolled = enrolledRes.data.courses.some(c => c.id.toString() === id.toString());
        setEnrolled(isEnrolled);

        const isInstructor = user.role.toLowerCase() === 'teacher' && courseRes.data.course.teacherId.toString() === user.id.toString();

        if (isEnrolled || isInstructor) {
          const [assignmentsRes, materialsRes, discussionsRes, gradesRes] = await Promise.all([
            getAssignmentsByCourse(id).catch(() => ({ data: { assignments: [] } })),
            getMaterials(id).catch(() => ({ data: { materials: [] } })),
            getDiscussions(id).catch(() => ({ data: { comments: [] } })),
            isInstructor 
              ? API.get(`/assignments/all-submissions/${id}`).catch(() => ({ data: { submissions: [] } }))
              : API.get(`/grades/student-course/${id}`).catch(() => ({ data: { grades: [] } }))
          ]);

          setAssignments(assignmentsRes.data.assignments || []);
          setMaterials(materialsRes.data.materials || []);
          setComments(discussionsRes.data.comments || []);
          const submissionList = gradesRes.data.submissions || gradesRes.data.grades || [];
          setGrades(submissionList);

          // Update assignments with submission status
          if (!isInstructor) {
            setAssignments(prev => prev.map(asm => ({
              ...asm,
              submitted: submissionList.some(s => s.assignment_id === asm.id)
            })));
          }

          if (isInstructor) {
            const studentsRes = await getCourseStudents(id).catch(() => ({ data: { students: [] } }));
            setStudents(studentsRes.data.students || []);
          }
        }
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [id, user]);

  useEffect(() => { fetchCourseData(); }, [fetchCourseData]);

  if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}><div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div></div>;
  if (!course) return <div className="container" style={{ padding: '5rem' }}><h2>Course not found</h2></div>;

  const isTeacher = user?.role?.toLowerCase() === 'teacher' && course.teacherId.toString() === user?.id.toString();

  return (
    <div className="container fade-in" style={{ padding: '3rem 0' }}>
      {/* Header Section */}
      <div className="card mb-4" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: '#F1F5F9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
            {course.category === 'Coding' ? '💻' : '📚'}
          </div>
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="badge badge-primary">{course.category}</span>
              <span className="small-muted">Instructor: {course.teacherName || `Prof. #${course.teacherId}`}</span>
            </div>
            <h1 style={{ fontSize: '2.25rem' }}>{course.title}</h1>
          </div>
        </div>
      </div>

      <div className="tab-nav">
        <div className={`tab-link ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>Syllabus</div>
        {(enrolled || isTeacher) && (
          <>
            <div className={`tab-link ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>Resources</div>
            <div className={`tab-link ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>Challenges</div>
            <div className={`tab-link ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => setActiveTab('grades')}>Grades</div>
            <div className={`tab-link ${activeTab === 'discussions' ? 'active' : ''}`} onClick={() => setActiveTab('discussions')}>Nexus Forum</div>
          </>
        )}
        {isTeacher && <div className={`tab-link ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Enrolled</div>}
      </div>

      <div className="dashboard-layout">
        <main>
          {activeTab === 'about' && (
            <div className="card">
              <h3 style={{ marginBottom: '1.25rem' }}>Overview</h3>
              <p style={{ color: 'var(--text-soft)', whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{course.description}</p>
            </div>
          )}

          {activeTab === 'materials' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Learning Materials</h3>
                {isTeacher && <button className="btn btn-primary btn-sm" onClick={() => setShowUploadMaterial(true)}>+ Add Asset</button>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {materials.length === 0 ? <p className="small-muted text-center py-4">No resources shared yet.</p> : materials.map(m => (
                  <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.5rem' }}>{m.type === 'PDF' ? '📄' : m.type === 'Video' ? '🎬' : '🔗'}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.title}</div>
                        <div className="small-muted" style={{ fontSize: '0.8rem' }}>{m.type} • Added {new Date(m.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a href={m.file_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View</a>
                      {isTeacher && <button onClick={async () => { if(window.confirm("Delete this?")) { await deleteMaterial(m.id); fetchCourseData(); } }} className="btn btn-outline btn-sm" style={{ color: 'var(--error)' }}>Del</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Course Challenges</h3>
                {isTeacher && <button className="btn btn-primary btn-sm" onClick={() => { setAssignmentForm({ id: null, title: '', description: '', deadline: '', max_marks: 100 }); setShowCreateAssignment(true); }}>+ New Challenge</button>}
              </div>
              {assignments.length === 0 ? <p className="small-muted text-center py-4">No assignments created yet.</p> : assignments.map(asm => (
                <div key={asm.id} className="card mb-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem' }}>{asm.title}</h4>
                    <span className="small-muted" style={{ fontWeight: 600 }}>Due: {new Date(asm.deadline).toLocaleDateString()}</span>
                  </div>
                  <p className="small-muted mb-4">{asm.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-primary">Marks: {asm.max_marks || 100}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {isTeacher ? (
                        <>
                          <button onClick={() => { setAssignmentForm({ ...asm }); setShowCreateAssignment(true); }} className="btn btn-outline btn-sm">Edit</button>
                          <button onClick={async () => { if(window.confirm("Delete?")) { await deleteAssignment(asm.id); fetchCourseData(); } }} className="btn btn-outline btn-sm" style={{ color: 'var(--error)' }}>Delete</button>
                        </>
                      ) : (
                        asm.submitted ? (
                          <span className="badge badge-success">✓ Submitted</span>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => { setSubmissionForm({ assignmentId: asm.id, content: '' }); setShowSubmissionModal(true); }}>Submit Task</button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'grades' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{isTeacher ? 'Grading Dashboard' : 'Your Performance'}</h3>
              <div className="card">
                {isTeacher ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>Student</th>
                        <th style={{ padding: '1rem' }}>Assignment</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem' }}>Grade</th>
                        <th style={{ padding: '1rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map(g => (
                        <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '1rem' }}>{g.studentName}</td>
                          <td style={{ padding: '1rem' }}>{g.assignmentTitle || `Task #${g.assignment_id}`}</td>
                          <td style={{ padding: '1rem' }}><span className={`badge ${g.status === 'Reviewed' ? 'badge-success' : 'badge-primary'}`}>{g.status}</span></td>
                          <td style={{ padding: '1rem' }}>{g.marks || '—'}</td>
                          <td style={{ padding: '1rem' }}>
                            <button className="btn btn-outline btn-sm" onClick={() => { setGradingSubmission(g); setGradeForm({ marks: g.marks || 0, feedback: g.feedback || '' }); }}>{g.status === 'Reviewed' ? 'Edit' : 'Grade'}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {grades.length === 0 ? <p className="small-muted text-center py-4">No grades available yet.</p> : grades.map(g => (
                      <div key={g.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 700 }}>{g.assignmentTitle}</span>
                          <span className="badge badge-success">{g.marks} pts</span>
                        </div>
                        <p className="small-muted" style={{ fontSize: '0.9rem' }}>Feedback: {g.feedback || "Good work! Keep it up."}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'discussions' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Nexus Forum</h3>
              <div className="card mb-4">
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Share your thoughts or ask a question..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <button 
                  className="btn btn-primary btn-sm mt-3" 
                  onClick={async () => {
                    if (!newComment.trim()) return;
                    setPostingComment(true);
                    try {
                      await postComment(id, newComment);
                      setNewComment('');
                      fetchCourseData();
                    } catch (err) { alert('Failed to post'); } finally { setPostingComment(false); }
                  }}
                  disabled={postingComment}
                >
                  Post to Forum
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comments.length === 0 ? <p className="small-muted text-center">No discussions yet. Be the first!</p> : comments.map(c => (
                  <div key={c.id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>{c.userName}</span>
                      <span className="small-muted" style={{ fontSize: '0.75rem' }}>{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '0.95rem' }}>{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <aside>
          <div className="card text-center" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎓</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Enrollment Status</h3>
            {!enrolled && !isTeacher ? (
              <>
                <p className="small-muted mb-4">Join this course to access materials and challenges.</p>
                <button className="btn btn-primary btn-block" onClick={async () => {
                  await API.post(`/courses/${id}/enroll`);
                  setEnrolled(true);
                  fetchCourseData();
                }}>Enroll in Course</button>
              </>
            ) : (
              <div className="badge badge-success">Enrolled Member</div>
            )}
            <div className="mt-4" style={{ textAlign: 'left', fontSize: '0.85rem' }}>
              <div className="mb-2">✅ Full lifetime access</div>
              <div className="mb-2">✅ Access on mobile and TV</div>
              <div className="mb-2">✅ Certificate of completion</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modals */}
      {showUploadMaterial && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Upload Resource</h3>
            <div className="form-group"><label>Title</label><input className="form-control" value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} /></div>
            <div className="form-group">
              <label>Type</label>
              <select className="form-control" value={materialForm.type} onChange={e => setMaterialForm({...materialForm, type: e.target.value})}>
                <option value="Link">Web Link</option>
                <option value="PDF">PDF Document</option>
                <option value="Video">YouTube Video</option>
              </select>
            </div>
            <div className="form-group"><label>URL</label><input className="form-control" value={materialForm.fileUrl} onChange={e => setMaterialForm({...materialForm, fileUrl: e.target.value})} /></div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary btn-block" onClick={async () => { await uploadMaterial({ ...materialForm, courseId: id }); setShowUploadMaterial(false); fetchCourseData(); }}>Save Asset</button>
              <button className="btn btn-outline btn-block" onClick={() => setShowUploadMaterial(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCreateAssignment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{assignmentForm.id ? 'Edit' : 'Create'} Challenge</h3>
            <div className="form-group"><label>Title</label><input className="form-control" value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} /></div>
            <div className="form-group"><label>Description</label><textarea className="form-control" rows="3" value={assignmentForm.description} onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} /></div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}><label>Deadline</label><input type="date" className="form-control" value={assignmentForm.deadline} onChange={e => setAssignmentForm({...assignmentForm, deadline: e.target.value})} /></div>
              <div className="form-group" style={{ width: '100px' }}><label>Max Marks</label><input type="number" className="form-control" value={assignmentForm.max_marks} onChange={e => setAssignmentForm({...assignmentForm, max_marks: e.target.value})} /></div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary btn-block" onClick={async () => { 
                if (assignmentForm.id) await updateAssignment(assignmentForm.id, assignmentForm);
                else await createAssignment({ ...assignmentForm, courseId: id });
                setShowCreateAssignment(false); fetchCourseData(); 
              }}>Save Challenge</button>
              <button className="btn btn-outline btn-block" onClick={() => setShowCreateAssignment(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSubmissionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Submit Your Work</h3>
            <p className="small-muted mb-4">Provide a link to your repository or paste your solution below.</p>
            <textarea className="form-control" rows="6" value={submissionForm.content} onChange={e => setSubmissionForm({...submissionForm, content: e.target.value})} placeholder="https://github.com/your-work..." />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary btn-block" onClick={async () => { await submitAssignment(submissionForm.assignmentId, submissionForm.content); setShowSubmissionModal(false); fetchCourseData(); }}>Submit Now</button>
              <button className="btn btn-outline btn-block" onClick={() => setShowSubmissionModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {gradingSubmission && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Evaluate Submission</h3>
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div className="small-muted">Student Content:</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', wordBreak: 'break-all' }}>{gradingSubmission.content}</div>
            </div>
            <div className="form-group"><label>Award Marks (Max: {gradingSubmission.max_marks || 100})</label><input type="number" className="form-control" value={gradeForm.marks} onChange={e => setGradeForm({...gradeForm, marks: e.target.value})} /></div>
            <div className="form-group"><label>Feedback Comments</label><textarea className="form-control" rows="3" value={gradeForm.feedback} onChange={e => setGradeForm({...gradeForm, feedback: e.target.value})} /></div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary btn-block" onClick={async () => { await postGrade({ submissionId: gradingSubmission.id, ...gradeForm }); setGradingSubmission(null); fetchCourseData(); }}>Publish Grade</button>
              <button className="btn btn-outline btn-block" onClick={() => setGradingSubmission(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
