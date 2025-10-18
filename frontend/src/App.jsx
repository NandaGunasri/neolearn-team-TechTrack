// frontend/src/App.jsx
import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseDetails from './pages/CourseDetails';

import MyCourses from './pages/MyCourses';
import CourseStudents from './pages/CourseStudents';
import WelcomeSplash from './components/WelcomeSplash';

import './styles.css';

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse current user from localStorage', e);
    return null;
  }
}

function App(){
  const currentUser = useMemo(() => getCurrentUser(), []);

  return (
    <BrowserRouter>
      <Navbar currentUser={currentUser} />
      <Routes>
        <Route path="/" element={<Home currentUser={currentUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Welcome splash route - shows a small fun fact before dashboard */}
        <Route
          path="/welcome"
          element={<WelcomeSplash autoSkipMs={5000} showOnceKey={'seenWelcomeSplash'} heading={`Welcome back!`} />}
        />

        {/* Dashboard and course pages receive currentUser so they can show role-specific UI */}
        <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
        <Route path="/courses/:id" element={<CourseDetails currentUser={currentUser} />} />

        {/* Silver-level pages */}
        <Route path="/my-courses" element={<MyCourses currentUser={currentUser} />} />
        <Route path="/courses/:courseId/students" element={<CourseStudents currentUser={currentUser} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
