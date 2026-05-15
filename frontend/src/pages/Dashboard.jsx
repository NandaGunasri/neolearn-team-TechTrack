// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markNotificationsRead, getMyGrades } from "../services/courseService";
import API from "../services/api";

const LEVELS = [
  { name: "Bronze", min: 0, icon: "🥉" },
  { name: "Silver", min: 50, icon: "🥈" },
  { name: "Gold", min: 150, icon: "🥇" },
  { name: "Platinum", min: 300, icon: "💎" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState(user);
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ avgScore: 0, gradedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", duration: "", category: "General" });

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const isTeacher = user?.role?.toLowerCase() === 'teacher';
      const [coursesRes, notifyRes, statsRes, userRes, achRes] = await Promise.all([
        API.get(isTeacher ? '/courses/owned' : '/courses/enrolled'),
        getNotifications(),
        !isTeacher ? getMyGrades() : Promise.resolve({ data: { stats: { avgScore: 0, gradedCount: 0 } } }),
        API.get('/auth/me'),
        API.get('/auth/achievements')
      ]);
      
      setCourses(coursesRes.data.courses || []);
      setNotifications(notifyRes.data.notifications || []);
      setStats(statsRes.data.stats || { avgScore: 0, gradedCount: 0 });
      setAchievements(achRes.data.achievements || []);
      if (userRes.data.user) setCurrentUser(userRes.data.user);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
    else navigate('/login');
  }, [user, fetchData, navigate]);

  if (!user || !currentUser) return null;

  const points = currentUser?.points || 0;
  const currentLevel = [...LEVELS].reverse().find(l => points >= l.min) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const progress = nextLevel ? ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;
  
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <div className="container fade-in">
      <div className="dashboard-layout">
        <main>
          {/* Header Section */}
          <div className="card mb-4" style={{ 
            background: 'linear-gradient(135deg, var(--surface) 0%, #F1F5F9 100%)',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            border: 'none',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--primary-glow)', borderRadius: '50%' }}></div>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                color: 'white', 
                borderRadius: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '2rem', 
                fontWeight: 800,
                boxShadow: '0 8px 16px rgba(79, 70, 229, 0.2)'
              }}>
                {currentUser?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="badge badge-primary mb-2" style={{ background: 'white', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>✨ Platinum Member</div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Welcome, {currentUser?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Learner'}!</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-soft)' }}>{currentUser?.skill_level || 'Beginner'} Pioneer</span>
                  <div style={{ width: '4px', height: '4px', background: 'var(--border)', borderRadius: '50%' }}></div>
                  <span className="small-muted">ID: #LX-{currentUser?.id || user?.id || '000'}109</span>
                </div>
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              {currentUser?.role?.toLowerCase() === 'teacher' ? (
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Course</button>
              ) : (
                <Link to="/" className="btn btn-primary">Browse Curriculum</Link>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="icon-box" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>🏆</div>
              <div>
                <div className="small-muted" style={{ fontWeight: 600 }}>Total XP</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{points.toLocaleString()}</div>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
              <div className="icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>🔥</div>
              <div>
                <div className="small-muted" style={{ fontWeight: 600 }}>Streak</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{currentUser?.streak || 0} Days</div>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
              <div className="icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-gold)' }}>{currentLevel.icon}</div>
              <div>
                <div className="small-muted" style={{ fontWeight: 600 }}>Elite Rank</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{currentLevel.name}</div>
              </div>
            </div>
          </div>

          {/* Curriculum Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Active Curriculum</h2>
            <Link to="/my-courses" className="small-muted" style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>View All →</Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner"></div></div>
          ) : courses.length === 0 ? (
            <div className="card text-center py-5">No active courses. <Link to="/">Browse courses</Link></div>
          ) : (
            <div className="course-grid">
              {courses.slice(0, 4).map(course => (
                <div key={course.id} className="course-card">
                  <div className="course-thumb" style={{ height: '120px', fontSize: '2rem' }}>
                    {course.category === 'Coding' ? '💻' : '📚'}
                  </div>
                  <div className="course-body">
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>{course.title}</h4>
                    <Link to={`/courses/${course.id}`} className="btn btn-outline btn-sm btn-block">Enter Classroom</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <aside>
          {/* Notifications */}
          <div className="card mb-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem' }}>Notifications</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {unreadCount > 0 && <span className="badge" style={{ background: 'var(--error)', color: 'white', fontSize: '0.7rem' }}>{unreadCount}</span>}
                <button 
                  onClick={async () => { await markNotificationsRead(); fetchData(); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Clear All
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.length === 0 ? (
                <p className="small-muted text-center">No new notifications.</p>
              ) : (
                notifications.slice(0, 4).map(n => (
                  <div key={n.id} style={{ display: 'flex', gap: '0.75rem', opacity: n.is_read ? 0.6 : 1 }}>
                    <div style={{ fontSize: '1.1rem' }}>{n.type === 'grade' ? '📝' : '📢'}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.title}</div>
                      <div className="small-muted" style={{ fontSize: '0.75rem' }}>{n.message}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Progress Card */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Level Progress</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="small-muted">To Next Level</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
            </div>
            <div className="mt-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span className="badge badge-primary">🚀 Started</span>
              {stats.avgScore >= 90 && <span className="badge badge-success">🎯 Top Scorer</span>}
            </div>
          </div>

          {/* Achievements List */}
          {achievements.length > 0 && (
            <div className="card mt-4">
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Achievements</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {achievements.map(ach => (
                  <div key={ach.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.5rem' }}>{ach.type === 'platinum' ? '💎' : ach.type === 'excellence' ? '🌟' : '⭐'}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ach.title}</div>
                      <div className="small-muted" style={{ fontSize: '0.7rem' }}>{new Date(ach.awarded_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Modal Reverted to Standard */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Create New Course</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await API.post("/courses", form);
                setShowCreate(false);
                setForm({ title: "", description: "", duration: "", category: "General" });
                fetchData();
              } catch (err) { alert("Error creating course"); }
            }}>
              <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="Coding">Coding</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              <div className="form-group"><label>Description</label><textarea className="form-control" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
              <button type="submit" className="btn btn-primary btn-block mt-4">Create Curriculum</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
