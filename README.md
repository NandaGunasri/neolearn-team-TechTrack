# 💎 NeoLearn LMS: Platinum Edition

**NeoLearn** is a world-class, feature-complete Learning Management System (LMS) designed for the **Synapse 2K25 Hackathon**. It empowers students with expert-led curriculum and gamified progression while providing instructors with professional-grade curriculum management and assessment tools.

---

## 🚀 Team TechTrack (Synapse 2K25)
- **Team Name:** TechTrack
- **Team Leader:** Gagana Sree
- **Team Members:** Gunasri, Meghana, Jahnavi
- **Project Goal:** To deliver a high-fidelity, scalable, and engaging educational ecosystem.

---

## 🌟 Platinum Feature Suite

### 🏫 Educational Lifecycle
- **Elite Course Management**: Teachers can design rich curriculums with categorized modules.
- **Resource Nexus**: Dynamic delivery of study materials (PDFs, Videos, Links) with instant student notifications.
- **Advanced Assessments**: Robust assignment module with deadline tracking, max marks, and centralized grading.
- **Nexus Forum**: Course-specific discussion threads and announcements to foster community collaboration.

### 🎮 Gamification & Engagement
- **Platinum Progression**: A sophisticated XP and level system (Bronze → Platinum) with visual progress bars.
- **Achievement Engine**: Automatic badge awarding for enrollment, consistency (streaks), and high performance.
- **Daily Streaks**: Encourages daily learning through interactive activity tracking.

### 🔔 Intelligence & Notifications
- **Real-time Alerts**: Automated notifications for course enrollment, new materials, assignment releases, and grading updates.
- **Elite Dashboard**: A personalized "Command Center" for both roles, featuring activity analytics and quick-access metrics.

---

## 🛠️ Tech Stack
- **Frontend**: React.js (Vite) + CSS3 (Glassmorphism & Platinum Design System)
- **Backend**: Node.js + Express.js
- **Database**: SQLite (Production-optimized schema)
- **Security**: JWT (JSON Web Tokens) + Bcrypt Password Hashing
- **Icons/Avatars**: Professional emoji-based iconography for universal compatibility

---

## ⚙️ Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env with:
# PORT=5000
# JWT_SECRET=your_platinum_secret
# SQLITE_PATH=./database.sqlite
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Create .env with:
# REACT_APP_API_BASE=http://localhost:5000/api
npm start
```

---

## 📂 Project Architecture
```text
├── backend/
│   ├── routes/          # Auth, Courses, Assignments, Grades, Notifications...
│   ├── middleware/      # Role-based Access Control (RBAC)
│   ├── db.js            # Platinum Schema Initialization
│   └── server.js        # Production-ready Express Server
└── frontend/
    ├── src/
    │   ├── context/     # Auth & Identity Management
    │   ├── pages/       # High-fidelity Platinum Dashboard, CourseDetails...
    │   ├── services/    # Optimized API Integration
    │   └── styles.css   # Platinum Design System (Glassmorphism)
```

---

## 🏆 Judge's Audit Guide (Test Flows)
1. **Registration**: Join as a **Student** or **Teacher** to experience the personalized role-based UI.
2. **Onboarding**: Encounter the high-fidelity "Welcome Splash" featuring intelligent facts and platform tips.
3. **Curriculum Delivery (Teacher)**: Create a course → Add a Resource → Post an Assignment.
4. **Learning Journey (Student)**: Enroll in a course → Download Resources → Submit an Assignment.
5. **Assessment Loop**: (Teacher) Grade the submission → (Student) Receive an Achievement Badge & Notification.
6. **Community**: Participate in the **Nexus Forum** to see collaborative learning in action.

---

## 🔒 Security & Performance
- **RBAC**: Strict Role-Based Access Control on all administrative API routes.
- **Defensive Rendering**: Comprehensive optional chaining and state fallbacks to ensure zero-crash performance.
- **Optimized SQL**: Foreign-key indexed tables for high-speed data retrieval.

---

**Developed with ❤️ for Synapse 2K25.**
**Final Platinum Edition refined, enhanced, and production-polished by Nanda Gunasri.**