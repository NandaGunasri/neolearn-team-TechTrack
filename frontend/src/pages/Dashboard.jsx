// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";

/* Dashboard without framer-motion — CSS-based transitions */
function computeLevel(createdCount, enrolledCount) {
  const points = createdCount * 2 + enrolledCount * 1;
  if (points >= 10) return { name: "Platinum", points, next: null };
  if (points >= 5) return { name: "Gold", points, next: 10 };
  if (points >= 2) return { name: "Silver", points, next: 5 };
  return { name: "Bronze", points, next: 2 };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create course UI state
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", duration: "" });
  const [creating, setCreating] = useState(false);
  const [flash, setFlash] = useState(null); // { type: 'success'|'error', msg }

  // ---- Fetch courses + enrollments (robust & normalized) ----
  async function fetchAll() {
    setLoading(true);
    try {
      // courses: backend returns either array or { courses: [...] }
      const coursesResp = await API.get("/courses").then((r) => r.data).catch(() => []);
      const coursesArr = Array.isArray(coursesResp) ? coursesResp : (coursesResp?.courses || []);
      setCourses(coursesArr);

      // enrollments: we expose GET /api/courses/enrolled/:userId
      let enrollmentsArr = [];
      if (user && user.id) {
        const enrollResp = await API.get(`/courses/enrolled/${user.id}`).then((r) => r.data).catch(() => []);
        // normalize: could be array or { enrollments: [...] } or { courses: [...] }
        if (Array.isArray(enrollResp)) enrollmentsArr = enrollResp;
        else enrollmentsArr = enrollResp?.enrollments || enrollResp?.courses || enrollResp || [];
      }
      setEnrollments(enrollmentsArr);
    } catch (err) {
      console.error("fetchAll error", err);
      setCourses([]);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // optionally add [user] to re-run after login
  }, []);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div style={cardStyle} className="card p-6 text-center">
          <h3 style={{ margin: 0, fontSize: 20 }}>Please sign in</h3>
          <p style={{ color: "#64748b", marginTop: 8 }}>Login to access your dashboard.</p>
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        </div>
      </div>
    );

  // ---- defensive derived values (support multiple key names) ----
  const role = (user.role || "").toString().toLowerCase();

  const createdCount = (Array.isArray(courses) ? courses : []).filter((c) => {
    const tid = c.teacherId ?? c.teacher_id ?? c.teacher;
    return String(tid) === String(user?.id);
  }).length;

  const enrolledCount = (Array.isArray(enrollments) ? enrollments : []).filter((e) => {
    const sid = e.studentId ?? e.user_id ?? e.userId ?? e.student;
    return String(sid) === String(user?.id);
  }).length;

  const level = computeLevel(createdCount, enrolledCount);
  const progress = level.next ? Math.min(1, level.points / level.next) : 1;

  const myCourses = role === "teacher"
    ? (Array.isArray(courses) ? courses.filter((c) => {
        const tid = c.teacherId ?? c.teacher_id ?? c.teacher;
        return String(tid) === String(user?.id);
      }) : [])
    : [];

  const myEnrolledIds = (Array.isArray(enrollments) ? enrollments : []).map((e) => {
    return e.courseId ?? e.course_id ?? e.courseId ?? e.course;
  }).filter(Boolean);

  const myEnrolledCourses = (Array.isArray(courses) ? courses : []).filter((c) => myEnrolledIds.includes(c.id));

  // ---- Create course handler ----
  async function handleCreateCourse(e) {
    e && e.preventDefault && e.preventDefault();
    if (!user || (user.role || "").toLowerCase() !== "teacher") {
      setFlash({ type: "error", msg: "Only teachers can create courses." });
      return;
    }

    // Basic validation
    if (!form.title || !form.description) {
      setFlash({ type: "error", msg: "Please provide a title and description." });
      return;
    }
    if (form.title.trim().length < 3) {
      setFlash({ type: "error", msg: "Title must be at least 3 characters." });
      return;
    }
    if (form.description.trim().length < 10) {
      setFlash({ type: "error", msg: "Description must be at least 10 characters." });
      return;
    }
    if (form.duration && isNaN(Number(form.duration))) {
      setFlash({ type: "error", msg: "Duration must be a number (e.g., 4 for 4 hours)." });
      return;
    }

    setCreating(true);
    setFlash(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        duration: form.duration ? String(form.duration).trim() : "",
        // backend accepts teacher_id or teacherId; we send camel case
        teacherId: user.id,
      };
      await API.post("/courses", payload);
      setFlash({ type: "success", msg: "Course created successfully." });

      // reset and close
      setForm({ title: "", description: "", duration: "" });
      setShowCreate(false);

      // refresh courses & enrollments
      await fetchAll();
    } catch (err) {
      console.error("Create course error:", err);
      setFlash({ type: "error", msg: err?.response?.data?.message || err?.response?.data?.error || "Create failed" });
    } finally {
      setCreating(false);
      setTimeout(() => setFlash(null), 4000);
    }
  }

  // ---- Enroll helper (correct endpoint) ----
  async function enrollStudent(courseId) {
    const studentId = prompt('Enter your student id (for demo use numeric id like 1):', '1');
    if (!studentId) return alert('Cancelled');

    try {
      // backend accepts userId or user_id in body
      const res = await API.post(`/courses/${courseId}/enroll`, { userId: studentId });
      alert(res.data?.message || "Enrolled");
      await fetchAll(); // refresh enrollments
    } catch (err) {
      console.error("Enroll error:", err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Enroll failed";
      alert(msg);
    }
  }

  // Small helper to render flash
  function Flash() {
    if (!flash) return null;
    return (
      <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: flash.type === "success" ? "#ecfdf5" : "#fff1f2", color: flash.type === "success" ? "#065f46" : "#881337", border: flash.type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca" }}>
        {flash.msg}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#f8fafc,#f1f5f9)", padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div style={{ transition: "transform .5s ease, opacity .5s ease", transform: "translateY(0)", opacity: 1 }}>
          {/* Top card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24 }}>Welcome back, {user.name}</h2>
                <div style={{ color: "#64748b", marginTop: 6 }}>Role: {role}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={badgeStyle(level.name)}>{level.name} Level</span>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                  Points: {level.points}{level.next ? ` / ${level.next}` : " (Max)"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ color: "#64748b" }}>Progress to next level</div>
                <div style={{ fontWeight: 700 }}>{level.next ? `${Math.round(progress*100)}%` : "Complete"}</div>
              </div>
              <div style={{ height: 10, background: "#e6eefb", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress*100}%`, background: "linear-gradient(90deg,#60a5fa,#7c3aed)", transition: "width 1s ease" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 18 }}>
              <div style={statCardStyle}>
                <div style={{ color: "#64748b", fontSize: 12 }}>Courses created</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{createdCount}</div>
              </div>
              <div style={statCardStyle}>
                <div style={{ color: "#64748b", fontSize: 12 }}>Enrollments</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{enrolledCount}</div>
              </div>
              <div
                style={{
                  ...statCardStyle,
                  background: role === "teacher" ? "linear-gradient(90deg,#6366f1,#06b6d4)" : "#f8fafc",
                  color: role === "teacher" ? "#fff" : "#0f172a",
                  cursor: role === "teacher" ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => (role === "teacher" ? setShowCreate(true) : navigate("/courses"))}
                title={role === "teacher" ? "Create a new course" : "Browse available courses"}
              >
                {role === "teacher" ? "Create Course" : "Browse Courses"}
              </div>
            </div>
          </div>

          {/* My Courses / Enrolled */}
          <div style={{ marginTop: 18 }}>
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>{role === "teacher" ? "My Created Courses" : "My Enrolled Courses"}</h3>

              {loading ? (
                <p style={{ color: "#94a3b8" }}>Loading...</p>
              ) : (role === "teacher" ? myCourses : myEnrolledCourses).length === 0 ? (
                <p style={{ color: "#94a3b8" }}>{role === "teacher" ? "You haven't created any courses yet." : "You haven't enrolled in any courses yet."}</p>
              ) : (
                (role === "teacher" ? myCourses : myEnrolledCourses).map((c) => (
                  <div key={c.id} style={{ padding: 12, borderRadius: 10, border: "1px solid #eef2ff", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{c.title}</div>
                        <div style={{ color: "#64748b", fontSize: 13 }}>{c.description}</div>
                        {c.duration ? <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>Duration: {c.duration}</div> : null}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Link to={`/courses/${c.id}`} style={{ padding: "8px 12px", borderRadius: 8, background: "#fff", border: "1px solid #e6eefb", color: "#0f172a" }}>Open</Link>
                        {role !== "teacher" && <button className="btn outline-btn" onClick={() => enrollStudent(c.id)}>Enroll</button>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right aside */}
        <aside style={{ transition: "transform .6s ease, opacity .6s ease", transform: "translateX(0)", opacity: 1 }}>
          <div style={{ ...cardStyle, textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: 999, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(90deg,#7c3aed,#06b6d4)", color: "#fff", fontWeight: 700, fontSize: 20 }}>
              {getInitials(user.name)}
            </div>
            <h3 style={{ marginTop: 12 }}>{user.name}</h3>
            <div style={{ color: "#64748b" }}>{user.email}</div>

            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "center" }}>
              <div style={{ padding: 10, borderRadius: 10, border: "1px solid #eef2ff" }}>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Role</div>
                <div style={{ fontWeight: 700 }}>{role}</div>
              </div>
              <div style={{ padding: 10, borderRadius: 10, border: "1px solid #eef2ff" }}>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Level</div>
                <div style={{ fontWeight: 700 }}>{level.name}</div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={() => navigate("/profile")}>Edit Profile</button>
            </div>
          </div>
        </aside>
      </div>

      {/* Create Course modal / slide-over */}
      {showCreate && (
        <div style={modalBackdropStyle} onClick={() => setShowCreate(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Create New Course</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ marginTop: 12 }}>
              <label style={labelStyle}>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Add a short, clear title"
                style={inputStyle}
                maxLength={120}
                required
              />

              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what students will learn (min 10 chars)"
                style={{ ...inputStyle, minHeight: 110 }}
                maxLength={2000}
                required
              />

              <label style={labelStyle}>Duration (hours)</label>
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 4"
                style={inputStyle}
                inputMode="numeric"
              />

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn" type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Course"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowCreate(false); setForm({ title: "", description: "", duration: "" }); }}>
                  Cancel
                </button>
              </div>

              <Flash />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* inline styles for simple theming */
const cardStyle = {
  background: "#fff",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 20px rgba(15,23,42,0.04)",
  border: "1px solid rgba(99,102,241,0.04)",
};

const statCardStyle = {
  padding: 12,
  borderRadius: 12,
  background: "#fbfdff",
  textAlign: "center",
};

function badgeStyle(levelName) {
  if (levelName === "Gold") return { background: "#fff7ed", color: "#92400e", padding: "6px 10px", borderRadius: 999, fontWeight: 700, fontSize: 13 };
  if (levelName === "Silver") return { background: "#f8fafc", color: "#374151", padding: "6px 10px", borderRadius: 999, fontWeight: 700, fontSize: 13 };
  if (levelName === "Platinum") return { background: "#ecfeff", color: "#0f766e", padding: "6px 10px", borderRadius: 999, fontWeight: 700, fontSize: 13 };
  return { background: "#f1f5f9", color: "#0f172a", padding: "6px 10px", borderRadius: 999, fontWeight: 700, fontSize: 13 };
}

function getInitials(name = "User") {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
}

/* Modal styles */
const modalBackdropStyle = {
  position: "fixed",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  background: "rgba(2,6,23,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 80,
  padding: 20,
};

const modalStyle = {
  width: "100%",
  maxWidth: 700,
  borderRadius: 12,
  background: "#fff",
  padding: 18,
  boxShadow: "0 10px 40px rgba(2,6,23,0.2)",
  border: "1px solid rgba(99,102,241,0.04)",
};

const labelStyle = { display: "block", marginTop: 12, marginBottom: 6, color: "#475569", fontSize: 13 };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e6eefb", outline: "none", fontSize: 14 };

/* Small utility classes (you may already have .btn styles in your CSS) */
/* If not, add minimal styles to your global CSS:
.btn { padding: 8px 12px; border-radius: 8px; border: none; cursor: pointer; background:#6366f1; color:#fff; }
.btn-ghost { background:transparent; border:1px solid #e6eefb; color:#0f172a; }
*/
