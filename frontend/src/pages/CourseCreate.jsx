// frontend/src/pages/CreateCourse.jsx
import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

/**
 * Simple markdown -> HTML converter (very small subset).
 * Escapes HTML then interprets:
 *  - **bold**
 *  - *italic*
 *  - `inline code`
 *  - links: [text](url)
 *  - line breaks -> <p> blocks
 *
 * This is intentionally minimal; for production use a proper markdown sanitizer/renderer.
 */
function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function markdownToHtml(md = "") {
  if (!md) return "";
  const escaped = escapeHtml(md);

  // inline code
  let out = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");

  // bold
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // italic (single star)
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // links
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');

  // paragraphs (split by blank line)
  const paragraphs = out.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");
  return paragraphs;
}

export default function CreateCourse() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [form, setForm] = useState({ title: "", description: "", duration: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [useMarkdown, setUseMarkdown] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [flash, setFlash] = useState(null); // {type,msg}

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <div style={cardStyle}>
          <h3>Please sign in</h3>
          <p style={{ color: "#64748b" }}>You must be signed in to create a course.</p>
          <button className="btn" onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  if ((user.role || "").toLowerCase() !== "teacher") {
    return (
      <div style={{ padding: 24 }}>
        <div style={cardStyle}>
          <h3>Access denied</h3>
          <p style={{ color: "#64748b" }}>Only teachers can create courses.</p>
          <button className="btn" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  function onPickImage(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImageFile(file);

    // preview
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  function validateForm() {
    if (!form.title || form.title.trim().length < 3) {
      setFlash({ type: "error", msg: "Title is required (min 3 characters)." });
      return false;
    }
    if (!form.description || form.description.trim().length < 10) {
      setFlash({ type: "error", msg: "Description is required (min 10 characters)." });
      return false;
    }
    if (form.duration && isNaN(Number(form.duration))) {
      setFlash({ type: "error", msg: "Duration must be a number (hours)." });
      return false;
    }
    return true;
  }

  function openConfirm(e) {
    e && e.preventDefault && e.preventDefault();
    setFlash(null);
    if (!validateForm()) return;
    setConfirmOpen(true);
  }

  async function doCreate() {
    setCreating(true);
    setFlash(null);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("duration", form.duration ? String(form.duration).trim() : "");
      fd.append("teacherId", user.id);
      if (imageFile) fd.append("image", imageFile);

      // axios will set proper multipart headers when FormData is passed
      await API.post("/courses", fd);
      setFlash({ type: "success", msg: "Course created successfully." });

      // navigate back to dashboard or to courses list
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      setFlash({ type: "error", msg: err?.response?.data?.error || "Failed to create course." });
    } finally {
      setCreating(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#f8fafc,#f1f5f9)", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Create Course</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </div>

          <form onSubmit={openConfirm} style={{ marginTop: 12 }}>
            <label style={labelStyle}>Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Short, clear title"
              style={inputStyle}
              required
            />

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={useMarkdown} onChange={(e) => setUseMarkdown(e.target.checked)} />
                Use Markdown
              </label>
            </div>

            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What will students learn? (supports markdown if enabled)"
              style={{ ...inputStyle, minHeight: 160 }}
              required
            />

            {useMarkdown && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>Preview</div>
                <div style={{ border: "1px solid #eef2ff", padding: 12, borderRadius: 8, background: "#fff" }}
                     dangerouslySetInnerHTML={{ __html: markdownToHtml(form.description) }} />
              </div>
            )}

            <label style={labelStyle}>Duration (hours)</label>
            <input
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="e.g. 4"
              style={inputStyle}
              inputMode="numeric"
            />

            <label style={labelStyle}>Cover Image (optional)</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input type="file" accept="image/*" onChange={onPickImage} />
              {imagePreview ? <img src={imagePreview} alt="preview" style={{ width: 96, height: 64, objectFit: "cover", borderRadius: 8 }} /> : null}
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <button className="btn" type="submit" disabled={creating}>Create Course</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setForm({ title: "", description: "", duration: "" }); setImageFile(null); setImagePreview(null); }}>Reset</button>
            </div>

            {flash && (
              <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: flash.type === "success" ? "#ecfdf5" : "#fff1f2", color: flash.type === "success" ? "#065f46" : "#881337" }}>
                {flash.msg}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Confirmation dialog */}
      {confirmOpen && (
        <div style={modalBackdropStyle} onClick={() => setConfirmOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Confirm course creation</h3>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 700 }}>{form.title}</div>
              <div style={{ color: "#64748b", marginTop: 6 }}>{form.duration ? `Duration: ${form.duration} hours` : "Duration: —"}</div>

              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>Description preview</div>
                <div style={{ border: "1px solid #eef2ff", padding: 12, borderRadius: 8, background: "#fff" }}
                     dangerouslySetInnerHTML={{ __html: markdownToHtml(form.description) }} />
              </div>

              {imagePreview && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>Cover image</div>
                  <img src={imagePreview} alt="preview" style={{ width: 220, height: 120, objectFit: "cover", borderRadius: 8 }} />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn" onClick={doCreate} disabled={creating}>{creating ? "Creating..." : "Confirm & Create"}</button>
              <button className="btn btn-ghost" onClick={() => setConfirmOpen(false)}>Go Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* shared inline styles (can be moved to CSS) */
const cardStyle = {
  background: "#fff",
  borderRadius: 12,
  padding: 18,
  boxShadow: "0 6px 20px rgba(15,23,42,0.04)",
  border: "1px solid rgba(99,102,241,0.04)",
};

const labelStyle = { display: "block", marginTop: 12, marginBottom: 6, color: "#475569", fontSize: 13 };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e6eefb", outline: "none", fontSize: 14 };

/* Modal */
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
  maxWidth: 720,
  borderRadius: 12,
  background: "#fff",
  padding: 18,
  boxShadow: "0 10px 40px rgba(2,6,23,0.2)",
  border: "1px solid rgba(99,102,241,0.04)",
};
