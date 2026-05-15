// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseDetails from './pages/CourseDetails';
import MyCourses from './pages/MyCourses';
import CourseStudents from './pages/CourseStudents';
import SubmissionsPage from './pages/SubmissionsPage';
import WelcomeSplash from './components/WelcomeSplash';

import './styles.css';

function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<WelcomeSplash autoSkipMs={5000} showOnceKey={'seenWelcomeSplash'} heading={`Welcome back!`} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/courses/:courseId/students" element={<CourseStudents />} />
          <Route path="/assignments/:assignmentId/submissions" element={<SubmissionsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
