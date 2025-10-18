# LMS Project - Synapse 2K25 Hackathon

# NeoLearn — Team TechTrack

**Team name:** Team Gagana  
**Team leader:** Gagana Sree  
**Team member 1:** Gunasri  
**Team member 2:** Meghana  
**Team member 3:** Jahnavi

---

## Project summary
NeoLearn is a lightweight learning management system (LMS) demo built with a React frontend and Node.js/Express backend. Users can register/login, browse courses, enroll, and view a dashboard with progress. Teachers can create courses and view enrolled students. The app includes a small UX delight — a fun “welcome splash” with a joke/fact after login.

---

## Tech stack
- **Frontend:** React.js (Create React App) — HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **Database:** SQLite (dev/demo). Can be swapped to MySQL or MongoDB for production.  
- **Authentication:** JWT (JSON Web Tokens)  
- **Hosting:** Frontend on Vercel (recommended) / Backend on Render or Railway (recommended)  
- **Version control:** Git + GitHub

---

## Features implemented
- User registration and login (JWT-based auth)  
- Persistent session (token stored in `localStorage`)  
- Dashboard with profile, level, and progress bar  
- Browse available courses (list & course details)  
- Student: enroll in courses (enrollment stored in DB)  
- Teacher: create courses and view enrolled students (role-based UI)  
- Points system: earn points on actions (enroll/complete) — progress calculation shown on dashboard  
- Fun welcome splash (random fun-fact/joke) after login with Skip/Another and auto-skip  
- Basic responsive UI with clean cards and buttons

---

## Live hosting
- **Frontend (hosted):** `https://your-frontend-url.vercel.app`  
- **Backend (hosted):** `https://your-backend.onrender.com`  

> Replace the URLs above with the actual hosting links after deployment.

---

## Quick Demo (test flows)
1. Visit the hosted frontend.  
2. Register a new user (choose **Student** or **Teacher**).  
3. Login — you should see the welcome splash (first time) then the Dashboard.  
4. Browse courses and click **Enroll** (for students).  
5. Visit Dashboard → “My Enrolled Courses” to verify enrollment and updated progress/points.  
6. (Teacher) Create a course and open its *Students* page to verify enrolled list.

---

## How to run locally (developer)
**Prerequisites:** Node.js (>=14), npm

### Backend
```bash
cd backend
npm install
# create .env with JWT_SECRET and DB connection if needed
# example .env:
# JWT_SECRET=your_secret_here
# SQLITE_PATH=./data.db

npm run dev   # or `node server.js`
Frontend
bash
Copy code
cd frontend
npm install
# set API base url in .env file or environment variables
# create .env.local with:
# REACT_APP_API_BASE=http://localhost:5000/api

npm start
Open http://localhost:3000.

Key project files & structure
bash
Copy code
/frontend
  /src
    /components
      WelcomeSplash.jsx
    /pages
      Login.jsx
      Register.jsx
      Dashboard.jsx
      CourseDetails.jsx
  package.json

/backend
  server.js
  db.js
  /routes
    auth.js
    enroll.js
    courses.js
  package.json
Environment variables (important)
JWT_SECRET — secret key to sign JWTs (backend)

SQLITE_PATH or DATABASE_URL — database connection string/path

REACT_APP_API_BASE — frontend API base URL (e.g. https://your-backend.onrender.com/api)

Set these in your hosting provider (Render/Vercel) dashboard.

Deployment notes (quick)
Backend (Render):

Create Web Service → point to backend folder → start command node server.js or npm run start.

Add env vars (JWT_SECRET, DB config).

If using SQLite for demo, include data.db in repo (not for production).

Frontend (Vercel):

Import project & point to frontend folder.

Build command npm run build.

Set REACT_APP_API_BASE to your deployed backend base URL.

Submission checklist
 Working hosted frontend URL

 Working hosted backend URL (API)

 GitHub repository link with commit history

 README.md in repo (this file)

 Ensure /api/auth/register and /api/auth/login return { token, user } on success

Testing checklist for judges
Register a user → check Network response for POST /api/auth/register.

Login → check localStorage for token and user.

Enroll in a course → confirm POST /api/courses/:id/enroll returns 200 and /api/my-enrollments returns the course.

Dashboard shows updated “My Enrolled Courses” and progress.

Known issues & notes
This is a demo app intended for local testing / contest submission. For production: migrate from SQLite to a managed DB (MySQL/Mongo), secure JWT_SECRET, and avoid committing DB file to repository.

If you want, we can add CI/CD, tests, and a production-ready DB integration.

Contact
Team leader: Gagana Sree — (add contact/email here)